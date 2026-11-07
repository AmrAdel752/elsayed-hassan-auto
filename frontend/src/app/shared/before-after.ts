import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { I18n } from '../core/i18n.service';
import { BeforeAfter as Item } from '../data/gallery';
import { Icon } from './icon';

/** Drag-to-compare slider. Uses real photos when given, otherwise drawn "worn vs. fixed" placeholders. */
@Component({
  selector: 'app-before-after',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let it = item();
    <div class="card overflow-hidden h-full flex flex-col">
      <div class="relative aspect-[16/11] select-none touch-pan-y" dir="ltr">
        <!-- after (full) -->
        <div class="absolute inset-0">
          @if (it.after) { <img [src]="it.after" alt="" class="w-full h-full object-cover"> }
          @else {
            <div class="w-full h-full grid place-items-center bg-gradient-to-br from-brand-red2 via-brand-red to-[#741419]">
              <div class="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.25)_45%,transparent_55%)]"></div>
              <app-icon [name]="it.icon" class="w-24 h-24 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,.35)]" />
            </div>
          }
        </div>
        <!-- before (clipped from the right edge to the handle) -->
        <div class="absolute inset-0" [style.clip-path]="'inset(0 ' + (100 - pos()) + '% 0 0)'">
          @if (it.before) { <img [src]="it.before" alt="" class="w-full h-full object-cover"> }
          @else {
            <div class="w-full h-full grid place-items-center bg-gradient-to-br from-[#57534e] via-[#3f3a36] to-[#1c1917]">
              <div class="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_30%,rgba(120,72,30,.6)_0_6%,transparent_7%),radial-gradient(circle_at_70%_60%,rgba(80,50,20,.6)_0_9%,transparent_10%),radial-gradient(circle_at_45%_80%,rgba(0,0,0,.5)_0_5%,transparent_6%),radial-gradient(circle_at_85%_20%,rgba(120,72,30,.5)_0_4%,transparent_5%)]"></div>
              <app-icon [name]="it.icon" class="w-24 h-24 text-zinc-500/80" />
            </div>
          }
        </div>
        <!-- labels -->
        <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-bold">{{ i.t('gal.before') }}</span>
        <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 text-brand-red text-xs font-bold">{{ i.t('gal.after') }}</span>
        <!-- handle -->
        <div class="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,.5)] pointer-events-none" [style.left.%]="pos()">
          <span class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-brand-red grid place-items-center shadow-xl">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
          </span>
        </div>
        <input type="range" min="0" max="100" [value]="pos()" (input)="pos.set(+$any($event.target).value)"
               class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" [attr.aria-label]="i.l(it.title)">
      </div>
      <div class="p-4 md:p-5">
        <h3 class="font-extrabold text-base md:text-lg">{{ i.l(it.title) }}</h3>
        <p class="muted text-sm">{{ i.l(it.desc) }}</p>
      </div>
    </div>
  `,
})
export class BeforeAfterSlider {
  protected readonly i = inject(I18n);
  readonly item = input.required<Item>();
  protected readonly pos = signal(50);
}
