import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: "iA|vps_l=Q8Vu9}/U-6b`xH'IfA%922!(ztqBzGeE:vgq_ZdEza3vMpHVG]j1+S",
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
