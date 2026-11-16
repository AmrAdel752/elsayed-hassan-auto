import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { CATEGORIES, Category, OFFERS, Offer, PRODUCTS, Product } from '../data/catalog';
import { REVIEWS, Review } from '../data/reviews';

/**
 * Categories, products, offers and customer reviews for the public pages.
 * Starts with the built-in data (data/catalog.ts) so pages render instantly and keep working if the
 * API is down, then swaps in the live data managed from the dashboard (one request set per visit).
 */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly http = inject(HttpClient);

  readonly categories = signal<Category[]>(CATEGORIES);
  readonly products = signal<Product[]>(PRODUCTS);
  readonly offers = signal<Offer[]>(OFFERS);
  readonly reviews = signal<Review[]>(REVIEWS);
  /** True once the API answered or failed, i.e. "not found" can be trusted. */
  readonly ready = signal(false);

  constructor() {
    const api = `${environment.apiUrl}/api`;
    forkJoin({
      categories: this.http.get<Category[]>(`${api}/categories`),
      products: this.http.get<Product[]>(`${api}/products`),
      offers: this.http.get<Offer[]>(`${api}/offers`),
      reviews: this.http.get<Review[]>(`${api}/reviews`),
    }).pipe(timeout(10000)).subscribe({
      next: r => {
        // the API sends null for empty optional fields; the pages expect them to be absent
        this.categories.set(r.categories);
        this.products.set(r.products.map(strip));
        this.offers.set(r.offers.map(strip));
        this.reviews.set(r.reviews.map(strip));
        this.ready.set(true);
      },
      error: () => this.ready.set(true),   // keep the built-in data
    });
  }
}

function strip<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null)) as T;
}
