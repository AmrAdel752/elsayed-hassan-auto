import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { OFFERS, PRODUCTS } from '../../data/catalog';
import { PageBanner } from '../../shared/page-banner';
import { OfferCard } from '../../shared/offer-card';
import { ProductCard } from '../../shared/product-card';
import { CtaBand } from '../../shared/cta-band';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-offers',
  imports: [PageBanner, OfferCard, ProductCard, CtaBand, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('offers.title')" [subtitle]="i.t('offers.sub')" icon="gift" [crumbs]="[{ label: i.t('nav.offers') }]" />

    <section class="py-6 md:py-20">
      <div class="wrap">
        @if (offers.length) {
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            @for (o of offers; track o.id; let n = $index) { <app-offer-card [offer]="o" [full]="true" [reveal]="n * .12" /> }
          </div>
        } @else {
          <div class="card p-14 text-center"><app-icon name="gift" class="w-14 h-14 mx-auto mb-4 muted" /><p class="font-bold text-lg">{{ i.t('offers.ended') }}</p></div>
        }
      </div>
    </section>

    <!-- discounted products -->
    @if (sale.length) {
      <section class="py-12 md:py-20 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-50 dark:from-ink-900 dark:via-ink-800 dark:to-ink-900">
        <div class="wrap">
          <div reveal class="sec-head"><span class="tag">{{ i.t('shop.tag') }}</span><h2 class="h2">{{ i.t('shop.save') }} <span class="text-brand-red2">%</span></h2></div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            @for (p of sale; track p.slug) { <app-product-card [product]="p" /> }
          </div>
        </div>
      </section>
    }

    <div class="pt-14 md:pt-20"><app-cta-band /></div>
  `,
})
export class Offers {
  protected readonly i = inject(I18n);
  protected readonly offers = OFFERS.filter(o => new Date(o.endsAt).getTime() > Date.now());
  protected readonly sale = PRODUCTS.filter(p => p.oldPrice);
}
