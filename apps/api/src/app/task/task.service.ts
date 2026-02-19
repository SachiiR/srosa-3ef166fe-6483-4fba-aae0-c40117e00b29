import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto, UpdateTaskDto, Role } from '@org/data';
import { AuditService } from '../audit/audit.service';
import { Task } from '../../entities/task.entity';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    private auditService: AuditService
  ) { }

  async create(createDto: CreateTaskDto, user: any): Promise<Task> {
    const hasPermission = await this.hasPermission(user.role, 'tasks:create');
    if (!hasPermission) throw new ForbiddenException('No permission to create tasks');

    // const lastTask = await this.taskRepo.findOne({
    //   where: { },
    //   order: { order: 'DESC' }
    // });
    const count = await this.taskRepo.count();

    const task = this.taskRepo.create({
      ...createDto,
      order: count + 1,
      status: 'Pending',
      owner: { id: user.userId },
      assignedTo: createDto.assignedToId ? { id: createDto.assignedToId } : { id: user.userId },
    });

    const saved = await this.taskRepo.save(task);
    this.auditService.log(`Created task ${saved.id}`, user.userId);
    return saved;
  }

  async findAllTasks(user: any): Promise<Task[]> {
    const hasPermission = await this.hasPermission(user.role, 'tasks:read');
    if (!hasPermission) throw new ForbiddenException('No permission to read tasks');

    let query = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .orderBy('task.order', 'ASC');

    if (user.role === Role.VIEWER) {
      query = query.where(
        'owner.id = :userId OR assignedTo.id = :userId',
        { userId: user.userId }
      );
    }
    else if (user.role === Role.OWNER) {
      query = query.where('owner.organizationId = :orgId', { orgId: user.orgId });
}
    // Owner and Admin see all tasks

    return query.getMany();
  }

  async update(id: number, updateDto: UpdateTaskDto, user: any): Promise<Task> {
    const hasPermission = await this.hasPermission(user.role, 'tasks:update');
    if (!hasPermission) throw new ForbiddenException('No permission to update tasks');

    const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner', 'assignedTo'] });
    if (!task) throw new ForbiddenException('Task not found');

    // Viewer can only update their own tasks
    if (user.role === Role.VIEWER) {
      const isOwner = task.owner.id === user.userId;
      const isAssigned = task.assignedTo?.id === user.userId;
      if (!isOwner && !isAssigned) {
        throw new ForbiddenException('Viewers can only update their own or assigned tasks');
      }
    }

    const { assignedToId, ...rest } = updateDto;
    Object.assign(task, rest);
    if (assignedToId) {
      task.assignedTo = { id: assignedToId } as any;
    }
    const saved = await this.taskRepo.save(task);
    this.auditService.log(`Updated task ${id}`, user.userId);
    return saved;
  }

  async remove(id: number, user: any): Promise<void> {

    const hasPermission = await this.hasPermission(user.role, 'tasks:delete');
    if (!hasPermission) throw new ForbiddenException('No permission to delete tasks');

    const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!task) throw new ForbiddenException('Task not found');

    const deletedOrder = task.order;
    await this.taskRepo.remove(task);

    // reorder remaining tasks
    await this.taskRepo
      .createQueryBuilder()
      .update(Task)
      .set({ order: () => '"order" - 1' })
      .where('"order" > :deletedOrder', { deletedOrder })
      .execute();

    this.auditService.log(`Deleted task ${id}`, user.userId);
  }

  async reorder(tasks: { id: number; order: number }[], user: any): Promise<void> {
    if (user.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot reorder tasks');
    }

    await Promise.all(
      tasks.map(t => this.taskRepo.update(t.id, { order: t.order }))
    );
    this.auditService.log(`Reordered tasks`, user.userId);
  }

  private async hasPermission(userRole: Role, requiredPermission: string): Promise<boolean> {
    const perms = await this.permissionRepo.find({ where: { role: userRole } });
    return perms.some(p => p.name === requiredPermission);
  }
}