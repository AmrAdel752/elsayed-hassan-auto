import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminUser { id: number; userName: string; displayName: string; role: 'Owner' | 'Staff'; }
interface Session { token: string; expiresAt: string; user: AdminUser; }

const KEY = 'sha-admin';

/** Dashboard login state: JWT from POST /api/auth/login, kept in localStorage until it expires (8h). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(read());
  private timer?: ReturnType<typeof setTimeout>;

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isOwner = computed(() => this.user()?.role === 'Owner');
  /** Token for the Authorization header, or null when logged out / expired. */
  readonly token = computed(() => this.session()?.token ?? null);

  constructor() {
    this.watchExpiry();
    // logging in or out in another tab applies here too
    addEventListener('storage', e => { if (e.key === KEY) { this.session.set(read()); this.watchExpiry(); } });
  }

  isLoggedIn() {
    const s = this.session();
    if (s && Date.parse(s.expiresAt) <= Date.now()) { this.clear(); return false; }
    return !!s;
  }

  async login(userName: string, password: string) {
    const s = await firstValueFrom(
      this.http.post<Session>(`${environment.apiUrl}/api/auth/login`, { userName, password }).pipe(timeout(15000)));
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
    this.session.set(s);
    this.watchExpiry();
  }

  /** Forget the token and go to the login page (`expired` shows a "session ended" note there). */
  logout(expired = false) {
    this.clear();
    this.router.navigate(['/admin/login'], expired ? { queryParams: { expired: 1 } } : {});
  }

  private clear() {
    clearTimeout(this.timer);
    try { localStorage.removeItem(KEY); } catch {}
    this.session.set(null);
  }

  /** Log out by itself the moment the token expires, so a stale dashboard isn't left open. */
  private watchExpiry() {
    clearTimeout(this.timer);
    const s = this.session();
    if (!s) return;
    const ms = Date.parse(s.expiresAt) - Date.now();
    if (ms <= 0) { this.clear(); return; }
    this.timer = setTimeout(() => this.logout(true), Math.min(ms, 2 ** 31 - 1));
  }
}

function read(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Session | null;
    return s?.token && s.user && Date.parse(s.expiresAt) > Date.now() ? s : null;
  } catch { return null; }
}
