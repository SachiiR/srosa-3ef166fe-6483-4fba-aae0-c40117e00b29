import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { RbacGuard } from '@org/auth';
import { AuthGuard } from '@nestjs/passport';

const mockTaskService = {
  create: jest.fn(),
  findAllTasks: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  reorder: jest.fn()
};

const mockAdminUser = { userId: 1, role: 'Admin', orgId: 1 };
const mockViewerUser = { userId: 2, role: 'Viewer', orgId: 1 };

const mockTask = {
  id: 1,
  title: 'Test Task',
  category: 'Work',
  status: 'Pending',
  order: 1
};

describe('TaskController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: TaskService, useValue: mockTaskService }
      ]
    })
      .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
      .overrideGuard(RbacGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterEach(() => jest.clearAllMocks());

  // --- create ---
  describe('create', () => {
    it('should call service.create with dto and user', async () => {
      mockTaskService.create.mockResolvedValue(mockTask);

      const req = { user: mockAdminUser } as any;
      const dto = { title: 'Test Task', category: 'Work', assignedToId: 1 } as any;

      const result = await controller.create(dto, req);

      expect(result).toEqual(mockTask);
      expect(mockTaskService.create).toHaveBeenCalledWith(dto, mockAdminUser);
    });
  });

  // --- findAll ---
  describe('findAll', () => {
    it('should call service.findAllTasks with user', async () => {
      mockTaskService.findAllTasks.mockResolvedValue([mockTask]);

      const req = { user: mockAdminUser } as any;
      const result = await controller.findAll(req);

      expect(result).toEqual([mockTask]);
      expect(mockTaskService.findAllTasks).toHaveBeenCalledWith(mockAdminUser);
    });

    it('should return only own tasks for Viewer', async () => {
      const viewerTasks = [{ ...mockTask, owner: { id: mockViewerUser.userId } }];
      mockTaskService.findAllTasks.mockResolvedValue(viewerTasks);

      const req = { user: mockViewerUser } as any;
      const result = await controller.findAll(req);

      expect(result).toEqual(viewerTasks);
      expect(mockTaskService.findAllTasks).toHaveBeenCalledWith(mockViewerUser);
    });
  });

  // --- update ---
  describe('update', () => {
    it('should call service.update with id, dto and user', async () => {
      mockTaskService.update.mockResolvedValue(mockTask);

      const req = { user: mockAdminUser } as any;
      const dto = { title: 'Updated Task' } as any;

      const result = await controller.update(1, dto, req);

      expect(result).toEqual(mockTask);
      expect(mockTaskService.update).toHaveBeenCalledWith(1, dto, mockAdminUser);
    });
  });

  // --- remove ---
  describe('remove', () => {
    it('should call service.remove with id and user', async () => {
      mockTaskService.remove.mockResolvedValue(undefined);

      const req = { user: mockAdminUser } as any;
      const result = await controller.remove(1, req);

      expect(mockTaskService.remove).toHaveBeenCalledWith(1, mockAdminUser);
    });
  });

  // --- reorder ---
  describe('reorder', () => {
    it('should call service.reorder with tasks and user', async () => {
      mockTaskService.reorder.mockResolvedValue(undefined);

      const req = { user: mockAdminUser } as any;
      const body = { tasks: [{ id: 1, order: 2 }, { id: 2, order: 1 }] };

      await controller.reorder(body, req);

      expect(mockTaskService.reorder).toHaveBeenCalledWith(body.tasks, mockAdminUser);
    });
  });
});