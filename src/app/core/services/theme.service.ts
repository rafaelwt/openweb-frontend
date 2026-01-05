import { Injectable, signal } from '@angular/core';

/**
 * Manages application theme (light/dark mode).
 *
 * Provides reactive theme state and methods to toggle between light and dark modes.
 * Persists user preference in localStorage and respects system preferences.
 *
 * @remarks
 * - Theme preference is stored in localStorage with key 'theme'
 * - Falls back to system preference if no saved preference exists
 * - Applies theme by toggling 'dark' class on document.documentElement
 * - Works with Tailwind CSS dark mode (class strategy)
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly darkMode = signal(false);

  /**
   * Readonly signal indicating whether dark mode is active.
   */
  readonly isDarkMode = this.darkMode.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initializes theme on service creation.
   *
   * @remarks
   * Priority:
   * 1. Saved preference in localStorage ('theme')
   * 2. System preference (prefers-color-scheme: dark)
   * 3. Default to light mode
   *
   * @internal
   */
  private initializeTheme(): void {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && systemDark);
    this.applyTheme(isDark);
  }

  /**
   * Toggles between light and dark mode.
   *
   * @remarks
   * - Updates the isDarkMode signal
   * - Applies/removes 'dark' class on document root
   * - Saves preference to localStorage
   *
   * @example
   * ```typescript
   * // In a component
   * themeService.toggle();
   * console.log(themeService.isDarkMode()); // true or false
   * ```
   */
  toggle(): void {
    this.applyTheme(!this.darkMode());
  }

  /**
   * Applies the specified theme.
   *
   * @param isDark - Whether to apply dark mode
   *
   * @internal
   */
  private applyTheme(isDark: boolean): void {
    this.darkMode.set(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
