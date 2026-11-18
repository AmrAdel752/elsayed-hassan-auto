import { Component, effect, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Seo } from './core/seo.service';
import { I18n } from './core/i18n.service';
import { Header } from './layout/header';
import { Footer } from './layout/footer';
import { Preloader } from './layout/preloader';
import { BottomNav } from './layout/bottom-nav';
import { NavProgress } from './layout/nav-progress';

const isAdminUrl = (url: string) => /^\/admin(\/|\?|#|$)/.test(url);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Preloader, BottomNav, NavProgress],
  template: `
    <app-preloader aria-hidden="true" />
    <app-nav-progress />
    @if (admin()) {
      <!-- the dashboard has its own shell (admin/admin-layout.ts) -->
      <router-outlet />
    } @else {
      <a href="#main" class="skip-link">{{ i.t('nav.skip') }}</a>
      <app-header />
      <main id="main" tabindex="-1" class="outline-none"><router-outlet /></main>
      <app-footer />
      <!-- room for the fixed bottom tab bar on phones -->
      <div class="lg:hidden h-[calc(68px+env(safe-area-inset-bottom))]"></div>
      <app-bottom-nav />
    }
  `,
})
export class App {
  // instantiate once so titles/meta follow every navigation and language switch
  private readonly seo = inject(Seo);
  private readonly meta = inject(Meta);
  protected readonly i = inject(I18n);

  /** /admin pages: no public header/footer, and hidden from search engines. */
  protected readonly admin = signal(isAdminUrl(location.pathname));

  constructor() {
    inject(Router).events.subscribe(e => { if (e instanceof NavigationEnd) this.admin.set(isAdminUrl(e.urlAfterRedirects)); });
    effect(() => {
      if (this.admin()) this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' }, 'name="robots"');
      else this.meta.removeTag('name="robots"');
    });
  }
}
