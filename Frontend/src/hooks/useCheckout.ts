import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { CheckoutState } from '@/types/checkout.types';
import { useToast } from '@/hooks/use-toast';

export const useCheckout = () => {
  const { cart, isLoading: isCartLoading, refreshCart, user } = useCart();
  const { toast } = useToast();
  const [state, setState] = useState<CheckoutState>({ items: [], originalSubtotal: 0, currentSubtotal: 0, isLoading: true, hasBlockingIssues: true, hasPriceChanges: false });
  const [isValidating, setIsValidating] = useState(false);

  const validateCart = useCallback(async () => {
    if (isCartLoading) return;
    if (!cart.items.length) {
      setState({ items: [], originalSubtotal: 0, currentSubtotal: 0, isLoading: false, hasBlockingIssues: true, hasPriceChanges: false });
      return;
    }
    setIsValidating(true);
    try {
      const { data: variants, error } = await supabase.from('product_variants')
        .select('id, price, stock, active, products (slug, active)').in('id', cart.items.map(i => i.variantId));
      if (error) throw error;
      const items = cart.items.map(item => {
        const remote = variants?.find(v => v.id === item.variantId);
        const relation = remote?.products;
        const product = Array.isArray(relation) ? relation[0] : relation;
        const currentPrice = Number(remote?.price ?? 0);
        const currentStock = Number(remote?.stock ?? 0);
        const active = Boolean(remote?.active && product?.active);
        return { ...item, currentPrice, currentStock, active, slug: product?.slug,
          hasPriceChange: currentPrice !== item.price,
          hasStockIssue: !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > currentStock,
          isInactive: !active,
        };
      });
      setState({ items, originalSubtotal: cart.subtotal, currentSubtotal: items.reduce((sum, i) => sum + i.currentPrice * i.quantity, 0),
        isLoading: false, hasBlockingIssues: items.some(i => i.hasStockIssue || i.isInactive || !Number.isFinite(i.currentPrice) || i.currentPrice <= 0),
        hasPriceChanges: items.some(i => i.hasPriceChange),
      });
    } catch {
      setState(previous => ({ ...previous, isLoading: false, hasBlockingIssues: true }));
      toast({ title: 'No se pudo validar el carrito', description: 'Vuelve a intentarlo antes de pagar.', variant: 'destructive' });
    } finally { setIsValidating(false); }
  }, [cart.items, cart.subtotal, isCartLoading, toast]);

  useEffect(() => { void validateCart(); }, [validateCart]);

  const updateCartSnapshot = async () => {
    if (!user) return;
    setIsValidating(true);
    try {
      const results = await Promise.all(state.items.filter(i => i.hasPriceChange).map(i =>
        supabase.from('cart_items').update({ price_snapshot: i.currentPrice }).eq('id', i.id)));
      if (results.some(r => r.error)) throw new Error('No se pudo actualizar');
      await refreshCart();
    } catch {
      toast({ title: 'No se pudo actualizar el carrito', variant: 'destructive' });
    } finally { setIsValidating(false); }
  };
  return { ...state, isValidating, refreshValidation: validateCart, updateCartSnapshot };
};
