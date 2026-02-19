// task-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { CommonModule } from '@angular/common';
import { Task } from '@org/data';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const mockTasks: Task[] = [
  { id: 1, title: 'Task 1', status: 'Pending', category: 'Work', order: 1 } as Task,
  { id: 2, title: 'Task 2', status: 'Completed', category: 'Personal', order: 2 } as Task,
];

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent, CommonModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should accept tasks input', () => {
      component.tasks = mockTasks;
      fixture.detectChanges();
      expect(component.tasks).toEqual(mockTasks);
    });

    it('should default to empty array', () => {
      expect(component.tasks).toEqual([]);
    });
  });

  describe('trackByTaskId', () => {
    it('should return task id', () => {
      expect(component.trackByTaskId(0, mockTasks[0])).toBe(1);
      expect(component.trackByTaskId(1, mockTasks[1])).toBe(2);
    });
  });

  describe('outputs', () => {
    it('should emit editTask', () => {
      jest.spyOn(component.editTask, 'emit');
      component.editTask.emit(mockTasks[0]);
      expect(component.editTask.emit).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should emit deleteTask', () => {
      jest.spyOn(component.deleteTask, 'emit');
      component.deleteTask.emit(1);
      expect(component.deleteTask.emit).toHaveBeenCalledWith(1);
    });
  });

  describe('Template', () => {
    it('should show empty message when no tasks', () => {
      component.tasks = [];
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('[data-testid="empty-message"]');
      expect(empty).toBeTruthy();
    });

    it('should not show empty message when adit logs exist', () => {
      component.tasks = mockTasks;
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('[data-testid="empty-message"]');
      expect(empty).toBeTruthy();
    });
  });
});