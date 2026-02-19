import { Category, TaskStatus } from "../data.enum.js";

export class UpdateTaskDto {
    title!: string;
    description!: string;
    category?: Category;
    status!: TaskStatus;
    assignedToId!: number;
  }