import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '@org/data';

@Pipe({ name: 'category', standalone: true })
export class CategoryPipe implements PipeTransform {
  transform(tasks: Task[] | null, category: string): Task[] {
    if (!tasks) return [];
    if (category === 'All') return tasks;
    return tasks.filter(t => t.category === category);
  }
}