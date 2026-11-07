import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { CarModel } from '../data/models';
import { Icon } from './icon';

@Component({
  selector: 'app-model-card',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let m = model();
    <a [routerLink]="['/models', m.slug]" class="card group relative block h-full overflow-hidden transition duration-300 hover:-translate-y-2 hover:border-brand-red/50">
      <div class="relative h-32 sm:h-40 overflow-hidden bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,47,54,.45),transparent_60%)] transition duration-500 group-hover:scale-125"></div>
        <span class="absolute -bottom-4 start-4 font-[Arial] font-black text-[64px] leading-none tracking-tight text-white/10 transition duration-500 group-hover:text-white/20">{{ m.name.toUpperCase() }}</span>
        <app-icon name="car" class="absolute top-1/2 -translate-y-1/2 end-6 w-24 h-24 text-white/85 transition duration-500 group-hover:-translate-x-2 rtl:group-hover:translate-x-2" />
        <span class="absolute top-4 start-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-bold">{{ i.l(m.type) }}</span>
      </div>
      <div class="p-5 sm:p-6">
        <h3 class="font-[Arial] text-2xl font-black tracking-wide mb-1">NISSAN <span class="text-brand-red2">{{ m.name.toUpperCase() }}</span></h3>
        <p class="muted text-sm mb-5 line-clamp-2">{{ i.l(m.tagline) }}</p>
        <div class="grid grid-cols-3 gap-2 text-center text-xs mb-5">
          <div class="rounded-xl bg-zinc-100 dark:bg-white/5 py-2"><small class="muted block">{{ i.t('mdl.engine') }}</small><b dir="ltr">{{ m.engine.split(' / ')[0] }}</b></div>
          <div class="rounded-xl bg-zinc-100 dark:bg-white/5 py-2"><small class="muted block">{{ i.t('mdl.gearbox') }}</small><b>{{ i.l(m.gearbox).split(' / ')[0] }}</b></div>
          <div class="rounded-xl bg-zinc-100 dark:bg-white/5 py-2"><small class="muted block">{{ i.t('mdl.years') }}</small><b dir="ltr">{{ m.years.split(' — ')[0] }}+</b></div>
        </div>
        <span class="inline-flex items-center gap-1.5 text-sm font-bold text-brand-dgold dark:text-brand-gold">{{ i.t('mdl.open') }}<app-icon name="arrow" class="w-4 h-4 rtl:rotate-180" /></span>
      </div>
    </a>
  `,
})
export class ModelCard {
  protected readonly i = inject(I18n);
  readonly model = input.required<CarModel>();
}
