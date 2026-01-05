import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (errors().length > 0) {
      <div class="mb-4 flex items-start gap-3 rounded-md border-t border-r border-b border-l-4 border-red-500 bg-red-100 px-4 py-4 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
        <div class="flex-1">
          <div class="mb-1 font-semibold">
            {{ errors().length > 1 ? 'Errores de validacion:' : 'Error de validacion:' }}
          </div>
          <ul class="mt-2 list-inside list-disc text-xl">
            @for (error of errors(); track error) {
              <li>{{ error }}</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class ErrorAlertComponent {
  readonly errors = input<string[]>([]);
}
