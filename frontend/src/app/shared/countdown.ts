import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { I18n } from '../core/i18n.service';

/** Live days/hours/minutes/seconds countdown to `to` (ISO date). */
@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (left() > 0) {
      <div class="flex gap-2">
        @for (u of parts(); track $index) {
          <div class="min-w-[54px] rounded-xl px-2 py-2 text-center" [class]="dark() ? 'bg-white/10' : 'bg-zinc-100 dark:bg-white/5'">
            <b class="block text-xl font-black leading-none tabular-nums">{{ u < 10 ? '0' + u : u }}</b>
            <small class="block text-[10px] font-bold opacity-70 mt-1">{{ i.dict().offers.units[$index] }}</small>
          </div>
        }
      </div>
    } @else {
      <span class="font-bold opacity-70">{{ i.t('offers.ended') }}</span>
    }
  `,
})
export class Countdown {
  protected readonly i = inject(I18n);
  readonly to = input.required<string>();
  /** Use light-on-dark chips when placed on a dark/red background. */
  readonly dark = input(false);

  private readonly now = signal(Date.now());
  protected readonly left = computed(() => Math.max(0, new Date(this.to()).getTime() - this.now()));
  protected readonly parts = computed(() => {
    const s = Math.floor(this.left() / 1000);
    return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
  });

  constructor() {
    const t = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }
}
