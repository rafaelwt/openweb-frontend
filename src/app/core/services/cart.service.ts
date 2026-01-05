import { Injectable, signal, computed } from '@angular/core';

import Decimal from 'decimal.js-light';

import { Carrito, ItemCarrito } from '../models';

// Configure Decimal.js for currency operations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Manages shopping cart state using signals and session storage.
 *
 * Provides reactive computed values for:
 * - Item counts and totals
 * - Service and commission calculations
 * - Cart persistence across page reloads
 *
 * @remarks
 * - Uses Decimal.js for precise currency operations (20 precision, ROUND_HALF_UP)
 * - Cart data persists in sessionStorage with session ID validation
 * - Session IDs prevent cart data leakage between different sessions
 *
 * @see {@link Carrito}
 * @see {@link ItemCarrito}
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'redis_cart_items';
  private readonly SESSION_KEY = 'redis_session_id';

  private readonly cart = signal<Carrito | null>(null);

  /**
   * Computed signal containing all items in the cart.
   *
   * @remarks
   * Returns an empty array if cart is null.
   * Updates reactively when cart changes.
   *
   * @returns Readonly array of cart items
   */
  readonly items = computed(() => this.cart()?.items ?? []);

  /**
   * Computed signal with the total number of items in the cart.
   *
   * @returns Number of items in the cart
   */
  readonly itemCount = computed(() => this.items().length);

  /**
   * Computed signal with the total service amount for all items.
   *
   * @remarks
   * Uses Decimal.js for precise currency calculations.
   *
   * @returns Total service amount in Bolivianos
   */
  readonly totalServices = computed(() =>
    this.items()
      .reduce((sum, item) => sum.plus(item.totalServicio), new Decimal(0))
      .toNumber(),
  );

  /**
   * Computed signal with the total commission amount for all items.
   *
   * @remarks
   * Uses Decimal.js for precise currency calculations.
   *
   * @returns Total commission amount in Bolivianos
   */
  readonly totalCommissions = computed(() =>
    this.items()
      .reduce((sum, item) => sum.plus(item.totalComision), new Decimal(0))
      .toNumber(),
  );

  /**
   * Computed signal with the grand total (services + commissions).
   *
   * @remarks
   * Uses Decimal.js for precise currency calculations.
   *
   * @returns Grand total amount in Bolivianos
   */
  readonly totalGeneral = computed(() =>
    this.items()
      .reduce((sum, item) => sum.plus(item.totalGeneral), new Decimal(0))
      .toNumber(),
  );

  /**
   * Computed signal indicating whether the cart has any commissions.
   *
   * @returns `true` if total commissions are greater than 0, `false` otherwise
   */
  readonly hasCommissions = computed(() => this.totalCommissions() > 0);

  /**
   * Computed signal indicating whether the cart is empty.
   *
   * @returns `true` if cart has no items, `false` otherwise
   */
  readonly isEmpty = computed(() => this.itemCount() === 0);

  /**
   * Computed signal with the currency used in the cart.
   *
   * @returns Currency abbreviation from first item, or null if cart is empty
   *
   * @remarks
   * All items in cart must use the same currency.
   * This returns the currency of the first item as the "cart currency".
   */
  readonly cartCurrency = computed(() => {
    const items = this.items();
    return items.length > 0 ? items[0].abreviacionMoneda : null;
  });

  constructor() {
    this.loadCart();
  }

  /**
   * Loads the cart from session storage.
   *
   * @remarks
   * - Validates session ID before restoring cart data
   * - Clears cart if session ID is invalid or parsing fails
   * - Automatically called in constructor on service initialization
   */
  loadCart(): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cart = JSON.parse(stored) as Carrito;

        // Migration: Add default currency to old cart items
        cart.items = cart.items.map((item) => {
          if (!item.abreviacionMoneda) {
            return { ...item, abreviacionMoneda: 'Bs.' };
          }
          return item;
        });

        if (this.validateSession(cart.sessionId)) {
          this.cart.set(cart);
        } else {
          this.clearCart();
        }
      }
    } catch {
      this.clearCart();
    }
  }

  /**
   * Adds an item to the shopping cart.
   *
   * @param item - The cart item to add
   * @returns `true` if item was added successfully, `false` if an error occurred
   *
   * @remarks
   * - Creates a new session ID if none exists
   * - Updates the cart's `updatedAt` timestamp
   * - Automatically persists to sessionStorage
   *
   * @example
   * ```typescript
   * const success = cartService.addItem({
   *   aliasServicio: 'coopappi',
   *   nombreServicio: 'COOPAPPI',
   *   totalGeneral: 150.00,
   *   // ... other properties
   * });
   * if (success) {
   *   console.log('Item added to cart');
   * }
   * ```
   */
  addItem(item: ItemCarrito): boolean {
    try {
      const currentCart = this.cart();
      const sessionId = this.getOrCreateSessionId();

      const newCart: Carrito = {
        sessionId,
        items: currentCart ? [...currentCart.items, item] : [item],
        createdAt: currentCart?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };

      this.cart.set(newCart);
      this.saveCart();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes an item from the cart by its index.
   *
   * @param index - Zero-based index of the item to remove
   *
   * @remarks
   * - If this is the last item, the entire cart is cleared (including session data)
   * - Updates the cart's `updatedAt` timestamp
   * - Automatically persists changes to sessionStorage
   */
  removeItem(index: number): void {
    const currentCart = this.cart();
    if (!currentCart) return;

    const newItems = currentCart.items.filter((_, i) => i !== index);

    if (newItems.length === 0) {
      this.clearCart();
    } else {
      const newCart: Carrito = {
        ...currentCart,
        items: newItems,
        updatedAt: Date.now(),
      };
      this.cart.set(newCart);
      this.saveCart();
    }
  }

  /**
   * Finds a duplicate item in the cart based on service alias and contract code.
   *
   * @param aliasServicio - Service alias to match
   * @param codigoContrato - Contract code to match
   * @returns Index of duplicate item, or -1 if not found
   *
   * @remarks
   * Duplicate is defined as having the same `aliasServicio` AND `codigoContrato`.
   * This prevents users from adding the same contract payment multiple times.
   *
   * @example
   * ```typescript
   * const duplicateIndex = cartService.findDuplicateIndex('coopappi', 'CT-12345');
   * if (duplicateIndex !== -1) {
   *   console.log('Duplicate found at index:', duplicateIndex);
   * }
   * ```
   */
  findDuplicateIndex(aliasServicio: string, codigoContrato: string): number {
    return this.items().findIndex((item) => item.aliasServicio === aliasServicio && item.codigoContrato === codigoContrato);
  }

  /**
   * Validates if an item with the given currency can be added to the cart.
   *
   * @param abreviacionMoneda - Currency abbreviation to validate (e.g., "Bs.", "USD")
   * @returns Object with validation result
   *
   * @remarks
   * **Validation rules:**
   * - Empty cart: Always returns `{ canAdd: true, existingCurrency: null }`
   * - Cart has items: Returns `{ canAdd: false, existingCurrency: "Bs." }` if currency mismatch
   * - Cart has items with same currency: Returns `{ canAdd: true, existingCurrency: "Bs." }`
   *
   * This prevents users from mixing different currencies in a single transaction.
   *
   * @example
   * ```typescript
   * const validation = cartService.canAddItemWithCurrency('USD');
   * if (!validation.canAdd) {
   *   console.log(`Cart already contains items in ${validation.existingCurrency}`);
   * }
   * ```
   */
  canAddItemWithCurrency(abreviacionMoneda: string): {
    canAdd: boolean;
    existingCurrency: string | null;
  } {
    const items = this.items();

    // Empty cart - allow any currency
    if (items.length === 0) {
      return { canAdd: true, existingCurrency: null };
    }

    // Get currency from first item (all items must have same currency)
    const existingCurrency = items[0].abreviacionMoneda;

    // Check if new item's currency matches existing items
    const canAdd = existingCurrency === abreviacionMoneda;

    return { canAdd, existingCurrency };
  }

  /**
   * Replaces an existing item in the cart.
   *
   * @param index - Index of the item to replace
   * @param newItem - New item data
   * @returns `true` if replacement was successful, `false` otherwise
   *
   * @remarks
   * - Validates index is within bounds before replacing
   * - Updates the cart's `updatedAt` timestamp
   * - Automatically persists changes to sessionStorage
   *
   * @example
   * ```typescript
   * const success = cartService.replaceItem(0, newItemData);
   * if (success) {
   *   console.log('Item replaced successfully');
   * }
   * ```
   */
  replaceItem(index: number, newItem: ItemCarrito): boolean {
    try {
      const currentCart = this.cart();
      if (!currentCart || index < 0 || index >= currentCart.items.length) {
        return false;
      }

      const newItems = [...currentCart.items];
      newItems[index] = newItem;

      const newCart: Carrito = {
        ...currentCart,
        items: newItems,
        updatedAt: Date.now(),
      };

      this.cart.set(newCart);
      this.saveCart();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clears the entire cart.
   *
   * @remarks
   * - Removes all items from the cart signal
   * - Removes cart data from sessionStorage
   * - Does not remove the session ID
   */
  clearCart(): void {
    this.cart.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Serializes cart items to JSON string.
   *
   * @returns JSON string representation of cart items array
   *
   * @remarks
   * Used for sending cart data to the backend API.
   */
  getItemsAsJson(): string {
    return JSON.stringify(this.items());
  }

  private saveCart(): void {
    const currentCart = this.cart();
    if (currentCart) {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentCart));
    }
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  private validateSession(cartSessionId: string): boolean {
    const currentSessionId = sessionStorage.getItem(this.SESSION_KEY);
    return currentSessionId === cartSessionId;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
