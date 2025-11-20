import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { MongoIdDto } from 'src/common/mongoId.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (userExists) {
      throw new ConflictException('User already exists');
    }
    const user = new this.userModel(createUserDto);
    await user.save();
    return user;
  }

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async findOne(id: MongoIdDto) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: MongoIdDto, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
      })
      .select('username email imgUrl role -_id');

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User updated successfully',
      user,
    };
  }

  async updateRoleToInstructor(userId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { role: 'instructor' }, { new: true })
      .select('username email role -_id');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User role updated to instructor successfully',
      user,
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail progress');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      imgUrl: user.imgUrl || '',
      bio: user.bio || '',
      role: user.role,
      enrolledCourses: user.enrolledCourses || [],
    };
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateUserDto, { new: true })
      .select('-password')
      .populate('enrolledCourses', 'title thumbnail progress');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile updated successfully',
      id: user._id,
      username: user.username,
      email: user.email,
      imgUrl: user.imgUrl || '',
      bio: user.bio || '',
      role: user.role,
      enrolledCourses: user.enrolledCourses || [],
    };
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateUserDto, { new: true })
      .select('username email imgUrl role -_id');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User updated successfully',
      user,
    };
  }

  async remove(id: MongoIdDto) {
    const user = await this.userModel
      .findByIdAndDelete(id)
      .select('username email role _id');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User deleted successfully',
      user,
    };
  }
}
