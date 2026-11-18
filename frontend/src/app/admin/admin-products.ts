import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { imgUrl } from '../core/media';
import { SITE } from '../core/site';
import { Icon } from '../shared/icon';
import { AdminApi, Category, Product, ProductInput } from './admin-api';
import { apiError, bySortOrder, moveItem, nextSortOrder, slugify, withChanges } from './admin-ui';
import { MoveArrows } from './move-arrows';
import { forkJoin } from 'rxjs';
import { ImageInput } from './image-input';
import { autoIcon, autoSlug } from './auto-icon';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

/** Brands offered in the product form's dropdown (plus any brand already used by a product). */
const BRANDS = [
  'Nissan Genuine', 'Mobil', 'Castrol', 'Shell', 'Total', 'Valvoline', 'Motul', 'Liqui Moly', 'Bosch', 'NGK', 'Denso', 'KYB', 'Monroe', 'Sachs',
  'Brembo', 'TRW', 'Akebono', 'Varta', 'Exide', 'Mann', 'Mahle', 'Valeo', 'Aisin', 'Hella', 'Gates', 'Febi', 'Continental', 'Michelin', 'Bridgestone',
];



/** `price` empty/0 = "ask for the price" on the site. English texts are optional: empty = the Arabic text is used. */
type ProductForm = Omit<ProductInput, 'price'> & { id: number | null; price: number | null; hasBadge: boolean; badgeAr: string; badgeEn: string };
/** English copy that was saved as "same as Arabic" is shown empty again when editing. */
const enOnly = (t: { ar: string; en: string }) => ({ ar: t.ar, en: t.en === t.ar ? '' : t.en });

