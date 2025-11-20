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
  Query,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { MongoIdDto } from 'src/common/mongoId.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  enrollCourse(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Req() req: any,
  ) {
    return this.enrollmentsService.enrollCourse(
      createEnrollmentDto,
      req.user.sub,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  findUserEnrollments(@Req() req: any) {
    return this.enrollmentsService.findEnrollments(req.user.sub);
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  verifyEnrollment(@Query('session_id') sessionId: string, @Req() req: any) {
    return this.enrollmentsService.verifyAndCompleteEnrollment(
      sessionId,
      req.user.sub,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findUserEnrollment(@Param('id') id: MongoIdDto, @Req() req: any) {
    return this.enrollmentsService.findEnrollment(id, req.user.sub);
  }
}
