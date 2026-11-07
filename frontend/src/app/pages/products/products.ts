import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n } from '../../core/i18n.service';
import { SITE } from '../../core/site';
import { CATEGORIES, PRODUCTS } from '../../data/catalog';
import { PageBanner } from '../../shared/page-banner';
import { ProductCard } from '../../shared/product-card';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-products',
  imports: [FormsModule, PageBanner, ProductCard, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('shop.title')" [subtitle]="i.t('shop.sub')" icon="parts" [crumbs]="[{ label: i.t('nav.products') }]" />

    <section class="py-5 md:py-16">
      <div class="wrap">
        <!-- category chips -->
        <div class="flex gap-2 md:gap-2.5 overflow-x-auto pb-2 mb-4 md:mb-6 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none]">
          @for (c of chips(); track c.id) {
            <button type="button" (click)="cat.set(c.id)"
                    class="shrink-0 inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full border-2 font-bold text-sm transition"
                    [class]="cat() === c.id ? 'bg-brand-red border-brand-red text-white shadow-[0_8px_20px_-8px_rgba(220,47,54,.8)]' : 'border-zinc-200 dark:border-ink-600 hover:border-brand-red/50'">
              @if (c.icon) { <app-icon [name]="c.icon" class="w-4 h-4" /> }{{ c.label }}
            </button>
          }
        </div>

        <!-- search + model filter -->
        <div class="grid grid-cols-[1fr_130px] sm:grid-cols-[1fr_220px] gap-2 sm:gap-3 mb-3 md:mb-4">
          <div class="relative">
            <input class="field ps-11" type="search" [attr.aria-label]="i.t('shop.search')" [placeholder]="i.t('shop.search')" [ngModel]="q()" (ngModelChange)="q.set($event)">
            <app-icon name="search" class="w-5 h-5 absolute top-1/2 -translate-y-1/2 start-4 muted" />
          </div>
          <select class="field !px-3 sm:!px-4 text-sm sm:text-base" [attr.aria-label]="i.t('shop.model')" [ngModel]="model()" (ngModelChange)="model.set($event)">
            <option value="">{{ i.t('shop.model') }}</option>
            @for (m of models; track m) { <option [value]="m">{{ m }}</option> }
          </select>
        </div>
        <p class="muted text-xs md:text-sm mb-4 md:mb-8">{{ i.dict().shop.count(list().length) }}</p>

        @if (list().length) {
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            @for (p of list(); track p.slug) { <app-product-card [product]="p" /> }
          </div>
        } @else {
          <div class="card p-14 text-center">
            <app-icon name="parts" class="w-14 h-14 mx-auto mb-4 muted" />
            <p class="font-bold text-lg">{{ i.t('shop.empty') }}</p>
          </div>
        }
        <p class="muted text-xs text-center mt-10">{{ i.t('shop.note') }}</p>
      </div>
    </section>
  `,
})
export class Products implements OnInit {
  protected readonly i = inject(I18n);
  protected readonly models = SITE.models;
  /** Optional `?cat=` preselect. */
  readonly catParam = input<string>(undefined, { alias: 'cat' });

  protected readonly cat = signal('all');
  protected readonly q = signal('');
  protected readonly model = signal('');

  protected readonly chips = computed(() => [
    { id: 'all', icon: '', label: this.i.t('shop.all') },
    ...CATEGORIES.map(c => ({ id: c.id, icon: c.icon, label: this.i.l(c.name) })),
  ]);

  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), cat = this.cat(), m = this.model();
    return PRODUCTS.filter(p =>
      (cat === 'all' || p.cat === cat) &&
      (!m || p.models.includes(m)) &&
      (!q || `${p.name.ar} ${p.name.en} ${p.brand}`.toLowerCase().includes(q)));
  });

  ngOnInit() {
    const c = this.catParam();
    if (c && CATEGORIES.some(x => x.id === c)) this.cat.set(c);
  }
}
