import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; 
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('jwt'));

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => { 
        console.log('saving token:', res);
        localStorage.setItem('jwt', res.token);
        this.tokenSubject.next(res.token);
        this.router.navigate(['/tasks']);
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.tokenSubject.asObservable().pipe(map(token => !!token));
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  register(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        // localStorage.setItem('jwt', res.token);
        // this.tokenSubject.next(res.token);
        this.router.navigate(['/login']);
      })
    );
  }
  constructor(private http: HttpClient, private router: Router) {}
}