import { User } from '@org/data';

export interface UserState {
  currentUser: any | null;
  users: User[];
}

export const initialUserState: UserState = {
  currentUser: null,
  users: []
};