import { Injectable, computed, signal } from '@angular/core';
import { AR, Dict } from '../i18n/ar';

export type Lang = 'ar' | 'en';

// Arabic ships in the main bundle; English is fetched only when a visitor needs it.
const DICTS: Partial<Record<Lang, Dict>> = { ar: AR };
const LOADERS: Record<Lang, () => Promise<Dict>> = {
  ar: async () => AR,
  en: () => import('../i18n/en').then(m => m.EN),
};

function read(key: string, fallback: Lang): Lang {
  try { return (localStorage.getItem(key) as Lang) || fallback; } catch { return fallback; }
}

@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>('ar');
  readonly dict = computed(() => DICTS[this.lang()]!);
  readonly isAr = computed(() => this.lang() === 'ar');

  /** Resolves once the saved language's texts are loaded (awaited by an app initializer). */
  readonly ready = this.use(read('sha-lang', 'ar'));

  /** Loads a language if needed, then switches the page to it. */
  async use(l: Lang) {
    DICTS[l] ??= await LOADERS[l]();
    this.lang.set(l);
    const root = document.documentElement;
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('sha-lang', l); } catch {}
  }

  /** Dotted-path lookup, e.g. t('home.hero.title'). Returns the key when missing. */
  t(path: string): any {
    return path.split('.').reduce<any>((o, k) => o?.[k], this.dict()) ?? path;
  }

  /** Picks the current-language value of a bilingual field. */
  l(v: { ar: string; en: string } | undefined): string { return v ? v[this.lang()] : ''; }

  /** Formats an EGP price, e.g. "1,450 ج.م" / "EGP 1,450". */
  price(n: number): string {
    const s = n.toLocaleString('en-US');
    return this.isAr() ? `${s} ج.م` : `EGP ${s}`;
  }

  toggle() { this.use(this.isAr() ? 'en' : 'ar'); }
}
