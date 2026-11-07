import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { waLink } from '../core/site';
import { Product } from '../data/catalog';
import { Icon } from './icon';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let p = product();
    <div class="card group relative h-full flex flex-col overflow-hidden transition duration-300 hover:-translate-y-2 hover:border-brand-red/50">
      <a [routerLink]="['/products', p.slug]" class="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-ink-700 dark:to-ink-900">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(220,47,54,.18),transparent_65%)] transition duration-500 group-hover:scale-125"></div>
        <app-icon [name]="p.icon" class="absolute inset-0 m-auto w-14 h-14 sm:w-20 sm:h-20 -translate-y-2 sm:translate-y-0 text-brand-red2/80 transition duration-500 group-hover:scale-110 group-hover:-rotate-6" />
        <span class="absolute bottom-2.5 sm:bottom-3 inset-x-0 text-center font-[Arial] font-black tracking-[2px] sm:tracking-[3px] text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500">{{ p.brand.toUpperCase() }}</span>
        <div class="absolute top-3 start-3 flex flex-col gap-1.5 items-start">
          @if (off()) { <span class="px-2.5 py-1 rounded-lg bg-brand-red text-white text-xs font-black" dir="ltr">-{{ off() }}%</span> }
          @if (p.badge) { <span class="px-2.5 py-1 rounded-lg bg-brand-gold text-ink-900 text-xs font-black">{{ i.l(p.badge) }}</span> }
        </div>
        <span class="absolute top-3 end-3 px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur"
              [class]="p.inStock ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-500/20 muted'">
          {{ i.t(p.inStock ? 'shop.inStock' : 'shop.out') }}
        </span>
      </a>
      <div class="p-3.5 sm:p-5 flex flex-col flex-1">
        <a [routerLink]="['/products', p.slug]" class="text-sm sm:text-base font-extrabold leading-snug mb-1.5 sm:mb-2 line-clamp-2 hover:text-brand-red2">{{ i.l(p.name) }}</a>
        <small class="muted text-[11px] sm:text-xs mb-3 sm:mb-4 line-clamp-1" dir="ltr" [style.text-align]="i.isAr() ? 'right' : 'left'">{{ p.models.slice(0, 3).join(' • ') }}{{ p.models.length > 3 ? ' +' + (p.models.length - 3) : '' }}</small>
        <div class="mt-auto flex items-end justify-between gap-2 sm:gap-3">
          <div class="min-w-0">
            @if (p.oldPrice) { <s class="muted text-[11px] sm:text-xs block">{{ i.price(p.oldPrice) }}</s> }
            <b class="text-base sm:text-xl font-black text-brand-red2 whitespace-nowrap">{{ i.price(p.price) }}</b>
          </div>
          <a [href]="wa()" target="_blank" [attr.aria-label]="i.t('shop.order')"
             class="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl grid place-items-center bg-[#25d366] text-white transition hover:scale-110 shadow-[0_8px_20px_-8px_rgba(37,211,102,.8)]">
            <app-icon name="wa" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ProductCard {
  protected readonly i = inject(I18n);
  readonly product = input.required<Product>();
  protected readonly off = computed(() => {
    const p = this.product();
    return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  });
  protected readonly wa = computed(() =>
    waLink(this.i.dict().shop.msg(this.i.l(this.product().name), this.i.price(this.product().price))));
}
