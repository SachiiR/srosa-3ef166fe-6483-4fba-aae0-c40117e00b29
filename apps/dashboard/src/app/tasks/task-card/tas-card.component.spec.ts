// task-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { Role, Task } from '@org/data';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  category: 'Work',
  status: 'Pending',
  order: 1,
} as Task;

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent, CommonModule, StoreModule.forRoot({})],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    component.task = mockTask;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should accept task input', () => {
      expect(component.task).toEqual(mockTask);
    });
  });

  describe('onEdit', () => {
    it('should emit task on edit', () => {
      jest.spyOn(component.edit, 'emit');
      component.onEdit();
      expect(component.edit.emit).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('onDelete', () => {
    it('should emit task id on delete', () => {
      jest.spyOn(component.delete, 'emit');
      component.onDelete();
      expect(component.delete.emit).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('isViewer', () => {
    it('should set isViewer true for Viewer role', () => {
      component.currentUser = { role: Role.VIEWER };
      component.isViewer = component.currentUser.role === Role.VIEWER;
      expect(component.isViewer).toBe(true);
    });

    it('should set isViewer false for non-Viewer role', () => {
      component.currentUser = { role: Role.OWNER };
      component.isViewer = component.currentUser.role === Role.VIEWER;
      expect(component.isViewer).toBe(false);
    });
  });

  describe('Template', () => {

    it('should call onEdit when edit button clicked', () => {
      jest.spyOn(component, 'onEdit');
      const editBtn = fixture.nativeElement.querySelector('[data-testid="edit-btn"]');
      editBtn.click();
      expect(component.onEdit).toHaveBeenCalled();
    });

    it('should show delete confirm dialog when delete button clicked', () => {
      const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]');
      deleteBtn.click();
      fixture.detectChanges();
      const dialog = fixture.nativeElement.querySelector('[data-testid="confirm-dialog"]');
      expect(dialog).toBeTruthy();
    });
  });
});