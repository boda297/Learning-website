import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log(
      '🔍 [AuthGuard] Authorization header:',
      authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING',
    );

    const token = authHeader?.split(' ')[1];
    console.log(
      '🔐 [AuthGuard] Extracted token:',
      token ? `${token.substring(0, 20)}...` : 'NULL',
    );

    if (!token) {
      console.error('❌ [AuthGuard] No token provided');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      console.log(
        '✅ [AuthGuard] Token verified successfully. User sub:',
        decoded.sub,
      );
      request['user'] = decoded;
      return true;
    } catch (error) {
      console.error('❌ [AuthGuard] Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
