import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  @UseInterceptors(FileInterceptor('thumbnail'))
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() thumbnail: Express.Multer.File,
    @Req() req,
  ) {
    createCourseDto.thumbnail = thumbnail;
    return this.coursesService.create(createCourseDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('instuctor-courses')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  findInstructorCourses(@Req() req) {
    return this.coursesService.findInstructorCourses(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: MongoIdDto) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  update(
    @Param('id') id: MongoIdDto,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() thumbnail: Express.Multer.File,
    @Req() req,
  ) {
    return this.coursesService.update(id, updateCourseDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('instructor')
  remove(@Param('id') id: MongoIdDto, @Req() req) {
    return this.coursesService.remove(id, req.user.sub);
  }
}
