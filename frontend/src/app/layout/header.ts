import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { I18n } from '../core/i18n.service';
import { Theme } from '../core/theme.service';
import { SITE, waLink } from '../core/site';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-gradient-to-r from-brand-red to-[#a3232a] text-white text-xs md:text-[13px] py-1.5 md:py-2">
      <!-- mobile: one compact line -->
      <div class="wrap flex md:hidden items-center justify-between gap-3 whitespace-nowrap">
        <span class="inline-flex items-center gap-1.5"><app-icon name="clock" class="w-3.5 h-3.5" />{{ i.t('top.short') }}</span>
        <a [href]="'tel:' + phone" class="inline-flex items-center gap-1.5 font-bold"><app-icon name="phone" class="w-3.5 h-3.5" /><span dir="ltr">{{ phone }}</span></a>
      </div>
      <div class="wrap hidden md:flex justify-between gap-3">
        <span class="inline-flex items-center gap-2"><app-icon name="clock" class="w-4 h-4" />{{ i.t('top.hours') }}</span>
        <span class="inline-flex items-center gap-2"><app-icon name="pin" class="w-4 h-4" />{{ i.t('top.addr') }}</span>
      </div>
    </div>

    <nav [style.z-index]="open() ? 70 : null" class="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-ink-900/80 border-b border-zinc-200 dark:border-ink-600">
      <div class="wrap h-16 md:h-[78px] flex items-center justify-between gap-2 md:gap-4">
        <a routerLink="/" class="flex items-center gap-2.5 md:gap-3 min-w-0">
          <img src="logo.jpg" alt="" class="w-11 h-11 md:w-[54px] md:h-[54px] shrink-0 rounded-full ring-2 ring-brand-red shadow-[0_0_20px_rgba(220,47,54,.5)]">
          <div class="min-w-0 whitespace-nowrap">
            <b class="block text-base md:text-[19px] leading-tight">{{ i.t('brand.a') }} <span class="text-brand-red2">{{ i.t('brand.b') }}</span></b>
            <small class="muted text-[10px] md:text-xs tracking-wider">EL SAYED HASSAN AUTO</small>
          </div>
        </a>

        <div class="hidden xl:flex gap-7 font-semibold text-[15px] text-zinc-600 dark:text-zinc-300">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" ariaCurrentWhenActive="page" routerLinkActive="!text-zinc-900 dark:!text-white after:absolute after:inset-x-0 after:-bottom-2 after:h-0.5 after:bg-brand-red2 after:rounded"
               [routerLinkActiveOptions]="{ exact: l.path === '/' }" class="relative hover:text-brand-red2 transition">{{ i.t('nav.' + l.key) }}</a>
          }
        </div>

        <div class="flex items-center gap-1.5 md:gap-2 shrink-0">
          <button (click)="i.toggle()" class="icon-btn !h-10 !min-w-10 md:!h-11 md:!min-w-11" aria-label="Language">{{ i.isAr() ? 'EN' : 'ع' }}</button>
          <button (click)="theme.toggle()" class="icon-btn !h-10 !min-w-10 md:!h-11 md:!min-w-11" aria-label="Theme"><app-icon [name]="theme.dark() ? 'sun' : 'moon'" class="w-5 h-5" /></button>
          <a class="btn btn-red hidden sm:inline-flex !py-2.5 !px-5" [href]="wa" target="_blank"><app-icon name="wa" class="w-5 h-5" />{{ i.t('nav.bookNow') }}</a>
          <button (click)="open.set(!open())" [attr.aria-expanded]="open()" class="icon-btn !h-10 !min-w-10 md:!h-11 md:!min-w-11 xl:hidden" [class.!bg-brand-red]="open()" [class.!text-white]="open()" [class.!border-brand-red]="open()" aria-label="Menu">
            <app-icon [name]="open() ? 'close' : 'menu'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      @if (open()) {
        <!-- nav's backdrop-blur makes it the containing block, so top-full sits right under the bar -->
        <div class="xl:hidden absolute inset-x-0 top-full h-[calc(100dvh-64px)] md:h-[calc(100dvh-78px)]">
          <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="open.set(false)" aria-label="Close"></button>
          <div class="relative max-h-full overflow-y-auto bg-white dark:bg-ink-800 border-b border-zinc-200 dark:border-ink-600 shadow-2xl rounded-b-3xl">
            <div class="wrap py-5 space-y-5">
              <div class="grid grid-cols-2 gap-2">
                @for (l of links; track l.path) {
                  <a [routerLink]="l.path" (click)="open.set(false)" [routerLinkActiveOptions]="{ exact: l.path === '/' }"
                     routerLinkActive="!border-brand-red !bg-brand-red/5 [&_span]:!bg-brand-red [&_span]:!text-white"
                     class="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-ink-600 p-3 font-bold text-sm">
                    <span class="w-9 h-9 shrink-0 rounded-xl grid place-items-center bg-brand-red/10 text-brand-red2"><app-icon [name]="l.icon" class="w-[18px] h-[18px]" /></span>
                    {{ i.t('nav.' + l.key) }}
                  </a>
                }
              </div>
              <div>
                <small class="muted font-bold text-xs block mb-2">{{ i.t('nav.tools') }}</small>
                <div class="grid grid-cols-2 gap-2">
                  @for (l of tools; track l.path) {
                    <a [routerLink]="l.path" (click)="open.set(false)" routerLinkActive="!text-brand-red2"
                       class="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-white/5 px-3 py-2.5 text-sm font-bold">
                      <app-icon [name]="l.icon" class="w-4 h-4 text-brand-dgold dark:text-brand-gold" />{{ i.t('nav.' + l.key) }}
                    </a>
                  }
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <a [href]="wa" target="_blank" class="btn justify-center !px-3 !py-3 bg-[#25d366] text-white text-sm"><app-icon name="wa" class="w-5 h-5" />{{ i.t('nav.bookNow') }}</a>
                <a [href]="'tel:' + phone" class="btn btn-red justify-center !px-3 !py-3 text-sm"><app-icon name="phone" class="w-5 h-5" />{{ i.t('svc.call') }}</a>
              </div>
            </div>
          </div>
        </div>
      }
    </nav>
  `,
})
export class Header {
  protected readonly i = inject(I18n);
  protected readonly theme = inject(Theme);
  protected readonly open = signal(false);
  protected readonly wa = waLink();
  protected readonly phone = SITE.phone;
  protected readonly links = [
    { path: '/', key: 'home', icon: 'car' }, { path: '/services', key: 'services', icon: 'engine' },
    { path: '/products', key: 'products', icon: 'parts' }, { path: '/book', key: 'book', icon: 'cal' },
    { path: '/offers', key: 'offers', icon: 'gift' }, { path: '/about', key: 'about', icon: 'shield' },
    { path: '/contact', key: 'contact', icon: 'phone' },
  ];
  /** Extra tools listed only in the mobile menu. */
  protected readonly tools = [
    { path: '/maintenance-calculator', key: 'calc', icon: 'cal' }, { path: '/estimate', key: 'estimate', icon: 'tag' },
    { path: '/models', key: 'models', icon: 'car' }, { path: '/track', key: 'track', icon: 'search' },
    { path: '/gallery', key: 'gallery', icon: 'car' }, { path: '/reviews', key: 'reviews', icon: 'star' }, { path: '/tips', key: 'tips', icon: 'oil' }, { path: '/faq', key: 'faq', icon: 'shield' },
  ];

  constructor() {
    // close the mobile menu after any navigation
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.open.set(false));
  }
}
