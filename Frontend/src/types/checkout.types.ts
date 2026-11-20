import { CartItem } from "./cart.types";

export interface CheckoutItem extends CartItem {
    // Current real-time data from DB
    currentPrice: number;
    currentStock: number;
    active: boolean;

    // Validation flags
    hasPriceChange: boolean;
    hasStockIssue: boolean; // true if quantity > currentStock
    isInactive: boolean;
    slug?: string;
}

export interface CheckoutState {
    items: CheckoutItem[];
    originalSubtotal: number;
    currentSubtotal: number;
    isLoading: boolean;
    hasBlockingIssues: boolean; // Stock or Inactive issues
    hasPriceChanges: boolean; // Only price warnings
}
