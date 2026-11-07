import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { PageBanner } from '../../shared/page-banner';
import { Icon } from '../../shared/icon';
import { RouterLink } from '@angular/router';
import { saveBooking } from '../../data/tracking';

interface Day { iso: string; label: string; wd: string; d: number; }

const OPEN = 10, CLOSE = 22;
const pad = (n: number) => String(n).padStart(2, '0');

@Component({
  selector: 'app-book',
  imports: [FormsModule, RouterLink, PageBanner, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book.html',
})
export class Book implements OnInit {
  protected readonly i = inject(I18n);
  protected readonly models = SITE.models;
  protected readonly years = Array.from({ length: 22 }, (_, k) => 2026 - k);
  protected readonly hours = Array.from({ length: CLOSE - OPEN }, (_, k) => OPEN + k);

  /** Optional `?service=slug` from a service page, preselected in step 2. */
  readonly service = input<string>();
  /** Optional `?model=Name` from a model page, preselected in step 1. */
  readonly modelParam = input<string>(undefined, { alias: 'model' });

  protected readonly step = signal(0);
  protected readonly model = signal('');
  protected readonly year = signal(2020);
  protected readonly km = signal('');
  protected readonly picked = signal<string[]>([]);
  protected readonly date = signal('');
  protected readonly hour = signal<number | null>(null);
  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly notes = signal('');
  protected readonly code = signal('');

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
      out.push({
        iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        label: k === 0 ? this.i.t('book.time.today') : k === 1 ? this.i.t('book.time.tomorrow') : d.toLocaleDateString(loc, { weekday: 'short' }),
        wd: d.toLocaleDateString(loc, { month: 'short' }), d: d.getDate(),
      });
    }
    return out;
  });

  protected readonly serviceNames = computed(() =>
    this.i.dict().services.filter(s => this.picked().includes(s.slug)).map(s => s.t));

  protected readonly when = computed(() => {
    if (!this.date() || this.hour() === null) return '';
    const d = new Date(`${this.date()}T00:00`);
    const day = d.toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    return `${day} — ${this.fmtHour(this.hour()!)}`;
  });

  ngOnInit() {
    const m = this.modelParam();
    if (m && this.models.includes(m)) this.model.set(m);
    const s = this.service();
    if (s && this.i.dict().services.some(x => x.slug === s)) this.picked.set([s]);
  }

  /** Mock availability until the API exists: past hours today + a stable pseudo-random set are "booked". */
  protected busy(iso: string, h: number) {
    const now = new Date();
    if (iso === this.days()[0].iso && h <= now.getHours()) return true;
    const seed = [...iso].reduce((a, c) => a + c.charCodeAt(0), 0) + h * 7;
    return seed % 5 === 0;
  }

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
    this.step.set(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected confirm() {
    this.code.set(`SHA-${Math.floor(10000 + Math.random() * 90000)}`);
    saveBooking({ code: this.code(), model: this.model(), year: this.year(), services: this.picked() });
    this.step.set(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected waUrl() {
    return waLink(this.i.dict().book.msg({
      code: this.code(), name: this.name(), phone: this.phone(), model: this.model(), year: this.year(),
      km: this.km(), services: this.serviceNames().join(this.i.isAr() ? '، ' : ', '), when: this.when(), notes: this.notes(),
    }));
  }

  protected reset() {
    this.step.set(0); this.model.set(''); this.km.set(''); this.picked.set([]); this.date.set('');
    this.hour.set(null); this.name.set(''); this.phone.set(''); this.notes.set(''); this.code.set('');
  }
}
