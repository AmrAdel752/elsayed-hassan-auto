import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { SITE, waLink } from '../../core/site';
import { ALT_FACTOR, JOBS, MODEL_FACTOR, round50 } from '../../data/pricing';
import { PageBanner } from '../../shared/page-banner';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-estimate',
  imports: [RouterLink, PageBanner, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('est.title')" [subtitle]="i.t('est.sub')" icon="tag" [crumbs]="[{ label: i.t('nav.estimate') }]" />

    <section class="pt-5 pb-20 md:py-20">
      <div class="wrap grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        <div class="space-y-4 md:space-y-6">
          <!-- car + parts type -->
          <div class="card p-4 sm:p-6 md:p-8 grid md:grid-cols-[1.4fr_1fr] gap-5 md:gap-7">
            <div>
              <span class="lbl">{{ i.t('est.model') }}</span>
              <div class="grid grid-cols-4 gap-2">
                @for (m of models; track m) {
                  <button type="button" (click)="model.set(m)"
                          class="rounded-xl border-2 py-2.5 font-[Arial] font-bold text-xs tracking-wide transition hover:border-brand-red/60"
                          [class]="model() === m ? 'border-brand-red bg-brand-red text-white' : 'border-zinc-200 dark:border-ink-600'">{{ m.toUpperCase() }}</button>
                }
              </div>
            </div>
            <div>
              <span class="lbl">{{ i.t('est.parts') }}</span>
              <div class="grid grid-cols-2 md:grid-cols-1 gap-2">
                @for (g of [true, false]; track g) {
                  <button type="button" (click)="genuine.set(g)" class="rounded-xl border-2 px-4 py-2.5 text-start transition hover:border-brand-red/60"
                          [class]="genuine() === g ? 'border-brand-red bg-brand-red/5' : 'border-zinc-200 dark:border-ink-600'">
                    <b class="block text-sm" [class.text-brand-red2]="genuine() === g">{{ i.t(g ? 'est.genuine' : 'est.alt') }}</b>
                    <small class="muted text-xs">{{ i.t(g ? 'est.genuineSub' : 'est.altSub') }}</small>
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- jobs grouped by service -->
          <div class="card p-4 sm:p-6 md:p-8">
            <h2 class="text-lg md:text-xl font-black mb-4 md:mb-5">{{ i.t('est.jobs') }}</h2>
            <div class="space-y-6">
              @for (g of groups(); track g.slug) {
                <div>
                  <div class="flex items-center gap-2.5 mb-3">
                    <span class="ic-red w-9 h-9 rounded-xl"><app-icon [name]="g.icon" class="w-5 h-5" /></span><b class="text-lg">{{ g.t }}</b>
                  </div>
                  <div class="grid sm:grid-cols-2 gap-2.5">
                    @for (j of g.jobs; track j.id) {
                      @let on = picked().includes(j.id);
                      <button type="button" (click)="toggle(j.id)"
                              class="flex items-center gap-3 rounded-xl border-2 p-3 text-start transition hover:border-brand-red/60"
                              [class]="on ? 'border-brand-red bg-brand-red/5' : 'border-zinc-200 dark:border-ink-600'">
                        <span class="w-6 h-6 shrink-0 rounded-md border-2 grid place-items-center" [class]="on ? 'bg-brand-red border-brand-red text-white' : 'border-zinc-300 dark:border-ink-600'">
                          @if (on) { <app-icon name="check" class="w-4 h-4" /> }
                        </span>
                        <span class="flex-1 font-bold text-sm">{{ i.l(j.name) }}</span>
                        <small class="muted text-xs font-bold whitespace-nowrap" dir="ltr">{{ short(price(j.min)) }}–{{ short(price(j.max)) }}</small>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- phones: running total pinned above the tab bar; tap to jump to the full summary -->
        @if (lines().length) {
          <button type="button" (click)="toSummary()" class="lg:hidden fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-[55] flex items-center gap-3 px-4 py-2.5 text-start bg-ink-900/95 text-white backdrop-blur border-t border-brand-red/40">
            <span class="flex-1 min-w-0">
              <small class="block text-[11px] text-zinc-400 font-bold">{{ i.t('est.total') }} — {{ i.dict().est.count(lines().length) }}</small>
              <b class="gold-text font-black whitespace-nowrap">{{ i.price(total().min) }} – {{ i.price(total().max) }}</b>
            </span>
            <span class="px-3 py-2 rounded-full bg-brand-red text-xs font-black whitespace-nowrap">{{ i.t('est.summary') }}</span>
          </button>
        }

        <!-- summary -->
        <aside #summary class="lg:sticky lg:top-28 scroll-mt-24">
          <div class="relative overflow-hidden rounded-[24px] p-6 md:p-7 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30">
            <div class="absolute -top-20 -end-20 w-56 h-56 rounded-full bg-brand-red/30 blur-3xl"></div>
            <div class="relative flex items-center justify-between mb-5">
              <h3 class="text-lg font-black">{{ i.t('est.summary') }}</h3>
              <small class="text-zinc-400 font-[Arial] font-bold">NISSAN {{ model().toUpperCase() }}</small>
            </div>
            @if (lines().length) {
              <ul class="relative space-y-2.5 mb-5 max-h-[260px] overflow-y-auto pe-1">
                @for (l of lines(); track l.id) {
                  <li class="flex justify-between gap-3 text-sm">
                    <span class="text-zinc-300">{{ l.name }}</span>
                    <b class="whitespace-nowrap" dir="ltr">{{ short(l.min) }}–{{ short(l.max) }}</b>
                  </li>
                }
              </ul>
              <div class="relative border-t border-white/10 pt-5 mb-6">
                <small class="text-zinc-400 font-bold">{{ i.t('est.total') }} <span class="text-zinc-500">({{ i.dict().est.count(lines().length) }})</span></small>
                <b class="block text-3xl font-black gold-text mt-1">{{ i.price(total().min) }}</b>
                <small class="text-zinc-400">{{ i.t('est.to') }} <b class="text-white">{{ i.price(total().max) }}</b></small>
              </div>
              <a [href]="wa()" target="_blank" class="btn relative w-full justify-center bg-[#25d366] text-white !py-3"><app-icon name="wa" class="w-5 h-5" />{{ i.t('est.quote') }}</a>
              <a routerLink="/book" [queryParams]="{ model: model() }" class="btn relative w-full justify-center mt-3 border border-white/30 !py-3"><app-icon name="cal" class="w-5 h-5" />{{ i.t('est.book') }}</a>
            } @else {
              <div class="relative py-10 text-center text-zinc-400"><app-icon name="tag" class="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{{ i.t('est.empty') }}</p></div>
            }
          </div>
          <p class="muted text-xs mt-4">{{ i.t('est.note') }}</p>
        </aside>
      </div>
    </section>
  `,
})
export class Estimate implements OnInit {
  protected readonly i = inject(I18n);
  protected readonly models = SITE.models;
  /** Optional `?model=Name` prefill. */
  readonly modelParam = input<string>(undefined, { alias: 'model' });

  protected readonly model = signal('Sunny');
  protected readonly genuine = signal(true);
  protected readonly picked = signal<string[]>(['oil']);

  protected readonly groups = computed(() => this.i.dict().services
    .map(s => ({ slug: s.slug, icon: s.icon, t: s.t, jobs: JOBS.filter(j => j.service === s.slug) }))
    .filter(g => g.jobs.length));

  protected readonly lines = computed(() => JOBS.filter(j => this.picked().includes(j.id))
    .map(j => ({ id: j.id, name: this.i.l(j.name), min: this.price(j.min), max: this.price(j.max) })));

  protected readonly total = computed(() => this.lines().reduce((t, l) => ({ min: t.min + l.min, max: t.max + l.max }), { min: 0, max: 0 }));

  protected readonly wa = computed(() => waLink(this.i.dict().est.msg({
    model: this.model(),
    parts: this.i.t(this.genuine() ? 'est.genuine' : 'est.alt'),
    jobs: this.lines().map(l => `• ${l.name}`).join('\n'),
    total: `${this.i.price(this.total().min)} – ${this.i.price(this.total().max)}`,
  })));

  private readonly summaryEl = viewChild<ElementRef<HTMLElement>>('summary');
  protected toSummary() { this.summaryEl()?.nativeElement.scrollIntoView({ behavior: 'smooth' }); }

  ngOnInit() {
    const m = this.modelParam();
    if (m && this.models.includes(m)) this.model.set(m);
  }

  protected price(base: number) {
    return round50(base * (MODEL_FACTOR[this.model()] ?? 1) * (this.genuine() ? 1 : ALT_FACTOR));
  }

  /** Compact number for tight spots, e.g. 12,500 → "12.5k". */
  protected short(n: number) { return n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : `${n}`; }

  protected toggle(id: string) {
    this.picked.update(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));
  }
}
