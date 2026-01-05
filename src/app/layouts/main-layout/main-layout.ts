import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '@layouts/main-layout/components/header/header';
import { ErrorModalComponent } from '@shared/components/error-modal/error-modal';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal';

/**
 * Main application layout wrapper.
 *
 * Provides the structural layout for all pages including:
 * - Fixed header with navigation and cart
 * - Main content area with router outlet
 * - Global error modal
 *
 * @selector app-main-layout
 *
 * @remarks
 * Uses a flexbox column layout with minimum full-screen height.
 * Content area has top margin (mt-17.5) to avoid header overlap.
 * Supports dark mode via Tailwind dark: prefix.
 */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, ErrorModalComponent, ConfirmationModalComponent],
  template: `
    <div class="flex min-h-screen flex-col dark:bg-gray-900">
      <app-header />
      <div class="mt-17.5">
        <router-outlet />
      </div>
    </div>
    <app-error-modal />
    <app-confirmation-modal />
  `,
})
export class MainLayoutComponent {}
