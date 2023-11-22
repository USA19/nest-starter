import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export default class RestfulRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp().getRequest();
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const user = ctx.user;
    return this.matchRoles(roles, user.roles);
  }

  matchRoles(roles: string[], userRoles: string[]): boolean {
    return roles.some((r) => userRoles.indexOf(r) >= 0);
  }
}
