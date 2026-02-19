export interface AuditLog {
    id: number;
    action: string;
    userId: number;
    timestamp: Date;
  }