import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

interface Request extends ExpressRequest {
  user: any; 
}
import { TaskService } from './task.service';
import { Role, type CreateTaskDto, type UpdateTaskDto } from '@org/data';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, Roles } from '@org/auth';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TaskController {
  constructor(private service: TaskService) { }

  @Post()
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER) 
  create(@Body() dto: CreateTaskDto, @Request() req: Request) {
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll(@Request() req: Request) {
    return this.service.findAllTasks(req.user);
  }

  @Put(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.VIEWER) 
  update(@Param('id') id: number, @Body() dto: UpdateTaskDto, @Request() req: Request) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @Roles(Role.OWNER) 
  remove(@Param('id') id: number, @Request() req: Request) {
    return this.service.remove(id, req.user);
  }

  @Patch('reorder')
  @UseGuards(RbacGuard)
  @Roles(Role.VIEWER) 
  async reorder(@Body() body: { tasks: { id: number; order: number }[] }, @Request() req: any) {
    return this.service.reorder(body.tasks, req.user);
  }
}