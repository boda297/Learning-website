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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoIdDto } from 'src/common/mongoId.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/role/role.guard';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/me')
  @UseGuards(AuthGuard)
  getMyProfile(@Req() req) {
    return this.usersService.getUserProfile(req.user.sub);
  }

  @Patch('profile/me')
  @UseGuards(AuthGuard)
  updateMyProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserProfile(req.user.sub, updateUserDto);
  }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: MongoIdDto) {
    return this.usersService.findOne(id);
  }

  @Patch('update-role')
  @UseGuards(AuthGuard)
  updateRoleToInstructor(@Req() req) {
    return this.usersService.updateRoleToInstructor(req.user.sub);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: MongoIdDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/me')
  @UseGuards(AuthGuard)
  updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.sub, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: MongoIdDto) {
    return this.usersService.remove(id);
  }
}
