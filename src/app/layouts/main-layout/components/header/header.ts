import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

import { ThemeService } from '@core/services/theme.service';
import { CartService } from '@core/services/cart.service';

/**
 * Main application header with navigation and cart.
 *
 * Provides:
 * - Logo and branding
 * - Navigation links (home, call center, contacts)
 * - Dark mode toggle
 * - Shopping cart with item count badge
 * - Mobile responsive hamburger menu
 *
 * @selector app-header
 *
 * @remarks
 * **Features:**
 * - Sticky positioning at top of viewport
 * - Active link highlighting via router URL matching
 * - Tooltips for all interactive elements
 * - Cart badge shows total item count from CartService
 * - Dark mode managed by ThemeService
 * - Mobile menu toggle for small screens
 *
 * @see {@link ThemeService}
 * @see {@link CartService}
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
})
export class HeaderComponent {
  /**
   * Reference to theme service for dark mode toggle.
   */
  protected readonly theme = inject(ThemeService);

  /**
   * Reference to cart service for item count display.
   */
  protected readonly cart = inject(CartService);

  /**
   * Router instance for active link detection.
   */
  private readonly router = inject(Router);

  /**
   * Signal that tracks the current route.
   *
   * @remarks
   * Converts router navigation events to a signal for reactive route detection.
   * Uses `toSignal()` to transform the Observable stream into a signal that
   * updates automatically on every navigation.
   */
  private readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /**
   * Controls mobile hamburger menu visibility.
   */
  protected readonly mobileMenuOpen = signal(false);

  /**
   * Tooltip visibility state for logo.
   */
  protected readonly showLogoTooltip = signal(false);

  /**
   * Tooltip visibility state for theme toggle button.
   */
  protected readonly showThemeTooltip = signal(false);

  /**
   * Tooltip visibility state for call center link.
   */
  protected readonly showCallCenterTooltip = signal(false);

  /**
   * Tooltip visibility state for contact link.
   */
  protected readonly showContactTooltip = signal(false);

  /**
   * Tooltip visibility state for cart link.
   */
  protected readonly showCartTooltip = signal(false);

  /**
   * Computed signal for total number of items in the cart.
   *
   * @remarks
   * Used to display the badge on the cart icon.
   */
  protected readonly cartItemCount = computed(() => this.cart.itemCount());

  /**
   * Determines if a navigation link is currently active.
   *
   * @param path - The route path to check
   * @returns `true` if the current route matches the path, `false` otherwise
   *
   * @remarks
   * Uses the reactive `currentRoute` signal to detect route changes automatically.
   * This ensures the UI updates correctly when navigating programmatically.
   *
   * @internal
   */
  protected isRouteActive(path: string): boolean {
    return this.currentRoute() === path;
  }
}
