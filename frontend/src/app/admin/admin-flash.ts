import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../shared/icon';

/** Result box at the top of a dashboard page: green with a check icon, or red for a failure. */
@Component({
  selector: 'app-admin-flash',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <p class="mb-4 rounded-xl border p-3 text-sm font-bold flex items-start gap-2" [attr.role]="bad() ? 'alert' : 'status'"
       [class]="bad() ? 'border-brand-red/40 bg-brand-red/10 text-brand-red2' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'">
      <app-icon [name]="bad() ? 'close' : 'check'" class="w-5 h-5 shrink-0" />
      <span>{{ text() }}</span>
    </p>
  `,
})
export class AdminFlash {
  readonly text = input.required<string>();
  readonly bad = input(false);
}
