import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role, type Task } from '@org/data'; 
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/selectors/user.selector';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.css'],
})
export class TaskCardComponent {
  @Input() task!: Task; 
  @Output() edit = new EventEmitter<Task>();     
  @Output() delete = new EventEmitter<number>(); 
  currentUser$: Observable<any>;
  currentUser: any;
  isViewer: boolean = false;

  constructor(private store: Store){
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(){
    this.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.isViewer = user.role === Role.VIEWER;
      }
    });
  }

  onEdit() {
    this.edit.emit(this.task);
  }

  onDelete() {
    this.delete.emit(this.task.id);
  }

}