import { Button } from "@/components/ui/button";
import { CheckoutState } from "@/types/checkout.types";
import { Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface CheckoutSummaryProps {
    state: CheckoutState;
    onUpdateCart: () => void;
    onContinue: () => void;
    isSubmitting: boolean;
    checkoutEnabled: boolean;
    shippingAmountCents: number | null;
}

export const CheckoutSummary = ({ state, onUpdateCart, onContinue, isSubmitting, checkoutEnabled, shippingAmountCents }: CheckoutSummaryProps) => {
    const { currentSubtotal, originalSubtotal, hasBlockingIssues, hasPriceChanges, isLoading } = state;

    const subtotalDiff = currentSubtotal - originalSubtotal;

    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-medium text-foreground mb-4">Resumen del Pedido</h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-sm font-medium text-foreground">${currentSubtotal.toFixed(2)} MXN</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">Envío a México</p>
                    <p>{shippingAmountCents === null ? 'Por confirmar' : `$${(shippingAmountCents / 100).toFixed(2)} MXN`}</p>
                </div>

                {hasPriceChanges && (
                    <div className="flex items-center justify-between py-2 border-t border-dashed border-border">
                        <p className="text-xs text-amber-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Cambio de precio
                        </p>
                        <p className={`text-xs font-medium ${subtotalDiff > 0 ? "text-destructive" : "text-green-600"}`}>
                            {subtotalDiff > 0 ? "+" : ""}{subtotalDiff.toFixed(2)}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-4">
                    <p className="text-base font-medium text-foreground">Total Estimado</p>
                    <p className="text-base font-medium text-foreground">${(currentSubtotal + (shippingAmountCents ?? 0) / 100).toFixed(2)} MXN</p>
                </div>
            </div>

            {hasBlockingIssues && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                        Por favor revisa los problemas en tu carrito para continuar.
                    </p>
                </div>
            )}

            {hasPriceChanges && !hasBlockingIssues && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <p className="text-sm text-amber-600 font-medium">
                        Los precios han cambiado. Actualiza tu carrito para confirmar.
                    </p>
                </div>
            )}

            <div className="mt-6 space-y-3">
                {hasPriceChanges ? (
                    <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={onUpdateCart}
                        disabled={isLoading || isSubmitting}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Actualizar Precios
                    </Button>
                ) : (
                    <Button
                        className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground"
                        onClick={onContinue}
                        disabled={isLoading || isSubmitting || hasBlockingIssues || !checkoutEnabled || state.items.length === 0}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Abriendo pago seguro…' : 'Pagar con Stripe'}
                    </Button>
                )}

                {!checkoutEnabled && <p role="status" className="text-sm text-muted-foreground">La tienda aún está preparando las compras en línea.</p>}
                <p className="text-xs text-muted-foreground">El precio y la disponibilidad se validan al abrir el pago. Stripe solicita dirección, teléfono y aceptación de los términos de la tienda.</p>
                <Link to="/coleccion" className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground">Seguir comprando</Link>

            </div>
        </div>
    );
};
