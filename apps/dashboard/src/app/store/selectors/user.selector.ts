// store/selectors/user.selector.ts
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from './../app.state.js';

export const selectUserState = createFeatureSelector<UserState>('user');
export const selectCurrentUser = createSelector(selectUserState, s => s.currentUser);
export const selectAllUsers = createSelector(selectUserState, s => s.users);