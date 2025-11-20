import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  courseId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsNumber()
  @IsNotEmpty()
  rating: number;
}
