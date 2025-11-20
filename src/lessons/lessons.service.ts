import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson, LessonDocument } from './entities/lesson.entity';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from 'src/courses/entities/course.entity';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createLessonDto: CreateLessonDto) {
    const course = await this.courseModel.findById(createLessonDto.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const cloudinaryResponse = await this.cloudinaryService.uploadFile(
      createLessonDto.lessonUrl,
      'video',
    );
    const lessonUrl = cloudinaryResponse.secure_url;

    const lesson = await this.lessonModel.create({
      ...createLessonDto,
      lessonUrl: lessonUrl,
      courseId: course._id,
    });
    // push the lesson id to the course lessons array
    course.lessons.push(lesson._id as Types.ObjectId);
    await course.save();
    return course.populate('lessons');
  }

  findAll() {
    return this.lessonModel.find();
  }

  async findOne(id: MongoIdDto) {
    const lesson = await this.lessonModel.findById(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async update(id: MongoIdDto, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.lessonModel.findByIdAndUpdate(
      id,
      updateLessonDto,
      { new: true },
    );
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return {
      message: 'Lesson updated successfully',
      lesson,
    };
  }

  async remove(id: MongoIdDto) {
    const lesson = await this.lessonModel.findByIdAndDelete(id);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    course.lessons = course.lessons.filter(
      (lesson) => lesson.toString() !== id.toString(),
    );
    await course.save();
    return {
      message: 'Lesson deleted successfully',
      lesson,
    };
  }
}
