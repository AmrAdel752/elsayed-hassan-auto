import { Component, inject } from '@angular/core';
import { Seo } from './core/seo.service';
import { I18n } from './core/i18n.service';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header';
import { Footer } from './layout/footer';
import { Preloader } from './layout/preloader';
import { BottomNav } from './layout/bottom-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Preloader, BottomNav],
  template: `
    <a href="#main" class="skip-link">{{ i.t('nav.skip') }}</a>
    <app-preloader aria-hidden="true" />
    <app-header />
    <main id="main" tabindex="-1" class="outline-none"><router-outlet /></main>
    <app-footer />
    <!-- room for the fixed bottom tab bar on phones -->
    <div class="lg:hidden h-[calc(68px+env(safe-area-inset-bottom))]"></div>
    <app-bottom-nav />
  `,
})
export class App {
  // instantiate once so titles/meta follow every navigation and language switch
  private readonly seo = inject(Seo);
  protected readonly i = inject(I18n);
}
