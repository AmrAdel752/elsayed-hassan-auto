import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { OFFERS, PRODUCTS } from '../../data/catalog';
import { REVIEWS } from '../../data/reviews';
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
  protected readonly reviews = REVIEWS.slice(0, 3);
  protected readonly featured = PRODUCTS.filter(p => p.featured).slice(0, 8);
  protected readonly offers = signal(OFFERS.filter(o => new Date(o.endsAt).getTime() > Date.now()));
}
