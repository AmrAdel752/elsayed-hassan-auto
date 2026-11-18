import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Icon } from '../shared/icon';
import { AdminApi, Booking, Dashboard } from './admin-api';
import { BookingCard } from './booking-card';
import { adminTexts } from './admin.i18n';

/** Dashboard home: today's numbers + the next appointments. */
@Component({
  selector: 'app-admin-home',
  imports: [RouterLink, Icon, BookingCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().home;
    <h1 class="text-2xl md:text-3xl font-black">{{ T.hi }}، {{ auth.user()?.displayName }}</h1>
    <p class="muted mt-1 mb-6">{{ T.p }}</p>

    @if (failed()) {
      <p class="card p-6 text-center font-bold text-brand-red2" role="alert">{{ t().failed }}
        <button type="button" class="underline ms-2" (click)="load()">{{ t().retry }}</button></p>
    } @else if (!data()) {
      <div class="page-loading" role="status"><span class="spinner"></span>{{ t().loading }}</div>
    } @else {
      @let d = data()!;
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        @for (s of [
          { k: 'today', v: d.todayCounts.total - d.todayCounts.cancelled, icon: 'cal', q: { tab: 'today' } },
          { k: 'new', v: d.newCount, icon: 'spark', q: { tab: 'new' } },
          { k: 'week', v: d.upcomingCount, icon: 'clock', q: { tab: 'week' } },
          { k: 'done', v: d.todayCounts.done, icon: 'check', q: { tab: 'today' } }
        ]; track s.k) {
          <a routerLink="/admin/bookings" [queryParams]="s.q" class="card p-4 md:p-5 hover:border-brand-red/50 transition">
            <span class="w-10 h-10 rounded-xl grid place-items-center bg-brand-red/10 text-brand-red2 mb-3"><app-icon [name]="s.icon" class="w-5 h-5" /></span>
            <b class="block text-3xl font-black">{{ s.v }}</b>
            <small class="muted font-bold">{{ T.stat[s.k] }}</small>
          </a>
        }
      </div>

      <div class="flex items-center justify-between mt-8 mb-3">
        <h2 class="text-xl font-black">{{ T.next }}</h2>
        <a routerLink="/admin/bookings" class="text-sm font-bold text-brand-red2 hover:underline">{{ T.all }}</a>
      </div>
      @if (d.next.length) {
        <div class="space-y-3">
          @for (b of d.next; track b.id) { <app-booking-card [booking]="b" (changed)="onChanged($event)" /> }
        </div>
      } @else {
        <p class="card p-8 text-center muted">{{ T.none }}</p>
      }
    }
  `,
})
export class AdminHome {
  private readonly api = inject(AdminApi);
  protected readonly auth = inject(AuthService);
  protected readonly t = adminTexts();
  protected readonly data = signal<Dashboard | null>(null);
  protected readonly failed = signal(false);

  constructor() { this.load(); }

  protected load() {
    this.failed.set(false);
    this.api.dashboard().subscribe({ next: d => this.data.set(d), error: () => this.failed.set(true) });
  }

  /** A status changed: the counters may be different now. */
  protected onChanged(_: Booking) { this.load(); }
}
