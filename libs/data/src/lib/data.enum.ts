export enum Role {
    OWNER = 'Owner',
    ADMIN = 'Admin',
    VIEWER = 'Viewer',
  }

  export enum RoleHierarchy {
    ADMIN = 3,
    OWNER = 2,
    VIEWER = 1,
  }
  export enum Category { 
    Work = 'Work', 
    Personal = 'Personal', 
    All = 'All'
} 
export enum TaskStatus { 
    Pending = 'Pending', 
    Completed = 'Completed', 
}