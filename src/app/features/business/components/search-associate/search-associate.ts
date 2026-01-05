import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-associate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './search-associate.html',
})
export class SearchAssociateComponent {
  readonly form = input.required<FormGroup>();
  readonly isLoading = input<boolean>(false);

  readonly search = output<void>();
}
