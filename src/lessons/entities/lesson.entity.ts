import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true, minimize: false })
export class Lesson {
  @Prop({ required: true, ref: 'Course', type: Types.ObjectId })
  courseId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  lessonUrl: string;

  @Prop({ required: true })
  isViewed: boolean;

  @Prop({ required: true })
  isPreviewFree: boolean;

  @Prop({ required: true })
  lessonOrder: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
