import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { PageBanner } from '../../shared/page-banner';
import { ServicesGrid } from '../../shared/sections/services-grid';
import { CtaBand } from '../../shared/cta-band';
import { CarExplorer } from '../../shared/sections/car-explorer';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-services',
  imports: [PageBanner, ServicesGrid, CtaBand, Reveal, CarExplorer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('svc.title')" [subtitle]="i.t('svc.sub')" icon="engine" [crumbs]="[{ label: i.t('nav.services') }]" />

    <section class="py-10 md:py-24"><div class="wrap"><app-services-grid /></div></section>

    <section class="pb-14 md:pb-24 overflow-hidden"><app-car-explorer /></section>

    <section class="py-14 md:py-24 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
      <div class="wrap">
        <div reveal class="sec-head"><span class="tag">{{ i.t('svc.process.tag') }}</span><h2 class="h2" [innerHTML]="i.t('svc.process.h')"></h2></div>
        <div class="relative grid grid-cols-2 lg:grid-cols-5 gap-y-8 md:gap-y-10 gap-4 md:gap-5">
          <div class="hidden lg:block absolute top-[38px] inset-x-[10%] h-0.5 opacity-50 bg-[repeating-linear-gradient(90deg,#dc2f36_0_10px,transparent_10px_20px)]"></div>
          @for (s of i.dict().svc.process.steps; track $index; let n = $index) {
            <div [reveal]="n * .12" class="relative text-center last:col-span-2 lg:last:col-span-1">
              <div class="w-14 h-14 md:w-[76px] md:h-[76px] mx-auto mb-3 md:mb-5 rounded-full grid place-items-center text-xl md:text-[26px] font-black text-brand-red2 bg-zinc-50 dark:bg-ink-900 border-2 border-brand-red shadow-[0_0_30px_rgba(220,47,54,.35)]">{{ n + 1 }}</div>
              <h4 class="text-base md:text-[19px] font-extrabold mb-1 md:mb-1.5">{{ s[0] }}</h4><p class="muted text-sm md:text-[15px]">{{ s[1] }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <div class="pt-14 md:pt-28"><app-cta-band /></div>
  `,
})
export class Services {
  protected readonly i = inject(I18n);
}
