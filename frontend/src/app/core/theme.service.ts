import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Theme {
  readonly dark = signal(document.documentElement.classList.contains('dark'));

  toggle() {
    const dark = document.documentElement.classList.toggle('dark');
    this.dark.set(dark);
    try { localStorage.setItem('sha-theme', dark ? 'dark' : 'light'); } catch {}
  }
}
