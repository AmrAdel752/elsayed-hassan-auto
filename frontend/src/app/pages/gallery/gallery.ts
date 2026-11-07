import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { BEFORE_AFTER, GALLERY, GalleryItem } from '../../data/gallery';
import { PageBanner } from '../../shared/page-banner';
import { BeforeAfterSlider } from '../../shared/before-after';
import { CtaBand } from '../../shared/cta-band';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

const TILE_BG: Record<string, string> = {
  workshop: 'from-ink-700 via-ink-800 to-ink-900',
  work: 'from-[#3a0a0d] via-ink-800 to-ink-900',
  cars: 'from-brand-red2 via-brand-red to-[#741419]',
};

@Component({
  selector: 'app-gallery',
  imports: [PageBanner, BeforeAfterSlider, CtaBand, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'open.set(null)' },
  template: `
    <app-page-banner [title]="i.t('gal.title')" [subtitle]="i.t('gal.sub')" icon="star" [crumbs]="[{ label: i.t('nav.gallery') }]" />

    <section class="pt-5 pb-14 md:py-20">
      <div class="wrap">
        <div class="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap [scrollbar-width:none]">
          @for (c of cats; track c) {
            <button type="button" (click)="cat.set(c)"
                    class="shrink-0 px-4 py-2 rounded-full border-2 text-sm font-bold transition"
                    [class]="cat() === c ? 'bg-brand-red border-brand-red text-white' : 'border-zinc-200 dark:border-ink-600 hover:border-brand-red/50'">{{ label(c) }}</button>
          }
        </div>

        <!-- masonry-style grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[180px] gap-3 md:gap-4 [grid-auto-flow:dense]">
          @for (g of list(); track g.id) {
            <button type="button" (click)="open.set(g)" [class.row-span-2]="g.tall"
                    class="group relative overflow-hidden rounded-2xl text-start bg-gradient-to-br {{ bg(g) }}">
              @if (g.img) { <img [src]="g.img" alt="" class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"> }
              @else {
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,.12),transparent_60%)]"></div>
                <app-icon [name]="g.icon" class="absolute inset-0 m-auto w-14 h-14 md:w-20 md:h-20 text-white/80 transition duration-500 group-hover:scale-110" />
              }
              <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <small class="block text-[10px] font-bold text-[#ff9599]">{{ label(g.cat) }}</small>
                <b class="block text-white text-xs md:text-sm leading-snug line-clamp-2">{{ i.l(g.title) }}</b>
              </div>
            </button>
          }
        </div>
        <p class="muted text-xs text-center mt-4">{{ i.t('gal.note') }}</p>
      </div>
    </section>

    <!-- before / after -->
    <section class="py-14 md:py-24 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
      <div class="wrap">
        <div reveal class="sec-head"><span class="tag">{{ i.t('gal.baTag') }}</span><h2 class="h2" [innerHTML]="i.t('gal.baH')"></h2><p class="muted">{{ i.t('gal.baP') }}</p></div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          @for (b of beforeAfter; track b.id) { <app-before-after [item]="b" /> }
        </div>
      </div>
    </section>

    <div class="pt-14 md:pt-20"><app-cta-band /></div>

    <!-- lightbox -->
    @if (open(); as g) {
      <div class="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm grid place-items-center p-4" (click)="open.set(null)">
        <div class="relative w-full max-w-[720px]" (click)="$event.stopPropagation()">
          <div class="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br {{ bg(g) }}">
            @if (g.img) { <img [src]="g.img" alt="" class="w-full h-full object-cover"> }
            @else { <app-icon [name]="g.icon" class="absolute inset-0 m-auto w-32 h-32 text-white/85" /> }
          </div>
          <div class="flex items-center justify-between gap-3 mt-4 text-white">
            <button type="button" (click)="step(-1)" class="icon-btn !border-white/30 !bg-white/10 !text-white" [attr.aria-label]="i.t('gal.prev')"><app-icon name="arrow" class="w-5 h-5 ltr:rotate-180" /></button>
            <div class="text-center flex-1"><small class="text-[#ff9599] font-bold">{{ label(g.cat) }}</small><b class="block">{{ i.l(g.title) }}</b></div>
            <button type="button" (click)="step(1)" class="icon-btn !border-white/30 !bg-white/10 !text-white" [attr.aria-label]="i.t('gal.next')"><app-icon name="arrow" class="w-5 h-5 rtl:rotate-180" /></button>
          </div>
          <button type="button" (click)="open.set(null)" class="absolute -top-3 -end-3 icon-btn !bg-white !text-ink-900" [attr.aria-label]="i.t('gal.close')"><app-icon name="close" class="w-5 h-5" /></button>
        </div>
      </div>
    }
  `,
})
export class Gallery {
  protected readonly i = inject(I18n);
  protected readonly cats = ['all', 'workshop', 'work', 'cars'] as const;
  protected readonly beforeAfter = BEFORE_AFTER;
  protected readonly cat = signal<string>('all');
  protected readonly open = signal<GalleryItem | null>(null);
  protected readonly list = computed(() => GALLERY.filter(g => this.cat() === 'all' || g.cat === this.cat()));

  protected label(c: string): string { return (this.i.dict().gal.cats as Record<string, string>)[c]; }
  protected bg(g: GalleryItem) { return TILE_BG[g.cat]; }

  /** Move the lightbox through the currently filtered items. */
  protected step(d: number) {
    const l = this.list(), idx = l.findIndex(x => x.id === this.open()?.id);
    this.open.set(l[(idx + d + l.length) % l.length]);
  }
}
