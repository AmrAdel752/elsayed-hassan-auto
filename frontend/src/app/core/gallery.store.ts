import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { BEFORE_AFTER, BeforeAfter, GALLERY, GalleryItem } from '../data/gallery';

/**
 * Gallery tiles + before/after pairs for the public gallery page.
 * Starts with the built-in data (data/gallery.ts) so the page renders instantly and keeps working if the
 * API is down, then swaps in what the dashboard manages. Created on the first visit to the gallery page.
 */
@Injectable({ providedIn: 'root' })
export class GalleryStore {
  readonly items = signal<GalleryItem[]>(GALLERY);
  readonly beforeAfter = signal<BeforeAfter[]>(BEFORE_AFTER);

  constructor() {
    inject(HttpClient).get<{ items: GalleryItem[]; beforeAfter: BeforeAfter[] }>(`${environment.apiUrl}/api/gallery`)
      .pipe(timeout(10000)).subscribe({
        next: r => {
          // the API sends null for empty optional fields; the page expects them to be absent
          this.items.set(r.items.map(strip));
          this.beforeAfter.set(r.beforeAfter.map(strip));
        },
        error: () => {},   // keep the built-in data
      });
  }
}

function strip<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null)) as T;
}
