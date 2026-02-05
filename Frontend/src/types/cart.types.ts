export interface CartItem {
    id: string; // SKU or Variant ID for local, UUID for DB
    variantId: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    weight: string;
    quantity: number;
    stock: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    total: number;
}

export interface CartContextType {
    cart: Cart;
    isLoading: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    addToCart: (variantId: string, quantity: number, productData: any) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
}
