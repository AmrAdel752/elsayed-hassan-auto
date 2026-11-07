import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { Icon } from '../icon';
import { Reveal } from '../reveal.directive';

/** Hotspot positions in the SVG's 800×320 coordinate space, keyed by service slug. */
const SPOTS = [
  { slug: 'mechanics', x: 668, y: 160 },
  { slug: 'oils', x: 600, y: 200 },
  { slug: 'ac', x: 500, y: 124 },
  { slug: 'suspension', x: 645, y: 240 },
  { slug: 'maintenance', x: 390, y: 192 },
  { slug: 'parts', x: 108, y: 182 },
];

@Component({
  selector: 'app-car-explorer',
  imports: [RouterLink, Icon, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div reveal class="sec-head">
        <span class="tag">{{ i.t('car.tag') }}</span>
        <h2 class="h2" [innerHTML]="i.t('car.h')"></h2>
        <p class="muted text-base md:text-[17px]">{{ i.t('car.p') }}</p>
      </div>

      <div class="grid lg:grid-cols-[1.35fr_1fr] gap-6 lg:gap-10 items-center">
        <!-- car (min-w-0: the swipeable chip row must not stretch the grid column) -->
        <div reveal class="min-w-0">
          <div class="relative" dir="ltr">
            <svg viewBox="0 0 800 320" class="w-full h-auto drop-shadow-[0_25px_30px_rgba(0,0,0,.25)]" aria-hidden="true">
              <defs>
                <linearGradient id="cx-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#f2474d" /><stop offset=".55" stop-color="#dc2f36" /><stop offset="1" stop-color="#8f1a20" />
                </linearGradient>
                <linearGradient id="cx-glass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#2a2f3a" /><stop offset="1" stop-color="#0f1116" />
                </linearGradient>
                <radialGradient id="cx-rim"><stop offset="0" stop-color="#e5e7eb" /><stop offset="1" stop-color="#9ca3af" /></radialGradient>
              </defs>
              <ellipse cx="420" cy="292" rx="350" ry="16" fill="currentColor" class="text-zinc-300 dark:text-black/60" />
              <!-- body -->
              <path d="M58 212 Q58 172 108 162 L232 150 Q296 96 384 88 L522 88 Q586 92 646 142 L722 156 Q764 164 768 198 L768 226 Q768 242 748 242 L702 242 A57 57 0 0 0 588 242 L272 242 A57 57 0 0 0 158 242 L80 242 Q58 242 58 226 Z" fill="url(#cx-body)" />
              <!-- belt line + door seams -->
              <path d="M110 186 L760 186" stroke="#fff" stroke-opacity=".18" stroke-width="2" fill="none" />
              <path d="M452 152 L448 238 M300 155 L296 236" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none" />
              <!-- windows -->
              <path d="M258 150 Q304 106 382 100 L440 100 L440 150 Z" fill="url(#cx-glass)" />
              <path d="M456 100 L518 100 Q572 104 616 142 L456 150 Z" fill="url(#cx-glass)" />
              <path d="M268 146 Q306 112 360 106" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round" />
              <!-- lights -->
              <path d="M722 166 L760 176 L758 192 L722 186 Z" fill="#fde68a" />
              <rect x="60" y="172" width="16" height="22" rx="4" fill="#7f1d1d" />
              <!-- handles -->
              <rect x="400" y="166" width="28" height="5" rx="2.5" fill="#fff" fill-opacity=".5" />
              <rect x="560" y="166" width="28" height="5" rx="2.5" fill="#fff" fill-opacity=".5" />
              <!-- wheels -->
              @for (wx of [215, 645]; track wx) {
                <circle [attr.cx]="wx" cy="242" r="50" fill="#111318" />
                <circle [attr.cx]="wx" cy="242" r="30" fill="url(#cx-rim)" />
                <circle [attr.cx]="wx" cy="242" r="9" fill="#4b5563" />
                @for (a of [0, 72, 144, 216, 288]; track a) {
                  <line [attr.x1]="wx" y1="242" [attr.x2]="wx" y2="216" stroke="#6b7280" stroke-width="5" stroke-linecap="round" [attr.transform]="'rotate(' + a + ' ' + wx + ' 242)'" />
                }
              }
            </svg>

            <!-- hotspots (positioned in % of the 800×320 drawing) -->
            @for (s of spots; track s.slug) {
              @let on = active() === s.slug;
              <button type="button" (click)="active.set(s.slug)" [attr.aria-label]="part(s.slug)"
                      class="absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full transition"
                      [style.left.%]="s.x / 8" [style.top.%]="s.y / 3.2">
                <span class="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-brand-red2/40 animate-ping" [class.hidden]="on"></span>
                <span class="relative grid place-items-center rounded-full border-[3px] border-white shadow-lg transition"
                      [class]="on ? 'w-10 h-10 sm:w-12 sm:h-12 bg-brand-red text-white scale-110' : 'w-6 h-6 sm:w-7 sm:h-7 bg-brand-red2'">
                  @if (on) { <app-icon [name]="svc(s.slug)?.icon ?? 'engine'" class="w-5 h-5 sm:w-6 sm:h-6" /> }
                </span>
              </button>
            }
          </div>
          <p class="muted text-xs text-center mt-3 flex items-center justify-center gap-1.5"><span class="w-2 h-2 rounded-full bg-brand-red2 animate-pulse"></span>{{ i.t('car.hint') }}</p>

          <!-- part chips (easier to tap on phones) -->
          <div class="flex gap-2 overflow-x-auto mt-4 pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:justify-center [scrollbar-width:none]">
            @for (s of spots; track s.slug) {
              <button type="button" (click)="active.set(s.slug)"
                      class="shrink-0 px-3.5 py-2 rounded-full border-2 text-xs sm:text-sm font-bold transition"
                      [class]="active() === s.slug ? 'bg-brand-red border-brand-red text-white' : 'border-zinc-200 dark:border-ink-600 hover:border-brand-red/50'">{{ part(s.slug) }}</button>
            }
          </div>
        </div>

        <!-- selected service -->
        @if (current(); as c) {
          <div reveal class="relative overflow-hidden rounded-[24px] p-6 md:p-8 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30">
            <div class="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-brand-red/30 blur-3xl"></div>
            <small class="relative text-[#ff9599] font-bold text-sm">{{ part(c.slug) }}</small>
            <div class="relative flex items-center gap-3 mt-2 mb-3">
              <span class="ic-red w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0"><app-icon [name]="c.icon" class="w-6 h-6 md:w-7 md:h-7" /></span>
              <h3 class="text-2xl md:text-3xl font-black">{{ c.t }}</h3>
            </div>
            <p class="relative text-zinc-400 mb-5">{{ c.d }}</p>
            <ul class="relative space-y-2 mb-6">
              @for (x of c.includes.slice(0, 4); track x) {
                <li class="flex items-center gap-2 text-sm"><app-icon name="check" class="w-4 h-4 text-emerald-400" />{{ x }}</li>
              }
            </ul>
            <div class="relative grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5 [&_.btn]:whitespace-nowrap">
              <a routerLink="/book" [queryParams]="{ service: c.slug }" class="btn btn-red justify-center !py-3"><app-icon name="cal" class="w-5 h-5" />{{ i.t('car.book') }}</a>
              <a [routerLink]="['/services', c.slug]" class="btn justify-center !py-3 border border-white/25 hover:bg-white/10">{{ i.t('car.details') }}<app-icon name="arrow" class="w-5 h-5 rtl:rotate-180" /></a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CarExplorer {
  protected readonly i = inject(I18n);
  protected readonly spots = SPOTS;
  protected readonly active = signal('mechanics');
  protected readonly current = computed(() => this.svc(this.active()));

  protected svc(slug: string) { return this.i.dict().services.find(s => s.slug === slug); }
  protected part(slug: string): string { return (this.i.dict().car.parts as Record<string, string>)[slug]; }
}
