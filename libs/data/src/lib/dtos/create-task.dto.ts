import { Category, TaskStatus } from "../data.enum";

export class CreateTaskDto {
    title!: string;
    description?: string;
    category?: Category;
    status: TaskStatus = TaskStatus.Pending;
    order!: number;
    assignedToId?: number;
  }