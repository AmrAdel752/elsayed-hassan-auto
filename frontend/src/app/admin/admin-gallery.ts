import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { I18n } from '../core/i18n.service';
import { imgUrl } from '../core/media';
import { Icon } from '../shared/icon';
import { AdminApi, BeforeAfterInput, BeforeAfterPair, GalleryCat, GalleryTile, GalleryTileInput } from './admin-api';
import { apiError, moveItem, withChanges } from './admin-ui';
import { MoveArrows } from './move-arrows';
import { autoIcon } from './auto-icon';
import { ImageInput } from './image-input';
import { AdminFlash } from './admin-flash';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

type Tab = 'tiles' | 'pairs';
type TileForm = GalleryTileInput & { kind: 'tiles'; id: number | null };
type PairForm = BeforeAfterInput & { kind: 'pairs'; id: number | null };

const CATS: GalleryCat[] = ['workshop', 'work', 'cars'];
/** English that only repeats the Arabic was never typed: keep the box empty when editing. */
const en = (t: { ar: string; en: string }) => (t.en === t.ar ? '' : t.en);
const bySort = <T extends { sortOrder: number; id: number }>(l: T[]) => [...l].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

/** Gallery: photo tiles + before/after pairs. Hidden ones stay here but leave the website. */
@Component({
  selector: 'app-admin-gallery',
  imports: [FormsModule, Icon, ImageInput, AdminFlash, MoveArrows],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().gallery; @let C = t();
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex-1">
        <h1 class="text-2xl md:text-3xl font-black">{{ T.h }}</h1>
        @if (!loading() && !failed()) { <p class="muted text-sm mt-1">{{ T.count(shown(), total()) }}</p> }
      </div>
      <button type="button" class="btn btn-red !py-2.5" (click)="edit(null)">+ {{ tab() === 'tiles' ? T.addTile : T.addPair }}</button>
    </div>

    <div class="flex gap-2 mb-5" role="tablist">
      @for (x of tabs; track x) {
        <button type="button" role="tab" [attr.aria-selected]="tab() === x" (click)="setTab(x)"
                class="px-4 py-2 rounded-xl font-bold text-sm border transition"
                [class]="tab() === x ? 'bg-brand-red text-white border-brand-red' : 'border-zinc-300 dark:border-ink-600 hover:bg-zinc-100 dark:hover:bg-white/5'">
          {{ T.tabs[x] }} <span class="opacity-70">({{ x === 'tiles' ? tiles().length : pairs().length }})</span></button>
      }
    </div>

    @if (msg()) { <app-admin-flash [text]="msg()" [bad]="msgBad()" /> }

    @if (form(); as f) {
      <form class="card p-5 md:p-6 mb-5 border-brand-red/40" (ngSubmit)="save(gf)" #gf="ngForm">
        <h2 class="text-lg font-black mb-4">{{ f.kind === 'tiles' ? (f.id ? T.editTileH : T.addTileH) : (f.id ? T.editPairH : T.addPairH) }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ T.titleAr }}</span><input class="field" name="tar" required minlength="2" maxlength="200" [(ngModel)]="f.titleAr"></label>
          <label><span class="lbl">{{ T.titleEn }}</span><input class="field" name="ten" dir="ltr" maxlength="200" [(ngModel)]="f.titleEn">
            <small class="muted text-xs">{{ T.enHint }}</small></label>

          @if (f.kind === 'pairs') {
            <label><span class="lbl">{{ T.descAr }}</span><textarea class="field resize-none" rows="3" name="dar" required minlength="2" maxlength="1000" [(ngModel)]="f.descAr"></textarea></label>
            <label><span class="lbl">{{ T.descEn }}</span><textarea class="field resize-none" rows="3" name="den" dir="ltr" maxlength="1000" [(ngModel)]="f.descEn"></textarea></label>
            <div><span class="lbl">{{ T.before }}</span><app-image-input [(value)]="f.before" /></div>
            <div><span class="lbl">{{ T.after }}</span><app-image-input [(value)]="f.after" /></div>
          } @else {
            <label><span class="lbl">{{ T.cat }}</span>
              <select class="field" name="cat" [(ngModel)]="f.cat">@for (c of cats; track c) { <option [ngValue]="c">{{ T.cats[c] }}</option> }</select></label>
            <label class="flex items-center gap-2 font-bold text-sm self-end pb-3"><input type="checkbox" name="tall" class="w-5 h-5 accent-[#dc2f36]" [(ngModel)]="f.tall">{{ T.tall }}</label>
            <div class="sm:col-span-2"><span class="lbl">{{ C.f.image }}</span><app-image-input [(value)]="f.img" /></div>
          }
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
    } @else if (tab() === 'tiles') {
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        @for (g of tiles(); track g.id; let first = $first, last = $last) {
          <article class="card overflow-hidden flex flex-col" [class.opacity-60]="!g.isVisible">
            <div class="aspect-[4/3] bg-zinc-100 dark:bg-ink-900 grid place-items-center relative">
              @if (g.img) { <img [src]="src(g.img)" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover"> }
              @else { <app-icon [name]="g.icon" class="w-10 h-10 text-brand-red2" [attr.title]="T.noImg" /> }
              @if (!g.isVisible) { <span class="absolute top-2 start-2 rounded-full bg-zinc-900/80 text-white px-2 py-0.5 text-[11px] font-bold">{{ C.hidden }}</span> }
            </div>
            <div class="p-3 flex-1 flex flex-col">
              <b class="block leading-snug">{{ i.l(g.title) }}</b>
              <small class="muted">{{ T.cats[g.cat] }}</small>
              <div class="mt-auto pt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold">
                <button type="button" class="hover:underline" (click)="toggle(g)">{{ g.isVisible ? C.hide : C.show }}</button>
                <button type="button" class="hover:underline" (click)="edit(g)">{{ C.edit }}</button>
                <button type="button" class="text-brand-red2 hover:underline" (click)="remove(g)">{{ C.del }}</button>
                <app-move-arrows class="!flex-row ms-auto !my-0" [first]="first" [last]="last" [busy]="moving()" (move)="moveTile(g, $event)" />
              </div>
            </div>
          </article>
        } @empty { <p class="card p-10 text-center muted col-span-full">{{ T.emptyTiles }}</p> }
      </div>
    } @else {
      <div class="space-y-2.5">
        @for (b of pairs(); track b.id; let first = $first, last = $last) {
          <article class="card p-3 md:p-4 flex flex-wrap items-center gap-3 md:gap-4" [class.opacity-60]="!b.isVisible">
            <app-move-arrows [first]="first" [last]="last" [busy]="moving()" (move)="movePair(b, $event)" />
            <div class="flex gap-1.5 shrink-0">
              @for (p of [b.before, b.after]; track $index) {
                <div class="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-ink-900 grid place-items-center overflow-hidden">
                  @if (p) { <img [src]="src(p)" alt="" loading="lazy" class="w-full h-full object-cover"> }
                  @else { <app-icon [name]="b.icon" class="w-7 h-7 text-brand-red2" [class.opacity-40]="$index === 0" /> }
                </div>
              }
            </div>
            <div class="flex-1 min-w-[160px]">
              <div class="flex items-center gap-2 flex-wrap">
                <b>{{ i.l(b.title) }}</b>
                @if (!b.isVisible) { <span class="rounded-full bg-zinc-500/15 px-2 py-0.5 text-[11px] font-bold">{{ C.hidden }}</span> }
              </div>
              <small class="muted block">{{ i.l(b.desc) }}</small>
            </div>
            <div class="flex gap-3 shrink-0 text-sm font-bold">
              <button type="button" class="hover:underline" (click)="toggle(b)">{{ b.isVisible ? C.hide : C.show }}</button>
              <button type="button" class="hover:underline" (click)="edit(b)">{{ C.edit }}</button>
              <button type="button" class="text-brand-red2 hover:underline" (click)="remove(b)">{{ C.del }}</button>
            </div>
          </article>
        } @empty { <p class="card p-10 text-center muted">{{ T.emptyPairs }}</p> }
      </div>
    }
  `,
})
export class AdminGallery {
  private readonly api = inject(AdminApi);
  protected readonly i = inject(I18n);
  protected readonly t = adminTexts();
  protected readonly cats = CATS;
  protected readonly tabs: Tab[] = ['tiles', 'pairs'];
  protected readonly src = imgUrl;

  protected readonly tab = signal<Tab>('tiles');
  protected readonly tiles = signal<GalleryTile[]>([]);
  protected readonly pairs = signal<BeforeAfterPair[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly busy = signal(false);
  protected readonly msg = signal('');
  protected readonly msgBad = signal(false);
  protected readonly formErr = signal('');
  protected readonly form = signal<TileForm | PairForm | null>(null);

  private readonly current = computed<{ isVisible: boolean }[]>(() => (this.tab() === 'tiles' ? this.tiles() : this.pairs()));
  protected readonly total = computed(() => this.current().length);
  protected readonly shown = computed(() => this.current().filter(x => x.isVisible).length);

  constructor() { this.load(); }

  protected load() {
    this.loading.set(true); this.failed.set(false);
    forkJoin([this.api.gallery(), this.api.beforeAfter()]).subscribe({
      next: ([g, b]) => { this.tiles.set(g); this.pairs.set(b); this.loading.set(false); },
      error: () => { this.loading.set(false); this.failed.set(true); },
    });
  }

  protected setTab(x: Tab) { this.tab.set(x); this.form.set(null); this.msg.set(''); }

  private tileInput(g: GalleryTile): GalleryTileInput {
    return { cat: g.cat, icon: g.icon, tall: g.tall, titleAr: g.title.ar, titleEn: en(g.title), img: g.img ?? null, sortOrder: g.sortOrder, isVisible: g.isVisible };
  }
  private pairInput(b: BeforeAfterPair): BeforeAfterInput {
    return {
      icon: b.icon, titleAr: b.title.ar, titleEn: en(b.title), descAr: b.desc.ar, descEn: en(b.desc),
      before: b.before ?? null, after: b.after ?? null, sortOrder: b.sortOrder, isVisible: b.isVisible,
    };
  }
  private isTile(x: GalleryTile | BeforeAfterPair): x is GalleryTile { return 'cat' in x; }

  /** New items go last. */
  private nextSort(l: { sortOrder: number }[]) { return l.length ? Math.max(...l.map(x => x.sortOrder)) + 1 : 0; }

  protected edit(x: GalleryTile | BeforeAfterPair | null) {
    this.formErr.set(''); this.msg.set('');
    if (x ? this.isTile(x) : this.tab() === 'tiles') {
      this.form.set(x ? { kind: 'tiles', id: x.id, ...this.tileInput(x as GalleryTile) }
        : { kind: 'tiles', id: null, cat: 'work', icon: 'car', tall: false, titleAr: '', titleEn: '', img: null, sortOrder: this.nextSort(this.tiles()), isVisible: true });
    } else {
      this.form.set(x ? { kind: 'pairs', id: x.id, ...this.pairInput(x as BeforeAfterPair) }
        : { kind: 'pairs', id: null, icon: 'car', titleAr: '', titleEn: '', descAr: '', descEn: '', before: null, after: null, sortOrder: this.nextSort(this.pairs()), isVisible: true });
    }
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected save(ngf: NgForm) {
    const f = this.form();
    if (!f) return;
    if (ngf.invalid) { ngf.form.markAllAsTouched(); this.formErr.set(this.t().fillAll); return; }
    // the icon (shown while there's no photo) is picked from the title
    const fallback = f.kind === 'pairs' ? 'car' : f.cat === 'cars' ? 'car' : f.cat === 'workshop' ? 'engine' : 'parts';
    f.icon = autoIcon(`${f.titleAr} ${f.titleEn}`, fallback);
    this.busy.set(true); this.formErr.set('');
    const done = () => { this.busy.set(false); this.form.set(null); this.flash(this.t().saved); };
    const fail = (e: unknown) => { this.busy.set(false); this.formErr.set(apiError(e).message || this.t().failed); };
    if (f.kind === 'tiles') {
      const { kind, id, ...body } = f;
      this.api.saveGalleryTile(id, body).subscribe({ next: g => { this.putTile(g, id); done(); }, error: fail });
    } else {
      const { kind, id, ...body } = f;
      this.api.saveBeforeAfter(id, body).subscribe({ next: b => { this.putPair(b, id); done(); }, error: fail });
    }
  }

  private putTile(g: GalleryTile, id: number | null) { this.tiles.update(l => bySort(id ? l.map(x => (x.id === id ? g : x)) : [...l, g])); }
  private putPair(b: BeforeAfterPair, id: number | null) { this.pairs.update(l => bySort(id ? l.map(x => (x.id === id ? b : x)) : [...l, b])); }

  protected toggle(x: GalleryTile | BeforeAfterPair) {
    const error = () => this.flash(this.t().failed, true);
    if (this.isTile(x)) this.api.saveGalleryTile(x.id, { ...this.tileInput(x), isVisible: !x.isVisible }).subscribe({ next: g => this.putTile(g, x.id), error });
    else this.api.saveBeforeAfter(x.id, { ...this.pairInput(x), isVisible: !x.isVisible }).subscribe({ next: b => this.putPair(b, x.id), error });
  }

  protected async remove(x: GalleryTile | BeforeAfterPair) {
    if (!(await this.confirm.ask(this.delQ(this.i.l(x.title))))) return;
    const error = () => this.flash(this.t().failed, true);
    const ok = () => this.flash(this.t().deleted);
    if (this.isTile(x)) this.api.deleteGalleryTile(x.id).subscribe({ next: () => { this.tiles.update(l => l.filter(y => y.id !== x.id)); ok(); }, error });
    else this.api.deleteBeforeAfter(x.id).subscribe({ next: () => { this.pairs.update(l => l.filter(y => y.id !== x.id)); ok(); }, error });
  }


  // ---------- order (▲▼) ----------
  protected readonly moving = signal(false);
  protected moveTile(g: GalleryTile, dir: -1 | 1) {
    const changed = moveItem(this.tiles(), this.tiles(), g.id, dir);
    if (!changed.length) return;
    this.tiles.update(l => withChanges(l, changed));
    this.saveOrder(changed.map(c => this.api.saveGalleryTile(c.id, this.tileInput(c))));
  }
  protected movePair(b: BeforeAfterPair, dir: -1 | 1) {
    const changed = moveItem(this.pairs(), this.pairs(), b.id, dir);
    if (!changed.length) return;
    this.pairs.update(l => withChanges(l, changed));
    this.saveOrder(changed.map(c => this.api.saveBeforeAfter(c.id, this.pairInput(c))));
  }
  private saveOrder(calls: Observable<unknown>[]) {
    this.moving.set(true);
    forkJoin(calls).subscribe({
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
