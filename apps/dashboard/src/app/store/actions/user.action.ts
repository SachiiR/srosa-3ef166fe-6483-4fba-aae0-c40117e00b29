// store/actions/user.action.ts
import { createAction, props } from '@ngrx/store';

export const setCurrentUser = createAction(
  '[User] Set Current User',
  props<{ user: any }>()
);

export const loadUsers = createAction('[User] Load Users');

export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: any[] }>()
);