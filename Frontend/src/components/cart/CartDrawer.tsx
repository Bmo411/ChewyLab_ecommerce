import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "./CartItem";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
    const { cart, isOpen, setIsOpen, isLoading } = useCart();

    // Safety check just in case cart is undefined
    const items = cart?.items || [];
    const isEmpty = items.length === 0;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-background/95 backdrop-blur-xl border-l border-border/30">
                <SheetHeader className="px-6 py-4 border-b border-border/30">
                    <SheetTitle className="font-display text-xl text-foreground flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gold" />
                        Tu Carrito
                        {!isEmpty && (
                            <span className="ml-auto mr-8 text-sm font-normal text-muted-foreground">
                                {items.reduce((acc, item) => acc + item.quantity, 0)} items
                            </span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto px-6 py-2 pb-24">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                            <p className="text-muted-foreground text-sm">Cargando carrito...</p>
                        </div>
                    ) : isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-2">
                                <ShoppingBag className="w-8 h-8 text-gold/50" />
                            </div>
                            <h3 className="font-display text-lg font-medium text-foreground">
                                El carrito está vacío
                            </h3>
                            <p className="text-sm text-muted-foreground w-2/3 mx-auto">
                                ¡Agrega productos deliciosos para tu mascota!
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 border-gold text-gold hover:bg-gold hover:text-primary-foreground"
                                onClick={() => setIsOpen(false)}
                            >
                                Ver Colección
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Checkout */}
                {!isEmpty && (
                    <div className="absolute bottom-0 left-0 right-0 bg-card/50 backdrop-blur-md border-t border-border/30 p-6 space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium text-foreground">
                                    ${cart.subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-border/30">
                                <span className="font-display text-lg font-medium">Total</span>
                                <span className="font-display text-2xl text-gold">
                                    ${cart.total.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                Impuestos y envío calculados al finalizar compra.
                            </p>
                        </div>

                        <Button className="w-full bg-gold hover:bg-gold/90 text-primary-foreground h-12 text-base font-semibold tracking-wide">
                            Finalizar Compra
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
