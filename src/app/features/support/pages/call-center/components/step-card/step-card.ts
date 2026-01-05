import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-step-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-card.html',
})
export class StepCard {
  step = input.required<number>();
  title = input.required<string>();
  showArrow = input(true);
}
