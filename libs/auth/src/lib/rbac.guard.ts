import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, RoleHierarchy, RequestUser } from '@org/data';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!allowed) return true;

    const user = context.switchToHttp().getRequest().user as RequestUser;
    if (!user?.role) return false;

    const userLevel = RoleHierarchy[user.role.toUpperCase() as keyof typeof RoleHierarchy];

    return allowed.some(role => 
      userLevel >= RoleHierarchy[role.toUpperCase() as keyof typeof RoleHierarchy]
    );
  }
}