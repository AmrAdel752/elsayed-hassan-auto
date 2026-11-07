import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { REVIEWS } from '../../data/reviews';
import { PageBanner } from '../../shared/page-banner';
import { ReviewCard } from '../../shared/review-card';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-reviews',
  imports: [PageBanner, ReviewCard, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('rev.title')" [subtitle]="i.t('rev.sub')" icon="star" [crumbs]="[{ label: i.t('nav.reviews') }]" />

    <section class="pt-5 pb-14 md:py-20">
      <div class="wrap">
        <!-- summary -->
        <div reveal class="card p-5 md:p-8 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center mb-6 md:mb-10">
          <div class="text-center md:px-6">
            <small class="muted font-bold">{{ i.t('rev.avg') }}</small>
            <b class="block text-6xl font-black gold-text leading-tight" dir="ltr">{{ avg() }}</b>
            <div class="flex justify-center gap-0.5 text-brand-gold my-1">
              @for (s of [1, 2, 3, 4, 5]; track s) { <app-icon name="star" class="w-5 h-5" [class.opacity-25]="s > roundedAvg()" /> }
            </div>
            <small class="muted">{{ i.dict().rev.count(all.length) }}</small>
          </div>
          <div class="space-y-2">
            @for (d of dist(); track d.stars) {
              <button type="button" (click)="stars.set(stars() === d.stars ? 0 : d.stars)" class="w-full flex items-center gap-3 text-sm group">
                <span class="w-14 shrink-0 font-bold text-start" [class.text-brand-red2]="stars() === d.stars">{{ i.dict().rev.stars(d.stars) }}</span>
                <span class="flex-1 h-2.5 rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden" dir="ltr">
                  <span class="block h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-red2 transition-all" [style.width.%]="d.pct"></span>
                </span>
                <span class="w-6 shrink-0 muted text-end">{{ d.n }}</span>
              </button>
            }
          </div>
        </div>

        <!-- service filter -->
        <div class="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap [scrollbar-width:none]">
          @for (c of chips(); track c.slug) {
            <button type="button" (click)="svc.set(c.slug)"
                    class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-bold transition"
                    [class]="svc() === c.slug ? 'bg-brand-red border-brand-red text-white' : 'border-zinc-200 dark:border-ink-600 hover:border-brand-red/50'">
              @if (c.icon) { <app-icon [name]="c.icon" class="w-4 h-4" /> }{{ c.t }}
            </button>
          }
        </div>

        @if (list().length) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            @for (r of list(); track r.id) { <app-review-card [review]="r" /> }
          </div>
        } @else {
          <div class="card p-10 text-center"><app-icon name="star" class="w-12 h-12 mx-auto mb-3 muted" /><p class="font-bold">{{ i.t('rev.empty') }}</p></div>
        }

        <!-- share -->
        <div class="relative overflow-hidden rounded-[24px] p-6 md:p-8 mt-8 md:mt-12 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30 flex flex-col md:flex-row md:items-center gap-5">
          <div class="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-brand-red/30 blur-3xl"></div>
          <div class="relative flex-1"><h3 class="text-xl md:text-2xl font-black mb-1">{{ i.t('rev.share') }}</h3><p class="text-zinc-400 text-sm md:text-base">{{ i.t('rev.shareSub') }}</p></div>
          <div class="relative grid sm:grid-cols-2 gap-2.5 shrink-0">
            <a [href]="maps" target="_blank" class="btn justify-center bg-white text-ink-900 !py-3"><app-icon name="star" class="w-5 h-5 text-brand-gold" />{{ i.t('rev.google') }}</a>
            <a [href]="wa()" target="_blank" class="btn justify-center bg-[#25d366] text-white !py-3"><app-icon name="wa" class="w-5 h-5" />{{ i.t('rev.wa') }}</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Reviews {
  protected readonly i = inject(I18n);
  protected readonly all = REVIEWS;
  protected readonly maps = SITE.maps;
  protected readonly svc = signal('all');
  protected readonly stars = signal(0);

  protected readonly avg = computed(() => (this.all.reduce((s, r) => s + r.rating, 0) / this.all.length).toFixed(1));
  protected readonly roundedAvg = computed(() => Math.round(+this.avg()));
  protected readonly dist = computed(() => [5, 4, 3, 2, 1].map(stars => {
    const n = this.all.filter(r => r.rating === stars).length;
    return { stars, n, pct: (n / this.all.length) * 100 };
  }));

  protected readonly chips = computed(() => [
    { slug: 'all', icon: '', t: this.i.t('rev.all') },
    ...this.i.dict().services.filter(s => this.all.some(r => r.service === s.slug)).map(s => ({ slug: s.slug, icon: s.icon, t: s.t })),
  ]);

  protected readonly list = computed(() => this.all.filter(r =>
    (this.svc() === 'all' || r.service === this.svc()) && (!this.stars() || r.rating === this.stars())));

  protected readonly wa = computed(() => waLink(this.i.t('rev.msg')));
}
