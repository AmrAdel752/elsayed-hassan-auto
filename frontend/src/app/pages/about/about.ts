import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { SITE } from '../../core/site';
import { PageBanner } from '../../shared/page-banner';
import { CtaBand } from '../../shared/cta-band';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';
import { CountUp } from '../../shared/count-up.directive';

@Component({
  selector: 'app-about',
  imports: [PageBanner, CtaBand, Icon, Reveal, CountUp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('about.title')" [subtitle]="i.t('about.sub')" icon="shield" [crumbs]="[{ label: i.t('nav.about') }]" />

    <!-- story -->
    <section class="py-12 md:py-28 overflow-hidden">
      <div class="wrap grid lg:grid-cols-2 gap-14 items-center">
        <div reveal class="relative aspect-square max-w-[290px] sm:max-w-[440px] w-full mx-auto">
          <div class="absolute inset-0 rounded-[40px] rotate-6 bg-gradient-to-br from-brand-red2 to-[#741419] opacity-90"></div>
          <div class="absolute inset-0 rounded-[40px] -rotate-3 border-2 border-brand-gold/40"></div>
          <div class="absolute inset-0 rounded-[40px] bg-ink-900 grid place-items-center overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(220,47,54,.35),transparent_65%)]"></div>
            <img src="logo.jpg" alt="" class="relative w-[78%] rounded-full animate-float shadow-[0_30px_60px_-20px_#000]">
          </div>
          <span class="absolute -bottom-5 start-6 px-5 py-2.5 rounded-2xl bg-white dark:bg-ink-700 border border-zinc-200 dark:border-ink-600 shadow-xl font-[Arial] font-black tracking-[4px] text-brand-red2">NISSAN ONLY</span>
        </div>
        <div [reveal]=".15">
          <span class="tag">{{ i.t('about.story.tag') }}</span>
          <h2 class="h2 mb-6" [innerHTML]="i.t('about.story.h')"></h2>
          @for (p of i.dict().about.story.p; track $index) { <p class="muted text-base md:text-lg leading-loose mb-4">{{ p }}</p> }
        </div>
      </div>
    </section>

    <!-- stats -->
    <section class="pb-12 md:pb-28">
      <div class="wrap grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
        @for (s of stats; track $index; let n = $index) {
          <div [reveal]="n * .1" class="card p-5 md:p-7 text-center first:col-span-2 lg:first:col-span-1 first:border-brand-gold/60 first:bg-brand-gold/10 dark:first:from-brand-gold/10 dark:first:to-transparent">
            <b class="gold-text block text-4xl md:text-5xl font-black leading-none mb-2 md:mb-3" dir="ltr" [countUp]="s.n" [suffix]="s.s"></b>
            <span class="muted font-bold">{{ i.dict().about.stats[n] }}</span>
          </div>
        }
      </div>
    </section>

    <!-- values -->
    <section class="py-12 md:py-28 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
      <div class="wrap">
        <div reveal class="sec-head"><span class="tag">{{ i.t('about.values.tag') }}</span><h2 class="h2" [innerHTML]="i.t('about.values.h')"></h2></div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          @for (v of i.dict().about.values.items; track v.icon; let n = $index) {
            <div [reveal]="n * .1" class="card group p-4 sm:p-7 transition hover:-translate-y-2 hover:border-brand-red/50">
              <div class="ic-red w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-3 sm:mb-5 transition group-hover:rotate-6"><app-icon [name]="v.icon" class="w-7 h-7" /></div>
              <h3 class="text-base sm:text-xl font-extrabold mb-1 sm:mb-2">{{ v.t }}</h3>
              <p class="muted text-sm sm:text-base">{{ v.d }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- workshop equipment -->
    <section class="py-12 md:py-28">
      <div class="wrap grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center">
        <div reveal>
          <span class="tag">{{ i.t('about.equip.tag') }}</span>
          <h2 class="h2" [innerHTML]="i.t('about.equip.h')"></h2>
        </div>
        <ul class="grid sm:grid-cols-2 gap-3">
          @for (x of i.dict().about.equip.items; track x; let n = $index) {
            <li [reveal]="n * .06" class="card !rounded-2xl flex items-center gap-3 p-4 font-bold">
              <span class="w-9 h-9 shrink-0 rounded-lg grid place-items-center border border-brand-gold/40 bg-brand-gold/10 text-brand-dgold dark:text-brand-gold"><app-icon name="cpu" class="w-5 h-5" /></span>{{ x }}
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- team sections -->
    <section class="py-12 md:py-28 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
      <div class="wrap">
        <div reveal class="sec-head"><span class="tag">{{ i.t('about.team.tag') }}</span><h2 class="h2" [innerHTML]="i.t('about.team.h')"></h2></div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          @for (t of i.dict().about.team.items; track t.icon; let n = $index) {
            <div [reveal]="n * .1" class="relative overflow-hidden rounded-[20px] p-4 sm:p-7 text-white bg-gradient-to-br from-[#2a0709] to-ink-800 border border-brand-red/30">
              <app-icon [name]="t.icon" class="absolute -bottom-6 -end-6 w-32 h-32 text-white/[.05]" />
              <div class="ic-red w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl mb-3 sm:mb-5"><app-icon [name]="t.icon" class="w-7 h-7" /></div>
              <h3 class="text-base sm:text-xl font-extrabold mb-1">{{ t.t }}</h3>
              <p class="text-zinc-400 text-sm sm:text-base">{{ t.d }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <div class="pt-14 md:pt-28"><app-cta-band /></div>
  `,
})
export class About {
  protected readonly i = inject(I18n);
  protected readonly stats = [{ n: 15, s: '+' }, { n: 100, s: '%' }, { n: 7, s: '/7' }, { n: 12, s: '' }, { n: SITE.models.length, s: '+' }];
}
