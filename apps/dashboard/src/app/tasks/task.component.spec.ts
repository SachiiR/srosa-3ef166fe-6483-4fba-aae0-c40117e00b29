// task.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './task.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { TaskService } from './task.service';
import { AuthService } from '../auth/auth.service';
import { of } from 'rxjs';
import { Task } from '@org/data';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', status: 'Pending', category: 'Work', order: 1 } as Task,
  { id: 2, title: 'Task 2', status: 'Completed', category: 'Personal', order: 2 } as Task,
  { id: 3, title: 'Task 3', status: 'Completed', category: 'Work', order: 3 } as Task,
];

const mockTaskService = {
  getTasks: jest.fn().mockReturnValue(of(mockTasks)),
  createTask: jest.fn().mockReturnValue(of({})),
  updateTask: jest.fn().mockReturnValue(of({})),
  deleteTask: jest.fn().mockReturnValue(of({})),
  reorderTasks: jest.fn().mockReturnValue(of({})),
  getAuditLogs: jest.fn().mockReturnValue(of([])),
};

const mockAuthService = {
  logout: jest.fn(),
};

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TasksComponent,
        CommonModule,
        FormsModule,
        StoreModule.forRoot({}),
      ],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: AuthService, useValue: mockAuthService },
      ],
      schemas: [NO_ERRORS_SCHEMA], // ignores unknown child components
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should load tasks on init', () => {
      expect(mockTaskService.getTasks).toHaveBeenCalled();
      expect(component.taskList).toEqual(mockTasks);
    });
  });

  describe('completionPercentage', () => {
    it('should return 0 if no tasks', () => {
      component['_taskList'] = [];
      expect(component.completionPercentage).toBe(0);
    });

    it('should calculate correct percentage', () => {
      component['_taskList'] = mockTasks;
      expect(component.completedCount).toBe(2);
      expect(component.totalCount).toBe(3);
      expect(component.completionPercentage).toBe(67);
    });
  });

  describe('toggleForm', () => {
    it('should show form when toggled', () => {
      expect(component.showForm).toBe(false);
      component.toggleForm();
      expect(component.showForm).toBe(true);
    });

    it('should clear selectedTask when closing form', () => {
      component.selectedTask = mockTasks[0];
      component.showForm = true;
      component.toggleForm();
      expect(component.selectedTask).toBeNull();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle dark mode', () => {
      expect(component.isDarkMode).toBe(false);
      component.toggleTheme();
      expect(component.isDarkMode).toBe(true);
      component.toggleTheme();
      expect(component.isDarkMode).toBe(false);
    });
  });

  describe('onSelectTaskForEdit', () => {
    it('should set selectedTask and show form', () => {
      component.onSelectTaskForEdit(mockTasks[0]);
      expect(component.selectedTask).toEqual(mockTasks[0]);
      expect(component.showForm).toBe(true);
    });
  });

  describe('onCancelEdit', () => {
    it('should clear selectedTask and hide form', () => {
      component.selectedTask = mockTasks[0];
      component.showForm = true;
      component.onCancelEdit();
      expect(component.selectedTask).toBeNull();
      expect(component.showForm).toBe(false);
    });
  });

  describe('showToast', () => {
    it('should set toast message', () => {
      component.showToast('Task created!');
      expect(component.toast).toEqual({ message: 'Task created!', type: 'success' });
    });

    it('should set error toast', () => {
      component.showToast('Failed!', 'error');
      expect(component.toast).toEqual({ message: 'Failed!', type: 'error' });
    });

    it('should clear toast after 3 seconds', () => {
      jest.useFakeTimers();
      component.showToast('Task created!');
      expect(component.toast).not.toBeNull();
      jest.advanceTimersByTime(3000);
      expect(component.toast).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('deleteTask', () => {
    it('should call deleteTask service and show toast', () => {
      component.deleteTask(1);
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  describe('logout', () => {
    it('should call auth service logout', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('canViewAuditLog', () => {
    it('should return true for Owner', () => {
      component.currentUser = { role: 'Owner' };
      expect(component.canViewAuditLog).toBe(true);
    });

    it('should return true for Admin', () => {
      component.currentUser = { role: 'Admin' };
      expect(component.canViewAuditLog).toBe(true);
    });

    it('should return false for Viewer', () => {
      component.currentUser = { role: 'Viewer' };
      expect(component.canViewAuditLog).toBe(false);
    });
  });

  describe('Template', () => {
    it('should call toggleForm when Add Task button clicked', () => {
      jest.spyOn(component, 'toggleForm');
      const button = fixture.nativeElement.querySelector('[data-testid="add-task-btn"]');
      button.click();
      expect(component.toggleForm).toHaveBeenCalled();
    });
  
    it('should show audit log button only for Owner and Admin', () => {
      component.currentUser = { role: 'Viewer' };
      fixture.detectChanges();
      const btn = fixture.nativeElement.querySelector('[data-testid="audit-log-btn"]');
      expect(btn).toBeFalsy();
  
      component.currentUser = { role: 'Admin' };
      fixture.detectChanges();
      const btn2 = fixture.nativeElement.querySelector('[data-testid="audit-log-btn"]');
      expect(btn2).toBeTruthy();
    });
  
    it('should display correct completion percentage', () => {
      component['_taskList'] = mockTasks;
      fixture.detectChanges();
      const bar = fixture.nativeElement.querySelector('[data-testid="completion-text"]');
      expect(bar?.textContent).toContain('67%');
    });
  });
});

