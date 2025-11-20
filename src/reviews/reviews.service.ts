import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Course, CourseDocument } from 'src/courses/entities/course.entity';
import { Model, Types } from 'mongoose';
import { Review, ReviewDoc } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDoc>,
  ) {}

  async create(createReviewDto: CreateReviewDto, owner: MongoIdDto) {
    const user = await this.userModel.findById(owner);
    if (!user) throw new NotFoundException('User not found');

    const course = await this.courseModel.findById(createReviewDto.courseId);
    if (!course) throw new NotFoundException('Course not found');

    const review = (await this.reviewModel.create(createReviewDto)).populate(
      'owner',
    );

    // add User review to Course entity

    return review;
  }

  async findAll(createReviewDto: CreateReviewDto) {
    const course = await this.courseModel.findById(createReviewDto.courseId);
    if (!course) throw new NotFoundException('Course not found');

    return await this.reviewModel.find({ course });
  }

  findOne(id: MongoIdDto) {
    return `This action returns a #${id} review`;
  }

  update(id: MongoIdDto, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: MongoIdDto) {
    return `This action removes a #${id} review`;
  }
}
