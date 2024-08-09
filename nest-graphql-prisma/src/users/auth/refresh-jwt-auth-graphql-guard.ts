import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UsersService } from '../users.service';

@Injectable()
export class JwtRefreshTokenGraphqlGuard extends AuthGuard('jwt-refresh') {
  constructor(private usersService: UsersService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const refreshToken = request.headers['x-refresh-token'] || request.body.refreshToken;
    if (!refreshToken) {
      throw new HttpException('Refresh token missing', HttpStatus.UNAUTHORIZED);
    }
    request.user = await this.validateRefreshToken(refreshToken);
    return true;
  }

  async validateRefreshToken(token: string) {
    try {
      const user = await this.usersService.verifyRefreshToken(token);

      if (!user) {
        throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
      }

      return user;
    } catch (err) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }
}
