import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { dueAt } from '../../data/maintenance';
import { PageBanner } from '../../shared/page-banner';
import { Icon } from '../../shared/icon';

const fmt = (n: number) => n.toLocaleString('en-US');

@Component({
  selector: 'app-calculator',
  imports: [FormsModule, RouterLink, PageBanner, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('calc.title')" [subtitle]="i.t('calc.sub')" icon="cal" [crumbs]="[{ label: i.t('nav.calc') }]" />

    <section class="pt-5 pb-20 md:py-20">
      <div class="wrap grid lg:grid-cols-[400px_1fr] gap-6 lg:gap-8 items-start">
        <!-- inputs -->
        <div class="card p-4 sm:p-6 md:p-8 space-y-6 md:space-y-7 lg:sticky lg:top-28">
          <div>
            <span class="lbl">{{ i.t('calc.model') }}</span>
            <div class="grid grid-cols-4 lg:grid-cols-2 gap-1.5 sm:gap-2 [&_button]:text-[11px] sm:[&_button]:text-sm">
              @for (m of models; track m) {
                <button type="button" (click)="model.set(m)"
                        class="rounded-xl border-2 py-2.5 font-[Arial] font-bold text-sm tracking-wide transition hover:border-brand-red/60"
                        [class]="model() === m ? 'border-brand-red bg-brand-red text-white' : 'border-zinc-200 dark:border-ink-600'">{{ m.toUpperCase() }}</button>
              }
            </div>
          </div>

          <div>
            <span class="lbl">{{ i.t('calc.km') }}</span>
            <div class="relative">
              <input type="number" [attr.aria-label]="i.t('calc.km')" min="0" max="400000" step="1000" dir="ltr" class="field text-2xl font-black !py-4 pe-14"
                     [ngModel]="km()" (ngModelChange)="km.set(clamp($event))">
              <span class="absolute top-1/2 -translate-y-1/2 end-4 muted font-bold">{{ i.t('calc.unit') }}</span>
            </div>
            <input type="range" [attr.aria-label]="i.t('calc.km')" min="0" max="250000" step="1000" class="w-full mt-4 accent-[#dc2f36]" dir="ltr"
                   [ngModel]="km()" (ngModelChange)="km.set(+$event)">
            <div class="flex justify-between text-xs muted mt-1" dir="ltr"><span>0</span><span>125,000</span><span>250,000</span></div>
          </div>

          <div>
            <span class="lbl">{{ i.t('calc.driving') }}</span>
            <div class="grid grid-cols-2 gap-2">
              @for (d of [false, true]; track d) {
                <button type="button" (click)="severe.set(d)"
                        class="rounded-xl border-2 p-3 text-start transition hover:border-brand-red/60"
                        [class]="severe() === d ? 'border-brand-red bg-brand-red/5' : 'border-zinc-200 dark:border-ink-600'">
                  <b class="block" [class.text-brand-red2]="severe() === d">{{ i.t(d ? 'calc.severe' : 'calc.normal') }}</b>
                  <small class="muted text-xs">{{ i.t(d ? 'calc.severeSub' : 'calc.normalSub') }}</small>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- result -->
        @if (model()) {
          <!-- phones: the result sits below the inputs, so keep its headline pinned above the tab bar -->
          <button type="button" (click)="toResult()" class="lg:hidden fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-[55] flex items-center gap-3 px-4 py-2.5 text-start bg-ink-900/95 text-white backdrop-blur border-t border-brand-red/40">
            <span class="ic-red w-10 h-10 rounded-xl shrink-0"><app-icon name="cal" class="w-5 h-5" /></span>
            <span class="flex-1 min-w-0">
              <small class="block text-[11px] text-zinc-400 font-bold">{{ i.t('calc.next') }} — {{ i.dict().calc.itemsCount(items().length) }}</small>
              <b class="gold-text text-lg font-black" dir="ltr">{{ fmt(next()) }} km</b>
            </span>
            <app-icon name="arrow" class="w-5 h-5 rotate-90" />
          </button>
          <div #result class="space-y-5 md:space-y-6 scroll-mt-24">
            <div class="relative overflow-hidden rounded-[24px] md:rounded-[28px] p-5 sm:p-7 md:p-10 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30">
              <div class="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-brand-red/30 blur-3xl"></div>
              <div class="relative flex flex-wrap items-end justify-between gap-6 mb-7">
                <div>
                  <small class="text-zinc-400 font-bold">{{ i.t('calc.next') }} — Nissan {{ model() }}</small>
                  <div class="flex items-baseline gap-2 mt-1" dir="ltr">
                    <b class="text-4xl sm:text-5xl md:text-6xl font-black gold-text">{{ fmt(next()) }}</b><span class="text-xl text-zinc-400 font-bold">km</span>
                  </div>
                </div>
                <span class="px-4 py-2 rounded-full font-black text-sm" [class]="left() === 0 ? 'bg-brand-red text-white animate-pulse' : 'bg-white/10'">
                  {{ left() === 0 ? i.t('calc.now') : i.dict().calc.left(fmt(left())) }}
                </span>
              </div>
              <div class="relative h-3 rounded-full bg-white/10 overflow-hidden" dir="ltr">
                <div class="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-red2 transition-all duration-500" [style.width.%]="progress()"></div>
              </div>
              <div class="relative flex justify-between text-xs text-zinc-500 mt-2 font-bold" dir="ltr"><span>{{ fmt(next() - step()) }}</span><span>{{ fmt(next()) }}</span></div>
            </div>

            <div class="card p-4 sm:p-6 md:p-8">
              <h2 class="text-lg md:text-xl font-black mb-4 md:mb-5">{{ i.t('calc.items') }} <span class="muted font-bold text-base">({{ i.dict().calc.itemsCount(items().length) }})</span></h2>
              <ul class="grid sm:grid-cols-2 gap-3">
                @for (it of items(); track it.id) {
                  <li class="flex items-center gap-3 rounded-2xl border border-zinc-200 dark:border-ink-600 p-3.5">
                    <span class="w-10 h-10 shrink-0 rounded-xl grid place-items-center bg-brand-red/10 text-brand-red2"><app-icon [name]="it.icon" class="w-5 h-5" /></span>
                    <b class="text-[15px]">{{ i.l(it.name) }}</b>
                  </li>
                }
              </ul>
              <div class="grid sm:grid-cols-2 gap-3 mt-7">
                <a routerLink="/book" [queryParams]="{ service: 'maintenance' }" class="btn btn-red justify-center"><app-icon name="cal" class="w-5 h-5" />{{ i.t('calc.book') }}</a>
                <a [href]="wa()" target="_blank" class="btn justify-center bg-[#25d366] text-white"><app-icon name="wa" class="w-5 h-5" />{{ i.t('calc.wa') }}</a>
              </div>
            </div>

            <div>
              <h2 class="text-xl font-black mb-4">{{ i.t('calc.upcoming') }}</h2>
              <div class="grid sm:grid-cols-3 gap-4">
                @for (u of upcoming(); track u.at) {
                  <div class="card p-5">
                    <b class="block text-2xl font-black mb-1" dir="ltr" [style.text-align]="i.isAr() ? 'right' : 'left'">{{ fmt(u.at) }} <small class="muted text-sm">km</small></b>
                    <small class="text-brand-red2 font-bold">{{ i.dict().calc.itemsCount(u.items.length) }}</small>
                    <p class="muted text-sm mt-2 line-clamp-2">{{ u.names }}</p>
                  </div>
                }
              </div>
            </div>
            <p class="muted text-xs">{{ i.t('calc.note') }}</p>
          </div>
        } @else {
          <div class="card p-14 text-center grid place-items-center min-h-[360px]">
            <div><app-icon name="car" class="w-20 h-20 mx-auto mb-5 text-brand-red2/70" /><p class="font-bold text-lg">{{ i.t('calc.pick') }}</p></div>
          </div>
        }
      </div>
    </section>
  `,
})
export class Calculator implements OnInit {
  protected readonly i = inject(I18n);
  protected readonly models = SITE.models;
  protected readonly fmt = fmt;

  /** Optional `?model=Name` from a model page. */
  readonly modelParam = input<string>(undefined, { alias: 'model' });
  protected readonly model = signal('');
  protected readonly km = signal(35000);
  protected readonly severe = signal(true);

  protected readonly step = computed(() => (this.severe() ? 5000 : 10000));
  protected readonly next = computed(() => Math.max(this.step(), Math.ceil(this.km() / this.step()) * this.step()));
  protected readonly left = computed(() => this.next() - this.km());
  protected readonly progress = computed(() => ((this.step() - this.left()) / this.step()) * 100);
  protected readonly items = computed(() => dueAt(this.next(), this.model(), this.severe()));
  protected readonly upcoming = computed(() => [1, 2, 3].map(k => {
    const at = this.next() + k * this.step(), items = dueAt(at, this.model(), this.severe());
    return { at, items, names: items.map(x => this.i.l(x.name)).join(' • ') };
  }));
  protected readonly wa = computed(() => waLink(this.i.dict().calc.msg({
    at: fmt(this.next()), model: this.model(), km: fmt(this.km()),
    items: this.items().map(x => `• ${this.i.l(x.name)}`).join('\n'),
  })));

  ngOnInit() {
    const m = this.modelParam();
    if (m && this.models.includes(m)) this.model.set(m);
  }

  private readonly resultEl = viewChild<ElementRef<HTMLElement>>('result');
  protected toResult() { this.resultEl()?.nativeElement.scrollIntoView({ behavior: 'smooth' }); }

  protected clamp(v: unknown) { return Math.min(400000, Math.max(0, Math.round(+(v as number) || 0))); }
}
