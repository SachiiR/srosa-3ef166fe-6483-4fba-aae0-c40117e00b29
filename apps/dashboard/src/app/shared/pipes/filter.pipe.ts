import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '@org/data';

@Pipe({ name: 'filter', standalone: true })
export class FilterPipe implements PipeTransform {
  transform(tasks: Task[] | null, filter: string): Task[] {
    if (!tasks) return [];
    if (!filter) return tasks;
    return tasks.filter(t => 
      t.title.toLowerCase().includes(filter.toLowerCase())
    );
  }
}