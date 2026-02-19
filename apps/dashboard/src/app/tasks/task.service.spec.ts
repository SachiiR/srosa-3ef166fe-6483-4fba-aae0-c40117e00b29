// task.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, User } from '@org/data';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:3000/api/tasks';
  const usersUrl = 'http://localhost:3000/api/user';
  const auditUrl = 'http://localhost:3000/api/audit';

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    category: 'Work',
    status: 'Pending',
    order: 1,
  } as Task;

  const mockTasks: Task[] = [mockTask, { ...mockTask, id: 2, title: 'Task 2' }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no unexpected HTTP calls were made
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should return all tasks', () => {
      service.getTasks().subscribe(tasks => {
        expect(tasks).toHaveLength(2);
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('createTask', () => {
    it('should create a task', () => {
      service.createTask(mockTask).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTask);
      req.flush(mockTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task', () => {
      const changes = { title: 'Updated Title' };

      service.updateTask(1, changes).subscribe(task => {
        expect(task.title).toBe('Updated Title');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(changes);
      req.flush({ ...mockTask, ...changes });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      service.deleteTask(1).subscribe(res => {
        expect(res).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('reorderTasks', () => {
    it('should send reorder request', () => {
      const reorderData = [{ id: 1, order: 2 }, { id: 2, order: 1 }];

      service.reorderTasks(reorderData).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reorder`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ tasks: reorderData });
      req.flush({});
    });
  });

  describe('getUsers', () => {
    it('should return users', () => {
      const mockUsers: User[] = [
        { id: 1, username: 'owner', role: 'Owner' } as User,
      ];

      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(usersUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs', () => {
      const mockLogs = [
        { id: 1, action: 'Created task', userId: 1, timestamp: new Date() }
      ];

      service.getAuditLogs().subscribe(logs => {
        expect(logs).toEqual(mockLogs);
      });

      const req = httpMock.expectOne(auditUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockLogs);
    });
  });
});