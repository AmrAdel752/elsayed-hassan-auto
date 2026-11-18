import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { Icon } from '../shared/icon';
import { AdminApi, Category, CategoryInput } from './admin-api';
import { apiError, bySortOrder, moveItem, nextSortOrder, slugify, withChanges } from './admin-ui';
import { MoveArrows } from './move-arrows';
import { forkJoin } from 'rxjs';
import { autoIcon, autoSlug } from './auto-icon';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

type CategoryForm = { id: number | null; ar: string; en: string; isActive: boolean };

/** Product categories (oils, filters, brakes...): name only — the link and icon are made automatically. */
@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, Icon, AdminFlash, RouterLink, MoveArrows],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().cats; @let C = t();
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <div class="flex-1">
        <h1 class="text-2xl md:text-3xl font-black">{{ T.h }}</h1>
        <p class="muted text-sm mt-1">{{ T.intro }}</p>
      </div>
      <button type="button" class="btn btn-red !py-2.5" (click)="edit(null)">+ {{ T.add }}</button>
    </div>

    @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

    @if (form(); as f) {
      <form class="card p-5 md:p-6 mb-5 border-brand-red/40" (ngSubmit)="save()" novalidate>
        <h2 class="text-lg font-black mb-4">{{ f.id ? T.editH : T.addH }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ T.nameAr }} *</span>
            <input class="field" name="ar" maxlength="100" [(ngModel)]="f.ar" [class.bad]="tried() && !f.ar.trim()" [placeholder]="T.namePh"></label>
          <label><span class="lbl">{{ T.nameEn }}</span>
            <input class="field" name="en" dir="ltr" maxlength="100" [(ngModel)]="f.en" placeholder="Oils">
            <small class="muted text-xs">{{ t().products.enHint }}</small></label>
        </div>
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <label class="opt"><input type="checkbox" name="active" [(ngModel)]="f.isActive"><span><b>{{ T.active }}</b><small>{{ T.activeHint }}</small></span></label>
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
        @for (c of items(); track c.id; let first = $first, last = $last) {
          <article class="card p-3 md:p-4 flex items-center gap-3 md:gap-4" [class.opacity-60]="!c.isActive">
            <app-move-arrows [first]="first" [last]="last" [busy]="moving()" (move)="move(c, $event)" />
            <span class="w-12 h-12 shrink-0 rounded-xl bg-zinc-100 dark:bg-ink-900 grid place-items-center"><app-icon [name]="c.icon" class="w-6 h-6 text-brand-red2" /></span>
            <div class="flex-1 min-w-0">
              <b class="block truncate">{{ i.l(c.name) }}</b>
              <small class="muted">
                <a routerLink="/admin/products" [queryParams]="{ cat: c.id }" class="hover:underline">{{ t().products.inCat(c.productCount) }}</a>
                @if (!c.isActive) { — {{ C.hidden }} }</small>
            </div>
            <div class="flex flex-col sm:flex-row gap-1 sm:gap-3 shrink-0 text-sm font-bold">
              <button type="button" class="hover:underline" (click)="toggle(c)">{{ c.isActive ? C.hide : C.show }}</button>
              <button type="button" class="hover:underline" (click)="edit(c)">{{ C.edit }}</button>
              <button type="button" class="text-brand-red2 hover:underline" (click)="remove(c)">{{ C.del }}</button>
            </div>
          </article>
        } @empty { <p class="card p-10 text-center muted">{{ T.empty }}</p> }
      </div>
    }
  `,
})
export class AdminCategories {
  private readonly api = inject(AdminApi);
  protected readonly i = inject(I18n);
  protected readonly t = adminTexts();

  protected readonly items = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly busy = signal(false);
  protected readonly msg = signal('');
  protected readonly msgBad = signal(false);
  protected readonly formErr = signal('');
  protected readonly tried = signal(false);
  protected readonly form = signal<CategoryForm | null>(null);

  constructor() { this.load(); }

  protected load() {
    this.loading.set(true); this.failed.set(false);
    this.api.categories().subscribe({
      next: c => { this.items.set(bySortOrder(c)); this.loading.set(false); },
      error: () => { this.loading.set(false); this.failed.set(true); },
    });
  }

  protected edit(c: Category | null) {
    this.formErr.set(''); this.msg.set(''); this.tried.set(false);
    this.form.set(c ? { id: c.id, ar: c.name.ar, en: c.name.en === c.name.ar ? '' : c.name.en, isActive: c.isActive }
      : { id: null, ar: '', en: '', isActive: true });
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Name → full category: the link and the icon are worked out from the name. */
  private toInput(f: CategoryForm, old?: Category): CategoryInput {
    const ar = f.ar.trim(), en = f.en.trim() || ar;
    return {
      name: { ar, en }, isActive: f.isActive,
      icon: autoIcon(`${ar} ${en}`, old?.icon ?? 'parts'),
      slug: old?.slug ?? autoSlug(f.en, 'c', this.items().map(c => c.slug), slugify),
      sortOrder: old?.sortOrder ?? nextSortOrder(this.items()),
    };
  }

  protected save() {
    const f = this.form(), T = this.t();
    if (!f) return;
    this.tried.set(true);
    if (!f.ar.trim()) { this.formErr.set(T.products.missing([T.cats.nameAr])); return; }
    const old = this.items().find(c => c.id === f.id);
    this.busy.set(true); this.formErr.set('');
    this.api.saveCategory(f.id, this.toInput(f, old)).subscribe({
      next: c => {
        this.busy.set(false); this.form.set(null);
        this.items.update(l => (f.id ? l.map(x => (x.id === f.id ? c : x)) : [...l, c]));
        this.flash(T.saved);
      },
      error: e => { this.busy.set(false); const err = apiError(e); this.formErr.set(err.code === 'slug_taken' ? T.cats.taken : err.message || T.failed); },
    });
  }

  protected toggle(c: Category) {
    const { id, productCount, ...body } = c;
    this.api.saveCategory(id, { ...body, isActive: !c.isActive }).subscribe({
      next: r => this.items.update(l => l.map(x => (x.id === id ? r : x))),
      error: () => this.flash(this.t().failed, true),
    });
  }

  protected async remove(c: Category) {
    const T = this.t();
    if (c.productCount) { this.flash(T.products.catInUse, true); return; }
    const K = T.confirm;
    if (!(await this.confirm.ask({ title: K.delTitle, subject: this.i.l(c.name), message: K.delMsg, confirmText: K.delBtn, cancelText: K.keep }))) return;
    this.api.deleteCategory(c.id).subscribe({
      next: () => { this.items.update(l => l.filter(x => x.id !== c.id)); this.flash(T.deleted); },
      error: e => this.flash(apiError(e).code === 'category_in_use' ? T.products.catInUse : T.failed, true),
    });
  }


  // ---------- order (▲▼) ----------
  protected readonly moving = signal(false);
  protected move(x: Category, dir: -1 | 1) {
    const changed = moveItem(this.items(), this.items(), x.id, dir);
    if (!changed.length) return;
    this.items.update(l => withChanges(l, changed));
    this.moving.set(true);
    forkJoin(changed.map(c => { const { id, productCount, ...body } = c; return this.api.saveCategory(id, body); })).subscribe({
      next: () => this.moving.set(false),
      error: () => { this.moving.set(false); this.flash(this.t().failed, true); this.load(); },
    });
  }

  private readonly confirm = inject(ConfirmService);
  private flash(text: string, bad = false) { this.msgBad.set(bad); this.msg.set(text); }
}
