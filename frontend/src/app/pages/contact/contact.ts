import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { PageBanner } from '../../shared/page-banner';
import { ContactBlock } from '../../shared/sections/contact-block';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, PageBanner, ContactBlock, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('cpage.title')" [subtitle]="i.t('cpage.sub')" icon="phone" [crumbs]="[{ label: i.t('nav.contact') }]" />

    <!-- quick contact cards -->
    <section class="py-6 md:py-20">
      <div class="wrap grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        @for (q of i.dict().cpage.quick; track q.icon; let n = $index) {
          <a [href]="hrefs[n]" target="_blank" [reveal]="n * .1"
             class="card group relative overflow-hidden p-4 sm:p-7 text-center transition duration-300 hover:-translate-y-2 hover:border-brand-red/50">
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(300px_160px_at_50%_0,rgba(220,47,54,.15),transparent_70%)]"></div>
            <div class="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-5 rounded-2xl grid place-items-center text-white transition group-hover:scale-110"
                 [class]="n === 0 ? 'bg-[#25d366] shadow-[0_12px_30px_-10px_rgba(37,211,102,.8)]' : n === 3 ? 'bg-[#1877f2] shadow-[0_12px_30px_-10px_rgba(24,119,242,.8)]' : 'ic-red'">
              <app-icon [name]="q.icon" class="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 class="relative text-base sm:text-xl font-extrabold mb-1">{{ q.t }}</h3>
            <p class="relative muted text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{{ q.d }}</p>
            @if (n === 1) { <b class="relative block mb-2 sm:mb-3 text-sm sm:text-lg" dir="ltr">{{ site.phone }}</b> }
            <span class="relative inline-flex items-center gap-1.5 text-sm font-bold text-brand-dgold dark:text-brand-gold">{{ q.cta }}<app-icon name="arrow" class="w-4 h-4 rtl:rotate-180" /></span>
          </a>
        }
      </div>
    </section>

    <!-- info + map -->
    <section class="pb-10 md:pb-20"><div class="wrap"><app-contact-block /></div></section>

    <!-- message form -->
    <section class="pb-14 md:pb-28">
      <div class="wrap max-w-[760px]">
        <form #f="ngForm" (ngSubmit)="send(f)" reveal class="card relative overflow-hidden p-6 md:p-10 space-y-5">
          <div class="absolute -top-24 -end-24 w-60 h-60 rounded-full bg-brand-red/20 blur-3xl pointer-events-none"></div>
          <div class="relative">
            <h2 class="text-2xl font-black">{{ i.t('cpage.form.h') }}</h2>
            <p class="muted text-sm">{{ i.t('cpage.form.sub') }}</p>
          </div>
          <label class="relative block"><span class="lbl">{{ i.t('cpage.form.name') }}</span><input name="name" ngModel required class="field"></label>
          <div class="relative">
            <span class="lbl">{{ i.t('cpage.form.topic') }}</span>
            <div class="flex flex-wrap gap-2">
              @for (t of i.dict().cpage.form.topics; track t) {
                <label class="cursor-pointer">
                  <input type="radio" name="topic" [value]="t" ngModel required class="peer sr-only">
                  <span class="block px-4 py-2 rounded-full border-2 text-sm font-bold transition border-zinc-200 dark:border-ink-600 peer-checked:border-brand-red peer-checked:bg-brand-red peer-checked:text-white hover:border-brand-red/50">{{ t }}</span>
                </label>
              }
            </div>
          </div>
          <label class="relative block"><span class="lbl">{{ i.t('cpage.form.msg') }}</span>
            <textarea name="msg" ngModel required rows="5" class="field resize-none" [placeholder]="i.t('cpage.form.phMsg')"></textarea></label>
          <button type="submit" [disabled]="f.invalid" class="btn btn-red relative w-full justify-center !py-4 disabled:opacity-40"><app-icon name="wa" class="w-5 h-5" />{{ i.t('cpage.form.send') }}</button>
        </form>
      </div>
    </section>
  `,
})
export class Contact {
  protected readonly i = inject(I18n);
  protected readonly site = SITE;
  protected readonly hrefs = [waLink(), `tel:${SITE.phone}`, SITE.maps, SITE.facebook];

  send(f: NgForm) {
    if (f.invalid) return;
    window.open(waLink(this.i.dict().cpage.wa(f.value)), '_blank');
  }
}
