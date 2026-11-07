import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Seo } from '../../core/seo.service';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { waLink } from '../../core/site';
import { CATEGORIES, PRODUCTS } from '../../data/catalog';
import { PageBanner } from '../../shared/page-banner';
import { ProductCard } from '../../shared/product-card';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, PageBanner, ProductCard, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product(); as p) {
      <app-page-banner [title]="i.l(p.name)" [crumbs]="[{ label: i.t('nav.products'), link: '/products' }, { label: i.l(p.name) }]" />

      <section class="py-5 md:py-16">
        <div class="wrap grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <!-- visual -->
          <div reveal class="card relative aspect-[4/3] sm:aspect-square overflow-hidden !rounded-[20px] md:!rounded-[28px] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-ink-700 dark:to-ink-900">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(220,47,54,.25),transparent_60%)]"></div>
            <div class="absolute inset-[18%] rounded-full border-2 border-dashed border-brand-red/30 animate-spin40"></div>
            <app-icon [name]="p.icon" class="absolute inset-0 m-auto w-28 h-28 sm:w-40 sm:h-40 text-brand-red2 animate-float" />
            <span class="absolute bottom-4 sm:bottom-6 inset-x-0 text-center font-[Arial] font-black tracking-[3px] sm:tracking-[5px] text-xs sm:text-base text-zinc-400 dark:text-zinc-500">{{ p.brand.toUpperCase() }}</span>
            @if (off()) { <span class="absolute top-5 start-5 px-3 py-1.5 rounded-xl bg-brand-red text-white font-black" dir="ltr">-{{ off() }}%</span> }
          </div>

          <!-- info -->
          <div [reveal]=".15">
            <div class="flex flex-wrap gap-2 mb-4">
              <a [routerLink]="'/products'" [queryParams]="{ cat: p.cat }" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red2 text-sm font-bold"><app-icon [name]="cat()!.icon" class="w-4 h-4" />{{ i.l(cat()!.name) }}</a>
              <span class="px-3 py-1 rounded-full text-sm font-bold" [class]="p.inStock ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-500/15 muted'">{{ i.t(p.inStock ? 'shop.inStock' : 'shop.out') }}</span>
            </div>
            <h1 class="hidden lg:block text-4xl font-black leading-tight mb-4">{{ i.l(p.name) }}</h1>
            <p class="muted text-base md:text-lg leading-loose mb-5 md:mb-6">{{ i.l(p.desc) }}</p>

            <div class="flex items-baseline flex-wrap gap-3 mb-2">
              <b class="text-3xl md:text-4xl font-black text-brand-red2">{{ i.price(p.price) }}</b>
              @if (p.oldPrice) {
                <s class="muted text-lg">{{ i.price(p.oldPrice) }}</s>
                <span class="px-2.5 py-1 rounded-lg bg-brand-gold/20 text-brand-dgold dark:text-brand-gold text-sm font-black">{{ i.t('shop.save') }} {{ i.price(p.oldPrice - p.price) }}</span>
              }
            </div>
            <p class="muted text-xs mb-6 md:mb-8">{{ i.t('shop.note') }}</p>

            <div class="card !rounded-2xl p-5 mb-6 space-y-4">
              <div class="flex justify-between gap-4"><span class="muted">{{ i.t('shop.brand') }}</span><b>{{ p.brand }}</b></div>
              <div>
                <span class="muted block mb-2">{{ i.t('shop.fits') }}</span>
                <div class="flex flex-wrap gap-2 font-[Arial] text-xs font-bold tracking-wide">
                  @for (m of p.models; track m) { <span class="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-ink-600">{{ m.toUpperCase() }}</span> }
                </div>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <a [href]="wa()" target="_blank" class="btn justify-center bg-[#25d366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,.7)]"><app-icon name="wa" class="w-5 h-5" />{{ i.t('shop.order') }}</a>
              <a routerLink="/book" class="btn btn-ghost justify-center"><app-icon name="engine" class="w-5 h-5" />{{ i.t('shop.installBtn') }}</a>
            </div>
            <p class="muted text-sm mt-3 text-center sm:text-start">{{ i.t('shop.install') }} {{ i.t('shop.installSub') }}</p>
          </div>
        </div>
      </section>

      <!-- phones: price + order always in reach, sitting on the bottom tab bar -->
      <div class="lg:hidden fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-[55] flex items-center gap-3 px-4 py-2.5 bg-white/95 dark:bg-ink-800/95 backdrop-blur border-t border-zinc-200 dark:border-ink-600">
        <div class="min-w-0 flex-1">
          @if (p.oldPrice) { <s class="muted text-[11px] block leading-none">{{ i.price(p.oldPrice) }}</s> }
          <b class="text-lg font-black text-brand-red2 whitespace-nowrap">{{ i.price(p.price) }}</b>
        </div>
        <a [href]="wa()" target="_blank" class="btn !py-2.5 !px-5 bg-[#25d366] text-white text-sm"><app-icon name="wa" class="w-5 h-5" />{{ i.t('shop.order') }}</a>
      </div>
      <div class="lg:hidden h-16"></div>

      @if (related().length) {
        <section class="py-12 md:py-20 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
          <div class="wrap">
            <h2 class="text-xl md:text-3xl font-black mb-5 md:mb-8">{{ i.t('shop.related') }}</h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              @for (r of related(); track r.slug) { <app-product-card [product]="r" /> }
            </div>
          </div>
        </section>
      }
    } @else {
      <section class="wrap min-h-[50vh] grid place-items-center text-center py-24">
        <div><h1 class="h2">{{ i.t('shop.notFound') }}</h1><a routerLink="/products" class="btn btn-red mt-6">{{ i.t('nav.products') }}</a></div>
      </section>
    }
  `,
})
export class ProductDetails {
  protected readonly i = inject(I18n);
  private readonly seo = inject(Seo);
  // item-specific <title>/description for this page
  private readonly seoFx = effect(() => { const p = this.product(); if (p) this.seo.set({ title: this.i.l(p.name), desc: this.i.l(p.desc) }); });
  /** Bound from the `:slug` route param. */
  readonly slug = input<string>();
  protected readonly product = computed(() => PRODUCTS.find(p => p.slug === this.slug()));
  protected readonly cat = computed(() => CATEGORIES.find(c => c.id === this.product()?.cat));
  protected readonly off = computed(() => {
    const p = this.product();
    return p?.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  });
  protected readonly related = computed(() => {
    const p = this.product();
    if (!p) return [];
    const same = PRODUCTS.filter(x => x.slug !== p.slug && x.cat === p.cat);
    const others = PRODUCTS.filter(x => x.slug !== p.slug && x.cat !== p.cat && x.featured);
    return [...same, ...others].slice(0, 4);
  });
  protected readonly wa = computed(() => {
    const p = this.product();
    return p ? waLink(this.i.dict().shop.msg(this.i.l(p.name), this.i.price(p.price))) : '';
  });
}
