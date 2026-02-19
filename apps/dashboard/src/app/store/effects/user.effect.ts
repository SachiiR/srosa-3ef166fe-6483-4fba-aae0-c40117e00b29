import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map } from 'rxjs';
import { TaskService } from '../../tasks/task.service';
import { loadUsers, loadUsersSuccess } from '../actions/user.action';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private taskService = inject(TaskService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() => this.taskService.getUsers().pipe(
        map(users => loadUsersSuccess({ users }))
      ))
    )
  );
}