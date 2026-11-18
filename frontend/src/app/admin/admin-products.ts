import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../core/i18n.service';
import { imgUrl } from '../core/media';
import { SITE } from '../core/site';
import { Icon } from '../shared/icon';
import { AdminApi, Category, CategoryInput, Product, ProductInput } from './admin-api';
import { apiError, slugify } from './admin-ui';
import { ImageInput } from './image-input';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

export const ICONS = ['oil', 'parts', 'susp', 'car', 'ac', 'cpu', 'tire', 'wash', 'paint', 'engine', 'shield', 'gift', 'tag'];

/** `price` empty/0 = "ask for the price" on the site. English texts are optional: empty = the Arabic text is used. */
type ProductForm = Omit<ProductInput, 'price'> & { id: number | null; price: number | null; hasBadge: boolean; badgeAr: string; badgeEn: string };
/** English copy that was saved as "same as Arabic" is shown empty again when editing. */
const enOnly = (t: { ar: string; en: string }) => ({ ar: t.ar, en: t.en === t.ar ? '' : t.en });
type CategoryForm = CategoryInput & { id: number | null };

/** Products: list + add/edit form (with image), plus the categories manager. */
@Component({
  selector: 'app-admin-products',
  imports: [FormsModule, Icon, ImageInput, AdminFlash],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().products; @let C = t();
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <h1 class="text-2xl md:text-3xl font-black flex-1">{{ T.h }}</h1>
      <button type="button" class="btn !py-2.5 border border-zinc-300 dark:border-ink-600" (click)="showCats.set(!showCats())">{{ T.cats }}</button>
      <button type="button" class="btn btn-red !py-2.5" (click)="edit(null)" [disabled]="!cats().length">+ {{ T.add }}</button>
    </div>

    @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

    <!-- categories manager -->
    @if (showCats()) {
      <section class="card p-5 md:p-6 mb-5">
        <h2 class="text-lg font-black mb-4">{{ T.cats }}</h2>
        <form class="grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_130px_90px_auto] gap-2 items-end mb-4" (ngSubmit)="saveCat()">
          <label><span class="lbl">{{ C.f.nameAr }}</span><input class="field" name="car" required maxlength="100" [(ngModel)]="cat.name.ar"></label>
          <label><span class="lbl">{{ C.f.nameEn }}</span><input class="field" name="cen" dir="ltr" required maxlength="100" [(ngModel)]="cat.name.en" (ngModelChange)="cat.id || (cat.slug = slug($event))"></label>
          <label><span class="lbl">{{ C.f.slug }}</span><input class="field" name="cslug" dir="ltr" required maxlength="60" pattern="[a-z0-9]+(-[a-z0-9]+)*" [(ngModel)]="cat.slug"></label>
          <label><span class="lbl">{{ C.f.icon }}</span><select class="field" name="cicon" [(ngModel)]="cat.icon">@for (x of icons; track x) { <option>{{ x }}</option> }</select></label>
          <label><span class="lbl">{{ C.f.sort }}</span><input class="field" type="number" name="csort" min="0" [(ngModel)]="cat.sortOrder"></label>
          <div class="flex gap-2">
            <button type="submit" [disabled]="busy()" class="btn btn-red !px-5 !py-3">{{ cat.id ? C.save : T.add }}</button>
            @if (cat.id) { <button type="button" class="btn !px-4 !py-3 border border-zinc-300 dark:border-ink-600" (click)="cat = newCat()">{{ C.cancel }}</button> }
          </div>
        </form>
        @for (c of cats(); track c.id) {
          <div class="flex items-center gap-3 py-2.5 border-t border-zinc-200 dark:border-ink-600">
            <app-icon [name]="c.icon" class="w-5 h-5 text-brand-red2" />
            <div class="flex-1 min-w-0"><b>{{ i.l(c.name) }}</b> <small class="muted" dir="ltr">{{ c.slug }}</small>
              <small class="muted block">{{ T.inCat(c.productCount) }}@if (!c.isActive) { — {{ C.hidden }} }</small></div>
            <button type="button" class="text-sm font-bold hover:underline" (click)="toggleCat(c)">{{ c.isActive ? C.hide : C.show }}</button>
            <button type="button" class="text-sm font-bold hover:underline" (click)="cat = { id: c.id, slug: c.slug, icon: c.icon, name: { ar: c.name.ar, en: c.name.en }, sortOrder: c.sortOrder, isActive: c.isActive }">{{ C.edit }}</button>
            <button type="button" class="text-sm font-bold text-brand-red2 hover:underline" (click)="removeCat(c)">{{ C.del }}</button>
          </div>
        }
      </section>
    }

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
          <label><span class="lbl">{{ T.brand }} *</span><input class="field" name="brand" required maxlength="100" [(ngModel)]="f.brand" [class.bad]="tried() && !f.brand.trim()"></label>
          <label><span class="lbl">{{ T.price }}</span><input class="field" type="number" name="price" min="0" step="0.01" [(ngModel)]="f.price">
            <small class="muted text-xs">{{ T.priceHint }}</small></label>
          <label><span class="lbl">{{ T.oldPrice }}</span><input class="field" type="number" name="old" min="0" step="0.01" [(ngModel)]="f.oldPrice"></label>
          <div class="grid grid-cols-2 gap-4 sm:col-span-2">
            <label><span class="lbl">{{ C.f.icon }}</span><select class="field" name="icon" [(ngModel)]="f.icon">@for (x of icons; track x) { <option>{{ x }}</option> }</select></label>
            <label><span class="lbl">{{ C.f.sort }}</span><input class="field" type="number" name="sort" min="0" [(ngModel)]="f.sortOrder"></label>
          </div>
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
          <button type="submit" [disabled]="busy()" class="btn btn-red disabled:opacity-50 disabled:pointer-events-none">{{ busy() ? C.saving : C.save }}</button>
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
      <p class="muted font-bold" role="status">{{ C.loading }}</p>
    } @else {
      <div class="space-y-2.5">
        @for (p of shown(); track p.id) {
          <article class="card p-3 md:p-4 flex items-center gap-3 md:gap-4" [class.opacity-60]="!p.isActive">
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
  protected readonly icons = ICONS;
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
  protected readonly q = signal('');
  protected readonly catFilter = signal(0);
  protected readonly showCats = signal(false);
  protected readonly form = signal<ProductForm | null>(null);
  protected cat: CategoryForm = { id: null, slug: '', icon: 'parts', name: { ar: '', en: '' }, sortOrder: 0, isActive: true };

  protected readonly shown = computed(() => {
    const q = this.q().trim().toLowerCase(), c = this.catFilter();
    return this.items().filter(p => (!c || p.categoryId === c) &&
      (!q || `${p.name.ar} ${p.name.en} ${p.brand} ${p.slug}`.toLowerCase().includes(q)));
  });

  constructor() { this.load(); }

  protected load() {
    this.loading.set(true); this.failed.set(false);
    this.api.categories().subscribe({ next: c => { this.cats.set(c); if (!this.cat.id) this.cat = this.newCat(); }, error: () => this.failed.set(true) });
    this.api.products().subscribe({
      next: p => { this.items.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.failed.set(true); },
    });
  }

  protected catName(id: number) { return this.i.l(this.cats().find(c => c.id === id)?.name); }

  // ---------- products ----------

  protected edit(p: Product | null) {
    this.formErr.set(''); this.msg.set(''); this.tried.set(false);
    this.form.set(p
      ? { ...p, name: enOnly(p.name), desc: enOnly(p.desc), price: p.price || null, models: [...p.models], hasBadge: !!p.badge,
          badgeAr: p.badge?.ar ?? '', badgeEn: p.badge && p.badge.en !== p.badge.ar ? p.badge.en : '' }
      : { id: null, slug: '', categoryId: this.catFilter() || this.cats()[0]?.id, icon: 'parts', brand: '', name: { ar: '', en: '' }, desc: { ar: '', en: '' },
          price: null, oldPrice: null, cost: null, models: this.models.slice(), inStock: true, featured: false, img: null, sortOrder: this.items().length, isActive: true,
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
    if (!f.id) {
      const base = this.slug(f.name.en) || `p-${Date.now().toString(36)}`, used = new Set(this.items().map(p => p.slug));
      let s = base;
      for (let n = 2; used.has(s); n++) s = `${base}-${n}`;
      f.slug = s;
    }

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
      ...rest, name: tr(f.name), desc: tr(f.desc), price, oldPrice: price ? f.oldPrice || null : null, cost: f.cost ?? null,
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

  // ---------- categories ----------

  /** Empty category form; new categories go to the end of the list. */
  protected newCat(): CategoryForm {
    return { id: null, slug: '', icon: 'parts', name: { ar: '', en: '' }, sortOrder: this.cats().length, isActive: true };
  }

  protected saveCat() {
    const { id, ...body } = this.cat, T = this.t();
    if (!body.name.ar.trim() || !body.name.en.trim() || !body.slug) return;
    this.busy.set(true);
    this.api.saveCategory(id, body).subscribe({
      next: c => {
        this.busy.set(false); this.cat = this.newCat();
        this.cats.update(l => (id ? l.map(x => (x.id === id ? c : x)) : [...l, c]).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id));
        this.flash(T.saved);
      },
      error: e => { this.busy.set(false); const err = apiError(e); this.flash(err.code === 'slug_taken' ? T.slugTaken : err.message || T.failed, true); },
    });
  }

  protected toggleCat(c: Category) {
    const { id, productCount, ...body } = c;
    this.api.saveCategory(id, { ...body, isActive: !c.isActive }).subscribe({
      next: r => this.cats.update(l => l.map(x => (x.id === id ? r : x))),
      error: () => this.flash(this.t().failed, true),
    });
  }

  protected async removeCat(c: Category) {
    const T = this.t();
    if (c.productCount) { this.flash(T.products.catInUse, true); return; }
    if (!(await this.confirm.ask(this.delQ(this.i.l(c.name))))) return;
    this.api.deleteCategory(c.id).subscribe({
      next: () => { this.cats.update(l => l.filter(x => x.id !== c.id)); this.flash(T.deleted); },
      error: e => this.flash(apiError(e).code === 'category_in_use' ? T.products.catInUse : T.failed, true),
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
