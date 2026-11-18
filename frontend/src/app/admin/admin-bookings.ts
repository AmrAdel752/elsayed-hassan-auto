import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Icon } from '../shared/icon';
import { AdminApi, Booking, BookingStatus } from './admin-api';
import { isoDay } from './admin-ui';
import { BookingCard } from './booking-card';
import { adminTexts } from './admin.i18n';

type Tab = 'today' | 'tomorrow' | 'week' | 'new' | 'all';
const TABS: Tab[] = ['today', 'tomorrow', 'week', 'new', 'all'];
const PAGE = 20;

/** Bookings list: quick tabs, status filter, search, status buttons on every card. */
@Component({
  selector: 'app-admin-bookings',
  imports: [FormsModule, Icon, BookingCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().bookings;
    <h1 class="text-2xl md:text-3xl font-black mb-5">{{ T.h }}</h1>

    <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none]" role="tablist">
      @for (x of tabs; track x) {
        <button type="button" role="tab" [attr.aria-selected]="active() === x" (click)="pick(x)"
                class="shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition"
                [class]="active() === x ? 'border-brand-red bg-brand-red text-white' : 'border-zinc-300 dark:border-ink-600 bg-white dark:bg-white/5'">{{ T.tabs[x] }}</button>
      }
    </div>

    <div class="grid sm:grid-cols-[1fr_200px] gap-3 mt-3 mb-5">
      <label class="relative block">
        <app-icon name="search" class="w-5 h-5 absolute inset-y-0 start-4 my-auto muted pointer-events-none" />
        <input class="field ps-12" type="search" [placeholder]="T.search" [ngModel]="q()" (ngModelChange)="onSearch($event)">
      </label>
      <select class="field" [ngModel]="status()" (ngModelChange)="status.set($event); reload()" [attr.aria-label]="T.filter">
        <option value="">{{ T.anyStatus }}</option>
        @for (s of statuses; track s) { <option [value]="s">{{ T.status[s] }}</option> }
      </select>
    </div>

    @if (failed()) {
      <p class="card p-6 text-center font-bold text-brand-red2" role="alert">{{ t().failed }}
        <button type="button" class="underline ms-2" (click)="reload()">{{ t().retry }}</button></p>
    } @else if (loading() && !items().length) {
      <div class="page-loading" role="status"><span class="spinner"></span>{{ t().loading }}</div>
    } @else if (!items().length) {
      <p class="card p-10 text-center muted">{{ T.empty }}</p>
    } @else {
      <p class="muted text-sm font-bold mb-3">{{ T.count(total()) }}</p>
      <div class="space-y-3">
        @for (b of items(); track b.id) { <app-booking-card [booking]="b" (changed)="onChanged($event)" /> }
      </div>
      @if (items().length < total()) {
        <button type="button" [attr.aria-busy]="loading()" [disabled]="loading()" (click)="more()" class="btn border border-zinc-300 dark:border-ink-600 mx-auto mt-5 flex">{{ loading() ? t().loading : T.more }}</button>
      }
    }
  `,
})
export class AdminBookings {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  protected readonly t = adminTexts();
  protected readonly tabs = TABS;
  protected readonly statuses: BookingStatus[] = ['New', 'Confirmed', 'Done', 'NoShow', 'Cancelled'];

  /** `?tab=today|tomorrow|week|new|all` (links from the dashboard home). */
  readonly tab = input<string>();

  protected readonly active = signal<Tab>('today');
  protected readonly q = signal('');
  protected readonly status = signal<BookingStatus | ''>('');
  protected readonly items = signal<Booking[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  private page = 1;
  private timer?: ReturnType<typeof setTimeout>;
  private request = 0;

  constructor() {
    effect(() => {
      const x = this.tab() as Tab | undefined;
      untracked(() => { this.active.set(x && TABS.includes(x) ? x : 'today'); this.reload(); });
    });
  }

  protected pick(x: Tab) { this.router.navigate([], { queryParams: { tab: x }, replaceUrl: true }); }

  protected onSearch(v: string) {
    this.q.set(v);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.reload(), 350);
  }

  protected reload() { this.page = 1; this.fetch(false); }
  protected more() { this.page++; this.fetch(true); }

  private fetch(append: boolean) {
    const id = ++this.request, a = this.active(), searching = !!this.q().trim();
    // a search looks in every booking, not only the open tab
    const range = searching ? {} : {
      today: { date: isoDay() }, tomorrow: { date: isoDay(1) }, week: { from: isoDay(), to: isoDay(6) },
      new: { from: isoDay(), status: 'New' }, all: { sort: 'newest' },
    }[a];
    this.loading.set(true); this.failed.set(false);
    this.api.bookings({ ...range, status: this.status() || (range as { status?: string }).status, q: this.q().trim(), page: this.page, pageSize: PAGE })
      .subscribe({
        next: r => {
          if (id !== this.request) return;   // an older answer arriving late
          this.items.set(append ? [...this.items(), ...r.items] : r.items);
          this.total.set(r.total); this.loading.set(false);
        },
        error: () => { if (id === this.request) { this.loading.set(false); this.failed.set(true); } },
      });
  }

  protected onChanged(b: Booking) { this.items.update(list => list.map(x => (x.id === b.id ? b : x))); }
}
