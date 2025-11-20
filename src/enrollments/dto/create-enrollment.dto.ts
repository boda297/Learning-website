import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateEnrollmentDto {
  @IsMongoId()
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  courseId: Types.ObjectId;
}
