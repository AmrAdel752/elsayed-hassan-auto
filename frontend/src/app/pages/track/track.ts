import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { Job, SAMPLE_CODES, STAGES, findJob } from '../../data/tracking';
import { PageBanner } from '../../shared/page-banner';
import { Icon } from '../../shared/icon';

const STAGE_ICONS = ['cal', 'car', 'cpu', 'tag', 'engine', 'shield', 'check'];

@Component({
  selector: 'app-track',
  imports: [FormsModule, PageBanner, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('track.title')" [subtitle]="i.t('track.sub')" icon="search" [crumbs]="[{ label: i.t('nav.track') }]" />

    <section class="pt-5 pb-14 md:py-20">
      <div class="wrap max-w-[920px]">
        <!-- search -->
        <form (ngSubmit)="search()" class="card p-5 md:p-7 relative overflow-hidden">
          <div class="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-brand-red/15 blur-3xl pointer-events-none"></div>
          <label for="track-code" class="relative lbl">{{ i.t('track.label') }}</label>
          <div class="relative flex gap-2 sm:gap-3">
            <input name="code" id="track-code" dir="ltr" class="field flex-1 min-w-0 text-lg sm:text-xl font-black tracking-widest uppercase !py-3 sm:!py-4" [placeholder]="i.t('track.ph')"
                   [ngModel]="code()" (ngModelChange)="code.set($event)">
            <button type="submit" class="btn btn-red justify-center !px-4 sm:!px-10 shrink-0"><app-icon name="search" class="w-5 h-5" /><span class="hidden sm:inline">{{ i.t('track.btn') }}</span></button>
          </div>
          <p class="relative muted text-sm mt-3 flex flex-wrap items-center gap-2">
            {{ i.t('track.try') }}
            @for (c of samples; track c) {
              <button type="button" (click)="code.set(c); search()" dir="ltr" class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 font-bold text-xs hover:text-brand-red2">{{ c }}</button>
            }
          </p>
        </form>

        @if (searched() && !job()) {
          <div class="card p-8 mt-5 md:mt-6 text-center"><app-icon name="search" class="w-12 h-12 mx-auto mb-3 muted" /><p class="font-bold">{{ i.t('track.notFound') }}</p></div>
        }

        @if (job(); as j) {
          <!-- status header -->
          <div class="mt-5 md:mt-8 relative overflow-hidden rounded-[24px] md:rounded-[28px] p-5 sm:p-7 md:p-9 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30">
            <div class="absolute -top-24 -end-24 w-72 h-72 rounded-full blur-3xl" [class]="done() ? 'bg-emerald-500/30' : 'bg-brand-red/30'"></div>
            <div class="relative flex flex-wrap items-start justify-between gap-6 mb-7">
              <div>
                <small class="text-zinc-400 font-bold">{{ i.t('track.current') }}</small>
                <h2 class="text-2xl md:text-4xl font-black mt-1 flex items-center gap-3">
                  <span class="w-3 h-3 rounded-full animate-pulse" [class]="done() ? 'bg-emerald-400' : 'bg-brand-red2'"></span>{{ stageText(j.stage)[0] }}
                </h2>
                <p class="text-zinc-400 mt-1">{{ stageText(j.stage)[1] }}</p>
              </div>
              <div class="text-end">
                <b class="block font-black tracking-widest gold-text text-xl" dir="ltr">{{ j.code }}</b>
                <small class="text-zinc-400 font-[Arial] font-bold">NISSAN {{ j.model.toUpperCase() }} {{ j.year }}</small>
              </div>
            </div>
            <div class="relative flex justify-between text-xs font-bold text-zinc-400 mb-2"><span>{{ i.t('track.progress') }}</span><span dir="ltr">{{ pct() }}%</span></div>
            <div class="relative h-3 rounded-full bg-white/10 overflow-hidden" dir="ltr">
              <div class="h-full rounded-full transition-all duration-1000" [style.width.%]="pct()"
                   [class]="done() ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-brand-gold to-brand-red2'"></div>
            </div>
          </div>

          <div class="grid lg:grid-cols-[1fr_320px] gap-4 md:gap-6 mt-4 md:mt-6 items-start">
            <!-- timeline -->
            <ol class="card p-4 sm:p-6 md:p-8">
              @for (s of stages; track s; let n = $index, last = $last) {
                @let reached = n <= j.stage;
                @let isNow = n === j.stage;
                <li class="relative flex gap-4" [class.pb-7]="!last">
                  @if (!last) { <span class="absolute top-12 start-[21px] bottom-0 w-0.5" [class]="n < j.stage ? 'bg-brand-red' : 'bg-zinc-200 dark:bg-ink-600'"></span> }
                  <span class="relative w-11 h-11 shrink-0 rounded-full grid place-items-center border-2 transition"
                        [class]="isNow ? (done() ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-brand-red border-brand-red text-white shadow-[0_0_0_6px_rgba(220,47,54,.15)]') : reached ? 'border-brand-red text-brand-red2' : 'border-zinc-200 dark:border-ink-600 muted'">
                    <app-icon [name]="icons[n]" class="w-5 h-5" />
                  </span>
                  <div class="flex-1 pt-1.5" [class.opacity-50]="!reached">
                    <div class="flex flex-wrap justify-between gap-x-3">
                      <b [class.text-brand-red2]="isNow && !done()" [class.text-emerald-500]="isNow && done()">{{ stageText(n)[0] }}</b>
                      @if (j.times[n]) { <small class="muted text-xs font-bold" dir="ltr">{{ fmt(j.times[n]) }}</small> }
                    </div>
                    <p class="muted text-sm">{{ stageText(n)[1] }}</p>
                  </div>
                </li>
              }
            </ol>

            <!-- side info -->
            <aside class="space-y-4">
              <div class="card p-6 space-y-4">
                <div><small class="muted block text-xs">{{ i.t('track.services') }}</small><b>{{ serviceNames() }}</b></div>
                @if (j.eta && !done()) { <div><small class="muted block text-xs">{{ i.t('track.eta') }}</small><b dir="ltr" class="inline-block">{{ fmt(j.eta) }}</b></div> }
                @if (j.tech) { <div><small class="muted block text-xs">{{ i.t('track.tech') }}</small><b>{{ i.l(j.tech) }}</b></div> }
              </div>
              @if (j.note) {
                <div class="card p-6 border-s-4 !border-s-brand-red">
                  <small class="text-brand-red2 font-bold text-xs flex items-center gap-1.5 mb-2"><app-icon name="engine" class="w-4 h-4" />{{ i.t('track.note') }}</small>
                  <p class="font-bold">{{ i.l(j.note) }}</p>
                </div>
              }
              <a [href]="wa()" target="_blank" class="btn w-full justify-center bg-[#25d366] text-white"><app-icon name="wa" class="w-5 h-5" />{{ i.t('track.ask') }}</a>
              <a [href]="'tel:' + phone" class="btn btn-ghost w-full justify-center"><app-icon name="phone" class="w-5 h-5" />{{ i.t('track.call') }}</a>
            </aside>
          </div>
        }
      </div>
    </section>
  `,
})
export class Track implements OnInit {
  protected readonly i = inject(I18n);
  protected readonly stages = STAGES;
  protected readonly icons = STAGE_ICONS;
  protected readonly samples = SAMPLE_CODES;
  protected readonly phone = SITE.phone;
  /** Optional `?code=` prefill (e.g. from the booking success screen). */
  readonly codeParam = input<string>(undefined, { alias: 'code' });

  protected readonly code = signal('');
  protected readonly searched = signal(false);
  protected readonly job = signal<Job | undefined>(undefined);

  protected readonly done = computed(() => this.job()?.stage === STAGES.length - 1);
  protected readonly pct = computed(() => Math.round(((this.job()?.stage ?? 0) / (STAGES.length - 1)) * 100));
  protected readonly serviceNames = computed(() => this.i.dict().services
    .filter(s => this.job()?.services.includes(s.slug)).map(s => s.t).join(' • '));
  protected readonly wa = computed(() => waLink(this.i.dict().track.msg(this.job()?.code ?? '')));

  ngOnInit() {
    const c = this.codeParam();
    if (c) { this.code.set(c); this.search(); }
  }

  protected search() {
    this.job.set(findJob(this.code()));
    this.searched.set(true);
  }

  protected stageText(n: number): string[] {
    return (this.i.dict().track.stages as Record<string, string[]>)[STAGES[n]];
  }

  protected fmt(iso: string) {
    return new Date(iso).toLocaleString(this.i.isAr() ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  }
}
