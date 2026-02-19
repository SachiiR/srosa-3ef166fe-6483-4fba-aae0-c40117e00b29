import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { Task } from '../../entities/task.entity';
import { Permission } from '../../entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Permission]), AuthModule, AuditModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}