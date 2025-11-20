import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateLessonDto {
  @IsMongoId()
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  courseId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  lessonUrl: any;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  isPreviewFree: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  isViewed: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  lessonOrder: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  duration: number;
}
