import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './entities/course.entity';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCourseDto: CreateCourseDto, instructorId: MongoIdDto) {
    const instructorExists = await this.userModel.findById(instructorId);
    if (!instructorExists) {
      throw new NotFoundException('Instructor not found');
    }

    const cloudinaryResponse = await this.cloudinaryService.uploadFile(
      createCourseDto.thumbnail,
    );

    // Extract only the secure_url from the response
    const thumbnailUrl = cloudinaryResponse.secure_url;

    const createdCourse = new this.courseModel({
      ...createCourseDto,
      thumbnail: thumbnailUrl,
      instructor: instructorId,
    });
    return createdCourse.save();
  }

  findAll() {
    return this.courseModel.find().populate('instructor', 'username email id');
  }

  async findOne(id: MongoIdDto) {
    const course = await this.courseModel.findById(id).populate('instructor');
    if (!course) throw new NotFoundException('Course Not Found');
    return course;
  }

  async findInstructorCourses(instructorId: MongoIdDto) {
    const courses = await this.courseModel.find({ instructor: instructorId });
    return courses;
  }

  async update(
    id: MongoIdDto,
    updateCourseDto: UpdateCourseDto,
    instructorId: MongoIdDto,
  ) {
    const instructor = await this.userModel.findById(instructorId);
    if (!instructor) throw new NotFoundException('Course Not Found');

    const course = await this.courseModel.findByIdAndUpdate(
      id,
      updateCourseDto,
      { new: true },
    );
    if (!course) throw new NotFoundException('Course Not Found');
    return course;
  }

  async remove(id: MongoIdDto, instructorId: MongoIdDto) {
    const instructor = await this.userModel.findById(instructorId);
    if (!instructor) throw new NotFoundException('Instructor not found');
    const course = await this.courseModel.findByIdAndDelete(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
