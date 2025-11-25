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

    const reviewData = {
      comment: createReviewDto.comment,
      rating: createReviewDto.rating,
      course: createReviewDto.courseId,
      owner,
    };

    const review = await this.reviewModel.create(reviewData);
    // add review to course's reviews array
    course.reviews.push(review._id as Types.ObjectId);
    await course.save();

    await review.populate('owner', 'username email imgUrl');
    return review;
  }

  async findAll(courseId: Types.ObjectId) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    return await this.reviewModel
      .find({ course: courseId as Types.ObjectId })
      .populate('owner', 'username email imgUrl');
  }

  async findOne(id: MongoIdDto) {
    const review = await this.reviewModel
      .findById(id)
      .populate('owner', 'username email imgUrl');
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(
    id: MongoIdDto,
    updateReviewDto: UpdateReviewDto,
    owner: MongoIdDto,
  ) {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      updateReviewDto,
      {
        new: true,
      },
    );
    if (!review) throw new NotFoundException('Review not found');
    await review.populate('owner', 'username email imgUrl');
    return review;
  }

  async remove(id: MongoIdDto) {
    const review = await this.reviewModel.findByIdAndDelete(id);
    if (!review) throw new NotFoundException('Review not found');
    return {
      message: 'Review deleted successfully',
    };
  }
}
