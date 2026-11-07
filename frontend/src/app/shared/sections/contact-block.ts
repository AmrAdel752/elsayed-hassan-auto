import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { I18n } from '../../core/i18n.service';
import { SITE } from '../../core/site';
import { Icon } from '../icon';
import { Reveal } from '../reveal.directive';

@Component({
  selector: 'app-contact-block',
  imports: [Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div reveal class="card !rounded-[28px] overflow-hidden grid lg:grid-cols-[1fr_1.2fr]">
      <div class="p-6 md:p-11">
        <h3 class="text-2xl md:text-[28px] font-black mb-5 md:mb-6">{{ i.t('contact.info') }}</h3>
        @for (r of rows; track r.icon) {
          <div class="flex gap-4 mb-5">
            <div class="shrink-0 w-12 h-12 rounded-xl grid place-items-center bg-brand-red/10 text-brand-red2"><app-icon [name]="r.icon" class="w-[22px] h-[22px]" /></div>
            <div>
              <small class="muted block text-[13px]">{{ i.t(r.label) }}</small>
              @if (r.ltr) { <b class="text-[17px] inline-block" dir="ltr">{{ r.ltr }}</b> } @else { <b class="text-[17px]">{{ i.t(r.value!) }}</b> }
              @if (r.icon === 'clock') {
                <br>
                <span class="inline-flex items-center gap-2 mt-1.5 px-3.5 py-1 rounded-full text-[13px] font-bold"
                      [class]="open ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-brand-red/10 text-brand-red2'">
                  <i class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></i>{{ i.t(open ? 'contact.open' : 'contact.closed') }}
                </span>
              }
            </div>
          </div>
        }
        <a class="btn btn-red mt-1 w-full sm:w-auto justify-center" [href]="site.maps" target="_blank"><app-icon name="pin" class="w-5 h-5" />{{ i.t('contact.map') }}</a>
      </div>
      <div class="relative min-h-[280px] md:min-h-[420px]">
        <iframe loading="lazy" [src]="map" [title]="i.t('contact.map')" class="absolute inset-0 w-full h-full border-0 dark:[filter:grayscale(1)_invert(.92)_contrast(.9)_hue-rotate(180deg)]"></iframe>
      </div>
    </div>
  `,
})
export class ContactBlock {
  protected readonly i = inject(I18n);
  protected readonly site = SITE;
  protected readonly map = inject(DomSanitizer).bypassSecurityTrustResourceUrl(SITE.mapEmbed);
  // open 10:00–22:00 Cairo time, every day
  protected readonly open = (() => { const h = +new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo', hour: 'numeric', hour12: false }); return h >= 10 && h < 22; })();
  protected readonly rows: { icon: string; label: string; value?: string; ltr?: string }[] = [
    { icon: 'pin', label: 'contact.addrL', value: 'contact.addr' },
    { icon: 'wa', label: 'contact.waL', ltr: '0108 094 1711' },
    { icon: 'phone', label: 'contact.phL', ltr: '0114 360 461' },
    { icon: 'clock', label: 'contact.hrL', value: 'contact.hours' },
  ];
}
