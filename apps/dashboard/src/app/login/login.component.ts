import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  name = '';
  isLoginMode = true;
  isLoginFail = false;

  constructor(private authService: AuthService) {}
  ngOnInit() {
    this.email = '';
    this.password = '';
    this.name = '';
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next:() => {
          this.email = '';
          this.password = '';
        },
        error: (err) => {
          this.isLoginFail = true;
        }
      });
    } else {
      this.authService.register({ username: this.name, email: this.email, password: this.password }).subscribe({
        next: () => {
          this.isLoginMode = true;
          this.name = '';
          this.email = '';
          this.password = '';
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }
}