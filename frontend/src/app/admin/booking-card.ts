import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../core/i18n.service';
import { Icon } from '../shared/icon';
import { AdminApi, Booking, BookingStatus } from './admin-api';
import { STATUS_CLASS, apiError, fmtDay, fmtHour } from './admin-ui';
import { adminTexts } from './admin.i18n';
import { ConfirmService } from './confirm-dialog';

/** One booking: details, call / WhatsApp, status buttons and the internal note. */
@Component({
  selector: 'app-booking-card',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let T = t().bookings; @let b = booking();
    <article class="card p-4 md:p-5">
      <div class="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div class="flex-1 min-w-[190px]">
          <div class="flex items-center gap-2 flex-wrap">
            <b class="text-lg">{{ b.name }}</b>
            <span class="rounded-full border px-2.5 py-0.5 text-xs font-bold" [class]="cls[b.status]">{{ T.status[b.status] }}</span>
          </div>
          <small class="muted font-bold" dir="ltr">{{ b.code }}</small>
        </div>
        <div class="text-end">
          <b class="block text-brand-red2">{{ hour() }}</b>
          <small class="muted">{{ day() }}</small>
        </div>
      </div>

      <dl class="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <div class="flex gap-2"><dt class="muted shrink-0">{{ T.car }}:</dt><dd class="font-bold">Nissan {{ b.model }} {{ b.generation }} {{ b.year }}{{ b.km ? ' — ' + b.km + ' km' : '' }}</dd></div>
        <div class="flex gap-2"><dt class="muted shrink-0">{{ T.services }}:</dt><dd class="font-bold">{{ services() }}</dd></div>
        @if (b.notes) { <div class="flex gap-2 sm:col-span-2"><dt class="muted shrink-0">{{ T.notes }}:</dt><dd>{{ b.notes }}</dd></div> }
      </dl>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <a [href]="'tel:' + b.phone" class="btn !px-4 !py-2 !text-sm border border-zinc-300 dark:border-ink-600 hover:!translate-y-0">
          <app-icon name="phone" class="w-4 h-4" /><span dir="ltr">{{ b.phone }}</span></a>
        <a [href]="'https://wa.me/2' + b.phone" target="_blank" rel="noopener" class="btn !px-4 !py-2 !text-sm bg-[#25d366] text-white hover:!translate-y-0">
          <app-icon name="wa" class="w-4 h-4" />{{ T.wa }}</a>
        <span class="flex-1"></span>
        @for (s of actions(); track s) {
          <button type="button" [disabled]="busy()" (click)="setStatus(s)"
                  class="btn !px-4 !py-2 !text-sm hover:!translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                  [class]="s === 'Confirmed' || s === 'Done' ? 'btn-red' : 'border border-zinc-300 dark:border-ink-600'">{{ T.action[s] }}</button>
        }
      </div>

      <div class="mt-3 flex items-center gap-2">
        <input class="field !py-2 text-sm" maxlength="1000" [placeholder]="T.notePh" [ngModel]="note()" (ngModelChange)="note.set($event)" (keydown.enter)="saveNote()">
        @if (note() !== (b.adminNote ?? '')) {
          <button type="button" [attr.aria-busy]="busy()" [disabled]="busy()" (click)="saveNote()" class="btn btn-red !px-4 !py-2 !text-sm hover:!translate-y-0 shrink-0">{{ T.save }}</button>
        }
      </div>
      @if (err()) { <p class="mt-2 text-sm font-bold text-brand-red2" role="alert">{{ err() }}</p> }
    </article>
  `,
})
export class BookingCard {
  private readonly api = inject(AdminApi);
  private readonly i = inject(I18n);
  protected readonly t = adminTexts();
  protected readonly cls = STATUS_CLASS;

  readonly booking = input.required<Booking>();
  /** The booking after a change was saved. */
  readonly changed = output<Booking>();

  protected readonly busy = signal(false);
  protected readonly err = signal('');
  protected readonly note = signal('');

  constructor() {
    // fill the note box from the booking (again whenever a saved booking comes back)
    effect(() => { const b = this.booking(); untracked(() => this.note.set(b.adminNote ?? '')); });
  }

  protected readonly day = computed(() => fmtDay(this.booking().date, this.i.isAr()));
  protected readonly hour = computed(() => fmtHour(this.booking().hour, this.i.isAr()));
  protected readonly services = computed(() => {
    const all = this.i.dict().services;
    return this.booking().services.map(s => all.find(x => x.slug === s)?.t ?? s).join(this.i.isAr() ? '، ' : ', ');
  });

  /** Next sensible steps for each status. */
  protected readonly actions = computed<BookingStatus[]>(() => {
    return ({
      New: ['Confirmed', 'Cancelled'], Confirmed: ['Done', 'NoShow', 'Cancelled'],
      Done: [], Cancelled: ['Confirmed'], NoShow: ['Confirmed'],
    } as Record<BookingStatus, BookingStatus[]>)[this.booking().status];
  });

  private readonly confirm = inject(ConfirmService);

  protected async setStatus(status: BookingStatus) {
    const C = this.t().confirm, b = this.booking();
    if (status === 'Cancelled' && !(await this.confirm.ask({
      title: C.cancelTitle, subject: `${b.code} — ${b.name}`, message: C.cancelMsg,
      confirmText: C.cancelBtn, cancelText: C.cancelKeep, icon: 'calX',
    }))) return;
    this.send({ status });
  }

  protected saveNote() { this.send({ adminNote: this.note().trim() }); }

  private send(body: { status?: BookingStatus; adminNote?: string }) {
    this.busy.set(true); this.err.set('');
    this.api.updateBooking(this.booking().id, body).subscribe({
      next: b => { this.busy.set(false); this.note.set(b.adminNote ?? ''); this.changed.emit(b); },
      error: e => {
        this.busy.set(false);
        const T = this.t();
        this.err.set(apiError(e).code === 'slot_full' ? T.bookings.slotFull : T.failed);
      },
    });
  }
}
