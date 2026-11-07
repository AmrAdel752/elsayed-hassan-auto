import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { Tip } from '../data/tips';
import { Icon } from './icon';

@Component({
  selector: 'app-tip-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let t = tip();
    <a [routerLink]="['/tips', t.slug]" class="card group h-full flex flex-col overflow-hidden transition duration-300 hover:-translate-y-2 hover:border-brand-red/50">
      <div class="relative h-36 md:h-44 overflow-hidden bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(220,47,54,.45),transparent_60%)] transition duration-500 group-hover:scale-125"></div>
        <app-icon [name]="t.icon" class="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 text-white/85 transition duration-500 group-hover:scale-110 group-hover:-rotate-6" />
        @if (svc(); as s) { <span class="absolute top-3 start-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-bold">{{ s.t }}</span> }
      </div>
      <div class="p-5 flex flex-col flex-1">
        <small class="muted text-xs mb-2 flex items-center gap-2"><app-icon name="clock" class="w-3.5 h-3.5" />{{ i.dict().tips.minutes(t.minutes) }} · <span>{{ date() }}</span></small>
        <h3 class="font-extrabold text-base md:text-lg leading-snug mb-2 group-hover:text-brand-red2 transition">{{ i.l(t.title) }}</h3>
        <p class="muted text-sm line-clamp-2 mb-4">{{ i.l(t.excerpt) }}</p>
        <span class="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-dgold dark:text-brand-gold">{{ i.t('tips.read') }}<app-icon name="arrow" class="w-4 h-4 rtl:rotate-180" /></span>
      </div>
    </a>
  `,
})
export class TipCard {
  protected readonly i = inject(I18n);
  readonly tip = input.required<Tip>();
  protected readonly svc = computed(() => this.i.dict().services.find(s => s.slug === this.tip().service));
  protected readonly date = computed(() => new Date(this.tip().date).toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
}
