import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Contacto } from '@core/models/contacto.model';

@Component({
  selector: 'app-contact-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-card.html',
})
export class ContactCard {
  contact = input.required<Contacto>();

  protected getColorClasses(color: string): { ring: string; text: string; hover: string } {
    const colors: Record<string, { ring: string; text: string; hover: string }> = {
      blue: {
        ring: 'ring-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        hover: 'hover:text-blue-600 dark:hover:text-blue-400',
      },
      green: {
        ring: 'ring-green-500',
        text: 'text-green-600 dark:text-green-400',
        hover: 'hover:text-green-600 dark:hover:text-green-400',
      },
      orange: {
        ring: 'ring-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
        hover: 'hover:text-orange-600 dark:hover:text-orange-400',
      },
    };
    return colors[color] || colors['blue'];
  }

  protected getPlaceholderColor(color: string): string {
    const colors: Record<string, string> = {
      blue: '3b82f6',
      green: '10b981',
      orange: 'f97316',
    };
    return colors[color] || '3b82f6';
  }
}
