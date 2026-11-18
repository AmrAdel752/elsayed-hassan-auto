import { HttpClient, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

/** Dashboard sections whose content appears on the website (same list as the API's SiteRebuild). */
const SITE_PATHS = /\/api\/admin\/(categories|products|offers|reviews|gallery|before-after)(\/|$|\?)/;

/**
 * Keeps open website pages up to date with the dashboard, without a refresh:
 * - every 10s (only while the tab is visible) and whenever the tab comes back into view, it asks the API
 *   for a tiny "content version" (GET /api/version); when it moved, `changes` fires and the stores reload;
 * - a save in the dashboard fires `changes` at once in the same tab and in every other tab of the same
 *   browser (BroadcastChannel), so the owner sees the result immediately.
 */
@Injectable({ providedIn: 'root' })
export class ContentSync {
  private readonly http = inject(HttpClient);
  private readonly changed = new Subject<void>();
  private readonly channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('sha-content');
  private last: number | null = null;
  private busy = false;

  /** Fires when website content changed: reload the live data. */
  readonly changes: Observable<void> = this.changed.asObservable();

  constructor() {
    this.channel?.addEventListener('message', () => this.changed.next());
    if (typeof document === 'undefined') return;
    const visible = () => document.visibilityState === 'visible';
    setInterval(() => visible() && this.check(), 10_000);
    document.addEventListener('visibilitychange', () => visible() && this.check());
    addEventListener('focus', () => this.check());
    this.check();
  }

  private check() {
    if (this.busy) return;
    this.busy = true;
    this.http.get<{ v: number }>(`${environment.apiUrl}/api/version`).subscribe({
      next: ({ v }) => {
        this.busy = false;
        if (this.last !== null && v !== this.last) this.changed.next();
        this.last = v;
      },
      error: () => { this.busy = false; },   // server asleep / offline: try again on the next tick
    });
  }

  /** The dashboard just saved something shown on the website. */
  notify() {
    this.changed.next();
    this.channel?.postMessage('changed');
  }
}

/** After a successful add / edit / delete in a dashboard section shown on the website, tell open pages. */
export const contentChangeInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' || !SITE_PATHS.test(req.url)) return next(req);
  const sync = inject(ContentSync);
  return next(req).pipe(tap(e => { if (e instanceof HttpResponse && e.ok) sync.notify(); }));
};
