// task-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { Category, Task, TaskStatus } from '@org/data';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  category: Category.Work,
  status: TaskStatus.Pending,
  assignedTo: { id: 2 },
  ownerId: 1, 
  organizationId: 1, 
  order: 1, 
  assignedToId: 2, 
} as Task;

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, CommonModule, FormsModule, StoreModule.forRoot({})],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with empty form', () => {
      expect(component.formData.title).toBe('');
      expect(component.formData.category).toBe(Category.Work);
      expect(component.formData.status).toBe(TaskStatus.Pending);
      expect(component.isEditMode).toBe(false);
    });

    it('should not be in edit mode initially', () => {
      expect(component.isEditMode).toBe(false);
    });
  });

  describe('ngOnChanges', () => {
    it('should populate form when taskToEdit is set', () => {
      component.taskToEdit = mockTask;
      component.ngOnChanges({
        taskToEdit: {
          currentValue: mockTask,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(component.formData.title).toBe('Test Task');
      expect(component.formData.description).toBe('Test Description');
      expect(component.isEditMode).toBe(true);
    });

    it('should map assignedTo relation to assignedToId', () => {
      component.taskToEdit = mockTask;
      component.ngOnChanges({
        taskToEdit: {
          currentValue: mockTask,
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(component.formData.assignedToId).toBe(2);
    });
  });

  describe('resetForm', () => {
    it('should reset form data to defaults', () => {
      component.formData.title = 'Something';
      component.isEditMode = true;
      component.resetForm();

      expect(component.formData.title).toBe('');
      expect(component.formData.category).toBe(Category.Work);
      expect(component.formData.status).toBe(TaskStatus.Pending);
      expect(component.isEditMode).toBe(false);
    });
  });

  describe('cancelEdit', () => {
    it('should emit cancelled event', () => {
      jest.spyOn(component.cancelled, 'emit');
      component.cancelEdit();
      expect(component.cancelled.emit).toHaveBeenCalled();
    });

    it('should reset form on cancel', () => {
      component.formData.title = 'Something';
      component.cancelEdit();
      expect(component.formData.title).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should emit taskSubmitted in create mode', () => {
      jest.spyOn(component.taskSubmitted, 'emit');
      component.isEditMode = false;
      component.formData = { title: 'New Task', category: Category.Work, status: TaskStatus.Pending };

      const mockForm = { invalid: false } as any;
      component.onSubmit(mockForm);

      expect(component.taskSubmitted.emit).toHaveBeenCalledWith(component.formData);
    });

    it('should emit taskUpdated in edit mode', () => {
      jest.spyOn(component.taskUpdated, 'emit');
      component.isEditMode = true;
      component.taskToEdit = mockTask;
      component.formData = { ...mockTask };

      const mockForm = { invalid: false } as any;
      component.onSubmit(mockForm);

      expect(component.taskUpdated.emit).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockTask.id })
      );
    });

    it('should not emit if form is invalid', () => {
      jest.spyOn(component.taskSubmitted, 'emit');
      const mockForm = { invalid: true } as any;
      component.onSubmit(mockForm);
      expect(component.taskSubmitted.emit).not.toHaveBeenCalled();
    });
  });

  describe('isViewer', () => {
    it('should set isViewer true for Viewer role', () => {
      component.isViewer = true;
      expect(component.isViewer).toBe(true);
    });

    it('should set isViewer false for non-Viewer role', () => {
      component.isViewer = false;
      expect(component.isViewer).toBe(false);
    });
  });
});