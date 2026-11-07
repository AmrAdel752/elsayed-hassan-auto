import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { TIPS } from '../../data/tips';
import { PageBanner } from '../../shared/page-banner';
import { TipCard } from '../../shared/tip-card';
import { CtaBand } from '../../shared/cta-band';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-tips',
  imports: [PageBanner, TipCard, CtaBand, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('tips.title')" [subtitle]="i.t('tips.sub')" icon="engine" [crumbs]="[{ label: i.t('nav.tips') }]" />
    <section class="pt-5 pb-14 md:py-20">
      <div class="wrap grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        @for (t of tips; track t.slug; let n = $index) { <app-tip-card [tip]="t" [reveal]="(n % 4) * .1" /> }
      </div>
    </section>
    <app-cta-band />
  `,
})
export class Tips {
  protected readonly i = inject(I18n);
  protected readonly tips = TIPS;
}
