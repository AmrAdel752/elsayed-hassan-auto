import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { BeforeAfter, GalleryItem } from '../data/gallery';
import { SNAPSHOT } from '../data/snapshot';
import { Live, strip } from './live';

type GalleryResponse = { items: GalleryItem[]; beforeAfter: BeforeAfter[] };

/**
 * Gallery tiles + before/after pairs for the public gallery page. Shown instantly from the copy built into
 * the site (data/snapshot.ts), then refreshed from the API in the background (see `Live`).
 */
@Injectable({ providedIn: 'root' })
export class GalleryStore {
  private readonly live = new Live<GalleryResponse>(inject(HttpClient), `${environment.apiUrl}/api/gallery`, SNAPSHOT.gallery,
    r => ({ items: r.items.map(strip), beforeAfter: r.beforeAfter.map(strip) }));

  readonly items = computed(() => this.live.data().items);
  readonly beforeAfter = computed(() => this.live.data().beforeAfter);

  /** Called when the page opens: check the server for anything newer (at most once a minute). */
  refresh() { this.live.refresh(); }
}
