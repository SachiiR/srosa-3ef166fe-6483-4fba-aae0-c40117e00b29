import { TaskStatus, Category } from "./../../index.js";

export interface Task {
    id: number;
    title: string;
    description: string;
    category: Category;
    status: TaskStatus;
    ownerId: number;
    organizationId: number;
    order: number;
    assignedToId: number;
  }