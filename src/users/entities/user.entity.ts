import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Course } from 'src/courses/entities/course.entity';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  imgUrl: string;

  @Prop({ required: false, default: '' })
  bio: string;

  @Prop({ type: [Types.ObjectId], default: [], ref: 'Course' })
  enrolledCourses: Types.ObjectId[];

  @Prop({
    required: true,
    default: 'user',
    enum: ['admin', 'user', 'instructor'],
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
