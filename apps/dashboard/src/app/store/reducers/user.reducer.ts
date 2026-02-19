// store/reducers/user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { setCurrentUser, loadUsersSuccess} from '../actions/user.action';
import { initialUserState } from './../app.state';

export const userReducer = createReducer(
  initialUserState,
  on(setCurrentUser, (state, { user }) => ({ ...state, currentUser: user })),
  on(loadUsersSuccess, (state, { users }) => ({ ...state, users }))
);