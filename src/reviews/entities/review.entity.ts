import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDoc = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;
  @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
  course: Types.ObjectId;
  @Prop({ required: true })
  comment: string;
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
