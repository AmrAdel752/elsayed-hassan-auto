import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { imgUrl } from '../core/media';
import { Icon } from '../shared/icon';
import { AdminApi } from './admin-api';
import { apiError } from './admin-ui';
import { adminTexts } from './admin.i18n';

const MAX = 5 * 1024 * 1024;

/** Image picker: uploads to the API right away and keeps the returned path in `value`. */
@Component({
  selector: 'app-image-input',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().image;
    <div class="flex items-center gap-4">
      <div class="w-24 h-24 shrink-0 rounded-2xl border border-dashed border-zinc-300 dark:border-ink-600 bg-zinc-50 dark:bg-ink-900 grid place-items-center overflow-hidden">
        @if (value()) { <img [src]="src(value())" alt="" class="w-full h-full object-cover"> }
        @else { <app-icon name="parts" class="w-8 h-8 muted" /> }
      </div>
      <div class="min-w-0">
        <label class="btn !px-4 !py-2 !text-sm border border-zinc-300 dark:border-ink-600 hover:!translate-y-0" [class.opacity-50]="busy()">
          {{ busy() ? T.uploading : value() ? T.change : T.pick }}
          <input type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" [disabled]="busy()" (change)="pick($event)">
        </label>
        @if (value()) { <button type="button" (click)="value.set(null)" class="ms-3 text-sm font-bold text-brand-red2 hover:underline">{{ T.remove }}</button> }
        <small class="block muted text-xs mt-2">{{ T.hint }}</small>
        @if (err()) { <small class="block text-brand-red2 font-bold text-xs mt-1" role="alert">{{ err() }}</small> }
      </div>
    </div>
  `,
})
export class ImageInput {
  private readonly api = inject(AdminApi);
  protected readonly t = adminTexts();
  protected readonly src = imgUrl;

  /** Image path (/uploads/...) or null. */
  readonly value = model<string | null | undefined>(null);
  protected readonly busy = signal(false);
  protected readonly err = signal('');

  protected pick(e: Event) {
    const input = e.target as HTMLInputElement, file = input.files?.[0];
    input.value = '';   // picking the same file again still fires `change`
    if (!file) return;
    const T = this.t().image;
    if (file.size > MAX) { this.err.set(T.tooBig); return; }
    this.busy.set(true); this.err.set('');
    this.api.upload(file).subscribe({
      next: r => { this.busy.set(false); this.value.set(r.url); },
      error: e => { this.busy.set(false); this.err.set(apiError(e).status === 400 ? T.bad : this.t().failed); },
    });
  }
}
