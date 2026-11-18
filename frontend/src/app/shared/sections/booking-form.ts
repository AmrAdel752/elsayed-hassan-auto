import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { I18n } from '../../core/i18n.service';
import { SITE, isDayOff, waLink } from '../../core/site';
import { BookingApi } from '../../core/booking-api';
import { Icon } from '../icon';
import { Reveal } from '../reveal.directive';

const OPEN = 10, CLOSE = 22, DAYS_AHEAD = 30;
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

@Component({
  selector: 'app-booking-form',
  imports: [FormsModule, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap grid lg:grid-cols-[.9fr_1.1fr] gap-8 lg:gap-12 items-center">
      <div reveal>
        <span class="tag">{{ i.t('home.bk.tag') }}</span>
        <h2 class="h2" [innerHTML]="i.t('home.bk.h')"></h2>
        <p class="muted text-base md:text-[17px] mb-6 md:mb-8">{{ i.t('home.bk.p') }}</p>
        <ol class="space-y-4 md:space-y-6">
          @for (s of i.dict().home.bk.steps; track $index; let n = $index, last = $last) {
            <li class="relative flex gap-4 items-start">
              @if (!last) { <span class="absolute top-14 start-6 h-[calc(100%-32px)] border-s-2 border-dashed border-brand-red/40"></span> }
              <div class="shrink-0 w-12 h-12 rounded-full grid place-items-center text-lg font-black text-brand-red2 bg-zinc-50 dark:bg-ink-900 border-2 border-brand-red shadow-[0_0_24px_rgba(220,47,54,.35)]">{{ n + 1 }}</div>
              <div><h4 class="text-lg font-extrabold">{{ s[0] }}</h4><p class="muted text-[15px]">{{ s[1] }}</p></div>
            </li>
          }
        </ol>
      </div>

      <form #f="ngForm" (ngSubmit)="send(f)" [reveal]=".15" class="card relative overflow-hidden p-6 md:p-9 space-y-4">
        <div class="absolute -top-24 -end-24 w-60 h-60 rounded-full bg-brand-red/20 blur-3xl pointer-events-none"></div>
        <div class="relative flex items-center gap-3 mb-2">
          <div class="ic-red w-12 h-12 rounded-2xl"><app-icon name="cal" class="w-6 h-6" /></div>
          <h3 class="text-2xl font-black">{{ i.t('home.bk.form') }}</h3>
        </div>
        <div class="relative grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ i.t('home.bk.name') }}</span><input name="name" ngModel required minlength="2" maxlength="100" class="field" [placeholder]="i.t('home.bk.phName')"></label>
          <label><span class="lbl">{{ i.t('home.bk.phone') }}</span>
            <input name="phone" ngModel required type="tel" dir="ltr" maxlength="11" pattern="01[0125][0-9]{8}" class="field" placeholder="01xxxxxxxxx" #ph="ngModel">
            @if (ph.invalid && ph.touched) { <small class="text-brand-red2 text-xs font-bold mt-1 block">{{ i.t('book.info.badPhone') }}</small> }
          </label>
          <label><span class="lbl">{{ i.t('home.bk.model') }}</span>
            <select name="model" ngModel required class="field">
              <option value="" disabled>{{ i.t('common.choose') }}</option>
              @for (m of models; track m) { <option [value]="m">{{ m }}</option> }
              <option value="Other">{{ i.t('common.other') }}</option>
            </select>
          </label>
          <label><span class="lbl">{{ i.t('home.bk.service') }}</span>
            <select name="service" ngModel required class="field">
              <option value="" disabled>{{ i.t('common.choose') }}</option>
              @for (s of i.dict().services; track s.slug) { <option [value]="s.slug">{{ s.t }}</option> }
            </select>
          </label>
          <label><span class="lbl">{{ i.t('home.bk.date') }}</span>
            <input name="date" type="date" ngModel required [min]="today" [max]="maxDate" class="field" (ngModelChange)="pickDate($event, f)"></label>
          <label><span class="lbl">{{ i.t('home.bk.time') }}</span>
            <select name="hour" ngModel required class="field" [disabled]="!date()">
              <option value="" disabled>{{ !date() ? i.t('home.bk.pickDate') : times().length ? i.t('common.choose') : dayOff() ? i.t('home.bk.dayOff') : slotsState() === 'loading' ? i.t('load.wait') : slotsState() === 'error' ? i.t('load.fail') : i.t('home.bk.noTimes') }}</option>
              @for (t of times(); track t.h) {
                <option [value]="t.h" [disabled]="t.left === 0">{{ fmtHour(t.h) }}{{ t.left === 0 ? ' — ' + i.t('home.bk.full') : '' }}</option>
              }
            </select>
            @if (date() && slotsState() === 'error') {
              <button type="button" class="mt-1.5 text-sm font-bold text-brand-red2 hover:underline" (click)="loadSlots()">{{ i.t('load.retry') }}</button>
            }
          </label>
        </div>
        <label class="relative block"><span class="lbl">{{ i.t('home.bk.notes') }}</span>
          <textarea name="notes" ngModel rows="3" maxlength="1000" class="field resize-none" [placeholder]="i.t('home.bk.phNotes')"></textarea></label>
        <!-- honeypot: hidden from people, bots fill it and the API drops the booking -->
        <input type="text" name="website" ngModel tabindex="-1" autocomplete="off" aria-hidden="true" class="absolute -start-[9999px] w-px h-px opacity-0">

        @if (err()) {
          <p class="relative rounded-2xl border border-brand-red/40 bg-brand-red/10 text-brand-red2 p-3 text-sm font-bold" role="alert">{{ i.t('book.err.' + err()) }}
            @if (err() === 'down' && downUrl()) {
              <a [href]="downUrl()" target="_blank" class="btn bg-[#25d366] text-white !py-2 !px-4 !text-sm mt-2 w-full justify-center"><app-icon name="wa" class="w-4 h-4" />{{ i.t('load.wa') }}</a>
            }</p>
        }
        @if (code()) {
          <p class="relative rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 text-sm font-bold" role="status">
            {{ i.t('home.bk.ok') }} <b dir="ltr">{{ code() }}</b></p>
        }
        <button type="submit" [attr.aria-busy]="sending()" [disabled]="sending()" class="btn btn-red relative w-full justify-center !py-4 text-lg disabled:opacity-60 disabled:pointer-events-none">
          <app-icon name="wa" class="w-5 h-5" />{{ sending() ? i.t('book.sending') : i.t('home.bk.submit') }}</button>
        <p class="relative muted text-xs text-center">{{ i.t('home.bk.hint') }}</p>
      </form>
    </div>
  `,
})
export class BookingForm {
  protected readonly i = inject(I18n);
  private readonly api = inject(BookingApi);
  protected readonly models = SITE.models;
  protected readonly today = iso(new Date());
  protected readonly maxDate = iso(new Date(Date.now() + DAYS_AHEAD * 864e5));

  protected readonly date = signal('');
  protected readonly dayOff = computed(() => !!this.date() && isDayOff(this.date()));
  /** Places left per "yyyy-mm-dd|hour". undefined = not loaded yet, null = API unreachable (no hours offered, "try again"). */
  private readonly slots = signal<Map<string, number> | null | undefined>(undefined);
  protected readonly slotsState = computed(() => { const s = this.slots(); return s === undefined ? 'loading' : s === null ? 'error' : 'ok'; });
  protected readonly sending = signal(false);
  protected readonly err = signal<'' | 'taken' | 'many' | 'generic' | 'down'>('');
  protected readonly code = signal('');

  /** Hours for the chosen day; past hours today are hidden. */
  protected readonly times = computed(() => {
    const d = this.date(), map = this.slots();
    if (!d || isDayOff(d) || !map) return [];   // Sunday: day off; no server answer: no times offered
    const now = new Date(), isToday = d === iso(now);
    const out: { h: number; left: number }[] = [];
    for (let h = OPEN; h < CLOSE; h++) {
      if (isToday && h <= now.getHours()) continue;
      out.push({ h, left: map.get(`${d}|${h}`) ?? 0 });
    }
    return out;
  });

  protected pickDate(d: string, f: NgForm) {
    this.date.set(d);
    f.controls['hour']?.setValue('');
    if (this.slots() === undefined) this.loadSlots();
  }

  private slotsBusy = false;
  /** Free times are fetched as soon as the form appears, so they're ready by the time a day is picked. */
  private readonly preload = this.loadSlots();
  protected loadSlots() {
    if (this.slotsBusy) return;
    this.slotsBusy = true; this.slots.set(undefined);
    this.api.slots(DAYS_AHEAD + 1).subscribe({
      next: days => { this.slotsBusy = false; this.slots.set(new Map(days.flatMap(d => d.hours.map(h => [`${d.date}|${h.hour}`, d.closed ? 0 : h.left] as const)))); },
      error: () => { this.slotsBusy = false; this.slots.set(null); },
    });
  }

  protected fmtHour(h: number) {
    const ar = this.i.isAr(), h12 = h % 12 || 12;
    return `${h12}:00 ${h < 12 ? (ar ? 'ص' : 'AM') : (ar ? 'م' : 'PM')}`;
  }

  /** Save the booking in the API first, then open WhatsApp with the returned code. */
  async send(f: NgForm) {
    if (f.invalid) { f.control.markAllAsTouched(); return; }
    if (this.sending()) return;
    this.err.set(''); this.code.set('');
    const v = f.value, hour = +v.hour;
    // open the tab inside the click so popup blockers allow it; it's pointed at WhatsApp after the API answers
    const tab = window.open('', '_blank');
    this.sending.set(true);
    let code = '';
    try {
      const r = await firstValueFrom(this.api.create({
        name: v.name.trim(), phone: v.phone.trim(), model: v.model, services: [v.service],
        date: v.date, hour, notes: v.notes?.trim() || undefined, website: v.website || undefined,
      }));
      code = r.code;
      this.code.set(code);
    } catch (e) {
      const he = e instanceof HttpErrorResponse ? e : null, status = he?.status ?? 0;
      const fields = status === 400 ? Object.keys(he?.error?.errors ?? {}).map(k => k.toLowerCase()) : [];
      if (status === 409 || fields.includes('date') || fields.includes('hour')) {
        tab?.close();
        this.err.set('taken'); f.controls['hour']?.setValue(''); this.loadSlots();
        return;
      }
      if (status === 400 || status === 429) { tab?.close(); this.err.set(status === 429 ? 'many' : 'generic'); return; }
      // API unreachable (offline / 5xx / timeout): the booking was NOT saved. Say so and offer WhatsApp
      // (a message without a booking code), instead of pretending it worked
      tab?.close(); this.err.set('down'); this.downUrl.set(this.waUrl(v, hour, ''));
      return;
    } finally {
      this.sending.set(false);
    }

    const url = this.waUrl(v, hour, code);
    if (tab) tab.location.href = url; else window.open(url, '_blank');
  }

  /** WhatsApp message for this booking (with its code when it was saved). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private waUrl(v: any, hour: number, code: string) {
    const service = this.i.dict().services.find(s => s.slug === v.service)?.t ?? v.service;
    const model = v.model === 'Other' ? this.i.t('common.other') : v.model;
    const when = new Date(`${v.date}T00:00`).toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return waLink(this.i.dict().home.bk.msg({ code, name: v.name, phone: v.phone, model, service, date: `${when} — ${this.fmtHour(hour)}`, notes: v.notes }));
  }
  /** "Send on WhatsApp" link shown when the booking couldn't be saved. */
  protected readonly downUrl = signal('');
}
