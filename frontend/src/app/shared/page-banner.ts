import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { Icon } from './icon';

export interface Crumb { label: string; link?: string | any[]; }

/** Top banner for inner pages: breadcrumb, title, subtitle and an optional icon. */
@Component({
  selector: 'app-page-banner',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative overflow-hidden pt-6 pb-9 md:pt-20 md:pb-24 border-b border-zinc-200 dark:border-ink-600">
      <div class="absolute inset-0 bg-[radial-gradient(600px_300px_at_80%_0,rgba(220,47,54,.18),transparent_70%),radial-gradient(500px_300px_at_10%_100%,rgba(232,184,74,.08),transparent_70%)]"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(127,127,127,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(127,127,127,.07)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"></div>
      <div class="relative wrap">
        <nav class="flex items-center flex-wrap gap-1.5 md:gap-2 text-xs md:text-sm muted mb-4 md:mb-6">
          <a routerLink="/" class="hover:text-brand-red2">{{ i.t('nav.home') }}</a>
          @for (c of crumbs(); track $index) {
            <app-icon name="arrow" class="w-3.5 h-3.5 opacity-60 rtl:rotate-180" />
            @if (c.link) { <a [routerLink]="c.link" class="hover:text-brand-red2">{{ c.label }}</a> }
            @else { <span class="text-zinc-900 dark:text-white font-bold">{{ c.label }}</span> }
          }
        </nav>
        <div class="flex items-center gap-3.5 md:gap-5">
          @if (icon()) { <div class="ic-red w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl shrink-0"><app-icon [name]="icon()!" class="w-6 h-6 md:w-10 md:h-10" /></div> }
          <div class="min-w-0">
            <h1 class="text-[clamp(26px,5vw,56px)] font-black leading-tight" [innerHTML]="title()"></h1>
            @if (subtitle()) { <p class="muted text-sm md:text-lg mt-1 md:mt-2 max-w-[640px]">{{ subtitle() }}</p> }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PageBanner {
  protected readonly i = inject(I18n);
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  readonly crumbs = input<Crumb[]>([]);
}
