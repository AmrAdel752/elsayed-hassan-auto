import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { I18n } from '../core/i18n.service';
import { SITE, waLink } from '../core/site';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-zinc-200 dark:border-ink-600 bg-white dark:bg-ink-800 pt-12 md:pt-16 pb-6 md:pb-7">
      <div class="wrap">
        <div class="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-x-6 gap-y-9 lg:gap-10 mb-8 md:mb-10">
          <!-- brand: full width + centered on phones -->
          <div class="col-span-2 lg:col-span-1 text-center lg:text-start">
            <a routerLink="/" class="inline-flex items-center gap-3">
              <img src="logo.jpg" alt="" class="w-[54px] h-[54px] rounded-full ring-2 ring-brand-red">
              <div class="text-start"><b class="block text-[19px] leading-tight">{{ i.t('brand.a') }} <span class="text-brand-red2">{{ i.t('brand.b') }}</span></b><small class="muted text-xs tracking-wider">EL SAYED HASSAN AUTO</small></div>
            </a>
            <p class="muted text-sm md:text-[15px] mt-4 max-w-[320px] mx-auto lg:mx-0">{{ i.t('footer.about') }}</p>
            <div class="flex justify-center lg:justify-start gap-2.5 mt-5">
              @for (s of social; track s.icon) {
                <a [href]="s.href" target="_blank" [attr.aria-label]="s.icon" class="icon-btn !w-11 hover:!bg-brand-red hover:text-white"><app-icon [name]="s.icon" class="w-[18px] h-[18px]" /></a>
              }
            </div>
          </div>

          <!-- services + quick links side by side on phones -->
          <div>
            <h5 class="text-base md:text-[17px] font-extrabold mb-3 md:mb-4 flex items-center gap-2"><span class="w-1 h-4 rounded bg-brand-red2"></span>{{ i.t('footer.services') }}</h5>
            <ul class="muted text-sm md:text-[15px] space-y-2.5">
              @for (s of i.dict().services; track s.slug) { <li><a [routerLink]="['/services', s.slug]" class="hover:text-brand-red2">{{ s.t }}</a></li> }
            </ul>
          </div>
          <div>
            <h5 class="text-base md:text-[17px] font-extrabold mb-3 md:mb-4 flex items-center gap-2"><span class="w-1 h-4 rounded bg-brand-red2"></span>{{ i.t('footer.links') }}</h5>
            <ul class="muted text-sm md:text-[15px] space-y-2.5">
              @for (l of quick; track l.k) { <li><a [routerLink]="l.path" class="hover:text-brand-red2">{{ i.t('nav.' + l.k) }}</a></li> }
            </ul>
          </div>

          <!-- hours: a compact card on phones -->
          <div class="col-span-2 lg:col-span-1 rounded-2xl border border-zinc-200 dark:border-ink-600 bg-zinc-50 dark:bg-white/[.03] p-4 lg:p-0 lg:border-0 lg:bg-transparent lg:dark:bg-transparent">
            <h5 class="text-base md:text-[17px] font-extrabold mb-3 md:mb-4 flex items-center gap-2"><span class="w-1 h-4 rounded bg-brand-red2"></span>{{ i.t('contact.hrL') }}</h5>
            <ul class="muted text-sm md:text-[15px] grid grid-cols-2 lg:grid-cols-1 gap-2.5 items-center">
              <li>{{ i.t('footer.days') }}</li>
              <li class="text-end lg:text-start"><span class="gold-text font-extrabold inline-block" dir="ltr">10:00 AM — 10:00 PM</span></li>
              <li class="col-span-2 lg:col-span-1"><a [href]="'tel:' + site.phone" class="inline-flex items-center gap-2 hover:text-brand-red2"><app-icon name="phone" class="w-4 h-4" /><span dir="ltr">{{ site.phone }}</span></a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-zinc-200 dark:border-ink-600 pt-5 flex flex-col sm:flex-row items-center justify-between text-center gap-1.5 sm:gap-2.5 muted text-xs sm:text-sm">
          <span>{{ i.t('footer.rights') }}</span><span>{{ i.t('badge.title') }}</span>
        </div>
      </div>
    </footer>

    <!-- hidden on phones where a page has its own sticky bottom bar (booking, product details, calculator, estimate) -->
    <a [href]="wa" target="_blank" aria-label="WhatsApp" [class.max-lg:hidden]="hideFab()" class="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] lg:bottom-6 start-4 lg:start-6 z-[60] w-14 h-14 lg:w-[62px] lg:h-[62px] rounded-full grid place-items-center bg-[#25d366] text-white animate-ping2">
      <app-icon name="wa" class="w-7 h-7 lg:w-8 lg:h-8" />
    </a>
  `,
})
export class Footer {
  protected readonly i = inject(I18n);
  protected readonly site = SITE;
  protected readonly wa = waLink();
  private readonly router = inject(Router);
  private readonly ownBar = () => /^\/(book|products\/|maintenance-calculator|estimate)/.test(this.router.url);
  protected readonly hideFab = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(this.ownBar)),
    { initialValue: this.ownBar() });
  protected readonly quick = [
    { k: 'book', path: '/book' }, { k: 'track', path: '/track' },{ k: 'calc', path: '/maintenance-calculator' }, { k: 'estimate', path: '/estimate' }, { k: 'models', path: '/models' }, { k: 'products', path: '/products' },
    { k: 'offers', path: '/offers' }, { k: 'about', path: '/about' }, { k: 'gallery', path: '/gallery' }, { k: 'tips', path: '/tips' }, { k: 'reviews', path: '/reviews' }, { k: 'faq', path: '/faq' }, { k: 'contact', path: '/contact' },
  ];
  protected readonly social = [
    { icon: 'fb', href: SITE.facebook }, { icon: 'wa', href: waLink() }, { icon: 'pin', href: SITE.maps },
  ];
}
