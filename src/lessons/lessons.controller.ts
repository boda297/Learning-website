import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  @UseInterceptors(FileInterceptor('lessonUrl'))
  create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() lessonUrl: Express.Multer.File,
  ) {
    createLessonDto.lessonUrl = lessonUrl;
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: MongoIdDto) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  @UseInterceptors(FileInterceptor('lessonUrl'))
  update(
    @Param('id') id: MongoIdDto,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFile() lessonUrl: Express.Multer.File,
  ) {
    updateLessonDto.lessonUrl = lessonUrl;
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  remove(@Param('id') id: MongoIdDto) {
    return this.lessonsService.remove(id);
  }
}
