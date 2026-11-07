import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { Icon } from '../icon';
import { Reveal } from '../reveal.directive';

@Component({
  selector: 'app-booking-form',
  imports: [FormsModule, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap grid lg:grid-cols-[.9fr_1.1fr] gap-8 lg:gap-12 items-center">
      <div reveal>
        <span class="tag">{{ i.t('home.bk.tag') }}</span>
        <h2 class="h2" [innerHTML]="i.t('home.bk.h')"></h2>
        <p class="muted text-base md:text-[17px] mb-6 md:mb-8">{{ i.t('home.bk.p') }}</p>
        <ol class="space-y-4 md:space-y-6">
          @for (s of i.dict().home.bk.steps; track $index; let n = $index, last = $last) {
            <li class="relative flex gap-4 items-start">
              @if (!last) { <span class="absolute top-14 start-6 h-[calc(100%-32px)] border-s-2 border-dashed border-brand-red/40"></span> }
              <div class="shrink-0 w-12 h-12 rounded-full grid place-items-center text-lg font-black text-brand-red2 bg-zinc-50 dark:bg-ink-900 border-2 border-brand-red shadow-[0_0_24px_rgba(220,47,54,.35)]">{{ n + 1 }}</div>
              <div><h4 class="text-lg font-extrabold">{{ s[0] }}</h4><p class="muted text-[15px]">{{ s[1] }}</p></div>
            </li>
          }
        </ol>
      </div>

      <form #f="ngForm" (ngSubmit)="send(f)" [reveal]=".15" class="card relative overflow-hidden p-6 md:p-9 space-y-4">
        <div class="absolute -top-24 -end-24 w-60 h-60 rounded-full bg-brand-red/20 blur-3xl pointer-events-none"></div>
        <div class="relative flex items-center gap-3 mb-2">
          <div class="ic-red w-12 h-12 rounded-2xl"><app-icon name="cal" class="w-6 h-6" /></div>
          <h3 class="text-2xl font-black">{{ i.t('home.bk.form') }}</h3>
        </div>
        <div class="relative grid sm:grid-cols-2 gap-4">
          <label><span class="lbl">{{ i.t('home.bk.name') }}</span><input name="name" ngModel required class="field" [placeholder]="i.t('home.bk.phName')"></label>
          <label><span class="lbl">{{ i.t('home.bk.model') }}</span>
            <select name="model" ngModel required class="field">
              <option value="" disabled>{{ i.t('common.choose') }}</option>
              @for (m of models; track m) { <option>{{ m }}</option> }
              <option>{{ i.t('common.other') }}</option>
            </select>
          </label>
          <label><span class="lbl">{{ i.t('home.bk.service') }}</span>
            <select name="service" ngModel required class="field">
              <option value="" disabled>{{ i.t('common.choose') }}</option>
              @for (s of i.dict().services; track s.slug) { <option>{{ s.t }}</option> }
            </select>
          </label>
          <label><span class="lbl">{{ i.t('home.bk.date') }}</span><input name="date" type="date" ngModel required [min]="today" class="field"></label>
        </div>
        <label class="relative block"><span class="lbl">{{ i.t('home.bk.notes') }}</span>
          <textarea name="notes" ngModel rows="3" class="field resize-none" [placeholder]="i.t('home.bk.phNotes')"></textarea></label>
        <button type="submit" class="btn btn-red relative w-full justify-center !py-4 text-lg"><app-icon name="wa" class="w-5 h-5" />{{ i.t('home.bk.submit') }}</button>
        <p class="relative muted text-xs text-center">{{ i.t('home.bk.hint') }}</p>
      </form>
    </div>
  `,
})
export class BookingForm {
  protected readonly i = inject(I18n);
  protected readonly models = SITE.models;
  protected readonly today = new Date().toISOString().slice(0, 10);

  send(f: NgForm) {
    if (f.invalid) { f.control.markAllAsTouched(); return; }
    window.open(waLink(this.i.dict().home.bk.msg(f.value)), '_blank');
  }
}
