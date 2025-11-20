import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true, minimize: false })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  isPublished: boolean;

  @Prop({ required: true, type: [Types.ObjectId], ref: 'Lesson' })
  lessons: Types.ObjectId[];

  @Prop({ required: true })
  price: number;

  @Prop({ min: 0, max: 100 })
  discount: number;

  @Prop({ required: true })
  thumbnail: string;

  @Prop()
  rating: [
    {
      userId: { type: Types.ObjectId; ref: 'User' };
      score: { type: Number; min: 1; max: 5 };
    },
  ];

  @Prop({ required: true })
  category: string[];

  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  instructor: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  enrolledStudents: Types.ObjectId[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
