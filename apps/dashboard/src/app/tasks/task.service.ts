import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, User } from '@org/data'; // From libs/data

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks'; // Backend API
  private usersUrl = 'http://localhost:3000/api/user';
  private auditUrl = 'http://localhost:3000/api/audit';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorderTasks(tasks: { id: number; order: number }[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reorder`, { tasks });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.usersUrl}`);
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.auditUrl}`);
  }
}