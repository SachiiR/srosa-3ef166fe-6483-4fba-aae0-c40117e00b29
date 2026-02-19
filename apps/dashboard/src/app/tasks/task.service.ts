import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, User } from '@org/data'; 
import { API_URLS } from './../shared/const';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private taskUrl = API_URLS.tasks; 
  private usersUrl = API_URLS.users;
  private auditUrl = API_URLS.audit;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.taskUrl);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.taskUrl, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.taskUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.taskUrl}/${id}`);
  }

  reorderTasks(tasks: { id: number; order: number }[]): Observable<any> {
    return this.http.patch(`${this.taskUrl}/reorder`, { tasks });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.usersUrl}`);
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.auditUrl}`);
  }
}