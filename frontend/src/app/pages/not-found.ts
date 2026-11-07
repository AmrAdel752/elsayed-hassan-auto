import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { waLink } from '../core/site';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative overflow-hidden py-14 md:py-24">
      <div class="absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_30%,rgba(220,47,54,.15),transparent_70%)]"></div>
      <div class="relative wrap max-w-[760px] text-center">
        <!-- 404 with a broken-down car on the road -->
        <div class="relative mx-auto max-w-[460px] mb-8" dir="ltr">
          <b class="block font-[Arial] font-black text-[110px] sm:text-[160px] leading-none gold-text select-none">404</b>
          <div class="relative -mt-1 h-20 sm:h-24">
            <div class="absolute bottom-3 inset-x-0 h-1.5 rounded-full bg-[repeating-linear-gradient(90deg,#a1a1aa_0_24px,transparent_24px_40px)] opacity-60"></div>
            <div class="absolute bottom-4 start-1/2 -translate-x-1/2 animate-float">
              <app-icon name="car" class="w-20 h-20 sm:w-24 sm:h-24 text-brand-red2 -rotate-6" />
              <span class="absolute -top-2 end-1 w-7 h-7 rounded-full bg-brand-gold text-ink-900 grid place-items-center font-black text-sm animate-pulse">!</span>
            </div>
          </div>
        </div>

        <h1 class="text-[clamp(26px,5vw,44px)] font-black leading-snug mb-3" [innerHTML]="i.t('nf.title')"></h1>
        <p class="muted text-base md:text-lg mb-8">{{ i.t('nf.sub') }}</p>

        <div class="grid sm:flex sm:justify-center gap-3 mb-10">
          <a routerLink="/" class="btn btn-red justify-center"><app-icon name="car" class="w-5 h-5" />{{ i.t('nf.home') }}</a>
          <a [href]="wa" target="_blank" class="btn justify-center bg-[#25d366] text-white"><app-icon name="wa" class="w-5 h-5" />{{ i.t('nav.bookNow') }}</a>
        </div>

        <small class="muted font-bold block mb-3">{{ i.t('nf.quick') }}</small>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" class="card !rounded-2xl p-4 flex flex-col items-center gap-2 font-bold text-sm transition hover:-translate-y-1 hover:border-brand-red/50">
              <span class="w-10 h-10 rounded-xl grid place-items-center bg-brand-red/10 text-brand-red2"><app-icon [name]="l.icon" class="w-5 h-5" /></span>{{ i.t('nav.' + l.key) }}
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class NotFound {
  protected readonly i = inject(I18n);
  protected readonly wa = waLink();
  protected readonly links = [
    { path: '/services', key: 'services', icon: 'engine' }, { path: '/products', key: 'products', icon: 'parts' },
    { path: '/book', key: 'book', icon: 'cal' }, { path: '/contact', key: 'contact', icon: 'phone' },
  ];
}
