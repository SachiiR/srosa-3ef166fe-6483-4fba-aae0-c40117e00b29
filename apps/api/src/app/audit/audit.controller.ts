import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, Roles } from '@org/auth';
import { Role } from '@org/data';

@Controller('audit')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  getLogs() {
    return this.service.getLogs();
  }
}