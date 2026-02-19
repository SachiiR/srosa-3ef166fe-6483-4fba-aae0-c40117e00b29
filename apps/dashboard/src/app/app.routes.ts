import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { map } from 'rxjs';

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      return authService.isAuthenticated().pipe(
        map(isAuth => isAuth ? router.createUrlTree(['/tasks']) : true)
      );
    }],
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/task.component').then(m => m.TasksComponent),
    // canActivate: [() => inject(AuthService).isAuthenticated().pipe(map(isAuth => isAuth || '/login'))],
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      return authService.isAuthenticated().pipe(
        map(isAuth => isAuth ? true : router.createUrlTree(['/login']))
      );
    }],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];