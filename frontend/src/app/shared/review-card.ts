import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18n } from '../core/i18n.service';
import { Review } from '../data/reviews';
import { Icon } from './icon';

@Component({
  selector: 'app-review-card',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let r = review();
    <div class="card h-full flex flex-col p-5 md:p-7">
      <div class="flex items-center justify-between gap-3 mb-3">
        <div class="flex gap-0.5 text-brand-gold">
          @for (s of [1, 2, 3, 4, 5]; track s) { <app-icon name="star" class="w-4 h-4 md:w-[18px] md:h-[18px]" [class.opacity-25]="s > r.rating" /> }
        </div>
        <small class="muted text-xs">{{ date() }}</small>
      </div>
      <p class="text-zinc-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed mb-5">{{ i.l(r.text) }}</p>
      <div class="mt-auto flex items-center gap-3">
        <div class="w-11 h-11 shrink-0 rounded-full grid place-items-center font-extrabold text-white bg-gradient-to-br from-brand-red2 to-[#8f1a20]">{{ i.l(r.name)[0] }}</div>
        <div class="min-w-0 flex-1"><b class="block truncate">{{ i.l(r.name) }}</b><small class="muted block text-[13px] font-[Arial]">NISSAN {{ r.model.toUpperCase() }} {{ r.year }}</small></div>
        @if (svc(); as s) {
          <span class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-red/10 text-brand-red2 text-[11px] font-bold"><app-icon [name]="s.icon" class="w-3.5 h-3.5" />{{ s.t }}</span>
        }
      </div>
    </div>
  `,
})
export class ReviewCard {
  protected readonly i = inject(I18n);
  readonly review = input.required<Review>();
  protected readonly svc = computed(() => this.i.dict().services.find(s => s.slug === this.review().service));
  protected readonly date = computed(() => new Date(this.review().date).toLocaleDateString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
}
