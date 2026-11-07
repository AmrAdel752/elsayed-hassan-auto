import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { CAR_MODELS } from '../../data/models';
import { PageBanner } from '../../shared/page-banner';
import { ModelCard } from '../../shared/model-card';
import { CtaBand } from '../../shared/cta-band';
import { Reveal } from '../../shared/reveal.directive';

@Component({
  selector: 'app-models',
  imports: [PageBanner, ModelCard, CtaBand, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-banner [title]="i.t('mdl.title')" [subtitle]="i.t('mdl.sub')" icon="car" [crumbs]="[{ label: i.t('nav.models') }]" />
    <section class="py-6 md:py-20">
      <div class="wrap grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        @for (m of models; track m.slug; let n = $index) { <app-model-card [model]="m" [reveal]="(n % 4) * .1" /> }
      </div>
    </section>
    <div class="pt-8"><app-cta-band /></div>
  `,
})
export class Models {
  protected readonly i = inject(I18n);
  protected readonly models = CAR_MODELS;
}
