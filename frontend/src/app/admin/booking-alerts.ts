import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { AdminApi, Booking } from './admin-api';

/**
 * While the dashboard is open (even in a background tab), checks for new website bookings every 30s.
 * A new one → a sound, a phone/desktop notification (if allowed), and a banner in the dashboard.
 * `count` = bookings still marked "New" (not confirmed yet), shown as a badge on "Bookings" in the menu.
 */
@Injectable()
export class BookingAlerts {
  private readonly api = inject(AdminApi);
  /** Unconfirmed ("New") bookings. */
  readonly count = signal(0);
  /** Bookings that arrived while the dashboard was open (newest first), until dismissed. */
  readonly fresh = signal<Booking[]>([]);
  /** Browser notifications: 'default' = not asked yet. */
  readonly permission = signal<NotificationPermission | 'unsupported'>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

  private seen: Set<number> | null = null;

  constructor() {
    const timer = setInterval(() => this.check(), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    this.check();
  }

  check() {
    this.api.bookings({ status: 'New', sort: 'newest', pageSize: 20 }).subscribe({
      next: r => {
        this.count.set(r.total);
        const ids = new Set(r.items.map(b => b.id));
        if (this.seen) {
          const added = r.items.filter(b => !this.seen!.has(b.id));
          if (added.length) { this.fresh.update(l => [...added, ...l].slice(0, 5)); this.ring(added); }
        }
        this.seen = new Set([...(this.seen ?? []), ...ids]);
      },
      error: () => { /* offline / signed out: try again on the next tick */ },
    });
  }

  dismiss(id?: number) { this.fresh.update(l => (id ? l.filter(b => b.id !== id) : [])); }

  /** Ask once (from a button click) to show notifications on the phone / computer. */
  async allow() {
    if (typeof Notification === 'undefined') return;
    this.permission.set(await Notification.requestPermission());
  }

  private ring(added: Booking[]) {
    beep();
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    for (const b of added) {
      try {
        const n = new Notification(`حجز جديد — ${b.name}`, { body: `${b.code} · ${b.date} · ${b.hour}:00 · Nissan ${b.model}`, tag: b.code, icon: '/favicon.ico' });
        n.onclick = () => { focus(); location.assign('/admin/bookings'); };
      } catch { /* some phones only allow notifications from an installed app */ }
    }
  }
}

/** Short two-tone "ding" (no sound file needed). Browsers may block it until the page was clicked once. */
function beep() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((f, n) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + n * 0.18;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.start(t); o.stop(t + 0.32);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch { /* no audio */ }
}
