import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { I18n } from '../core/i18n.service';
import { SITE, waLink } from '../core/site';
import { Icon } from './icon';

/** loading = waiting for the server, ok = done, error = the server didn't answer. */
export type LoadState = 'loading' | 'ok' | 'error';

/** Shown when live server data (booking times) is loading, or when the server didn't answer (with "try again"). */
@Component({
  selector: 'app-load-state',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state() === 'loading') {
      <div class="card p-10 md:p-14 text-center" role="status">
        <span class="inline-block w-9 h-9 rounded-full border-4 border-brand-red/20 border-t-brand-red animate-spin mb-3"></span>
        <p class="muted font-bold">{{ i.t('load.wait') }}</p>
      </div>
    } @else if (state() === 'error') {
      <div class="card p-10 md:p-14 text-center" role="alert">
        <app-icon name="clock" class="w-12 h-12 mx-auto mb-3 muted" />
        <p class="font-bold text-lg mb-1">{{ i.t('load.fail') }}</p>
        <p class="muted text-sm mb-5">{{ i.t('load.failP') }}</p>
        <div class="flex flex-wrap justify-center gap-3">
          <button type="button" class="btn btn-red" (click)="retry.emit()">{{ i.t('load.retry') }}</button>
          <a [href]="wa" target="_blank" class="btn bg-[#25d366] text-white"><app-icon name="wa" class="w-5 h-5" />{{ i.t('load.wa') }}</a>
        </div>
      </div>
    }
  `,
})
export class LoadStateView {
  protected readonly i = inject(I18n);
  protected readonly wa = waLink(undefined, SITE.whatsapp);
  readonly state = input.required<LoadState>();
  readonly retry = output<void>();
}
