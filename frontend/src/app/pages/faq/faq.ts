import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { waLink } from '../../core/site';
import { PageBanner } from '../../shared/page-banner';
import { Icon } from '../../shared/icon';

interface Group { id: string; icon: string; t: string; items: string[][]; }

@Component({
  selector: 'app-faq',
  imports: [FormsModule, PageBanner, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('faq.title')" [subtitle]="i.t('faq.sub')" icon="search" [crumbs]="[{ label: i.t('nav.faq') }]" />

    <section class="pt-5 pb-14 md:py-20">
      <div class="wrap max-w-[860px]">
        <!-- search -->
        <div class="relative mb-4">
          <input class="field ps-11 !py-3.5 md:!py-4 md:text-lg" type="search" [attr.aria-label]="i.t('faq.search')" [placeholder]="i.t('faq.search')" [ngModel]="q()" (ngModelChange)="q.set($event)">
          <app-icon name="search" class="w-5 h-5 absolute top-1/2 -translate-y-1/2 start-4 muted" />
        </div>

        <!-- topics -->
        <div class="flex gap-2 overflow-x-auto pb-2 mb-6 md:mb-10 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap [scrollbar-width:none]">
          @for (g of chips(); track g.id) {
            <button type="button" (click)="topic.set(g.id)"
                    class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-bold transition"
                    [class]="topic() === g.id ? 'bg-brand-red border-brand-red text-white' : 'border-zinc-200 dark:border-ink-600 hover:border-brand-red/50'">
              @if (g.icon) { <app-icon [name]="g.icon" class="w-4 h-4" /> }{{ g.t }}
            </button>
          }
        </div>

        @for (g of visible(); track g.id) {
          <div class="mb-8 md:mb-10">
            <h2 class="flex items-center gap-2.5 text-lg md:text-xl font-black mb-3 md:mb-4">
              <span class="ic-red w-9 h-9 rounded-xl"><app-icon [name]="g.icon" class="w-5 h-5" /></span>{{ g.t }}
            </h2>
            <div class="space-y-2.5 md:space-y-3">
              @for (it of g.items; track it[0]) {
                <details class="card !rounded-2xl group p-4 md:p-5 [&_summary::-webkit-details-marker]:hidden open:border-brand-red/40">
                  <summary class="flex items-center justify-between gap-4 cursor-pointer font-extrabold text-[15px] md:text-lg list-none">
                    {{ it[0] }}
                    <span class="w-8 h-8 shrink-0 rounded-full grid place-items-center bg-brand-red/10 text-brand-red2 transition group-open:rotate-45 group-open:bg-brand-red group-open:text-white text-xl leading-none">+</span>
                  </summary>
                  <p class="muted mt-3 text-sm md:text-base leading-relaxed">{{ it[1] }}</p>
                </details>
              }
            </div>
          </div>
        } @empty {
          <div class="card p-10 text-center"><app-icon name="search" class="w-12 h-12 mx-auto mb-3 muted" /><p class="font-bold">{{ i.t('faq.empty') }}</p></div>
        }

        <!-- still have a question -->
        <div class="relative overflow-hidden rounded-[24px] p-6 md:p-8 mt-4 text-white bg-gradient-to-br from-[#2a0709] via-ink-800 to-ink-900 border border-brand-red/30 flex flex-col sm:flex-row sm:items-center gap-5">
          <div class="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-brand-red/30 blur-3xl"></div>
          <div class="relative flex-1"><h3 class="text-xl md:text-2xl font-black mb-1">{{ i.t('faq.still') }}</h3><p class="text-zinc-400 text-sm md:text-base">{{ i.t('faq.stillSub') }}</p></div>
          <a [href]="wa" target="_blank" class="btn relative justify-center bg-[#25d366] text-white shrink-0"><app-icon name="wa" class="w-5 h-5" />{{ i.t('faq.ask') }}</a>
        </div>
      </div>
    </section>
  `,
})
export class Faq {
  protected readonly i = inject(I18n);
  protected readonly wa = waLink();
  protected readonly q = signal('');
  protected readonly topic = signal('all');

  /** General groups plus one built from every service's own FAQ. */
  private readonly groups = computed<Group[]>(() => [
    ...this.i.dict().faq.groups,
    { id: 'services', icon: 'engine', t: this.i.t('faq.svcGroup'), items: this.i.dict().services.flatMap(s => s.faq) },
  ]);

  protected readonly chips = computed(() => [
    { id: 'all', icon: '', t: this.i.t('faq.all') },
    ...this.groups().map(g => ({ id: g.id, icon: g.icon, t: g.t })),
  ]);

  protected readonly visible = computed(() => {
    const q = this.q().trim().toLowerCase(), topic = this.topic();
    return this.groups()
      .filter(g => topic === 'all' || g.id === topic)
      .map(g => ({ ...g, items: g.items.filter(([qq, a]) => !q || `${qq} ${a}`.toLowerCase().includes(q)) }))
      .filter(g => g.items.length);
  });
}
