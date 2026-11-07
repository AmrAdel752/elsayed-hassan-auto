import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { Icon } from '../shared/icon';

/** App-style bottom tab bar, phones and tablets only. */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-[65] pb-[env(safe-area-inset-bottom)] bg-white/90 dark:bg-ink-800/90 backdrop-blur-xl border-t border-zinc-200 dark:border-ink-600 shadow-[0_-10px_30px_-15px_rgba(0,0,0,.25)]">
      <div class="grid grid-cols-5 h-[68px] max-w-[560px] mx-auto">
        @for (t of tabs; track t.path) {
          @if (t.main) {
            <a [routerLink]="t.path" routerLinkActive #rla="routerLinkActive" class="flex flex-col items-center justify-end gap-1 pb-[9px] transition active:scale-95">
              <span class="-mt-7 w-[58px] h-[58px] rounded-full grid place-items-center text-white bg-gradient-to-br from-brand-red2 to-brand-red shadow-[0_10px_25px_-6px_rgba(220,47,54,.8)] border-4 border-zinc-50 dark:border-ink-800"
                    [class.ring-4]="rla.isActive" [class.ring-brand-red/25]="rla.isActive">
                <app-icon [name]="t.icon" class="w-7 h-7" />
              </span>
              <span class="text-[11px] font-extrabold text-brand-red2 whitespace-nowrap">{{ i.t('nav.' + t.key) }}</span>
            </a>
          } @else {
            <a [routerLink]="t.path" routerLinkActive #rla="routerLinkActive" [routerLinkActiveOptions]="{ exact: t.path === '/' }"
               class="relative flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95"
               [class]="rla.isActive ? 'text-brand-red2' : 'muted'">
              @if (rla.isActive) { <span class="absolute top-0 w-8 h-1 rounded-b-full bg-brand-red2"></span> }
              <app-icon [name]="t.icon" class="w-6 h-6" />
              <span class="whitespace-nowrap">{{ i.t('nav.' + t.short) }}</span>
            </a>
          }
        }
      </div>
    </nav>
  `,
})
export class BottomNav {
  protected readonly i = inject(I18n);
  protected readonly tabs = [
    { path: '/', key: 'home', short: 'home', icon: 'car' },
    { path: '/services', key: 'services', short: 'services', icon: 'engine' },
    { path: '/book', key: 'book', short: 'book', icon: 'cal', main: true },
    { path: '/products', key: 'products', short: 'products', icon: 'parts' },
    { path: '/contact', key: 'contact', short: 'contactShort', icon: 'phone' },
  ];
}
