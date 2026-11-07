import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Seo } from '../../core/seo.service';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { CAR_MODELS } from '../../data/models';
import { PRODUCTS } from '../../data/catalog';
import { PageBanner } from '../../shared/page-banner';
import { ProductCard } from '../../shared/product-card';
import { ModelCard } from '../../shared/model-card';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-model-details',
  imports: [RouterLink, PageBanner, ProductCard, ModelCard, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (car(); as m) {
      <app-page-banner [title]="title()" [subtitle]="i.l(m.tagline)" icon="car"
        [crumbs]="[{ label: i.t('nav.models'), link: '/models' }, { label: m.name }]" />

      <!-- specs -->
      <section class="py-5 md:py-16">
        <div class="wrap grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
          @for (s of specs(); track s.k; let n = $index) {
            <div [reveal]="n * .08" class="card p-5 flex items-center gap-4">
              <span class="w-12 h-12 shrink-0 rounded-xl grid place-items-center border border-brand-gold/40 bg-brand-gold/10 text-brand-dgold dark:text-brand-gold"><app-icon [name]="s.icon" class="w-6 h-6" /></span>
              <div class="min-w-0"><small class="muted block text-xs">{{ i.t('mdl.' + s.k) }}</small><b class="block truncate" [attr.dir]="s.ltr ? 'ltr' : null">{{ s.v }}</b></div>
            </div>
          }
        </div>
      </section>

      <!-- issues + calculator -->
      <section class="pb-12 md:pb-20">
        <div class="wrap grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div>
            <h2 reveal class="text-xl md:text-3xl font-black">{{ i.t('mdl.issues') }}</h2>
            <p reveal class="muted mb-6">{{ i.t('mdl.issuesSub') }}</p>
            <div class="space-y-4">
              @for (x of m.issues; track $index; let n = $index) {
                <div [reveal]="n * .1" class="card p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <span class="ic-red w-14 h-14 shrink-0 rounded-2xl"><app-icon [name]="svcIcon(x.service)" class="w-7 h-7" /></span>
                  <div class="flex-1"><h3 class="text-lg font-extrabold">{{ i.l(x.title) }}</h3><p class="muted">{{ i.l(x.desc) }}</p></div>
                  <a routerLink="/book" [queryParams]="{ service: x.service, model: m.name }" class="btn btn-ghost !py-2.5 !px-5 shrink-0 justify-center">{{ i.t('mdl.fix') }}</a>
                </div>
              }
            </div>
          </div>

          <aside [reveal]=".15" class="lg:sticky lg:top-28 space-y-4">
            <div class="relative overflow-hidden rounded-[24px] p-5 sm:p-7 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30">
              <div class="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-brand-red/30 blur-3xl"></div>
              <div class="relative ic-red w-14 h-14 rounded-2xl mb-5"><app-icon name="cal" class="w-7 h-7" /></div>
              <h3 class="relative text-xl font-black mb-1">{{ i.t('mdl.calcH') }}</h3>
              <p class="relative text-zinc-400 text-sm mb-5">{{ i.t('mdl.calcP') }}</p>
              <a routerLink="/maintenance-calculator" [queryParams]="{ model: m.name }" class="btn btn-red relative w-full justify-center !py-3">{{ i.t('mdl.calcBtn') }}</a>
            </div>
            <a routerLink="/book" [queryParams]="{ model: m.name }" class="btn btn-ghost w-full justify-center"><app-icon name="car" class="w-5 h-5" />{{ i.t('mdl.book') }}</a>
          </aside>
        </div>
      </section>

      <!-- parts -->
      @if (parts().length) {
        <section class="py-12 md:py-20 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
          <div class="wrap">
            <h2 class="text-xl md:text-3xl font-black mb-5 md:mb-8">{{ i.t('mdl.parts') }} — {{ m.name }}</h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              @for (p of parts(); track p.slug) { <app-product-card [product]="p" /> }
            </div>
          </div>
        </section>
      }

      <!-- other models -->
      <section class="py-12 md:py-20">
        <div class="wrap">
          <h2 class="text-xl md:text-3xl font-black mb-5 md:mb-8">{{ i.t('mdl.other') }}</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            @for (o of others(); track o.slug) { <app-model-card [model]="o" /> }
          </div>
        </div>
      </section>
    } @else {
      <section class="wrap min-h-[50vh] grid place-items-center text-center py-24">
        <div><h1 class="h2">{{ i.t('mdl.notFound') }}</h1><a routerLink="/models" class="btn btn-red mt-6">{{ i.t('nav.models') }}</a></div>
      </section>
    }
  `,
})
export class ModelDetails {
  protected readonly i = inject(I18n);
  private readonly seo = inject(Seo);
  // item-specific <title>/description for this page
  private readonly seoFx = effect(() => { const m = this.car(); if (m) this.seo.set({ title: `Nissan ${m.name}`, desc: this.i.l(m.tagline) }); });
  /** Bound from the `:slug` route param. */
  readonly slug = input<string>();
  protected readonly car = computed(() => CAR_MODELS.find(m => m.slug === this.slug()));
  protected readonly title = computed(() => `NISSAN <span class="text-brand-red2">${this.car()?.name.toUpperCase()}</span>`);
  protected readonly specs = computed(() => {
    const m = this.car()!;
    return [
      { k: 'type', icon: 'car', v: this.i.l(m.type) }, { k: 'years', icon: 'cal', v: m.years, ltr: true },
      { k: 'engine', icon: 'engine', v: m.engine, ltr: true }, { k: 'gearbox', icon: 'cpu', v: this.i.l(m.gearbox) },
    ];
  });
  protected readonly parts = computed(() => PRODUCTS.filter(p => p.models.includes(this.car()?.name ?? '')).slice(0, 4));
  protected readonly others = computed(() => {
    const idx = CAR_MODELS.findIndex(m => m.slug === this.slug());
    return [1, 2, 3, 4].map(k => CAR_MODELS[(idx + k) % CAR_MODELS.length]);
  });

  protected svcIcon(slug: string) { return this.i.dict().services.find(s => s.slug === slug)?.icon ?? 'engine'; }
}
