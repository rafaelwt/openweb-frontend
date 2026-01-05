import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-wizard-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wizard-nav.html',
})
export class WizardNavComponent {
  readonly loading = input<boolean>(false);
  readonly canAdvance = input<boolean>(true);
  readonly backLabel = input<string>('Atras');
  readonly nextLabel = input<string>('Siguiente');
  readonly nextIcon = input<'arrow' | 'cart'>('arrow');
  readonly showBack = input<boolean>(true);

  readonly backButton = output<void>();
  readonly nextButton = output<void>();
}
