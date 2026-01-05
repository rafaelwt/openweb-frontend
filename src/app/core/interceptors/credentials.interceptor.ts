import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, defer, throwError } from 'rxjs';
import { switchMap, tap, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '@environments/environment';

/**
 * Tracks whether CSRF token has been initialized.
 *
 * @remarks
 * Set to true after first successful CSRF initialization.
 * Reset to false on 419/403 errors to force re-initialization.
 *
 * @internal
 */
let csrfInitialized = false;

/**
 * Observable for CSRF initialization in progress.
 *
 * @remarks
 * Shared across concurrent requests to prevent multiple initialization calls.
 * Uses shareReplay(1) to cache the result.
 *
 * @internal
 */
let csrfInit$: Observable<void> | null = null;

/**
 * HTTP methods that require CSRF protection.
 *
 * @remarks
 * These methods modify server state and require CSRF token validation.
 *
 * @internal
 */
const MUTATING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * HTTP Interceptor that adds credentials and manages CSRF protection.
 *
 * Features:
 * - Adds `withCredentials: true` and `X-Requested-With` header to all requests
 * - Lazy CSRF initialization: calls /api/session before first mutating request
 * - Auto-retry on CSRF token expiration (419/403 errors)
 * - Transparent token refresh without user intervention
 *
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of the HTTP event
 *
 * @remarks
 * **CSRF Protection Flow:**
 * 1. First mutating request triggers CSRF initialization
 * 2. Calls GET /api/session to receive CSRF cookie
 * 3. Subsequent requests include the cookie automatically
 * 4. On 419/403 errors, resets and re-initializes CSRF token
 * 5. Retries the failed request with fresh token
 *
 * **Mutating methods:** POST, PUT, DELETE, PATCH
 * **Safe methods:** GET, HEAD, OPTIONS (no CSRF required)
 *
 * @see {@link https://laravel.com/docs/csrf Laravel CSRF Protection}
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  const secureReq = req.clone({
    withCredentials: true,
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const needsCsrf = MUTATING_METHODS.includes(req.method.toUpperCase());
  const isSessionEndpoint = req.url.includes('/session');

  // First mutating request: initialize CSRF
  if (needsCsrf && !csrfInitialized && !isSessionEndpoint) {
    if (!csrfInit$) {
      csrfInit$ = initCsrf$(http).pipe(shareReplay(1));
    }
    return csrfInit$.pipe(
      switchMap(() => next(secureReq)),
      catchError((err) => retryOnCsrfError(err, http, secureReq, next)),
    );
  }

  // Already initialized: execute with auto-retry on CSRF error
  if (needsCsrf && !isSessionEndpoint) {
    return next(secureReq).pipe(catchError((err) => retryOnCsrfError(err, http, secureReq, next)));
  }

  return next(secureReq);
};

/**
 * Handles CSRF token expiration errors with automatic retry.
 *
 * @param err - The error thrown by the HTTP request
 * @param http - HttpClient instance for re-initialization
 * @param req - The original HTTP request to retry
 * @param next - The next handler in the chain
 * @returns Observable of HTTP event or error
 *
 * @remarks
 * **Retry logic:**
 * - Detects 419 (Page Expired) or 403 (Forbidden) errors
 * - Resets CSRF initialization state
 * - Calls /api/session to get fresh CSRF token
 * - Retries the original request once
 * - If retry fails, throws the original error
 *
 * **Error codes:**
 * - 419: Laravel CSRF token mismatch/expiration
 * - 403: Forbidden (may indicate CSRF issues)
 *
 * @internal
 */
function retryOnCsrfError(err: unknown, http: HttpClient, req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (err instanceof HttpErrorResponse && (err.status === 419 || err.status === 403)) {
    // Reset and get fresh token
    csrfInitialized = false;
    csrfInit$ = null;

    return initCsrf$(http).pipe(
      switchMap(() => next(req)),
      catchError(() => throwError(() => err)),
    );
  }

  return throwError(() => err);
}

/**
 * Initializes CSRF protection by calling the session endpoint.
 *
 * @param http - HttpClient instance to make the request
 * @returns Observable that completes when CSRF is initialized
 *
 * @remarks
 * **Initialization process:**
 * 1. Calls GET /api/session with credentials
 * 2. Server sets CSRF cookie (XSRF-TOKEN)
 * 3. Updates csrfInitialized flag on success
 * 4. Gracefully handles failures (sets initialized anyway to prevent blocking)
 *
 * **Cookie handling:**
 * - Laravel sets XSRF-TOKEN cookie
 * - Browser automatically includes cookie in subsequent requests
 * - Laravel validates CSRF token from X-XSRF-TOKEN header
 *
 * @internal
 */
function initCsrf$(http: HttpClient): Observable<void> {
  return defer(() =>
    http.get<void>(`${environment.apiUrl}/session`, {
      withCredentials: true,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }),
  ).pipe(
    tap(() => {
      csrfInitialized = true;
      csrfInit$ = null;
    }),
    catchError(() => {
      csrfInitialized = true;
      csrfInit$ = null;
      return of(undefined as void);
    }),
  );
}
