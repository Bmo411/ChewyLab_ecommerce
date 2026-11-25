import { useCheckout } from "@/hooks/useCheckout";
import { CheckoutItemRow } from "@/components/checkout/CheckoutItemRow";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState, useRef } from "react";
import Footer from "@/components/Footer";
import { api, ApiError, CommerceStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
    const {
        items,
        isLoading,
        updateCartSnapshot,
        ...checkoutState
    } = useCheckout();

    const { user, isLoading: isAuthLoading } = useCart();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [commerce, setCommerce] = useState<CommerceStatus | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitting = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        api<CommerceStatus>('/api/commerce-status', { signal: controller.signal }).then(setCommerce).catch(() => setCommerce(null));
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate("/login?returnTo=%2Fcheckout", { replace: true });
        }
    }, [user, isAuthLoading, navigate]);

    if (isLoading || isAuthLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
        );
    }

    const handleContinue = async () => {
        if (submitting.current || !commerce?.checkoutEnabled || !user || checkoutState.hasBlockingIssues || !items.length) return;
        submitting.current = true;
        setIsSubmitting(true);
        try {
            const requestItems = items.map(i => ({ variantId: i.variantId, quantity: i.quantity })).sort((a, b) => a.variantId.localeCompare(b.variantId));
            const signature = JSON.stringify(requestItems);
            const storageKey = `chewylab:checkout:${user.id}`;
            let saved: { signature: string; requestId: string } | null = null;
            try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { /* Reemplazar dato local inválido. */ }
            const requestId = saved?.signature === signature ? saved.requestId : crypto.randomUUID();
            sessionStorage.setItem(storageKey, JSON.stringify({ signature, requestId }));
            const { url } = await api<{ url: string }>('/api/checkout/create-session', { method: 'POST', body: JSON.stringify({ requestId, items: requestItems }) });
            const target = new URL(url);
            if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com') throw new Error('La dirección de pago no es válida.');
            window.location.assign(target.href);
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) sessionStorage.removeItem(`chewylab:checkout:${user.id}`);
            toast({ title: 'No se pudo iniciar el pago', description: error instanceof Error ? error.message : 'Inténtalo de nuevo.', variant: 'destructive' });
            await checkoutState.refreshValidation();
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main id="contenido" className="container mx-auto px-4 py-8 lg:px-8 mt-20">

                <div className="mb-8">
                    <Link to="/coleccion" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Seguir comprando
                    </Link>
                    <h1 className="mt-4 text-3xl font-display font-bold text-foreground">Checkout</h1>
                    {new URLSearchParams(window.location.search).has('cancelled') && <p role="status" className="mt-3 text-muted-foreground">Regresaste del pago. Tu carrito se conserva; puedes abrir de nuevo la misma sesión.</p>}
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

                    {/* Items List */}
                    <section className="lg:col-span-7">
                        {items.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border rounded-lg">
                                <p className="text-lg text-muted-foreground">Tu carrito está vacío.</p>
                                <Link to="/coleccion" className="mt-4 inline-block text-gold hover:underline">
                                    Ir a comprar
                                </Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border border-t border-border">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <CheckoutItemRow item={item} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Summary */}
                    <section className="lg:col-span-5 mt-16 lg:mt-0">
                        <CheckoutSummary
                            state={{ items, isLoading, ...checkoutState }}
                            onUpdateCart={updateCartSnapshot}
                            onContinue={handleContinue}
                            isSubmitting={isSubmitting || checkoutState.isValidating}
                            checkoutEnabled={commerce?.checkoutEnabled ?? false}
                            shippingAmountCents={commerce?.shippingAmountCents ?? null}
                        />
                    </section>

                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Checkout;
