import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Course, CourseDocument } from 'src/courses/entities/course.entity';
import { Model, Types } from 'mongoose';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);
  private readonly frontendUrl: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
  }

  async enrollCourse(
    createEnrollmentDto: CreateEnrollmentDto,
    userId: MongoIdDto,
  ) {
    // Validate user exists
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate course exists and is published
    const course = await this.courseModel
      .findById(createEnrollmentDto.courseId)
      .lean();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isPublished) {
      throw new BadRequestException('Course is not published');
    }

    // Check if already enrolled
    if (this.isAlreadyEnrolled(user, createEnrollmentDto.courseId)) {
      throw new ConflictException('User is already enrolled in this course');
    }

    // Calculate final price with discount
    const finalPrice = this.calculateFinalPrice(course);

    // Build checkout URLs
    const { successUrl, cancelUrl } = this.buildCheckoutUrls();

    // Create Stripe checkout session
    const session = await this.stripeService.createCheckoutSession(
      createEnrollmentDto.courseId.toString(),
      course.title,
      finalPrice,
      userId.toString(),
      successUrl,
      cancelUrl,
    );

    return {
      sessionId: session.id,
      url: session.url,
      message: 'Redirect user to complete payment',
    };
  }

  async verifyAndCompleteEnrollment(sessionId: string, userId: MongoIdDto) {
    const session = await this.validatePaymentSession(sessionId, userId);
    const courseId = session.metadata?.courseId;

    const { user, course } = await this.loadUserAndCourse(userId, courseId);

    // Check idempotency - if already enrolled, return success
    if (this.isAlreadyEnrolled(user, courseId)) {
      return {
        status: 'already_enrolled',
        message: 'User is already enrolled in this course',
        course: {
          id: course._id,
          title: course.title,
        },
      };
    }

    // Complete enrollment with manual rollback support
    await this.completeEnrollmentWithRollback(user, course);

    return {
      status: 'enrolled',
      message: 'Successfully enrolled in the course',
      course: {
        id: course._id,
        title: course.title,
      },
    };
  }

  async findEnrollments(owner: MongoIdDto) {
    this.logger.log(`Fetching enrollments for user ${owner}`);

    const user = await this.userModel
      .findById(owner)
      .populate('enrolledCourses')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      enrolledCourses: user.enrolledCourses || [],
    };
  }

  async findEnrollment(courseId: MongoIdDto, owner: MongoIdDto) {
    this.logger.log(
      `Fetching enrollment details for user ${owner}, course ${courseId}`,
    );

    const user = await this.userModel
      .findById(owner)
      .populate('enrolledCourses')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const course = (user.enrolledCourses || []).find((c: any) =>
      c._id.equals(courseId as unknown as Types.ObjectId),
    );

    if (!course) {
      throw new NotFoundException('User is not enrolled in this course');
    }

    return course;
  }

  private async validatePaymentSession(sessionId: string, userId: MongoIdDto) {
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);

    if (!session) {
      throw new BadRequestException('Invalid payment session');
    }

    if (session.payment_status !== 'paid') {
      throw new ConflictException(
        `Payment not completed. Status: ${session.payment_status}`,
      );
    }

    const { courseId, userId: sessionUserId } = session.metadata || {};

    if (!courseId || !sessionUserId) {
      this.logger.error('Session metadata missing');
      throw new BadRequestException('Invalid session metadata');
    }

    if (sessionUserId.toString() !== userId.toString()) {
      this.logger.error('Session user mismatch');
      throw new ConflictException('Session does not belong to this user');
    }

    return session;
  }

  private async loadUserAndCourse(
    userId: MongoIdDto,
    courseId: string | undefined,
  ) {
    if (!courseId) {
      throw new BadRequestException('Course ID is missing');
    }

    const [user, course] = await Promise.all([
      this.userModel.findById(userId),
      this.courseModel.findById(courseId),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return { user, course };
  }

  private async completeEnrollmentWithRollback(
    user: UserDocument,
    course: CourseDocument,
  ) {
    const courseId = course._id as unknown as Types.ObjectId;
    const userId = user._id as unknown as Types.ObjectId;

    try {
      // Step 1: Add course to user's enrolled courses
      user.enrolledCourses.push(courseId);
      await user.save();

      this.logger.log(`User ${userId} updated with course ${courseId}`);

      try {
        // Step 2: Add user to course's enrolled students
        course.enrolledStudents.push(userId);
        await course.save();
      } catch (courseError) {
        // Rollback: Remove course from user's enrolledCourses

        user.enrolledCourses = user.enrolledCourses.filter(
          (id) => id.toString() !== courseId.toString(),
        );
        await user.save();
        throw courseError;
      }
    } catch (error) {
      this.logger.error(`Enrollment failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to complete enrollment');
    }
  }

  private isAlreadyEnrolled(user: any, courseId: any): boolean {
    return (user.enrolledCourses || []).some(
      (enrolledCourseId) => enrolledCourseId.toString() === courseId.toString(),
    );
  }

  private calculateFinalPrice(course: any): number {
    const discount = course.discount || 0;
    const finalPrice = course.price * (1 - discount / 100);

    this.logger.debug(
      `Price calculation: ${course.price} - ${discount}% = ${finalPrice}`,
    );

    return finalPrice;
  }

  private buildCheckoutUrls() {
    return {
      successUrl: `${this.frontendUrl}/enrollments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${this.frontendUrl}/enrollments/cancel`,
    };
  }
}
