import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../core/i18n.service';
import { imgUrl } from '../core/media';
import { Icon } from '../shared/icon';
import { AdminApi, Offer, OfferInput } from './admin-api';
import { apiError, slugify } from './admin-ui';
import { ICONS } from './admin-products';
import { ImageInput } from './image-input';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

/** `endsLocal` = value of the datetime-local input (the browser's local time). */
type OfferForm = OfferInput & { id: number | null; endsLocal: string };

const pad = (n: number) => String(n).padStart(2, '0');
const toLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Offers: list (incl. hidden and finished ones) + add/edit form. */
@Component({
  selector: 'app-admin-offers',
  imports: [FormsModule, Icon, ImageInput, AdminFlash],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().offers; @let C = t(); @let P = t().products;
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <h1 class="text-2xl md:text-3xl font-black flex-1">{{ T.h }}</h1>
      <button type="button" class="btn btn-red !py-2.5" (click)="edit(null)">+ {{ T.add }}</button>
    </div>

    @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

    @if (form(); as f) {
      <form class="card p-5 md:p-6 mb-5 border-brand-red/40" (ngSubmit)="save()" #of="ngForm">
        <h2 class="text-lg font-black mb-4">{{ f.id ? T.editH : T.addH }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ T.titleAr }}</span><input class="field" name="tar" required maxlength="200" [(ngModel)]="f.title.ar"></label>
          <label><span class="lbl">{{ T.titleEn }}</span><input class="field" name="ten" dir="ltr" required maxlength="200" [(ngModel)]="f.title.en" (ngModelChange)="f.id || (f.slug = slug($event))"></label>
          <label><span class="lbl">{{ C.f.descAr }}</span><textarea class="field resize-none" rows="3" name="dar" required maxlength="2000" [(ngModel)]="f.desc.ar"></textarea></label>
          <label><span class="lbl">{{ C.f.descEn }}</span><textarea class="field resize-none" rows="3" name="den" dir="ltr" required maxlength="2000" [(ngModel)]="f.desc.en"></textarea></label>
          <label><span class="lbl">{{ T.discountAr }}</span><input class="field" name="disar" required maxlength="60" [placeholder]="T.discountPh" [(ngModel)]="f.discount.ar"></label>
          <label><span class="lbl">{{ T.discountEn }}</span><input class="field" name="disen" dir="ltr" required maxlength="60" placeholder="Save 18%" [(ngModel)]="f.discount.en"></label>
          <label><span class="lbl">{{ T.price }}</span><input class="field" type="number" name="price" min="0" step="0.01" [(ngModel)]="f.price"></label>
          <label><span class="lbl">{{ T.oldPrice }}</span><input class="field" type="number" name="old" min="0" step="0.01" [(ngModel)]="f.oldPrice"></label>
          <label class="sm:col-span-2"><span class="lbl">{{ P.cost }}</span><input class="field sm:max-w-[calc(50%-0.5rem)]" type="number" name="cost" min="0" step="0.01" [(ngModel)]="f.cost">
            <small class="muted text-xs block">{{ P.costHint }}</small></label>
          <label><span class="lbl">{{ T.endsAt }}</span><input class="field" type="datetime-local" name="ends" required [(ngModel)]="f.endsLocal"></label>
          <label><span class="lbl">{{ T.service }}</span>
            <select class="field" name="service" [(ngModel)]="f.service">
              <option [ngValue]="null">{{ T.noService }}</option>
              @for (s of i.dict().services; track s.slug) { <option [ngValue]="s.slug">{{ s.t }}</option> }
            </select></label>
          <label><span class="lbl">{{ C.f.slug }}</span><input class="field" name="slug" dir="ltr" required maxlength="100" pattern="[a-z0-9]+(-[a-z0-9]+)*" [(ngModel)]="f.slug">
            <small class="muted text-xs">{{ C.f.slugHint }}</small></label>
          <div class="grid grid-cols-2 gap-4">
            <label><span class="lbl">{{ C.f.icon }}</span><select class="field" name="icon" [(ngModel)]="f.icon">@for (x of icons; track x) { <option>{{ x }}</option> }</select></label>
            <label><span class="lbl">{{ C.f.sort }}</span><input class="field" type="number" name="sort" min="0" [(ngModel)]="f.sortOrder"></label>
          </div>
        </div>

        <div class="mt-4"><span class="lbl">{{ T.includes }}</span>
          <div class="space-y-2">
            @for (row of f.includes; track $index; let n = $index) {
              <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input class="field" [name]="'iar' + n" required maxlength="200" [placeholder]="C.f.ar" [(ngModel)]="row.ar">
                <input class="field" [name]="'ien' + n" dir="ltr" required maxlength="200" placeholder="English" [(ngModel)]="row.en">
                <button type="button" class="icon-btn" (click)="f.includes.splice(n, 1)" [attr.aria-label]="C.del"><app-icon name="close" class="w-4 h-4" /></button>
              </div>
            }
          </div>
          <button type="button" class="mt-2 text-sm font-bold text-brand-red2 hover:underline" (click)="f.includes.push({ ar: '', en: '' })">+ {{ T.addInclude }}</button>
        </div>

        <div class="mt-4"><span class="lbl">{{ C.f.image }}</span><app-image-input [(value)]="f.img" /></div>
        <label class="mt-4 flex items-center gap-2 font-bold text-sm"><input type="checkbox" name="active" class="w-5 h-5 accent-[#dc2f36]" [(ngModel)]="f.isActive">{{ C.f.active }}</label>

        @if (formErr()) { <p class="mt-4 text-sm font-bold text-brand-red2" role="alert">{{ formErr() }}</p> }
        <div class="mt-5 flex gap-3">
          <button type="submit" [disabled]="busy() || of.invalid" class="btn btn-red disabled:opacity-50 disabled:pointer-events-none">{{ busy() ? C.saving : C.save }}</button>
          <button type="button" class="btn border border-zinc-300 dark:border-ink-600" (click)="form.set(null)">{{ C.cancel }}</button>
        </div>
      </form>
    }

    @if (failed()) {
      <p class="card p-6 text-center font-bold text-brand-red2" role="alert">{{ C.failed }} <button type="button" class="underline ms-2" (click)="load()">{{ C.retry }}</button></p>
    } @else if (loading()) {
      <p class="muted font-bold" role="status">{{ C.loading }}</p>
    } @else {
      <div class="space-y-2.5">
        @for (o of items(); track o.id) {
          <article class="card p-3 md:p-4 flex items-center gap-3 md:gap-4" [class.opacity-60]="!o.isActive || o.expired">
            <div class="w-16 h-16 shrink-0 rounded-xl bg-zinc-100 dark:bg-ink-900 grid place-items-center overflow-hidden">
              @if (o.img) { <img [src]="src(o.img)" alt="" loading="lazy" class="w-full h-full object-cover"> }
              @else { <app-icon [name]="o.icon" class="w-7 h-7 text-brand-red2" /> }
            </div>
            <div class="flex-1 min-w-0">
              <b class="block truncate">{{ i.l(o.title) }}</b>
              <small class="muted block truncate">{{ i.l(o.discount) }} · {{ T.until }} {{ ends(o.endsAt) }}</small>
              <div class="flex flex-wrap gap-1.5 mt-1 text-[11px] font-bold">
                @if (o.expired) { <span class="rounded-full bg-brand-red/10 text-brand-red2 px-2 py-0.5">{{ T.expired }}</span> }
                @else if (o.isActive) { <span class="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5">{{ T.live }}</span> }
                @if (!o.isActive) { <span class="rounded-full bg-zinc-500/15 px-2 py-0.5">{{ C.hidden }}</span> }
              </div>
            </div>
            @if (o.price || o.cost != null) { <div class="text-end shrink-0">
              @if (o.price) { <b class="block">{{ i.price(o.price) }}</b> }
              @if (o.oldPrice) { <small class="muted line-through">{{ i.price(o.oldPrice) }}</small> }
              @if (o.cost != null) {
                <small class="block text-[11px] font-bold muted">{{ P.costIs }} {{ i.price(o.cost) }}
                  @if (o.price != null) { · <span [class]="o.price - o.cost >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red2'">{{ P.profit }} {{ i.price(o.price - o.cost) }}</span> }</small>
              }
            </div> }
            <div class="flex flex-col sm:flex-row gap-1 sm:gap-3 shrink-0 text-sm font-bold">
              <button type="button" class="hover:underline" (click)="edit(o)">{{ C.edit }}</button>
              <button type="button" class="text-brand-red2 hover:underline" (click)="remove(o)">{{ C.del }}</button>
            </div>
          </article>
        } @empty { <p class="card p-10 text-center muted">{{ T.empty }}</p> }
      </div>
    }
  `,
})
export class AdminOffers {
  private readonly api = inject(AdminApi);
  protected readonly i = inject(I18n);
  protected readonly t = adminTexts();
  protected readonly icons = ICONS;
  protected readonly src = imgUrl;
  protected readonly slug = slugify;

  protected readonly items = signal<Offer[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly busy = signal(false);
  protected readonly msg = signal('');
  protected readonly msgBad = signal(false);
  protected readonly formErr = signal('');
  protected readonly form = signal<OfferForm | null>(null);

  constructor() { this.load(); }

  protected load() {
    this.loading.set(true); this.failed.set(false);
    this.api.offers().subscribe({
      next: o => { this.items.set(o); this.loading.set(false); },
      error: () => { this.loading.set(false); this.failed.set(true); },
    });
  }

  protected ends(iso: string) {
    return new Date(iso).toLocaleString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  protected edit(o: Offer | null) {
    this.formErr.set(''); this.msg.set('');
    const inTwoWeeks = new Date(Date.now() + 14 * 864e5); inTwoWeeks.setHours(22, 0, 0, 0);
    this.form.set(o
      ? { ...o, title: { ...o.title }, desc: { ...o.desc }, discount: { ...o.discount }, includes: o.includes.map(x => ({ ...x })), endsLocal: toLocal(o.endsAt) }
      : { id: null, slug: '', icon: 'gift', title: { ar: '', en: '' }, desc: { ar: '', en: '' }, discount: { ar: '', en: '' }, price: null, oldPrice: null, cost: null,
          endsAt: '', endsLocal: toLocal(inTwoWeeks.toISOString()), service: null, includes: [{ ar: '', en: '' }], img: null, sortOrder: this.items().length, isActive: true });
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected save() {
    const f = this.form();
    if (!f) return;
    const T = this.t();
    if (f.price && f.oldPrice && f.oldPrice <= f.price) { this.formErr.set(T.products.badOld); return; }
    const { id, endsLocal, expired, ...rest } = f as OfferForm & { expired?: boolean };
    const body: OfferInput = {
      ...rest, price: f.price || null, oldPrice: f.oldPrice || null, cost: f.cost ?? null,
      endsAt: new Date(endsLocal).toISOString(),   // local time picked in the form → exact moment
      includes: f.includes.filter(x => x.ar.trim() && x.en.trim()),
    };
    this.busy.set(true); this.formErr.set('');
    this.api.saveOffer(id, body).subscribe({
      next: o => {
        this.busy.set(false); this.form.set(null);
        this.items.update(l => (id ? l.map(x => (x.id === id ? o : x)) : [...l, o]));
        this.flash(T.saved);
      },
      error: e => {
        this.busy.set(false);
        const err = apiError(e);
        this.formErr.set(err.code === 'slug_taken' ? T.slugTaken : err.message || T.failed);
      },
    });
  }

  protected async remove(o: Offer) {
    if (!(await this.confirm.ask(this.delQ(this.i.l(o.title))))) return;
    this.api.deleteOffer(o.id).subscribe({
      next: () => { this.items.update(l => l.filter(x => x.id !== o.id)); this.flash(this.t().deleted); },
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
