import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { I18n } from '../core/i18n.service';
import { SITE } from '../core/site';
import { Icon } from '../shared/icon';
import { AdminApi, Review, ReviewInput } from './admin-api';
import { apiError, isoDay } from './admin-ui';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

type ReviewForm = ReviewInput & { id: number | null };

/** Customer reviews: add, edit, hide/show and delete. Hidden reviews stay here but leave the website. */
@Component({
  selector: 'app-admin-reviews',
  imports: [FormsModule, Icon, AdminFlash],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().reviews; @let C = t();
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="flex-1">
        <h1 class="text-2xl md:text-3xl font-black">{{ T.h }}</h1>
        @if (items().length) { <p class="muted text-sm mt-1">{{ T.summary(visible(), items().length, avg()) }}</p> }
      </div>
      <button type="button" class="btn btn-red !py-2.5" (click)="edit(null)">+ {{ T.add }}</button>
    </div>

    @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

    @if (form(); as f) {
      <form class="card p-5 md:p-6 mb-5 border-brand-red/40" (ngSubmit)="save(rf)" #rf="ngForm">
        <h2 class="text-lg font-black mb-4">{{ f.id ? T.editH : T.addH }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ T.nameAr }}</span><input class="field" name="nar" required minlength="2" maxlength="100" [(ngModel)]="f.nameAr"></label>
          <label><span class="lbl">{{ T.nameEn }}</span><input class="field" name="nen" dir="ltr" maxlength="100" [(ngModel)]="f.nameEn"></label>
          <label class="sm:col-span-2"><span class="lbl">{{ T.textAr }}</span><textarea class="field resize-none" rows="3" name="tar" required minlength="3" maxlength="2000" [(ngModel)]="f.textAr"></textarea></label>
          <label class="sm:col-span-2"><span class="lbl">{{ T.textEn }}</span><textarea class="field resize-none" rows="3" name="ten" dir="ltr" maxlength="2000" [(ngModel)]="f.textEn"></textarea>
            <small class="muted text-xs">{{ T.enHint }}</small></label>

          <div><span class="lbl">{{ T.rating }}</span>
            <div class="flex gap-1" role="radiogroup" [attr.aria-label]="T.rating">
              @for (n of [1, 2, 3, 4, 5]; track n) {
                <button type="button" role="radio" [attr.aria-checked]="f.rating === n" [attr.aria-label]="n + ' / 5'" (click)="f.rating = n"
                        class="w-10 h-10 grid place-items-center rounded-lg transition hover:scale-110" [class]="n <= f.rating ? 'text-brand-gold' : 'text-zinc-300 dark:text-ink-600'">
                  <app-icon name="star" class="w-7 h-7" /></button>
              }
            </div>
          </div>
          <label><span class="lbl">{{ T.date }}</span><input class="field" type="date" name="date" required [max]="today" [(ngModel)]="f.date"></label>
          <label><span class="lbl">{{ T.model }}</span>
            <select class="field" name="model" [(ngModel)]="f.model">
              <option [ngValue]="null">{{ T.none }}</option>
              @for (m of models; track m) { <option [ngValue]="m">{{ m }}</option> }
            </select></label>
          <label><span class="lbl">{{ T.year }}</span><input class="field" type="number" name="year" min="1980" max="2100" [(ngModel)]="f.year"></label>
          <label><span class="lbl">{{ T.service }}</span>
            <select class="field" name="service" [(ngModel)]="f.service">
              <option [ngValue]="null">{{ T.none }}</option>
              @for (s of i.dict().services; track s.slug) { <option [ngValue]="s.slug">{{ s.t }}</option> }
            </select></label>
          <label class="flex items-center gap-2 font-bold text-sm self-end pb-3"><input type="checkbox" name="visible" class="w-5 h-5 accent-[#dc2f36]" [(ngModel)]="f.isVisible">{{ C.f.active }}</label>
        </div>

        @if (formErr()) { <p class="mt-4 text-sm font-bold text-brand-red2" role="alert">{{ formErr() }}</p> }
        <div class="mt-5 flex gap-3">
          <button type="submit" [attr.aria-busy]="busy()" [disabled]="busy()" class="btn btn-red disabled:opacity-50 disabled:pointer-events-none">{{ busy() ? C.saving : C.save }}</button>
          <button type="button" class="btn border border-zinc-300 dark:border-ink-600" (click)="form.set(null)">{{ C.cancel }}</button>
        </div>
      </form>
    }

    @if (failed()) {
      <p class="card p-6 text-center font-bold text-brand-red2" role="alert">{{ C.failed }} <button type="button" class="underline ms-2" (click)="load()">{{ C.retry }}</button></p>
    } @else if (loading()) {
      <div class="page-loading" role="status"><span class="spinner"></span>{{ C.loading }}</div>
    } @else {
      <div class="space-y-2.5">
        @for (r of items(); track r.id) {
          <article class="card p-4 md:p-5" [class.opacity-60]="!r.isVisible">
            <div class="flex flex-wrap items-start gap-x-4 gap-y-2">
              <div class="flex-1 min-w-[180px]">
                <div class="flex items-center gap-2 flex-wrap">
                  <b class="text-lg">{{ i.l(r.name) }}</b>
                  @if (!r.isVisible) { <span class="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-bold">{{ C.hidden }}</span> }
                </div>
                <small class="muted">{{ meta(r) }}</small>
              </div>
              <div class="flex gap-0.5 text-brand-gold" [attr.aria-label]="r.rating + ' / 5'">
                @for (n of [1, 2, 3, 4, 5]; track n) { <app-icon name="star" class="w-4 h-4" [class.opacity-25]="n > r.rating" /> }
              </div>
            </div>
            <p class="mt-2">{{ i.l(r.text) }}</p>
            <div class="mt-3 flex gap-4 text-sm font-bold">
              <button type="button" class="hover:underline" (click)="toggle(r)">{{ r.isVisible ? C.hide : C.show }}</button>
              <button type="button" class="hover:underline" (click)="edit(r)">{{ C.edit }}</button>
              <button type="button" class="text-brand-red2 hover:underline" (click)="remove(r)">{{ C.del }}</button>
            </div>
          </article>
        } @empty { <p class="card p-10 text-center muted">{{ T.empty }}</p> }
      </div>
    }
  `,
})
export class AdminReviews {
  private readonly api = inject(AdminApi);
  protected readonly i = inject(I18n);
  protected readonly t = adminTexts();
  protected readonly models = SITE.models;
  protected readonly today = isoDay();

  protected readonly items = signal<Review[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly busy = signal(false);
  protected readonly msg = signal('');
  protected readonly msgBad = signal(false);
  protected readonly formErr = signal('');
  protected readonly form = signal<ReviewForm | null>(null);

  protected readonly visible = computed(() => this.items().filter(r => r.isVisible).length);
  /** Average of the reviews shown on the website. */
  protected readonly avg = computed(() => {
    const shown = this.items().filter(r => r.isVisible);
    return shown.length ? (shown.reduce((s, r) => s + r.rating, 0) / shown.length).toFixed(1) : '—';
  });

  constructor() { this.load(); }

  protected load() {
    this.loading.set(true); this.failed.set(false);
    this.api.reviews().subscribe({
      next: r => { this.items.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); this.failed.set(true); },
    });
  }

  /** "Nissan Sunny 2019 · تكييف · 28 أكتوبر 2026" (only the parts that exist). */
  protected meta(r: Review) {
    const service = this.i.dict().services.find(s => s.slug === r.service)?.t;
    const date = new Date(`${r.date}T00:00`).toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return [r.model ? `Nissan ${r.model} ${r.year ?? ''}`.trim() : '', service, date].filter(Boolean).join(' · ');
  }

  private toInput(r: Review): ReviewInput {
    // English that only repeats the Arabic was never typed: keep the box empty when editing
    return {
      nameAr: r.name.ar, nameEn: r.name.en === r.name.ar ? '' : r.name.en,
      textAr: r.text.ar, textEn: r.text.en === r.text.ar ? '' : r.text.en,
      model: r.model ?? null, year: r.year ?? null, service: r.service ?? null, rating: r.rating, date: r.date, isVisible: r.isVisible,
    };
  }

  protected edit(r: Review | null) {
    this.formErr.set(''); this.msg.set('');
    this.form.set(r ? { id: r.id, ...this.toInput(r) }
      : { id: null, nameAr: '', nameEn: '', textAr: '', textEn: '', model: null, year: null, service: null, rating: 5, date: this.today, isVisible: true });
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected save(ngf: NgForm) {
    const f = this.form();
    if (!f) return;
    if (ngf.invalid) { ngf.form.markAllAsTouched(); this.formErr.set(this.t().fillAll); return; }
    const { id, ...body } = f;
    this.busy.set(true); this.formErr.set('');
    this.api.saveReview(id, { ...body, year: body.year || null }).subscribe({
      next: r => {
        this.busy.set(false); this.form.set(null);
        this.items.update(l => (id ? l.map(x => (x.id === id ? r : x)) : [r, ...l]).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id));
        this.flash(this.t().saved);
      },
      error: e => { this.busy.set(false); this.formErr.set(apiError(e).message || this.t().failed); },
    });
  }

  protected toggle(r: Review) {
    this.api.saveReview(r.id, { ...this.toInput(r), isVisible: !r.isVisible }).subscribe({
      next: x => this.items.update(l => l.map(y => (y.id === r.id ? x : y))),
      error: () => this.flash(this.t().failed, true),
    });
  }

  protected async remove(r: Review) {
    if (!(await this.confirm.ask(this.delQ(this.i.l(r.name))))) return;
    this.api.deleteReview(r.id).subscribe({
      next: () => { this.items.update(l => l.filter(x => x.id !== r.id)); this.flash(this.t().deleted); },
      error: () => this.flash(this.t().failed, true),
    });
  }


  private readonly confirm = inject(ConfirmService);
  /** "Delete X?" popup texts. */
  private delQ(subject: string) {
    const C = this.t().confirm;
    return { title: C.delTitle, subject, message: C.delMsg, confirmText: C.delBtn, cancelText: C.keep };
  }

  private flash(text: string, bad = false) { this.msgBad.set(bad); this.msg.set(text); }
}
