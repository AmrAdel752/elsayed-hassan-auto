import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const ADMIN_API = `${environment.apiUrl}/api/admin`;

/**
 * Adds the admin token to dashboard API calls only (never to public calls or other hosts).
 * A 401 from the dashboard API means the token expired or the account was disabled: log out.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(ADMIN_API)) return next(req);
  const auth = inject(AuthService), token = auth.token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req).pipe(
    catchError((e: unknown) => {
      if (e instanceof HttpErrorResponse && e.status === 401) auth.logout(true);
      return throwError(() => e);
    }));
};

/** Dashboard pages: logged-in admins only; others go to the login page and come back afterwards. */
export const adminGuard: CanActivateFn = (_, state) =>
  inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });

/** Login page: already logged in → straight to the dashboard. */
export const loginGuard: CanActivateFn = () =>
  !inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/admin']);
