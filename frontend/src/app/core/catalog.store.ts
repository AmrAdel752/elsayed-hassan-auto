import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Category, Offer, Product } from '../data/catalog';
import { Review } from '../data/reviews';
import { SNAPSHOT } from '../data/snapshot';
import { Live, strip } from './live';
import { ContentSync } from './content-sync';

/**
 * Categories, products, offers and customer reviews for the public pages. Shown instantly from the copy
 * built into the site (data/snapshot.ts, rebuilt automatically after every dashboard change), then
 * refreshed from the API in the background (see `Live`).
 */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api`;

  private readonly cats = new Live<Category[]>(this.http, `${this.api}/categories`, SNAPSHOT.categories);
  private readonly prods = new Live<Product[]>(this.http, `${this.api}/products`, SNAPSHOT.products, r => r.map(strip));
  private readonly offs = new Live<Offer[]>(this.http, `${this.api}/offers`, SNAPSHOT.offers, r => r.map(strip));
  private readonly revs = new Live<Review[]>(this.http, `${this.api}/reviews`, SNAPSHOT.reviews, r => r.map(strip));

  readonly categories = this.cats.data.asReadonly();
  readonly products = this.prods.data.asReadonly();
  readonly offers = this.offs.data.asReadonly();
  readonly reviews = this.revs.data.asReadonly();
  /** True once the live products list arrived (or failed): a product missing from the built-in copy may be brand new. */
  readonly productsSynced = this.prods.synced.asReadonly();

  /** Called when a page opens: check the server for anything newer (at most once a minute; now if `force`d). */
  refresh(force = false) { for (const l of [this.cats, this.prods, this.offs, this.revs]) l.refresh(force); }

  // dashboard changes show up on open pages without a refresh
  private readonly sync = inject(ContentSync).changes.subscribe(() => this.refresh(true));
}
