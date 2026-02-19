// category.pipe.spec.ts
import { CategoryPipe } from './category.pipe';
import { Task } from '@org/data';

describe('CategoryPipe', () => {
  let pipe: CategoryPipe;

  const mockTasks: Task[] = [
    { id: 1, title: 'Task 1', category: 'Work', status: 'Pending' } as Task,
    { id: 2, title: 'Task 2', category: 'Personal', status: 'Pending' } as Task,
    { id: 3, title: 'Task 3', category: 'Work', status: 'Completed' } as Task,
  ];

  beforeEach(() => {
    pipe = new CategoryPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array if tasks is null', () => {
    expect(pipe.transform(null, 'All')).toEqual([]);
  });

  it('should return all tasks if category is All', () => {
    expect(pipe.transform(mockTasks, 'All')).toEqual(mockTasks);
  });

  it('should filter by Work category', () => {
    const result = pipe.transform(mockTasks, 'Work');
    expect(result).toHaveLength(2);
    result.forEach(t => expect(t.category).toBe('Work'));
  });

  it('should filter by Personal category', () => {
    const result = pipe.transform(mockTasks, 'Personal');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Task 2');
  });

  it('should return empty array if no tasks match category', () => {
    const result = pipe.transform(mockTasks, 'Shopping');
    expect(result).toHaveLength(0);
  });
});