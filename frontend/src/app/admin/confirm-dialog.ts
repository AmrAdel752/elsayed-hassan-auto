import { ChangeDetectionStrategy, Component, ElementRef, Injectable, effect, inject, signal, viewChild } from '@angular/core';
import { Icon } from '../shared/icon';

export interface ConfirmOptions {
  title: string;
  /** Short explanation under the title. */
  message?: string;
  /** Highlighted line, e.g. the name of the item being deleted. */
  subject?: string;
  confirmText: string;
  cancelText: string;
  /** danger = red (delete, cancel booking). */
  tone?: 'danger' | 'warning';
  icon?: string;
}

/** Dashboard replacement for window.confirm(): `if (!(await confirm.ask({...}))) return;` */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmOptions | null>(null);
  private resolve?: (ok: boolean) => void;

  ask(o: ConfirmOptions): Promise<boolean> {
    this.resolve?.(false);   // a new question replaces an unanswered one
    this.current.set({ tone: 'danger', icon: 'trash', ...o });
    return new Promise(r => (this.resolve = r));
  }

  answer(ok: boolean) {
    this.resolve?.(ok);
    this.resolve = undefined;
    this.current.set(null);
  }
}

/** The popup itself; placed once in the dashboard layout. Native <dialog>: Esc closes it, focus stays inside. */
@Component({
  selector: 'app-confirm-host',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg (cancel)="$event.preventDefault(); svc.answer(false)" (click)="$event.target === dlg && svc.answer(false)"
            [attr.aria-labelledby]="'cf-title'" [attr.aria-describedby]="'cf-msg'"
            class="cf m-auto p-0 w-[calc(100%-2rem)] max-w-[420px] bg-transparent text-inherit overflow-visible
                   backdrop:bg-black/60 backdrop:backdrop-blur-[3px]">
      @if (svc.current(); as c) {
        <div class="relative overflow-hidden rounded-[26px] border border-zinc-200 dark:border-ink-600 bg-white dark:bg-gradient-to-b dark:from-ink-700 dark:to-ink-800
                    shadow-[0_30px_80px_-20px_rgba(0,0,0,.55)] px-6 pt-8 pb-6 text-center">
          <!-- soft colour glow behind the icon -->
          <div class="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-60"
               [class]="c.tone === 'warning' ? 'bg-amber-400/25' : 'bg-brand-red/25'"></div>

          <div class="relative mx-auto mb-5 w-[76px] h-[76px] grid place-items-center rounded-full ring-8"
               [class]="c.tone === 'warning' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/10' : 'bg-brand-red/12 text-brand-red2 ring-brand-red/[.07]'">
            <span class="cf-pulse absolute inset-0 rounded-full" [class]="c.tone === 'warning' ? 'bg-amber-500/20' : 'bg-brand-red/20'"></span>
            <app-icon [name]="c.icon ?? 'trash'" class="relative w-9 h-9" />
          </div>

          <h2 id="cf-title" class="relative text-xl md:text-[22px] font-black leading-snug">{{ c.title }}</h2>
          @if (c.subject) {
            <p class="relative mt-3 mx-auto max-w-full inline-block rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-ink-600 px-4 py-2 font-bold break-words">{{ c.subject }}</p>
          }
          @if (c.message) { <p id="cf-msg" class="relative mt-3 muted text-[15px] leading-relaxed">{{ c.message }}</p> }

          <div class="relative mt-7 grid grid-cols-2 gap-3">
            <button type="button" (click)="svc.answer(false)" data-cancel
                    class="h-12 rounded-full font-bold border border-zinc-300 dark:border-ink-600 hover:bg-zinc-100 dark:hover:bg-white/5 transition
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-800">
              {{ c.cancelText }}</button>
            <button type="button" (click)="svc.answer(true)"
                    class="h-12 rounded-full font-bold text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-800"
                    [class]="c.tone === 'warning'
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-[0_10px_24px_-8px_rgba(245,158,11,.8)] focus-visible:ring-amber-500'
                      : 'bg-gradient-to-br from-brand-red2 to-brand-red shadow-[0_10px_24px_-8px_rgba(220,47,54,.85)] focus-visible:ring-brand-red2'">
              {{ c.confirmText }}</button>
          </div>
        </div>
      }
    </dialog>
  `,
  styles: `
    .cf[open] { animation: cf-in .22s cubic-bezier(.2, .9, .3, 1.2); }
    .cf[open]::backdrop { animation: cf-fade .2s ease-out; }
    .cf-pulse { animation: cf-pulse 2s ease-out infinite; }
    @keyframes cf-in { from { opacity: 0; transform: translateY(12px) scale(.94); } }
    @keyframes cf-fade { from { opacity: 0; } }
    @keyframes cf-pulse { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.55); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .cf[open], .cf[open]::backdrop, .cf-pulse { animation: none; } }
  `,
})
export class ConfirmHost {
  protected readonly svc = inject(ConfirmService);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const d = this.dlg().nativeElement, open = !!this.svc.current();
      if (open && !d.open) {
        d.showModal();
        // start on the safe answer ("No"), so Enter / Space never deletes by accident
        setTimeout(() => d.querySelector<HTMLButtonElement>('[data-cancel]')?.focus());
      }
      else if (!open && d.open) d.close();
    });
  }
}
