import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { I18n } from '../core/i18n.service';
import { AdminApi, ClosedDay, ClosedSlot, SlotSettings } from './admin-api';
import { apiError, fmtDay, fmtHour, isoDay } from './admin-ui';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';

/** Slot rules (owner) + closing a day or a single hour (owner and staff). */
@Component({
  selector: 'app-admin-slots',
  imports: [FormsModule, AdminFlash],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().slots;
    <h1 class="text-2xl md:text-3xl font-black mb-5">{{ T.h }}</h1>

    @if (failed()) {
      <p class="card p-6 text-center font-bold text-brand-red2" role="alert">{{ t().failed }}
        <button type="button" class="underline ms-2" (click)="load()">{{ t().retry }}</button></p>
    } @else if (!settings()) {
      <div class="page-loading" role="status"><span class="spinner"></span>{{ t().loading }}</div>
    } @else {
      @let s = settings()!;
      @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

      <!-- rules -->
      <form class="card p-5 md:p-6 mb-5" (ngSubmit)="save()">
        <h2 class="text-lg font-black mb-1">{{ T.rules }}</h2>
        <p class="muted text-sm mb-4">{{ auth.isOwner() ? T.rulesP : T.ownerOnly }}</p>
        <fieldset class="grid grid-cols-2 lg:grid-cols-4 gap-4" [disabled]="!auth.isOwner() || busy()">
          <label><span class="lbl">{{ T.capacity }}</span>
            <input class="field" type="number" name="capacity" min="1" max="50" required [ngModel]="s.capacity" (ngModelChange)="patch({ capacity: +$event })"></label>
          <label><span class="lbl">{{ T.open }}</span>
            <select class="field" name="open" [ngModel]="s.openHour" (ngModelChange)="patch({ openHour: +$event })">
              @for (h of hours24; track h) { <option [value]="h">{{ hourLabel(h) }}</option> }</select></label>
          <label><span class="lbl">{{ T.close }}</span>
            <select class="field" name="close" [ngModel]="s.closeHour" (ngModelChange)="patch({ closeHour: +$event })">
              @for (h of hours24; track h) { <option [value]="h + 1">{{ hourLabel((h + 1) % 24) }}</option> }</select></label>
          <label><span class="lbl">{{ T.days }}</span>
            <input class="field" type="number" name="days" min="1" max="90" required [ngModel]="s.maxDaysAhead" (ngModelChange)="patch({ maxDaysAhead: +$event })"></label>
        </fieldset>
        @if (auth.isOwner()) {
          <button type="submit" [attr.aria-busy]="busy()" [disabled]="busy() || !dirty() || s.openHour >= s.closeHour" class="btn btn-red mt-5 disabled:opacity-50 disabled:pointer-events-none">{{ t().save }}</button>
          @if (s.openHour >= s.closeHour) { <small class="block mt-2 text-brand-red2 font-bold">{{ T.badHours }}</small> }
        }
      </form>

      <div class="grid lg:grid-cols-2 gap-5">
        <!-- closed days -->
        <section class="card p-5 md:p-6">
          <h2 class="text-lg font-black mb-4">{{ T.closedDays }}</h2>
          <form class="grid grid-cols-[1fr_auto] gap-2 mb-4" (ngSubmit)="closeDay()">
            <input class="field" type="date" name="d" required [min]="today" [ngModel]="day()" (ngModelChange)="day.set($event)" [attr.aria-label]="T.date">
            <button type="submit" [attr.aria-busy]="busy()" [disabled]="busy() || !day()" class="btn btn-red !px-5 disabled:opacity-50 disabled:pointer-events-none">{{ T.closeBtn }}</button>
            <input class="field col-span-2" name="dr" maxlength="200" [placeholder]="T.reason" [ngModel]="dayReason()" (ngModelChange)="dayReason.set($event)">
          </form>
          @for (d of closedDays(); track d.id) {
            <div class="flex items-center gap-3 py-2.5 border-t border-zinc-200 dark:border-ink-600">
              <div class="flex-1 min-w-0"><b class="block">{{ dayLabel(d.date) }}</b>@if (d.reason) { <small class="muted">{{ d.reason }}</small> }</div>
              <button type="button" [disabled]="busy()" (click)="openDay(d)" class="text-sm font-bold text-brand-red2 hover:underline">{{ T.reopen }}</button>
            </div>
          } @empty { <p class="muted text-sm">{{ T.noDays }}</p> }
        </section>

        <!-- closed hours -->
        <section class="card p-5 md:p-6">
          <h2 class="text-lg font-black mb-4">{{ T.closedHours }}</h2>
          <form class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-4" (ngSubmit)="closeSlot()">
            <input class="field" type="date" name="sd" required [min]="today" [ngModel]="slotDay()" (ngModelChange)="slotDay.set($event)" [attr.aria-label]="T.date">
            <select class="field" name="sh" [ngModel]="slotHour()" (ngModelChange)="slotHour.set(+$event)" [attr.aria-label]="T.hour">
              @for (h of openHours(); track h) { <option [value]="h">{{ hourLabel(h) }}</option> }</select>
            <button type="submit" [attr.aria-busy]="busy()" [disabled]="busy() || !slotDay()" class="btn btn-red !px-5 disabled:opacity-50 disabled:pointer-events-none">{{ T.closeBtn }}</button>
            <input class="field col-span-3" name="sr" maxlength="200" [placeholder]="T.reason" [ngModel]="slotReason()" (ngModelChange)="slotReason.set($event)">
          </form>
          @for (c of closedSlots(); track c.id) {
            <div class="flex items-center gap-3 py-2.5 border-t border-zinc-200 dark:border-ink-600">
              <div class="flex-1 min-w-0"><b class="block">{{ dayLabel(c.date) }} — {{ hourLabel(c.hour) }}</b>@if (c.reason) { <small class="muted">{{ c.reason }}</small> }</div>
              <button type="button" [disabled]="busy()" (click)="openSlot(c)" class="text-sm font-bold text-brand-red2 hover:underline">{{ T.reopen }}</button>
            </div>
          } @empty { <p class="muted text-sm">{{ T.noHours }}</p> }
        </section>
      </div>
    }
  `,
})
export class AdminSlots {
  private readonly api = inject(AdminApi);
  private readonly i = inject(I18n);
  protected readonly auth = inject(AuthService);
  protected readonly t = adminTexts();
  protected readonly today = isoDay();
  protected readonly hours24 = Array.from({ length: 24 }, (_, k) => k);

  protected readonly settings = signal<SlotSettings | null>(null);
  private saved = '';
  protected readonly dirty = computed(() => JSON.stringify(this.settings()) !== this.saved);
  protected readonly closedDays = signal<ClosedDay[]>([]);
  protected readonly closedSlots = signal<ClosedSlot[]>([]);
  protected readonly failed = signal(false);
  protected readonly busy = signal(false);
  protected readonly msg = signal('');
  protected readonly msgBad = signal(false);

  protected readonly day = signal('');
  protected readonly dayReason = signal('');
  protected readonly slotDay = signal('');
  protected readonly slotHour = signal(10);
  protected readonly slotReason = signal('');

  /** Hours that can be closed = the shop's working hours. */
  protected readonly openHours = computed(() => {
    const s = this.settings();
    return s ? Array.from({ length: s.closeHour - s.openHour }, (_, k) => s.openHour + k) : [];
  });

  constructor() { this.load(); }

  protected hourLabel(h: number) { return fmtHour(h, this.i.isAr()); }
  protected dayLabel(iso: string) { return fmtDay(iso, this.i.isAr()); }
  protected patch(p: Partial<SlotSettings>) { this.settings.update(s => (s ? { ...s, ...p } : s)); }

  protected load() {
    this.failed.set(false);
    this.api.slots().subscribe({
      next: r => {
        this.saved = JSON.stringify(r.settings);
        this.settings.set(r.settings); this.closedDays.set(r.closedDays); this.closedSlots.set(r.closedSlots);
        this.slotHour.set(r.settings.openHour);
      },
      error: () => this.failed.set(true),
    });
  }

  protected save() {
    const s = this.settings();
    if (!s) return;
    this.run(this.api.saveSettings(s), r => { this.saved = JSON.stringify(r); this.settings.set(r); return this.t().saved; });
  }

  protected closeDay() {
    this.run(this.api.closeDay(this.day(), this.dayReason().trim() || undefined), r => {
      this.closedDays.update(l => [...l, r.closed].sort((a, b) => a.date.localeCompare(b.date)));
      this.day.set(''); this.dayReason.set('');
      return r.activeBookings ? this.t().slots.hasBookings(r.activeBookings) : this.t().saved;
    });
  }

  protected closeSlot() {
    this.run(this.api.closeSlot(this.slotDay(), this.slotHour(), this.slotReason().trim() || undefined), r => {
      this.closedSlots.update(l => [...l, r.closed].sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour));
      this.slotReason.set('');
      return r.activeBookings ? this.t().slots.hasBookings(r.activeBookings) : this.t().saved;
    });
  }

  protected openDay(d: ClosedDay) {
    this.run(this.api.openDay(d.id), () => { this.closedDays.update(l => l.filter(x => x.id !== d.id)); return this.t().saved; });
  }

  protected openSlot(c: ClosedSlot) {
    this.run(this.api.openSlot(c.id), () => { this.closedSlots.update(l => l.filter(x => x.id !== c.id)); return this.t().saved; });
  }

  /** Runs one change, then shows its success message (or the reason it failed). */
  private run<T>(call: import('rxjs').Observable<T>, done: (r: T) => string) {
    this.busy.set(true); this.msg.set('');
    call.subscribe({
      next: r => { this.busy.set(false); this.msgBad.set(false); this.msg.set(done(r)); },
      error: e => {
        this.busy.set(false); this.msgBad.set(true);
        const err = apiError(e), T = this.t();
        this.msg.set(err.code === 'already_closed' ? T.slots.already : err.status === 403 ? T.slots.ownerOnly : err.message || T.failed);
      },
    });
  }
}
