import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Category, Role, Task, TaskStatus } from '@org/data'; // from libs/data or local shared
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAllUsers, selectCurrentUser } from '../../store/selectors/user.selector';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent implements OnChanges {
  @Input() taskToEdit: Task | null = null;     // Pass existing task when editing
  @Output() taskSubmitted = new EventEmitter<Task>();
  @Output() taskUpdated = new EventEmitter<Task>();
  // @Input() users: any[] = [];
  // @Input() defaultAssignedId: number | null = null;
  @ViewChild('taskForm') taskForm!: NgForm;
  currentUser$: Observable<any>;
  userRole: string = '';
  isViewer: boolean = false;
  users$: Observable<any[]>;
  users: any[] = [];
  defaultAssignedId: number | null = null;
  // Form model
  formData: Partial<Task> = {
    title: '',
    description: '',
    category: Category.Work, 
    status: TaskStatus.Pending,
    assignedToId: undefined
  };

  isEditMode = false;

  constructor(private store: Store){
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.users$ = this.store.select(selectAllUsers);
  }

  @Output() cancelled = new EventEmitter<void>();

cancelEdit() {
  this.resetForm();
  this.cancelled.emit();
}

  resetForm() {
  this.formData = {
    title: '',
    description: '',
    category: Category.Work,
    status: TaskStatus.Pending,
    assignedToId: this.defaultAssignedId ? this.defaultAssignedId : undefined,
  };
  this.isEditMode = false;
  setTimeout(() => {
    this.taskForm?.resetForm(this.formData);
  }, 0);
}

  ngOnInit() {
    this.currentUser$.subscribe(user => {
      if (user) {
      this.defaultAssignedId = user.sub;
      this.isViewer = user.role === Role.VIEWER;
      }
    });

        this.users$.subscribe(users => {
      this.users = users;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['defaultAssignedId'] && this.defaultAssignedId) {
      this.formData.assignedToId = this.defaultAssignedId;
    }
    if (changes['taskToEdit'] && this.taskToEdit) {
      this.formData = { 
        ...this.taskToEdit,
        assignedToId: (this.taskToEdit as any).assignedTo?.id ?? null // ← map relation to id
      };
      this.isEditMode = true;
    }
  }

  onSubmit(form: NgForm) {
    console.log('-1')
    if (form.invalid) return;
    console.log('-2')
    if (this.isEditMode && this.taskToEdit?.id) {
      console.log('-4')
      this.taskUpdated.emit({ ...this.formData, id: this.taskToEdit.id } as Task);
    } else {
      console.log('-5')
      this.taskSubmitted.emit(this.formData as Task);
    }
  }
}