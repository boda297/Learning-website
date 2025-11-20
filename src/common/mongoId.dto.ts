import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class MongoIdDto {
  @IsMongoId()
  id: Types.ObjectId;
}
