import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadUsers, setCurrentUser } from '../store/actions/user.action';
import { Task, User } from '@org/data';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { FilterPipe } from "../shared/pipes/filter.pipe";
import { CategoryPipe } from "../shared/pipes/category.pipe";
import { TaskService } from './task.service';
import { AuthService } from './../auth/auth.service'
import { selectAllUsers, selectCurrentUser } from '../store/selectors/user.selector';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, TaskListComponent, TaskFormComponent, FilterPipe, CategoryPipe],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TasksComponent implements OnInit {
  // taskList: Task[] = [];
  filter: string = '';
  category: 'All' | 'Work' | 'Personal' = 'All';
  selectedTask: Task | null = null;
  isLoading = true;
  users: User[] = [];
  loggedInUserId: number | null = null;
  users$: Observable<any[]>;
  currentUser$: Observable<any>;
  @ViewChild(TaskFormComponent) taskFormComponent!: TaskFormComponent;
  private _taskList: Task[] = [];
  isDarkMode: boolean = false;
  showForm = false;
  currentUser: any;
  toast: { message: string; type: 'success' | 'error' } | null = null;
  auditLogs: any[] = [];
  showAuditLog = false;

  constructor(private store: Store, private taskService: TaskService, private authService: AuthService, private cd: ChangeDetectorRef) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.users$ = this.store.select(selectAllUsers);
  }

  ngOnInit() {
    const token = localStorage.getItem('jwt');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.store.dispatch(setCurrentUser({ user: payload }));
    }


    this.users$.subscribe(users => {
      this.users = users;
      
      this.cd.detectChanges();
    });

    this.currentUser$.subscribe(user => {
      if (user) {
        this.loggedInUserId = user.sub;
        console.log(user)
        this.currentUser = user
      }
    });
    this.store.dispatch(loadUsers());
    this.getTasks();
    // this.loadUsers();
    // this.getLoggedInUser();
  }

  get canViewAuditLog(): boolean {
    return this.currentUser?.role === 'Owner' || this.currentUser?.role === 'Admin';
  }
  
  toggleAuditLog() {
    if (!this.showAuditLog) {
      this.taskService.getAuditLogs().subscribe(logs => {
        this.auditLogs = logs;
        this.cd.detectChanges();
      });
    }
    this.showAuditLog = !this.showAuditLog;
    this.showForm = false;
  }
  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.selectedTask = null;
  }
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }


  getTasks(): Task[] {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.taskList = [...tasks];
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
    return this.taskList;
  }

  // onDrop(event: CdkDragDrop<Task[]>) {
  //   moveItemInArray(this.taskList, event.previousIndex, event.currentIndex);
  //   this.taskList = this.taskList.map((t, index) => ({ ...t, order: index + 1 }));

  //   this.taskService.reorderTasks(
  //     this.taskList.map(t => ({ id: t.id, order: t.order }))
  //   ).subscribe();

  //   this.cd.detectChanges();
  // }

  get taskList(): Task[] {
    return this._taskList;
  }

  set taskList(value: Task[]) {
    this._taskList = value;
  }

  onCancelEdit() {
    this.selectedTask = null;
    this.showForm = false;
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this._taskList, event.previousIndex, event.currentIndex);
    this.taskList = this._taskList.map((t, index) => ({ ...t, order: index + 1 }));

    this.taskService.reorderTasks(
      this._taskList.map(t => ({ id: t.id, order: t.order }))
    ).subscribe();

    this.cd.detectChanges();
  }

  logout() {
    this.authService.logout();
  }

  addNewTask(task: Task) {
    console.log('-3')
    this.taskService.createTask(task).subscribe({
      next: () => {
        this.taskList = this.getTasks();
        this.selectedTask = null;
        this.showForm = false;
        this.taskFormComponent.resetForm();
        this.showToast('Task created successfully!');
      },
      error: (err) => this.showToast('Failed to create task.', 'error')
    });
  }

  onSelectTaskForEdit(task: Task) {
    this.selectedTask = task;
    this.showForm = true;
  }

  // called when form is submitted — saves the task
  onEditTask(task: Task) {
    this.taskService.updateTask(task.id, task).subscribe({
      next: () => {
        this.getTasks();
        this.selectedTask = null;
        this.showForm = false;
        this.taskFormComponent.resetForm();
        this.showToast('Task updated successfully!');
      },
      error: (err) => this.showToast('Failed to update task.', 'error')
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.getTasks();
        this.showToast('Task deleted successfully!');
      },
      error: () => this.showToast('Failed to delete task.', 'error')
    });
  }

  get completedCount(): number {
    return this._taskList.filter(t => t.status === 'Completed').length;
  }
  
  get totalCount(): number {
    return this._taskList.length;
  }
  
  get completionPercentage(): number {
    if (!this.totalCount) return 0;
    return Math.round((this.completedCount / this.totalCount) * 100);
  }
}