/** Products: list + add/edit form (with image). Categories have their own page (admin-categories.ts). */
@Component({
  selector: 'app-admin-products',
  imports: [FormsModule, Icon, ImageInput, AdminFlash, RouterLink, MoveArrows],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().products; @let C = t();
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <h1 class="text-2xl md:text-3xl font-black flex-1">{{ T.h }}</h1>
      <a routerLink="/admin/categories" class="btn !py-2.5 border border-zinc-300 dark:border-ink-600">{{ T.cats }}</a>
      <button type="button" class="btn btn-red !py-2.5" (click)="edit(null)" [disabled]="!cats().length">+ {{ T.add }}</button>
    </div>

    @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

    <!-- product form -->
    @if (form(); as f) {
      <form class="card p-5 md:p-6 mb-5 border-brand-red/40" (ngSubmit)="save()">
        <h2 class="text-lg font-black mb-4">{{ f.id ? T.editH : T.addH }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ C.f.nameAr }} *</span><input class="field" name="nar" required maxlength="200" [(ngModel)]="f.name.ar" [class.bad]="tried() && !f.name.ar.trim()"></label>
          <label><span class="lbl">{{ T.nameEn }}</span><input class="field" name="nen" dir="ltr" maxlength="200" [(ngModel)]="f.name.en"></label>
          <label><span class="lbl">{{ C.f.descAr }} *</span><textarea class="field resize-none" rows="3" name="dar" required maxlength="2000" [(ngModel)]="f.desc.ar" [class.bad]="tried() && !f.desc.ar.trim()"></textarea></label>
          <label><span class="lbl">{{ T.descEn }}</span><textarea class="field resize-none" rows="3" name="den" dir="ltr" maxlength="2000" [(ngModel)]="f.desc.en"></textarea>
            <small class="muted text-xs">{{ T.enHint }}</small></label>
          <label><span class="lbl">{{ T.cat }} *</span>
            <select class="field" name="cat" required [(ngModel)]="f.categoryId" [class.bad]="tried() && !f.categoryId">@for (c of cats(); track c.id) { <option [ngValue]="c.id">{{ i.l(c.name) }}</option> }</select></label>
          <label><span class="lbl">{{ T.brand }} *</span>
            @if (!newBrand()) {
              <select class="field" name="brand" [ngModel]="f.brand" (ngModelChange)="pickBrand(f, $event)" [class.bad]="tried() && !f.brand.trim()">
                <option value="" disabled>{{ T.brandPick }}</option>
                @for (b of brands(); track b) { <option [value]="b">{{ b }}</option> }
                <option [value]="OTHER">{{ T.brandOther }}</option>
              </select>
            } @else {
              <input class="field" name="brandNew" dir="ltr" maxlength="100" [placeholder]="T.brandNew" [(ngModel)]="f.brand" [class.bad]="tried() && !f.brand.trim()">
              <button type="button" class="text-xs font-bold text-brand-red2 hover:underline mt-1" (click)="newBrand.set(false); f.brand = ''">{{ T.brandBack }}</button>
            }
          </label>
          <label><span class="lbl">{{ T.price }}</span><input class="field" type="number" name="price" min="0" step="0.01" [(ngModel)]="f.price">
            <small class="muted text-xs">{{ T.priceHint }}</small></label>
          <label><span class="lbl">{{ T.oldPrice }}</span><input class="field" type="number" name="old" min="0" step="0.01" [(ngModel)]="f.oldPrice"></label>
        </div>

        <!-- models: a dropdown with a checkbox per model -->
        <div class="mt-4"><span class="lbl">{{ T.models }}</span>
          <details class="relative" #md>
            <summary class="field cursor-pointer list-none flex items-center gap-2 select-none">
              <span class="flex-1 truncate">{{ modelsText(f.models) }}</span>
              <app-icon name="chevron" class="w-4 h-4 shrink-0 text-brand-red2" />
            </summary>
            <div class="absolute z-20 mt-1 w-full sm:w-80 card p-2 shadow-xl max-h-80 overflow-auto">
              <label class="flex items-center gap-2 rounded-lg px-3 py-2 font-bold text-sm hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer border-b border-zinc-200 dark:border-ink-600 mb-1">
                <input type="checkbox" class="w-5 h-5 accent-[#dc2f36]" [checked]="f.models.length === models.length"
                       (change)="f.models = f.models.length === models.length ? [] : models.slice()">{{ T.allPicked }}</label>
              @for (m of models; track m) {
                <label class="flex items-center gap-2 rounded-lg px-3 py-2 font-bold text-sm hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer" dir="ltr">
                  <input type="checkbox" class="w-5 h-5 accent-[#dc2f36]" [checked]="f.models.includes(m)" (change)="toggleModel(m)">{{ m }}</label>
              }
              <button type="button" class="btn btn-red !py-2 w-full mt-2" (click)="md.open = false">{{ T.done }}</button>
            </div>
          </details>
          <small class="muted text-xs">{{ T.modelsHint }}</small>
        </div>

        <div class="mt-4"><span class="lbl">{{ C.f.image }}</span><app-image-input [(value)]="f.img" /></div>

        <!-- on/off options, each with a one-line explanation -->
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <label class="opt"><input type="checkbox" name="active" [(ngModel)]="f.isActive"><span><b>{{ T.opt.active }}</b><small>{{ T.opt.activeHint }}</small></span></label>
          <label class="opt"><input type="checkbox" name="stock" [(ngModel)]="f.inStock"><span><b>{{ T.opt.stock }}</b><small>{{ T.opt.stockHint }}</small></span></label>
          <label class="opt"><input type="checkbox" name="feat" [(ngModel)]="f.featured"><span><b>{{ T.opt.featured }}</b><small>{{ T.opt.featuredHint }}</small></span></label>
          <label class="opt"><input type="checkbox" name="hasBadge" [(ngModel)]="f.hasBadge"><span><b>{{ T.opt.badge }}</b><small>{{ T.opt.badgeHint }}</small></span></label>
        </div>
        @if (f.hasBadge) {
          <div class="grid sm:grid-cols-2 gap-4 mt-3">
            <label><span class="lbl">{{ T.badgeAr }} *</span><input class="field" name="bar" required maxlength="60" [(ngModel)]="f.badgeAr" [class.bad]="tried() && !f.badgeAr.trim()"></label>
            <label><span class="lbl">{{ T.badgeEn }}</span><input class="field" name="ben" dir="ltr" maxlength="60" [(ngModel)]="f.badgeEn"></label>
          </div>
        }

        @if (formErr()) { <p class="mt-4 text-sm font-bold text-brand-red2" role="alert">{{ formErr() }}</p> }
        <div class="mt-5 flex gap-3">
          <button type="submit" [attr.aria-busy]="busy()" [disabled]="busy()" class="btn btn-red disabled:opacity-50 disabled:pointer-events-none">{{ busy() ? C.saving : C.save }}</button>
          <button type="button" class="btn border border-zinc-300 dark:border-ink-600" (click)="form.set(null)">{{ C.cancel }}</button>
        </div>
      </form>
    }

    <!-- list -->
    <div class="grid sm:grid-cols-[1fr_220px] gap-3 mb-4">
      <label class="relative block">
        <app-icon name="search" class="w-5 h-5 absolute inset-y-0 start-4 my-auto muted pointer-events-none" />
        <input class="field ps-12" type="search" [placeholder]="T.search" [ngModel]="q()" (ngModelChange)="q.set($event)">
      </label>
      <select class="field" [ngModel]="catFilter()" (ngModelChange)="catFilter.set(+$event)" [attr.aria-label]="T.cat">
        <option [value]="0">{{ T.allCats }}</option>
        @for (c of cats(); track c.id) { <option [value]="c.id">{{ i.l(c.name) }}</option> }
      </select>
    </div>

    @if (failed()) {
      <p class="card p-6 text-center font-bold text-brand-red2" role="alert">{{ C.failed }} <button type="button" class="underline ms-2" (click)="load()">{{ C.retry }}</button></p>
    } @else if (loading()) {
      <div class="page-loading" role="status"><span class="spinner"></span>{{ C.loading }}</div>
    } @else {
      <div class="space-y-2.5">
        @for (p of shown(); track p.id; let first = $first, last = $last) {
          <article class="card p-3 md:p-4 flex items-center gap-3 md:gap-4" [class.opacity-60]="!p.isActive">
            <app-move-arrows [first]="first" [last]="last" [busy]="moving()" (move)="move(p, $event)" />
            <div class="w-16 h-16 shrink-0 rounded-xl bg-zinc-100 dark:bg-ink-900 grid place-items-center overflow-hidden">
              @if (p.img) { <img [src]="src(p.img)" alt="" loading="lazy" class="w-full h-full object-cover"> }
              @else { <app-icon [name]="p.icon" class="w-7 h-7 text-brand-red2" /> }
            </div>
            <div class="flex-1 min-w-0">
              <b class="block truncate">{{ i.l(p.name) }}</b>
              <small class="muted block truncate">{{ p.brand }} · {{ catName(p.categoryId) }}</small>
              <div class="flex flex-wrap gap-1.5 mt-1 text-[11px] font-bold">
                @if (!p.isActive) { <span class="rounded-full bg-zinc-500/15 px-2 py-0.5">{{ C.hidden }}</span> }
                @if (!p.inStock) { <span class="rounded-full bg-brand-red/10 text-brand-red2 px-2 py-0.5">{{ T.outStock }}</span> }
                @if (p.featured) { <span class="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5">{{ T.featured }}</span> }
              </div>
            </div>
            <div class="text-end shrink-0">
              <b class="block">{{ i.productPrice(p.price) }}</b>
              @if (p.oldPrice) { <small class="muted line-through">{{ i.price(p.oldPrice) }}</small> }
            </div>
            <div class="flex flex-col sm:flex-row gap-1 sm:gap-3 shrink-0 text-sm font-bold">
              <button type="button" class="hover:underline" (click)="edit(p)">{{ C.edit }}</button>
              <button type="button" class="text-brand-red2 hover:underline" (click)="remove(p)">{{ C.del }}</button>
            </div>
          </article>
        } @empty { <p class="card p-10 text-center muted">{{ T.empty }}</p> }
      </div>
    }
  `,
})
export class AdminProducts {
  private readonly api = inject(AdminApi);
  protected readonly i = inject(I18n);
  protected readonly t = adminTexts();
  protected readonly models = SITE.models;
  protected readonly src = imgUrl;
  protected readonly slug = slugify;

  protected readonly items = signal<Product[]>([]);
  protected readonly cats = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly busy = signal(false);
  protected readonly msg = signal('');
  protected readonly msgBad = signal(false);
  protected readonly formErr = signal('');
  /** Save was pressed once: from now on missing fields are outlined in red. */
  protected readonly tried = signal(false);
  /** Dropdown title: "All models", the picked models, or "None". */
  protected modelsText(m: string[]) {
    const P = this.t().products;
    return m.length === this.models.length ? P.allPicked : m.length ? this.models.filter(x => m.includes(x)).join('، ') : P.nonePicked;
  }
  /** All brands for the dropdown: the usual ones + any already used by a product, A→Z. */
  protected readonly brands = computed(() =>
    [...new Set([...BRANDS, ...this.items().map(p => p.brand.trim()).filter(Boolean)])].sort((a, b) => a.localeCompare(b)));
  /** "Another brand" was picked: type a new name instead of choosing from the list. */
  protected readonly newBrand = signal(false);
  protected readonly OTHER = '__other__';
  protected pickBrand(f: ProductForm, v: string) {
    if (v === this.OTHER) { this.newBrand.set(true); f.brand = ''; } else f.brand = v;
  }
  protected readonly q = signal('');
  protected readonly catFilter = signal(0);
  protected readonly form = signal<ProductForm | null>(null);

  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase(), c = this.catFilter();
    return bySortOrder(this.items()).filter(p => (!c || p.categoryId === c) &&
      (!q || `${p.name.ar} ${p.name.en} ${p.brand} ${p.slug}`.toLowerCase().includes(q)));
  });

  constructor() {
    // opened from the categories page: show only that category
    const c = Number(inject(ActivatedRoute).snapshot.queryParamMap.get('cat'));
    if (c) this.catFilter.set(c);
    this.load();
  }

  protected load() {
    this.loading.set(true); this.failed.set(false);
    this.api.categories().subscribe({ next: c => this.cats.set(c), error: () => this.failed.set(true) });
    this.api.products().subscribe({
      next: p => { this.items.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.failed.set(true); },
    });
  }

  protected catName(id: number) { return this.i.l(this.cats().find(c => c.id === id)?.name); }

  protected edit(p: Product | null) {
    this.formErr.set(''); this.msg.set(''); this.tried.set(false); this.newBrand.set(false);
    this.form.set(p
      ? { ...p, name: enOnly(p.name), desc: enOnly(p.desc), price: p.price || null, models: [...p.models], hasBadge: !!p.badge,
          badgeAr: p.badge?.ar ?? '', badgeEn: p.badge && p.badge.en !== p.badge.ar ? p.badge.en : '' }
      : { id: null, slug: '', categoryId: this.catFilter() || this.cats()[0]?.id, icon: 'parts', brand: '', name: { ar: '', en: '' }, desc: { ar: '', en: '' },
          price: null, oldPrice: null, cost: null, models: this.models.slice(), inStock: true, featured: false, img: null, sortOrder: nextSortOrder(this.items()), isActive: true,
          hasBadge: false, badgeAr: '', badgeEn: '' });
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggleModel(m: string) {
    const f = this.form();
    if (f) f.models = f.models.includes(m) ? f.models.filter(x => x !== m) : [...f.models, m];
  }

  protected save() {
    const f = this.form();
    if (!f) return;
    const T = this.t(), P = T.products;
    // the page link (slug) is made automatically for new products: from the English name, or a short code
    if (!f.id) f.slug = autoSlug(f.name.en, 'p', this.items().map(p => p.slug), slugify);

    this.tried.set(true);
    const missing = [
      !f.name.ar.trim() && T.f.nameAr, !f.desc.ar.trim() && T.f.descAr, !f.categoryId && P.cat, !f.brand.trim() && P.brand,
      f.hasBadge && !f.badgeAr.trim() && P.badgeAr,
    ].filter((x): x is string => !!x);
    if (missing.length) { this.formErr.set(P.missing(missing)); return; }
    const price = f.price || 0;
    if (f.oldPrice && price && f.oldPrice <= price) { this.formErr.set(P.badOld); return; }

    const tr = (t: { ar: string; en: string }) => ({ ar: t.ar.trim(), en: t.en.trim() || t.ar.trim() });
    const { id, hasBadge, badgeAr, badgeEn, ...rest } = f;
    const body: ProductInput = {
      ...rest, name: tr(f.name), desc: tr(f.desc), price,
      icon: autoIcon(`${f.name.ar} ${f.name.en}`, this.cats().find(c => c.id === f.categoryId)?.icon ?? 'parts'), oldPrice: price ? f.oldPrice || null : null, cost: f.cost ?? null,
      badge: hasBadge ? tr({ ar: badgeAr, en: badgeEn }) : null,
    };
    this.busy.set(true); this.formErr.set('');
    this.api.saveProduct(id, body).subscribe({
      next: p => {
        this.busy.set(false); this.form.set(null);
        this.items.update(l => (id ? l.map(x => (x.id === id ? p : x)) : [...l, p]));
        this.flash(T.saved);
        this.api.categories().subscribe(c => this.cats.set(c));   // product counts
      },
      error: e => {
        this.busy.set(false);
        const err = apiError(e);
        this.formErr.set(err.code === 'slug_taken' ? T.slugTaken : err.message || T.failed);
      },
    });
  }

  protected async remove(p: Product) {
    if (!(await this.confirm.ask(this.delQ(this.i.l(p.name))))) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => { this.items.update(l => l.filter(x => x.id !== p.id)); this.flash(this.t().deleted); this.api.categories().subscribe(c => this.cats.set(c)); },
      error: () => this.flash(this.t().failed, true),
    });
  }


  // ---------- order (▲▼) ----------
  protected readonly moving = signal(false);
  protected move(x: Product, dir: -1 | 1) {
    const changed = moveItem(this.items(), this.shown(), x.id, dir);
    if (!changed.length) return;
    this.items.update(l => withChanges(l, changed));
    this.moving.set(true);
    forkJoin(changed.map(c => { const { id, cat, ...body } = c; return this.api.saveProduct(id, body); })).subscribe({
      next: () => this.moving.set(false),
      error: () => { this.moving.set(false); this.flash(this.t().failed, true); this.load(); },
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
