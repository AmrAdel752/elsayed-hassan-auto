import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Seo } from '../../core/seo.service';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { PageBanner } from '../../shared/page-banner';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';
import { CtaBand } from '../../shared/cta-band';

@Component({
  selector: 'app-service-details',
  imports: [RouterLink, PageBanner, Icon, Reveal, CtaBand],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svc(); as s) {
      <app-page-banner [title]="s.t" [subtitle]="s.d" [icon]="s.icon"
        [crumbs]="[{ label: i.t('nav.services'), link: '/services' }, { label: s.t }]" />

      <section class="py-8 md:py-20">
        <div class="wrap grid lg:grid-cols-[1fr_360px] gap-10 items-start">
          <!-- main -->
          <div class="space-y-9 md:space-y-12">
            <p reveal class="text-base md:text-xl leading-loose text-zinc-700 dark:text-zinc-300">{{ s.long }}</p>

            <!-- phones: key facts + booking right away (the sidebar comes last on small screens) -->
            <div class="lg:hidden grid grid-cols-2 gap-2.5">
              @for (m of [{ icon: 'clock', k: 'svc.time', v: s.time }, { icon: 'shield', k: 'svc.warranty', v: s.warranty }]; track m.icon) {
                <div class="card !rounded-2xl p-3.5">
                  <app-icon [name]="m.icon" class="w-5 h-5 text-brand-dgold dark:text-brand-gold mb-1.5" />
                  <small class="muted block text-[11px]">{{ i.t(m.k) }}</small><b class="text-sm leading-snug block">{{ m.v }}</b>
                </div>
              }
              <a routerLink="/book" [queryParams]="{ service: s.slug }" class="btn btn-red col-span-2 justify-center !py-3"><app-icon name="cal" class="w-5 h-5" />{{ i.t('svc.bookTitle') }}</a>
            </div>

            <div reveal>
              <h2 class="text-xl md:text-3xl font-black mb-4 md:mb-6">{{ i.t('svc.includes') }}</h2>
              <ul class="grid sm:grid-cols-2 gap-2.5 md:gap-3">
                @for (x of s.includes; track x) {
                  <li class="card !rounded-2xl flex items-center gap-3 p-3.5 md:p-4 font-bold text-sm md:text-base">
                    <span class="w-8 h-8 shrink-0 rounded-lg grid place-items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><app-icon name="check" class="w-4 h-4" /></span>{{ x }}
                  </li>
                }
              </ul>
            </div>

            <div reveal>
              <h2 class="text-xl md:text-3xl font-black mb-4 md:mb-6">{{ i.t('svc.faq') }}</h2>
              <div class="space-y-3">
                @for (q of s.faq; track $index) {
                  <details class="card !rounded-2xl group p-4 md:p-5 [&_summary::-webkit-details-marker]:hidden" [open]="$first">
                    <summary class="flex items-center justify-between gap-4 cursor-pointer font-extrabold text-base md:text-lg list-none">
                      {{ q[0] }}
                      <span class="w-8 h-8 shrink-0 rounded-full grid place-items-center bg-brand-red/10 text-brand-red2 transition group-open:rotate-45 text-xl leading-none">+</span>
                    </summary>
                    <p class="muted mt-3">{{ q[1] }}</p>
                  </details>
                }
              </div>
            </div>
          </div>

          <!-- sidebar -->
          <aside [reveal]=".15" class="lg:sticky lg:top-28 space-y-4">
            <div class="card p-6 space-y-5 hidden lg:block">
              @for (m of [{ icon: 'clock', k: 'svc.time', v: s.time }, { icon: 'shield', k: 'svc.warranty', v: s.warranty }]; track m.icon) {
                <div class="flex gap-4 items-center">
                  <div class="w-12 h-12 shrink-0 rounded-xl grid place-items-center border border-brand-gold/40 bg-brand-gold/10 text-brand-dgold dark:text-brand-gold"><app-icon [name]="m.icon" class="w-6 h-6" /></div>
                  <div><small class="muted block text-[13px]">{{ i.t(m.k) }}</small><b>{{ m.v }}</b></div>
                </div>
              }
            </div>
            <div class="relative overflow-hidden rounded-[20px] p-6 text-white bg-gradient-to-br from-[#c4252c] to-[#741419]">
              <div class="absolute -top-16 -end-16 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
              <h3 class="relative text-xl font-black mb-1">{{ i.t('svc.bookTitle') }}</h3>
              <p class="relative opacity-85 text-sm mb-5">{{ i.t('svc.bookSub') }}</p>
              <a routerLink="/book" [queryParams]="{ service: s.slug }" class="btn relative w-full justify-center bg-white text-brand-red !py-3"><app-icon name="cal" class="w-5 h-5" />{{ i.t('nav.book') }}</a>
              <a [href]="book()" target="_blank" class="btn relative w-full justify-center mt-3 border border-white/40 !py-3"><app-icon name="wa" class="w-5 h-5" />{{ i.t('svc.bookBtn') }}</a>
              <a [href]="'tel:' + phone" class="btn relative w-full justify-center mt-3 border border-white/40 !py-3"><app-icon name="phone" class="w-5 h-5" />{{ i.t('svc.call') }}</a>
            </div>
          </aside>
        </div>
      </section>

      <!-- related -->
      <section class="py-12 md:py-20 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
        <div class="wrap">
          <h2 reveal class="text-xl md:text-3xl font-black mb-5 md:mb-8">{{ i.t('svc.related') }}</h2>
          <div class="grid sm:grid-cols-3 gap-5">
            @for (r of related(); track r.slug; let n = $index) {
              <a [routerLink]="['/services', r.slug]" [reveal]="n * .1" class="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-brand-red/50">
                <div class="ic-red w-14 h-14 shrink-0 rounded-2xl"><app-icon [name]="r.icon" class="w-7 h-7" /></div>
                <div class="flex-1"><b class="block text-lg">{{ r.t }}</b><small class="muted line-clamp-1">{{ r.d }}</small></div>
                <app-icon name="arrow" class="w-5 h-5 text-brand-red2 rtl:rotate-180 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </a>
            }
          </div>
        </div>
      </section>

      <div class="pt-14 md:pt-20"><app-cta-band /></div>
    } @else {
      <section class="wrap min-h-[50vh] grid place-items-center text-center py-24">
        <div><h1 class="h2">{{ i.t('svc.notFound') }}</h1><a routerLink="/services" class="btn btn-red mt-6">{{ i.t('nav.services') }}</a></div>
      </section>
    }
  `,
})
export class ServiceDetails {
  protected readonly i = inject(I18n);
  private readonly seo = inject(Seo);
  // item-specific <title>/description for this page
  private readonly seoFx = effect(() => { const s = this.svc(); if (s) this.seo.set({ title: s.t, desc: s.d }); });
  protected readonly phone = SITE.phone;
  /** Bound from the `:slug` route param. */
  readonly slug = input<string>();
  protected readonly svc = computed(() => this.i.dict().services.find(s => s.slug === this.slug()));
  protected readonly related = computed(() => {
    const all = this.i.dict().services, idx = all.findIndex(s => s.slug === this.slug());
    return [1, 2, 3].map(k => all[(idx + k) % all.length]);
  });
  protected readonly book = computed(() => waLink(this.i.dict().svc.msg(this.svc()?.t ?? '')));
}
