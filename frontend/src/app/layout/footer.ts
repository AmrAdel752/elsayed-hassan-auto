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
    @let F = i.dict().footer;
    <!-- always dark, in both themes: a strong close for the page -->
    <footer class="relative overflow-hidden bg-ink-900 text-zinc-300">
      <div class="h-1 bg-gradient-to-r from-brand-red via-brand-gold to-brand-red"></div>
      <div class="absolute -top-40 start-1/4 w-[520px] h-[520px] rounded-full bg-brand-red/15 blur-[120px] pointer-events-none"></div>
      <div class="absolute -bottom-52 -end-24 w-[420px] h-[420px] rounded-full bg-brand-gold/10 blur-[120px] pointer-events-none"></div>

      <div class="wrap relative pt-12 md:pt-16 pb-6 md:pb-7">
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1.45fr] gap-x-6 gap-y-10 xl:gap-x-8">

          <!-- brand -->
          <div class="col-span-2 md:col-span-3 xl:col-span-1 text-center xl:text-start">
            <a routerLink="/" class="inline-flex items-center gap-3">
              <img src="logo.jpg" alt="" width="60" height="60" class="w-[60px] h-[60px] rounded-full ring-2 ring-brand-red shadow-[0_0_30px_rgba(220,47,54,.45)]">
              <div class="text-start"><b class="block text-xl leading-tight text-white">{{ i.t('brand.a') }} <span class="text-brand-red2">{{ i.t('brand.b') }}</span></b><small class="text-zinc-400 text-xs tracking-[.18em]">EL SAYED HASSAN AUTO</small></div>
            </a>
            <p class="text-zinc-400 text-sm md:text-[15px] leading-relaxed mt-4 max-w-[340px] md:max-w-xl xl:max-w-[340px] mx-auto xl:mx-0">{{ F.about }}</p>
            <span class="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 text-brand-gold2 text-xs font-bold">
              <app-icon name="shield" class="w-4 h-4" />{{ i.t('badge.title') }}</span>
            <div class="flex justify-center xl:justify-start gap-2.5 mt-5">
              @for (s of social; track s.icon) {
                <a [href]="s.href" target="_blank" rel="noopener" [attr.aria-label]="s.label"
                   class="w-11 h-11 rounded-full grid place-items-center border border-white/15 bg-white/5 text-white transition hover:-translate-y-1 hover:bg-brand-red hover:border-brand-red">
                  <app-icon [name]="s.icon" class="w-[18px] h-[18px]" /></a>
              }
            </div>
          </div>

          <!-- services -->
          <nav [attr.aria-label]="F.services">
            <h5 class="ft-h">{{ F.services }}</h5>
            <ul class="ft-list">
              @for (s of i.dict().services; track s.slug) { <li><a [routerLink]="['/services', s.slug]" class="ft-link">{{ s.t }}</a></li> }
            </ul>
          </nav>

          <!-- site pages -->
          <nav [attr.aria-label]="F.links">
            <h5 class="ft-h">{{ F.links }}</h5>
            <ul class="ft-list">
              @for (l of quick; track l.k) { <li><a [routerLink]="l.path" class="ft-link">{{ i.t('nav.' + l.k) }}</a></li> }
            </ul>
          </nav>

          <!-- tools -->
          <nav class="col-span-2 md:col-span-1" [attr.aria-label]="F.tools">
            <h5 class="ft-h">{{ F.tools }}</h5>
            <ul class="ft-list grid grid-cols-2 md:grid-cols-1 gap-x-6">
              @for (l of tools; track l.k) { <li><a [routerLink]="l.path" class="ft-link">{{ i.t('nav.' + l.k) }}</a></li> }
            </ul>
          </nav>

          <!-- contact card -->
          <div class="col-span-2 md:col-span-3 xl:col-span-1 rounded-2xl border border-white/10 bg-white/[.04] p-5 backdrop-blur">
            <h5 class="ft-h">{{ F.contact }}</h5>
            <ul class="grid gap-3.5 md:grid-cols-3 md:gap-6 xl:grid-cols-1 xl:gap-3.5 text-sm md:text-[15px]">
              <li class="flex items-start gap-3">
                <span class="ft-ic"><app-icon name="pin" class="w-4 h-4" /></span>
                <a [href]="site.maps" target="_blank" rel="noopener" class="leading-relaxed hover:text-white">{{ i.t('top.addr') }}</a>
              </li>
              <li class="flex items-center gap-3">
                <span class="ft-ic"><app-icon name="phone" class="w-4 h-4" /></span>
                <a [href]="'tel:' + site.phone" class="font-extrabold text-white text-base tracking-wide hover:text-brand-gold2" dir="ltr">{{ site.phone }}</a>
              </li>
              <li class="flex items-center gap-3">
                <span class="ft-ic"><app-icon name="clock" class="w-4 h-4" /></span>
                <span>{{ F.days }} · <b class="text-brand-gold2 inline-block" dir="ltr">10:00 AM — 10:00 PM</b></span>
              </li>
            </ul>
            <div class="grid grid-cols-2 gap-2.5 mt-5 md:max-w-sm xl:max-w-none">
              <a routerLink="/book" class="btn btn-red !px-3 !py-2.5 !text-sm justify-center hover:!translate-y-0"><app-icon name="cal" class="w-4 h-4" />{{ i.t('nav.book') }}</a>
              <a [href]="wa" target="_blank" rel="noopener" class="btn !px-3 !py-2.5 !text-sm justify-center bg-[#25d366] text-white hover:!translate-y-0"><app-icon name="wa" class="w-4 h-4" />{{ F.wa }}</a>
            </div>
          </div>
        </div>

        <div class="mt-10 md:mt-12 border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between text-center gap-2 text-zinc-500 text-xs sm:text-sm">
          <!-- three quick clicks here open the dashboard login (no visible hint on purpose) -->
          <span (click)="secret()" class="select-none">{{ F.rights }}</span>
          <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-brand-red2"></span>{{ F.tagline }}</span>
        </div>
      </div>
    </footer>

    <!-- hidden on phones where a page has its own sticky bottom bar (booking, product details, calculator, estimate) -->
    <a [href]="wa" target="_blank" aria-label="WhatsApp" [class.max-lg:hidden]="hideFab()" class="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] lg:bottom-6 start-4 lg:start-6 z-[60] w-14 h-14 lg:w-[62px] lg:h-[62px] rounded-full grid place-items-center bg-[#25d366] text-white animate-ping2">
      <app-icon name="wa" class="w-7 h-7 lg:w-8 lg:h-8" />
    </a>
  `,
  styles: `
    .ft-h { position: relative; margin-bottom: 1.1rem; padding-bottom: .7rem; font-size: 1.02rem; font-weight: 800; color: #fff; }
    .ft-h::after { content: ''; position: absolute; bottom: 0; inset-inline-start: 0; width: 34px; height: 3px; border-radius: 3px; background: linear-gradient(90deg, var(--color-brand-red2), var(--color-brand-gold)); }
    .ft-list { display: grid; row-gap: .7rem; font-size: .94rem; }
    .ft-link { display: inline-flex; align-items: center; gap: .5rem; color: #a1a1aa; transition: color .2s, transform .2s; }
    .ft-link::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--color-brand-red2); opacity: .55; transition: opacity .2s, transform .2s; }
    .ft-link:hover { color: #fff; transform: translateX(-4px); }
    :host-context([dir='ltr']) .ft-link:hover { transform: translateX(4px); }
    .ft-link:hover::before { opacity: 1; transform: scale(1.5); }
    .ft-ic { flex: none; width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; color: var(--color-brand-red2); background: rgba(220, 47, 54, .14); }
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
    { k: 'book', path: '/book' }, { k: 'products', path: '/products' }, { k: 'offers', path: '/offers' }, { k: 'models', path: '/models' },
    { k: 'gallery', path: '/gallery' }, { k: 'reviews', path: '/reviews' }, { k: 'about', path: '/about' }, { k: 'contact', path: '/contact' },
  ];
  protected readonly tools = [
    { k: 'calc', path: '/maintenance-calculator' }, { k: 'estimate', path: '/estimate' }, { k: 'track', path: '/track' },
    { k: 'tips', path: '/tips' }, { k: 'faq', path: '/faq' },
  ];
  protected readonly social = [
    { icon: 'fb', label: 'Facebook', href: SITE.facebook }, { icon: 'wa', label: 'WhatsApp', href: waLink() }, { icon: 'pin', label: 'Google Maps', href: SITE.maps },
  ];

  // Staff entry to the dashboard: 3 clicks on the copyright line within 1.5s. Nothing on the page hints at it.
  private clicks = 0;
  private timer?: ReturnType<typeof setTimeout>;
  protected secret() {
    clearTimeout(this.timer);
    if (++this.clicks >= 3) { this.clicks = 0; this.router.navigateByUrl('/admin'); return; }
    this.timer = setTimeout(() => (this.clicks = 0), 1500);
  }
}
