import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { Icon } from '../icon';
import { Reveal } from '../reveal.directive';

@Component({
  selector: 'app-services-grid',
  imports: [RouterLink, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
      @for (s of i.dict().services; track s.slug; let n = $index) {
        <a [routerLink]="['/services', s.slug]" [reveal]="(n % 3) * .12"
           class="card group relative flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden transition duration-300 hover:-translate-y-2 hover:border-brand-red/50">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(400px_200px_at_100%_0,rgba(220,47,54,.15),transparent_70%)]"></div>
          <span class="absolute end-3 top-2 md:end-6 md:top-4 text-[34px] md:text-[56px] font-black text-zinc-300 dark:text-zinc-500">0{{ n + 1 }}</span>
          <div class="ic-red relative w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[18px] mb-3 md:mb-5"><app-icon [name]="s.icon" class="w-6 h-6 md:w-[30px] md:h-[30px]" /></div>
          <h3 class="relative text-base sm:text-lg md:text-[22px] font-extrabold mb-1 md:mb-2">{{ s.t }}</h3>
          <p class="relative muted text-xs sm:text-sm md:text-[15px] mb-3 md:mb-4 line-clamp-3 md:line-clamp-none">{{ s.d }}</p>
          <span class="relative mt-auto inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-brand-dgold dark:text-brand-gold">
            {{ i.t('common.more') }}<app-icon name="arrow" class="w-4 h-4 rtl:rotate-180" />
          </span>
        </a>
      }
    </div>
  `,
})
export class ServicesGrid {
  protected readonly i = inject(I18n);
}
