import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../core/i18n.service';
import { waLink } from '../core/site';
import { Icon } from './icon';
import { Reveal } from './reveal.directive';

/** Red "book now" call-to-action band used at the bottom of pages. */
@Component({
  selector: 'app-cta-band',
  imports: [Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pb-14 md:pb-28"><div class="wrap">
      <div reveal class="relative rounded-[24px] md:rounded-[32px] px-5 py-10 md:px-6 md:py-[70px] text-center overflow-hidden bg-gradient-to-br from-[#c4252c] to-[#741419] text-white">
        <div class="absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,.04)_0_2px,transparent_2px_22px)]"></div>
        <h2 class="relative text-[clamp(24px,4vw,46px)] font-black mb-2 md:mb-2.5">{{ i.t('home.final.h') }}</h2>
        <p class="relative opacity-85 text-sm md:text-lg mb-6 md:mb-8">{{ i.t('home.final.p') }}</p>
        <a class="btn relative bg-white text-brand-red w-full sm:w-auto justify-center !px-4 sm:!px-7" [href]="wa" target="_blank"><app-icon name="wa" class="w-5 h-5" />{{ i.t('home.final.btn') }}</a>
      </div>
    </div></div>
  `,
})
export class CtaBand {
  protected readonly i = inject(I18n);
  protected readonly wa = waLink();
}
