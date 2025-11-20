import { IsEnum } from 'class-validator';

export class RoleUserDto {
  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';
}
