import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Seo } from '../../core/seo.service';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { TIPS } from '../../data/tips';
import { PageBanner } from '../../shared/page-banner';
import { TipCard } from '../../shared/tip-card';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-tip-details',
  imports: [RouterLink, PageBanner, TipCard, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tip(); as t) {
      <app-page-banner [title]="i.l(t.title)" [subtitle]="i.l(t.excerpt)" [icon]="t.icon"
        [crumbs]="[{ label: i.t('nav.tips'), link: '/tips' }, { label: i.l(t.title) }]" />

      <article class="pt-6 pb-14 md:py-16">
        <div class="wrap max-w-[760px]">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 muted text-sm mb-8">
            <span class="inline-flex items-center gap-1.5"><app-icon name="clock" class="w-4 h-4" />{{ i.dict().tips.minutes(t.minutes) }}</span>
            <span>{{ date() }}</span>
            <a [href]="share()" target="_blank" class="ms-auto inline-flex items-center gap-1.5 font-bold text-[#1faa53]"><app-icon name="wa" class="w-4 h-4" />{{ i.t('tips.share') }}</a>
          </div>

          @for (s of t.sections; track $index; let n = $index) {
            <section class="mb-8">
              <h2 class="text-xl md:text-2xl font-black mb-3 flex items-center gap-3">
                <span class="w-8 h-8 shrink-0 rounded-lg grid place-items-center bg-brand-red/10 text-brand-red2 text-sm font-black">{{ n + 1 }}</span>{{ i.l(s.h) }}
              </h2>
              <p class="text-base md:text-lg leading-loose text-zinc-700 dark:text-zinc-300">{{ i.l(s.p) }}</p>
            </section>
          }

          <!-- key takeaways -->
          <div class="rounded-2xl border-s-4 border-brand-gold bg-brand-gold/10 p-5 md:p-6 mb-8">
            <h3 class="font-black text-lg mb-3 text-brand-dgold dark:text-brand-gold">{{ i.t('tips.points') }}</h3>
            <ul class="space-y-2">
              @for (p of t.points; track $index) {
                <li class="flex items-center gap-2.5 font-bold"><app-icon name="check" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />{{ i.l(p) }}</li>
              }
            </ul>
          </div>

          <!-- service CTA -->
          @if (svc(); as s) {
            <div class="relative overflow-hidden rounded-[24px] p-6 md:p-7 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30 flex flex-col sm:flex-row sm:items-center gap-5">
              <div class="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-brand-red/30 blur-3xl"></div>
              <span class="relative ic-red w-14 h-14 rounded-2xl shrink-0"><app-icon [name]="s.icon" class="w-7 h-7" /></span>
              <div class="relative flex-1"><small class="text-zinc-400 font-bold">{{ i.t('tips.cta') }}</small><b class="block text-xl">{{ s.t }}</b></div>
              <a routerLink="/book" [queryParams]="{ service: s.slug }" class="btn btn-red relative justify-center shrink-0">{{ i.t('tips.ctaBtn') }}</a>
            </div>
          }
        </div>
      </article>

      <section class="py-12 md:py-16 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
        <div class="wrap">
          <h2 class="text-xl md:text-3xl font-black mb-5 md:mb-8">{{ i.t('tips.related') }}</h2>
          <div class="grid sm:grid-cols-3 gap-4 md:gap-5">
            @for (r of related(); track r.slug) { <app-tip-card [tip]="r" /> }
          </div>
        </div>
      </section>
    } @else {
      <section class="wrap min-h-[50vh] grid place-items-center text-center py-24">
        <div><h1 class="h2">{{ i.t('tips.notFound') }}</h1><a routerLink="/tips" class="btn btn-red mt-6">{{ i.t('nav.tips') }}</a></div>
      </section>
    }
  `,
})
export class TipDetails {
  protected readonly i = inject(I18n);
  private readonly seo = inject(Seo);
  // item-specific <title>/description for this page
  private readonly seoFx = effect(() => { const t = this.tip(); if (t) this.seo.set({ title: this.i.l(t.title), desc: this.i.l(t.excerpt) }); });
  /** Bound from the `:slug` route param. */
  readonly slug = input<string>();
  protected readonly tip = computed(() => TIPS.find(t => t.slug === this.slug()));
  protected readonly svc = computed(() => this.i.dict().services.find(s => s.slug === this.tip()?.service));
  protected readonly related = computed(() => TIPS.filter(t => t.slug !== this.slug()).slice(0, 3));
  protected readonly date = computed(() => {
    const t = this.tip();
    return t ? new Date(t.date).toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  });
  protected readonly share = computed(() =>
    `https://wa.me/?text=${encodeURIComponent(`${this.i.l(this.tip()?.title)}\n${location.href}`)}`);
}
