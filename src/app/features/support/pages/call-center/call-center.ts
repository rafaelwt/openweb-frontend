import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StepCard } from './components/step-card/step-card';

@Component({
  selector: 'app-call-center',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepCard, NgOptimizedImage],
  templateUrl: './call-center.html',
})
export class CallCenterComponent {
  private readonly document = inject(DOCUMENT);

  protected openWhatsApp(): void {
    this.document.location.href = 'whatsapp://send/?phone=59174420730&text=Hola';
  }

  protected openTelegram(): void {
    this.document.location.href = 'tg://resolve?domain=PagoalPaso247Bot';
  }
}
