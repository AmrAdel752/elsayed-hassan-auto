import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { I18n } from '../core/i18n.service';
import { Theme } from '../core/theme.service';
import { Icon } from '../shared/icon';
import { ConfirmHost } from './confirm-dialog';
import { adminTexts } from './admin.i18n';

/** Dashboard shell: sidebar (drawer on phones) + top bar + the current admin page. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, ConfirmHost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t();
    <div class="min-h-dvh bg-zinc-100 dark:bg-ink-900 lg:ps-64">
      <!-- sidebar -->
      @if (open()) { <button type="button" class="fixed inset-0 z-40 bg-black/50 lg:hidden" (click)="open.set(false)" [attr.aria-label]="T.close"></button> }
      <aside class="fixed inset-y-0 start-0 z-50 w-64 flex flex-col border-e border-zinc-200 dark:border-ink-600 bg-white dark:bg-ink-800 transition-transform"
             [class]="open() ? '' : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full'">
        <a routerLink="/admin" class="flex items-center gap-3 px-5 h-16 border-b border-zinc-200 dark:border-ink-600" (click)="open.set(false)">
          <span class="ic-red w-10 h-10 rounded-xl grid place-items-center"><app-icon name="shield" class="w-5 h-5" /></span>
          <span><b class="block leading-tight">{{ T.brand }}</b><small class="muted text-xs">{{ T.title }}</small></span>
        </a>
        <nav class="flex-1 overflow-y-auto p-3 space-y-1" [attr.aria-label]="T.menu">
          @for (n of nav; track n.path) {
            <a [routerLink]="n.path" routerLinkActive="!bg-brand-red !text-white shadow-[0_10px_24px_-12px_rgba(220,47,54,.9)]"
               [routerLinkActiveOptions]="{ exact: n.path === '/admin' }" (click)="open.set(false)"
               class="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[15px] hover:bg-zinc-100 dark:hover:bg-white/5 transition">
              <app-icon [name]="n.icon" class="w-5 h-5" />{{ T.nav[n.key] }}</a>
          }
        </nav>
        <div class="p-3 border-t border-zinc-200 dark:border-ink-600 space-y-1">
          <a routerLink="/" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold muted hover:bg-zinc-100 dark:hover:bg-white/5">
            <app-icon name="car" class="w-5 h-5" />{{ T.site }}</a>
          <button type="button" (click)="auth.logout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-brand-red2 hover:bg-brand-red/10">
            <app-icon name="close" class="w-5 h-5" />{{ T.logout }}</button>
        </div>
      </aside>

      <!-- top bar -->
      <header class="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 md:px-6 border-b border-zinc-200 dark:border-ink-600 bg-white/90 dark:bg-ink-800/90 backdrop-blur">
        <button type="button" class="icon-btn lg:hidden" (click)="open.set(true)" [attr.aria-label]="T.menu"><app-icon name="menu" class="w-5 h-5" /></button>
        <div class="flex-1 min-w-0">
          <b class="block truncate leading-tight">{{ auth.user()?.displayName }}</b>
          <small class="muted text-xs">{{ T.role[auth.user()?.role ?? 'Staff'] }}</small>
        </div>
        <button type="button" class="icon-btn" (click)="i.toggle()" aria-label="Language">{{ i.isAr() ? 'EN' : 'ع' }}</button>
        <button type="button" class="icon-btn" (click)="theme.toggle()" aria-label="Theme"><app-icon [name]="theme.dark() ? 'sun' : 'moon'" class="w-5 h-5" /></button>
      </header>

      <main id="main" tabindex="-1" class="outline-none p-4 md:p-6 lg:p-8 max-w-6xl mx-auto"><router-outlet /></main>
      <app-confirm-host />
    </div>
  `,
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  protected readonly i = inject(I18n);
  protected readonly theme = inject(Theme);
  protected readonly t = adminTexts();
  protected readonly open = signal(false);

  protected readonly nav = [
    { path: '/admin', key: 'home', icon: 'spark' },
    { path: '/admin/bookings', key: 'bookings', icon: 'cal' },
    { path: '/admin/slots', key: 'slots', icon: 'clock' },
    { path: '/admin/products', key: 'products', icon: 'parts' },
    { path: '/admin/offers', key: 'offers', icon: 'gift' },
    { path: '/admin/reviews', key: 'reviews', icon: 'star' },
    { path: '/admin/gallery', key: 'gallery', icon: 'paint' },
  ] as const;
}
