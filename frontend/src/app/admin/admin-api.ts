import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Tr { ar: string; en: string; }
export type BookingStatus = 'New' | 'Confirmed' | 'Done' | 'Cancelled' | 'NoShow';

export interface Booking {
  id: number; code: string; name: string; phone: string; model: string; generation?: string; year?: number; km?: string;
  services: string[]; date: string; hour: number; notes?: string; status: BookingStatus; adminNote?: string;
  createdAt: string; updatedAt?: string;
}
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number; }
export interface DayCounts { total: number; new: number; confirmed: number; done: number; cancelled: number; noShow: number; }
export interface Dashboard { today: string; todayCounts: DayCounts; newCount: number; upcomingCount: number; next: Booking[]; }

export interface SlotSettings { capacity: number; openHour: number; closeHour: number; maxDaysAhead: number; }
export interface ClosedDay { id: number; date: string; reason?: string; }
export interface ClosedSlot { id: number; date: string; hour: number; reason?: string; }
export interface SlotAdmin { settings: SlotSettings; closedDays: ClosedDay[]; closedSlots: ClosedSlot[]; }
export interface Closed<T> { closed: T; activeBookings: number; }

export interface Category { id: number; slug: string; icon: string; name: Tr; sortOrder: number; isActive: boolean; productCount: number; }
export type CategoryInput = Omit<Category, 'id' | 'productCount'>;

export interface Product {
  id: number; slug: string; categoryId: number; cat: string; icon: string; brand: string; name: Tr; desc: Tr;
  price: number; oldPrice?: number | null; cost?: number | null; models: string[]; inStock: boolean; featured: boolean; badge?: Tr | null; img?: string | null;
  sortOrder: number; isActive: boolean;
}
export type ProductInput = Omit<Product, 'id' | 'cat'>;

export interface Offer {
  id: number; slug: string; icon: string; title: Tr; desc: Tr; discount: Tr; price?: number | null; oldPrice?: number | null; cost?: number | null;
  endsAt: string; service?: string | null; includes: Tr[]; img?: string | null; sortOrder: number; isActive: boolean; expired: boolean;
}
export type OfferInput = Omit<Offer, 'id' | 'expired'>;

export interface Review {
  id: number; name: Tr; model?: string | null; year?: number | null; service?: string | null; rating: number; date: string; text: Tr; isVisible: boolean;
}
/** Arabic is required; English is optional (the API falls back to the Arabic text). */
export interface ReviewInput {
  nameAr: string; nameEn?: string | null; textAr: string; textEn?: string | null;
  model?: string | null; year?: number | null; service?: string | null; rating: number; date: string; isVisible: boolean;
}

export type GalleryCat = 'workshop' | 'work' | 'cars';
export interface GalleryTile { id: number; cat: GalleryCat; icon: string; tall: boolean; title: Tr; img?: string | null; sortOrder: number; isVisible: boolean; }
/** Arabic is required; English is optional (the API falls back to the Arabic text). */
export interface GalleryTileInput {
  cat: GalleryCat; icon: string; tall: boolean; titleAr: string; titleEn?: string | null; img?: string | null; sortOrder: number; isVisible: boolean;
}
export interface BeforeAfterPair { id: number; icon: string; title: Tr; desc: Tr; before?: string | null; after?: string | null; sortOrder: number; isVisible: boolean; }
export interface BeforeAfterInput {
  icon: string; titleAr: string; titleEn?: string | null; descAr: string; descEn?: string | null;
  before?: string | null; after?: string | null; sortOrder: number; isVisible: boolean;
}

type Query = Record<string, string | number | boolean | undefined | null>;
const clean = (q: Query) => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== null && v !== '')) as Record<string, string | number | boolean>;

/** Dashboard API (/api/admin/*). The token is added by authInterceptor. */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/admin`;

  dashboard() { return this.http.get<Dashboard>(`${this.base}/dashboard`); }

  bookings(q: Query) { return this.http.get<Paged<Booking>>(`${this.base}/bookings`, { params: clean(q) }); }
  updateBooking(id: number, body: { status?: BookingStatus; adminNote?: string }) {
    return this.http.patch<Booking>(`${this.base}/bookings/${id}`, body);
  }

  slots() { return this.http.get<SlotAdmin>(`${this.base}/slots`); }
  saveSettings(s: SlotSettings) { return this.http.put<SlotSettings>(`${this.base}/slots/settings`, s); }
  closeDay(date: string, reason?: string) { return this.http.post<Closed<ClosedDay>>(`${this.base}/slots/closed-days`, { date, reason }); }
  openDay(id: number) { return this.http.delete<void>(`${this.base}/slots/closed-days/${id}`); }
  closeSlot(date: string, hour: number, reason?: string) { return this.http.post<Closed<ClosedSlot>>(`${this.base}/slots/closed-slots`, { date, hour, reason }); }
  openSlot(id: number) { return this.http.delete<void>(`${this.base}/slots/closed-slots/${id}`); }

  categories() { return this.http.get<Category[]>(`${this.base}/categories`); }
  saveCategory(id: number | null, c: CategoryInput) {
    return id ? this.http.put<Category>(`${this.base}/categories/${id}`, c) : this.http.post<Category>(`${this.base}/categories`, c);
  }
  deleteCategory(id: number) { return this.http.delete<void>(`${this.base}/categories/${id}`); }

  products() { return this.http.get<Product[]>(`${this.base}/products`); }
  saveProduct(id: number | null, p: ProductInput) {
    return id ? this.http.put<Product>(`${this.base}/products/${id}`, p) : this.http.post<Product>(`${this.base}/products`, p);
  }
  deleteProduct(id: number) { return this.http.delete<void>(`${this.base}/products/${id}`); }

  offers() { return this.http.get<Offer[]>(`${this.base}/offers`); }
  saveOffer(id: number | null, o: OfferInput) {
    return id ? this.http.put<Offer>(`${this.base}/offers/${id}`, o) : this.http.post<Offer>(`${this.base}/offers`, o);
  }
  deleteOffer(id: number) { return this.http.delete<void>(`${this.base}/offers/${id}`); }

  reviews() { return this.http.get<Review[]>(`${this.base}/reviews`); }
  saveReview(id: number | null, r: ReviewInput) {
    return id ? this.http.put<Review>(`${this.base}/reviews/${id}`, r) : this.http.post<Review>(`${this.base}/reviews`, r);
  }
  deleteReview(id: number) { return this.http.delete<void>(`${this.base}/reviews/${id}`); }

  gallery() { return this.http.get<GalleryTile[]>(`${this.base}/gallery`); }
  saveGalleryTile(id: number | null, g: GalleryTileInput) {
    return id ? this.http.put<GalleryTile>(`${this.base}/gallery/${id}`, g) : this.http.post<GalleryTile>(`${this.base}/gallery`, g);
  }
  deleteGalleryTile(id: number) { return this.http.delete<void>(`${this.base}/gallery/${id}`); }

  beforeAfter() { return this.http.get<BeforeAfterPair[]>(`${this.base}/before-after`); }
  saveBeforeAfter(id: number | null, b: BeforeAfterInput) {
    return id ? this.http.put<BeforeAfterPair>(`${this.base}/before-after/${id}`, b) : this.http.post<BeforeAfterPair>(`${this.base}/before-after`, b);
  }
  deleteBeforeAfter(id: number) { return this.http.delete<void>(`${this.base}/before-after/${id}`); }

  /** Upload one image; returns its path (/uploads/...). */
  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/uploads`, form);
  }
}
