import { Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { I18n } from './i18n.service';

export interface SeoOverride { title: string; desc?: string; }

/**
 * Keeps <title>, meta description and Open Graph tags in sync with the current
 * route (`data: { seo: 'key' }` → meta.pages[key]) and language.
 * Detail pages call `set()` for item-specific titles; it resets on every navigation.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly i = inject(I18n);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);

  private readonly key = signal<string | null>(null);
  private readonly url = signal(location.href);
  private readonly override = signal<SeoOverride | null>(null);

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) this.override.set(null);
      if (e instanceof NavigationEnd) {
        let snap: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
        while (snap.firstChild) snap = snap.firstChild;
        this.key.set(snap.data['seo'] ?? null);
        this.url.set(location.href);
      }
    });

    effect(() => {
      const m = this.i.dict().meta, o = this.override(), k = this.key();
      const page = k ? (m.pages as Record<string, string[]>)[k] : null;
      const name = o?.title ?? page?.[0];
      const fullTitle = name ? `${name} | ${m.site}` : m.title;
      const desc = o?.desc ?? page?.[1] ?? m.desc;

      this.title.setTitle(fullTitle);
      this.tag('name', 'description', desc);
      this.tag('property', 'og:title', fullTitle);
      this.tag('property', 'og:description', desc);
      this.tag('property', 'og:url', this.url());
      this.tag('property', 'og:locale', this.i.isAr() ? 'ar_EG' : 'en_US');
      this.tag('name', 'twitter:title', fullTitle);
      this.tag('name', 'twitter:description', desc);
    });
  }

  set(o: SeoOverride) { this.override.set(o); }

  private tag(attr: 'name' | 'property', key: string, content: string) {
    this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
  }
}
