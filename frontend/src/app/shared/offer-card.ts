import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18n } from '../core/i18n.service';
import { waLink } from '../core/site';
import { Offer } from '../data/catalog';
import { Countdown } from './countdown';
import { Icon } from './icon';

@Component({
  selector: 'app-offer-card',
  imports: [Countdown, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let o = offer();
    <div class="relative h-full flex flex-col overflow-hidden rounded-[24px] p-5 sm:p-7 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30 shadow-[0_20px_50px_-25px_rgba(220,47,54,.6)]">
      <div class="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-brand-red/30 blur-3xl"></div>
      <app-icon [name]="o.icon" class="absolute -bottom-8 -start-8 w-40 h-40 text-white/[.04]" />
      <div class="relative flex items-start justify-between gap-3 mb-5">
        <div class="ic-red w-14 h-14 rounded-2xl"><app-icon [name]="o.icon" class="w-7 h-7" /></div>
        <span class="px-3.5 py-1.5 rounded-full bg-brand-gold text-ink-900 font-black text-sm" dir="auto">{{ i.l(o.discount) }}</span>
      </div>
      <h3 class="relative text-2xl font-black mb-2">{{ i.l(o.title) }}</h3>
      <p class="relative text-zinc-400 mb-5">{{ i.l(o.desc) }}</p>
      @if (full()) {
        <small class="relative block text-xs font-bold text-[#ff9599] mb-2">{{ i.t('offers.includes') }}</small>
        <ul class="relative space-y-2 mb-6">
          @for (x of o.includes; track $index) {
            <li class="flex items-center gap-2 text-sm"><app-icon name="check" class="w-4 h-4 text-emerald-400" />{{ i.l(x) }}</li>
          }
        </ul>
      }
      @if (o.price) {
        <div class="relative flex items-baseline gap-3 mb-5">
          <b class="text-3xl font-black gold-text">{{ i.price(o.price) }}</b>
          @if (o.oldPrice) { <s class="text-zinc-500">{{ i.price(o.oldPrice) }}</s> }
        </div>
      }
      <div class="relative mt-auto">
        <small class="block text-xs font-bold text-zinc-400 mb-2">{{ i.t('offers.ends') }}</small>
        <app-countdown [to]="o.endsAt" [dark]="true" />
        <a [href]="wa()" target="_blank" class="btn btn-red w-full justify-center mt-5 !py-3"><app-icon name="wa" class="w-5 h-5" />{{ i.t('offers.claim') }}</a>
      </div>
    </div>
  `,
})
export class OfferCard {
  protected readonly i = inject(I18n);
  readonly offer = input.required<Offer>();
  /** Show the "includes" list (offers page) or the compact version (home). */
  readonly full = input(false);
  protected readonly wa = computed(() => waLink(this.i.dict().offers.msg(this.i.l(this.offer().title))));
}
