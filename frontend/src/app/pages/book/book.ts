import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { SITE, isDayOff, waLink } from '../../core/site';
import { PageBanner } from '../../shared/page-banner';
import { LoadStateView } from '../../shared/load-state';
import { Icon } from '../../shared/icon';
import { saveBooking } from '../../data/tracking';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BookingApi, SlotDay } from '../../core/booking-api';

interface Day { iso: string; label: string; wd: string; d: number; full: boolean; off: boolean; }

const OPEN = 10, CLOSE = 22;
/** Max cars per time slot; a slot with this many bookings is closed. */
const pad = (n: number) => String(n).padStart(2, '0');

@Component({
  selector: 'app-book',
  imports: [FormsModule, PageBanner, Icon, LoadStateView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book.html',
})
export class Book implements OnInit {
  protected readonly i = inject(I18n);
  private readonly api = inject(BookingApi);
  protected readonly models = SITE.models;
  protected readonly years = Array.from({ length: 22 }, (_, k) => 2026 - k);
  protected readonly hours = Array.from({ length: CLOSE - OPEN }, (_, k) => OPEN + k);
  /** Slots grouped as morning / afternoon / evening. */
  protected readonly groups = [this.hours.filter(h => h < 12), this.hours.filter(h => h >= 12 && h < 17), this.hours.filter(h => h >= 17)];
  protected readonly generations = SITE.generations;

  /** Optional `?service=slug` from a service page, preselected in step 2. */
  readonly service = input<string>();
  /** Optional `?model=Name` from a model page, preselected in step 1. */
  readonly modelParam = input<string>(undefined, { alias: 'model' });

  protected readonly step = signal(0);
  protected readonly model = signal('');
  protected readonly year = signal(2020);
  protected readonly gen = signal('');
  protected readonly km = signal('');
  protected readonly picked = signal<string[]>([]);
  protected readonly date = signal('');
  protected readonly hour = signal<number | null>(null);
  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly notes = signal('');
  protected readonly code = signal('');
  /** Honeypot (hidden input): real visitors never fill it. */
  protected readonly website = signal('');

  /**
   * Places left per "yyyy-mm-dd|hour" from the API.
   * undefined = loading, null = API unreachable (no times offered; "try again" shown).
   */
  protected readonly slots = signal<Map<string, number> | null | undefined>(undefined);
  protected readonly sending = signal(false);
  /** Error shown above the nav bar (i18n key under book.err). */
  protected readonly err = signal<'' | 'taken' | 'many' | 'generic' | 'down'>('');

  protected readonly phoneOk = computed(() => /^01[0125]\d{8}$/.test(this.phone().trim()));
  protected readonly canNext = computed(() => [
    !!this.model(),
    this.picked().length > 0,
    !!this.date() && this.hour() !== null,
    this.name().trim().length > 1 && this.phoneOk(),
    true,
  ][this.step()]);

  protected readonly days = computed<Day[]>(() => {
    const loc = this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', out: Day[] = [];
    for (let k = 0; k < 14; k++) {
      const d = new Date(); d.setDate(d.getDate() + k);
      const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      out.push({
        iso, full: this.hours.every(h => this.left(iso, h) === 0), off: isDayOff(iso),
        label: k === 0 ? this.i.t('book.time.today') : k === 1 ? this.i.t('book.time.tomorrow') : d.toLocaleDateString(loc, { weekday: 'short' }),
        wd: d.toLocaleDateString(loc, { month: 'short' }), d: d.getDate(),
      });
    }
    return out;
  });

  /** Model + generation, e.g. "Sunny N16". */
  protected readonly car = computed(() => this.model() + (this.gen() ? ' ' + this.gen() : ''));

  protected readonly serviceNames = computed(() =>
    this.i.dict().services.filter(s => this.picked().includes(s.slug)).map(s => s.t));

  protected readonly when = computed(() => {
    if (!this.date() || this.hour() === null) return '';
    const d = new Date(`${this.date()}T00:00`);
    const day = d.toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return `${day} — ${this.fmtHour(this.hour()!)}`;
  });

  ngOnInit() {
    this.loadSlots();
    const m = this.modelParam();
    if (m && this.models.includes(m)) this.model.set(m);
    const s = this.service();
    if (s && this.i.dict().services.some(x => x.slug === s)) this.picked.set([s]);
  }

  /** Load availability from the API (GET /api/slots). */
  protected loadSlots() {
    this.api.slots(14).subscribe({
      next: days => this.slots.set(toMap(days)),
      error: () => this.slots.set(null),
    });
  }

  /** Free places left in a slot (0 = closed / full / past / day off). Server data only: nothing is offered until it answers. */
  protected left(iso: string, h: number) {
    if (isDayOff(iso)) return 0;   // Sunday: day off
    return this.slots()?.get(`${iso}|${h}`) ?? 0;
  }


  protected pickModel(m: string) { if (m !== this.model()) { this.model.set(m); this.gen.set(''); } }

  protected fmtHour(h: number) {
    const ar = this.i.isAr(), h12 = h % 12 || 12;
    return `${h12}:00 ${h < 12 ? (ar ? 'ص' : 'AM') : (ar ? 'م' : 'PM')}`;
  }

  protected toggle(slug: string) {
    this.picked.update(p => (p.includes(slug) ? p.filter(x => x !== slug) : [...p, slug]));
  }

  protected pickDay(iso: string) { this.date.set(iso); this.hour.set(null); }

  protected go(n: number) {
    if (n > this.step() && !this.canNext()) return;
    this.err.set('');
    if (n === 2 && this.step() !== 2) this.loadSlots();   // fresh availability every time the time step opens
    this.step.set(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Save the booking in the API first, then open WhatsApp with the returned code. */
  protected async confirm() {
    if (this.sending()) return;
    this.err.set('');
    // open the tab inside the click so popup blockers allow it; it's pointed at WhatsApp after the API answers
    const tab = window.open('', '_blank');
    this.sending.set(true);
    try {
      const r = await firstValueFrom(this.api.create({
        name: this.name().trim(), phone: this.phone().trim(), model: this.model(), generation: this.gen() || undefined,
        year: this.year(), km: this.km().trim() || undefined, services: this.picked(), date: this.date(), hour: this.hour()!,
        notes: this.notes().trim() || undefined, website: this.website() || undefined,
      }));
      this.code.set(r.code);
    } catch (e) {
      const he = e instanceof HttpErrorResponse ? e : null, status = he?.status ?? 0;
      const fields = status === 400 ? Object.keys(he?.error?.errors ?? {}).map(k => k.toLowerCase()) : [];
      if (status === 409 || fields.includes('date') || fields.includes('hour')) {
        // the hour was just taken (or is no longer valid): back to the time step with fresh slots
        tab?.close();
        this.hour.set(null); this.loadSlots(); this.step.set(2); this.err.set('taken');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (status === 400 || status === 429) { tab?.close(); this.err.set(status === 429 ? 'many' : 'generic'); return; }
      // API unreachable (offline / 5xx / timeout): the booking was NOT saved. Say so, and offer WhatsApp
      // (a message without a booking code, so nobody thinks it's in the system)
      tab?.close(); this.err.set('down'); return;
    } finally {
      this.sending.set(false);
    }
    saveBooking({ code: this.code(), model: this.car(), year: this.year(), services: this.picked(), date: this.date(), hour: this.hour()! });
    // the shop is notified when the customer sends the WhatsApp message, so open it right away
    if (tab) tab.location.href = this.waUrl(); else window.open(this.waUrl(), '_blank');
    this.step.set(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected waUrl() {
    return waLink(this.i.dict().book.msg({
      code: this.code(), name: this.name(), phone: this.phone(), model: this.car(), year: this.year(),
      km: this.km(), services: this.serviceNames().join(this.i.isAr() ? '، ' : ', '), when: this.when(), notes: this.notes(),
    }));
  }

  protected reset() {
    this.step.set(0); this.model.set(''); this.gen.set(''); this.km.set(''); this.picked.set([]); this.date.set('');
    this.hour.set(null); this.name.set(''); this.phone.set(''); this.notes.set(''); this.code.set(''); this.err.set('');
  }
}

const toMap = (days: SlotDay[]) =>
  new Map(days.flatMap(d => d.hours.map(h => [`${d.date}|${h.hour}`, d.closed ? 0 : h.left] as const)));
