import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-wizard-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Badge step number -->
    <div class="absolute -top-2 right-4 z-10 flex h-20 w-20 items-center justify-center rounded bg-blue-500 text-5xl font-bold text-white shadow-lg dark:bg-blue-600">
      {{ currentStep() }}
    </div>

    <!-- Progress bar -->
    <div class="mb-8">
      <div class="mb-2 flex justify-between text-sm text-gray-800 dark:text-gray-200">
        <span>{{ stepLabel() }}</span>
      </div>
      <div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
        <div class="relative h-full rounded-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-400 ease-in-out" [style.width.%]="progress()"></div>
      </div>
    </div>
  `,
})
export class WizardProgressComponent {
  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly stepLabel = input<string>('');

  protected readonly progress = computed(() => ((this.currentStep() - 1) / (this.totalSteps() - 1)) * 100);
}
