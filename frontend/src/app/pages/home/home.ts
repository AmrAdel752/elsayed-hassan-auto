import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';
import { CountUp } from '../../shared/count-up.directive';
import { ServicesGrid } from '../../shared/sections/services-grid';
import { BookingForm } from '../../shared/sections/booking-form';
import { ContactBlock } from '../../shared/sections/contact-block';
import { CtaBand } from '../../shared/cta-band';
import { CarExplorer } from '../../shared/sections/car-explorer';
import { ProductCard } from '../../shared/product-card';
import { OfferCard } from '../../shared/offer-card';
import { CatalogStore } from '../../core/catalog.store';
import { CAR_MODELS, MODEL_AR } from '../../data/models';
import { ReviewCard } from '../../shared/review-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, Reveal, CountUp, ServicesGrid, BookingForm, ContactBlock, CtaBand, ProductCard, OfferCard, CarExplorer, ReviewCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  protected readonly i = inject(I18n);
  protected readonly site = SITE;
  protected readonly wa = waLink();
  protected readonly stats = [{ n: 15, s: '+' }, { n: 100, s: '%' }, { n: 7, s: '/7' }, { n: 12, s: '' }];
  protected readonly models = SITE.models.map(m => m.toUpperCase());
  private readonly store = inject(CatalogStore);
  /** Model links for the "about us" text section: "صيانة نيسان صني" → /models/sunny. */
  protected readonly modelLinks = computed(() => CAR_MODELS.map(m => ({
    slug: m.slug, label: this.i.dict().home.seo.model(this.i.isAr() ? MODEL_AR[m.name] ?? m.name : m.name),
  })));
  protected readonly reviews = computed(() => this.store.reviews().slice(0, 3));
  protected readonly featured = computed(() => this.store.products().filter(p => p.featured).slice(0, 8));
  protected readonly offers = computed(() => this.store.offers().filter(o => new Date(o.endsAt).getTime() > Date.now()));
}
