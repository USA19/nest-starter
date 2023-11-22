import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUserInterface } from '../users/auth/dto/current-user.dto';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request: any = context.switchToHttp().getRequest<Request>();
  return request.user as CurrentUserInterface
});