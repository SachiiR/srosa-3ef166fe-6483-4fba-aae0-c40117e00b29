import { provideStore } from '@ngrx/store';
import { userReducer } from './store/reducers/user.reducer';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './auth/auth.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { UserEffects } from './store/effects/user.effect';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideStore({ user: userReducer }),
    provideEffects([UserEffects]),
    provideStoreDevtools({
      maxAge: 25,               // keep last 25 actions (good balance)
      logOnly: false,           // false = full features (time travel, jump, etc.)
    }),
  ]
};
