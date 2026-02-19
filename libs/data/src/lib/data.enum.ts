export enum Role {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    VIEWER = 'Viewer',
  }

  export enum RoleHierarchy {
    OWNER = 3,
    ADMIN = 2,
    VIEWER = 1,
  }
  export enum Category { 
    Work = 'Work', 
    Personal = 'Personal', 
} 
export enum TaskStatus { 
    Pending = 'Pending', 
    InProgress = 'In Progress', 
    Completed = 'Completed', 
}