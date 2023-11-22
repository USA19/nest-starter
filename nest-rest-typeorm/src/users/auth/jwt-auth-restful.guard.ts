import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users.service';

@Injectable()
export class JwtAuthRestFulGuard extends AuthGuard('jwt') {
  constructor(private usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp().getRequest();
    if (!ctx.headers.authorization) {
      return false;
    }
    ctx.user = await this.validateToken(ctx.headers.authorization);
    return true;
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException(
        'Invalid Authorization Token - No Token Provided in Headers',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = auth.split(' ')[1];
    try {
      return await this.usersService.verify(token);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Session expired',
          message: 'Token Invalid',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
