// filter.pipe.spec.ts
import { FilterPipe } from './filter.pipe';
import { Task } from '@org/data';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  const mockTasks: Task[] = [
    { id: 1, title: 'Buy groceries', status: 'Pending' } as Task,
    { id: 2, title: 'Fix bug', status: 'Completed' } as Task,
    { id: 3, title: 'Write tests', status: 'Pending' } as Task,
  ];

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty array if tasks is null', () => {
    expect(pipe.transform(null, '')).toEqual([]);
  });

  it('should return all tasks if filter is empty', () => {
    expect(pipe.transform(mockTasks, '')).toEqual(mockTasks);
  });

  it('should filter tasks by title case insensitively', () => {
    const result = pipe.transform(mockTasks, 'bug');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Fix bug');
  });

  it('should return empty array if no match', () => {
    const result = pipe.transform(mockTasks, 'xyz');
    expect(result).toHaveLength(0);
  });

  it('should match partial title', () => {
    const result = pipe.transform(mockTasks, 'wr');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Write tests');
  });

  it('should be case insensitive', () => {
    const upper = pipe.transform(mockTasks, 'BUY');
    const lower = pipe.transform(mockTasks, 'buy');
    expect(upper).toEqual(lower);
  });
});