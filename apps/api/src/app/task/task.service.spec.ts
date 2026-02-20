import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../entities/task.entity';
import { Permission } from '../../entities/permission.entity';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '@org/data';

const mockAdminUser = { userId: 1, role: 'Admin', orgId: 1 };
const mockViewerUser = { userId: 2, role: 'Viewer', orgId: 1 };
const mockOwnerUser = { userId: 3, role: 'Owner', orgId: 1 };

const mockTask = {
  id: 1,
  title: 'Test Task',
  order: 1,
  status: 'Pending',
  owner: { id: 1 },
  assignedTo: { id: 2 }
};

const mockTaskRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn()
};

const mockPermissionRepo = {
  find: jest.fn()
};

const mockAuditService = {
  log: jest.fn()
};

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepo },
        { provide: getRepositoryToken(Permission), useValue: mockPermissionRepo },
        { provide: AuditService, useValue: mockAuditService }
      ]
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => jest.clearAllMocks());

  // --- create ---
  describe('create', () => {
    it('should throw ForbiddenException if role has no create permission', async () => {
      mockPermissionRepo.find.mockResolvedValue([]); // no permissions

      await expect(
        service.create({ title: 'Task', category: 'Work', assignedToId: 1 } as any, mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a task and log audit', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:create' }]);
      mockTaskRepo.count.mockResolvedValue(2);
      mockTaskRepo.create.mockReturnValue(mockTask);
      mockTaskRepo.save.mockResolvedValue(mockTask);

      const result = await service.create(
        { title: 'Task', category: 'Work', assignedToId: 1 } as any,
        mockAdminUser
      );

      expect(result).toEqual(mockTask);
      expect(mockAuditService.log).toHaveBeenCalledWith(`Created task ${mockTask.id}`, mockAdminUser.userId);
    });
  });

  // --- findAllTasks ---
  describe('findAllTasks', () => {
    const mockQueryBuilder: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockTask])
    };

    beforeEach(() => {
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should throw ForbiddenException if role has no read permission', async () => {
      mockPermissionRepo.find.mockResolvedValue([]);

      await expect(service.findAllTasks(mockViewerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should filter tasks by userId for Viewer', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:read' }]);

      await service.findAllTasks(mockViewerUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'owner.id = :userId OR assignedTo.id = :userId',
        { userId: mockViewerUser.userId }
      );
    });

    it('should filter tasks by orgId for Owner', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:read' }]);

      await service.findAllTasks(mockOwnerUser);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'owner.organizationId = :orgId',
        { orgId: mockOwnerUser.orgId }
      );
    });

    it('should return all tasks for Admin', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:read' }]);

      await service.findAllTasks(mockAdminUser);

      // Admin doesn't call where()
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });
  });

  // --- update ---
  describe('update', () => {
    it('should throw ForbiddenException if role has no update permission', async () => {
      mockPermissionRepo.find.mockResolvedValue([]);

      await expect(service.update(1, {} as any, mockViewerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if Viewer tries to update someone elses task', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:update' }]);
      mockTaskRepo.findOne.mockResolvedValue({
        ...mockTask,
        owner: { id: 99 },      // someone else's task
        assignedTo: { id: 99 }
      });

      await expect(
        service.update(1, {} as any, mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow Viewer to update their own task', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:update' }]);
      mockTaskRepo.findOne.mockResolvedValue({
        ...mockTask,
        owner: { id: mockViewerUser.userId }, // viewer owns this task
        assignedTo: { id: mockViewerUser.userId }
      });
      mockTaskRepo.save.mockResolvedValue(mockTask);

      const result = await service.update(1, { title: 'Updated' } as any, mockViewerUser);

      expect(result).toEqual(mockTask);
      expect(mockAuditService.log).toHaveBeenCalledWith('Updated task 1', mockViewerUser.userId);
    });

    it('should allow Admin to update any task', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:update' }]);
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockTaskRepo.save.mockResolvedValue(mockTask);

      const result = await service.update(1, { title: 'Updated' } as any, mockAdminUser);

      expect(result).toEqual(mockTask);
    });
  });

  // --- remove ---
  describe('remove', () => {
    const mockQueryBuilder: any = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined)
    };

    beforeEach(() => {
      mockTaskRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should throw ForbiddenException if role has no delete permission', async () => {
      mockPermissionRepo.find.mockResolvedValue([]);

      await expect(service.remove(1, mockViewerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should delete task and reorder remaining tasks', async () => {
      mockPermissionRepo.find.mockResolvedValue([{ name: 'tasks:delete' }]);
      mockTaskRepo.findOne.mockResolvedValue(mockTask);
      mockTaskRepo.remove.mockResolvedValue(undefined);

      await service.remove(1, mockAdminUser);

      expect(mockTaskRepo.remove).toHaveBeenCalledWith(mockTask);
      expect(mockAuditService.log).toHaveBeenCalledWith('Deleted task 1', mockAdminUser.userId);
    });
  });

  // --- reorder ---
  describe('reorder', () => {
    it('should throw ForbiddenException if Viewer tries to reorder', async () => {
      await expect(
        service.reorder([{ id: 1, order: 2 }], mockViewerUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow Admin to reorder tasks', async () => {
      mockTaskRepo.update.mockResolvedValue(undefined);

      await service.reorder([{ id: 1, order: 2 }], mockAdminUser);

      expect(mockTaskRepo.update).toHaveBeenCalledWith(1, { order: 2 });
      expect(mockAuditService.log).toHaveBeenCalledWith('Reordered tasks', mockAdminUser.userId);
    });
  });
});