import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../shared/icon';
import { adminTexts } from './admin.i18n';

/** ▲ / ▼ buttons that move a row up or down in the website order (replaces typing order numbers). */
@Component({
  selector: 'app-move-arrows',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col shrink-0 -my-1' },
  template: `
    <button type="button" class="w-8 h-7 grid place-items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none"
            [disabled]="first() || busy()" (click)="move.emit(-1)" [attr.aria-label]="t().move.up" [title]="t().move.up">
      <app-icon name="chevron" class="w-4 h-4 rotate-180" /></button>
    <button type="button" class="w-8 h-7 grid place-items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none"
            [disabled]="last() || busy()" (click)="move.emit(1)" [attr.aria-label]="t().move.down" [title]="t().move.down">
      <app-icon name="chevron" class="w-4 h-4" /></button>
  `,
})
export class MoveArrows {
  protected readonly t = adminTexts();
  readonly first = input(false);
  readonly last = input(false);
  readonly busy = input(false);
  readonly move = output<-1 | 1>();
}
