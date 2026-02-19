import { SetMetadata } from '@nestjs/common';
import { Role } from '@org/data';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);