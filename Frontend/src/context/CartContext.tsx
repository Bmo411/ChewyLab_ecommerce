import { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Cart, CartContextType, CartItem } from "@/types/cart.types";
import { useToast } from "@/hooks/use-toast";
import { ProductFull } from "@/hooks/useProduct";

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { toast } = useToast();

    // Load cart on mount and auth change
    useEffect(() => {
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (event === 'INITIAL_SESSION') {
                // Handle initial load
                if (currentUser) {
                    fetchSupabaseCart(currentUser.id);
                } else {
                    loadLocalCart();
                }
            } else if (event === 'SIGNED_IN' && currentUser) {
                // Handle Explicit Login
                // Use setTimeout to avoid blocking the main thread or Supabase client during initial load
                setTimeout(async () => {
                    setIsLoading(true);
                    try {
                        await mergeLocalCartToSupabase(currentUser.id);
                        await fetchSupabaseCart(currentUser.id);
                    } catch (error) {
                        console.error("Error initializing cart session:", error);
                        toast({
                            title: "Error de sesión",
                            description: "Hubo un problema cargando tu carrito.",
                            variant: "destructive"
                        });
                    } finally {
                        setIsLoading(false);
                    }
                }, 100);
            } else if (event === 'SIGNED_OUT') {
                setCart({ items: [], subtotal: 0, total: 0 });
                // loadLocalCart(); // Optional: Clear or load empty local
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Update totals whenever items change
    useEffect(() => {
        const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCart(prev => ({ ...prev, subtotal, total: subtotal })); // Assuming no tax/shipping for now
    }, [cart.items]);

    // --- Local Storage Helpers ---

    const loadLocalCart = () => {
        try {
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            } else {
                setCart({ items: [], subtotal: 0, total: 0 });
            }
        } catch (e) {
            console.error("Error loading local cart", e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveLocalCart = (newCart: Cart) => {
        localStorage.setItem("cart", JSON.stringify(newCart));
        setCart(newCart);
    };

    // --- Supabase Helpers ---

    const fetchSupabaseCart = async (userId: string) => {
        setIsLoading(true);
        try {
            // Get cart ID
            let { data: cartData, error: cartError } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            if (cartError) throw cartError;

            if (!cartData) {
                // Create cart if not exists
                const { data: newCart, error: createError } = await supabase
                    .from('carts')
                    .insert({ user_id: userId })
                    .select('id')
                    .single();

                if (createError) throw createError;
                cartData = newCart;
            }

            if (cartData) {


                // Need to fetch product details (name, image) separately or join if possible.
                // Since the schema description says "NO guarda precio ni nombre (eso se resuelve por JOIN)",
                // we need to join products and product_images.
                // Let's do a second query to enrich data or adjust the first query if Supabase relationships allow deep nesting.
                // Assuming standard setup, let's try to map it manually or enhance query if relationships exist.

                // Revised Query with deep select
                /* 
                   NOTE: This assumes relations are set up correctly:
                   product_variants -> products (product_id)
                   products -> product_images (product_id)
                */
                const { data: enrichedItems, error: enrichedError } = await supabase
                    .from('cart_items')
                    .select(`
            id,
            quantity,
            variant_id,
            product_variants:variant_id (
              id, weight, price, stock,
              products (
                id, name,
                product_images (image_url, is_main)
              )
            )
          `)
                    .eq('cart_id', cartData.id);

                if (enrichedError) throw enrichedError;

                const containerItems: CartItem[] = enrichedItems.map((item: any) => {
                    const variant = item.product_variants;
                    const product = variant.products;
                    const mainImage = product.product_images.find((img: any) => img.is_main) || product.product_images[0];

                    return {
                        id: item.id, // Supabase ID
                        variantId: variant.id,
                        productId: product.id,
                        name: product.name,
                        image: mainImage?.image_url || '/placeholder.jpg',
                        price: variant.price,
                        weight: variant.weight,
                        quantity: item.quantity,
                        stock: variant.stock
                    };
                });

                setCart(prev => ({ ...prev, items: containerItems }));
            }
        } catch (error) {
            console.error("Error fetching Supabase cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const mergeLocalCartToSupabase = async (userId: string) => {
        const localCart = localStorage.getItem("cart");
        if (!localCart) return;

        const parsedLocal: Cart = JSON.parse(localCart);
        if (parsedLocal.items.length === 0) return;

        // 1. Get or Create Cart
        let { data: cartData } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle();
        if (!cartData) {
            const { data: newCart } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
            cartData = newCart;
        }

        if (!cartData) return;

        let someItemsAdjusted = false;

        // 2. Insert items
        for (const item of parsedLocal.items) {
            // Get current stock, price, and details for snapshots
            const { data: variantData } = await supabase
                .from('product_variants')
                .select(`
                    stock, 
                    price,
                    weight,
                    products (
                        name,
                        product_images (image_url, is_main, position)
                    )
                `)
                .eq('id', item.variantId)
                .single();

            if (!variantData) continue;

            // Casting for TS safety if needed, or assuming structure matches
            const product = (variantData as any).products;
            const images = product.product_images || [];
            const mainImage = images.find((img: any) => img.is_main) || images.sort((a: any, b: any) => a.position - b.position)[0]; // Fallback logic
            const imageUrl = mainImage?.image_url || '/placeholder.jpg';

            const maxStock = variantData.stock;

            // Check if item exists in DB
            const { data: existing } = await supabase
                .from('cart_items')
                .select('id, quantity')
                .eq('cart_id', cartData.id)
                .eq('variant_id', item.variantId)
                .maybeSingle();

            if (existing) {
                let newQty = existing.quantity + item.quantity;
                if (newQty > maxStock) {
                    newQty = maxStock;
                    someItemsAdjusted = true;
                }

                // Only update if quantity actually changes (and is not already maxed out locally + remote)
                // or simply overwrite to be safe and consistent
                await supabase
                    .from('cart_items')
                    .update({ quantity: newQty }) // Snapshots typically don't update on quantity change unless we want to refresh price
                    .eq('id', existing.id);
            } else {
                let newQty = item.quantity;
                if (newQty > maxStock) {
                    newQty = maxStock;
                    someItemsAdjusted = true;
                }

                await supabase
                    .from('cart_items')
                    .insert({
                        cart_id: cartData.id,
                        variant_id: item.variantId,
                        quantity: newQty,
                        price_snapshot: variantData.price,
                        name_snapshot: product.name,
                        variant_label_snapshot: variantData.weight || "N/A", // Assuming weight is the label
                        image_snapshot: imageUrl
                    });
            }
        }

        // 3. Notify if adjusted
        if (someItemsAdjusted) {
            toast({
                title: "Ajuste de inventario",
                description: "Algunos productos se ajustaron por disponibilidad.",
                duration: 4000
            });
        }

        // 4. Clear local
        localStorage.removeItem("cart");
    };

    // --- Actions ---

    const addToCart = async (variantId: string, quantity: number, productData: ProductFull) => {
        // Validate Stock
        const variant = productData.variants.find(v => v.id === variantId);
        if (!variant) return;

        if (variant.stock < quantity) {
            toast({ title: "Error", description: "No hay suficiente stock disponible.", variant: "destructive", duration: 2000 });
            return;
        }

        const newItem: CartItem = {
            id: user ? '' : variantId, // Temp ID for local, will be replaced by DB ID if auth
            variantId: variant.id,
            productId: productData.id,
            name: productData.name,
            image: productData.images.find(img => img.is_main)?.image_url || productData.images[0]?.image_url || '/placeholder.jpg',
            price: variant.price,
            weight: variant.weight,
            quantity: quantity,
            stock: variant.stock
        };

        if (user) {
            // Supabase
            try {
                // Get Cart
                let cartId = '';
                const { data: cartData } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle();

                if (cartData) {
                    cartId = cartData.id;
                } else {
                    const { data: newCart, error } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single();
                    if (error) throw error;
                    cartId = newCart.id;
                }

                // Check Existing
                const { data: existing } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('cart_id', cartId)
                    .eq('variant_id', variantId)
                    .maybeSingle();

                if (existing) {
                    const newQty = existing.quantity + quantity;
                    if (newQty > variant.stock) {
                        toast({ title: "Error", description: "No hay suficiente stock disponible.", variant: "destructive", duration: 2000 });
                        return;
                    }
                    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
                } else {
                    // Prepare snapshots
                    const mainImg = productData.images.find(img => img.is_main) || productData.images[0];

                    await supabase.from('cart_items').insert({
                        cart_id: cartId,
                        variant_id: variantId,
                        quantity: quantity,
                        price_snapshot: variant.price,
                        name_snapshot: productData.name,
                        variant_label_snapshot: variant.weight || "Standard",
                        image_snapshot: mainImg?.image_url || "/placeholder.jpg"
                    });
                }
                await fetchSupabaseCart(user.id);
                toast({ title: "Carrito actualizado", description: "Producto agregado al carrito.", duration: 2000 });
                // setIsOpen(true);
            } catch (err: any) {
                toast({ title: "Error", description: "No se pudo agregar al carrito.", variant: "destructive", duration: 2000 });
                console.error(err);
            }

        } else {
            // Local Storage
            const currentItems = [...cart.items];
            const existingIndex = currentItems.findIndex(item => item.variantId === variantId);

            if (existingIndex >= 0) {
                const newQty = currentItems[existingIndex].quantity + quantity;
                if (newQty > variant.stock) {
                    toast({ title: "Error", description: "No hay suficiente stock disponible.", variant: "destructive", duration: 2000 });
                    return;
                }
                currentItems[existingIndex].quantity = newQty;
            } else {
                currentItems.push(newItem);
            }

            saveLocalCart({ ...cart, items: currentItems });
            toast({ title: "Carrito actualizado", description: "Producto agregado al carrito.", duration: 2000 });
            // setIsOpen(true);
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (user) {
            try {
                await supabase.from('cart_items').delete().eq('id', itemId);
                await fetchSupabaseCart(user.id);
            } catch (error) {
                console.error(error);
            }
        } else {
            const newItems = cart.items.filter(item => item.variantId !== itemId); // For local, itemId is variantId or similar
            saveLocalCart({ ...cart, items: newItems });
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        if (user) {
            // Need to check stock again ideally, but skipping for speed unless critical
            try {
                await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
                await fetchSupabaseCart(user.id);
            } catch (error) {
                console.error(error);
            }
        } else {
            const currentItems = [...cart.items];
            const item = currentItems.find(i => i.variantId === itemId);
            if (item) {
                if (quantity > item.stock) {
                    toast({ title: "Error", description: "Stock máximo alcanzado", variant: "destructive", duration: 2000 });
                    return;
                }
                item.quantity = quantity;
                saveLocalCart({ ...cart, items: currentItems });
            }
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                // Get Cart ID first to be safe, or just delete all items for this user's cart? 
                // Safer: Select cart, delete items.
                const { data: cartData } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
                if (cartData) {
                    await supabase.from('cart_items').delete().eq('cart_id', cartData.id);
                    setCart({ items: [], subtotal: 0, total: 0 });
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            saveLocalCart({ items: [], subtotal: 0, total: 0 });
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            isLoading,
            isOpen,
            setIsOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
