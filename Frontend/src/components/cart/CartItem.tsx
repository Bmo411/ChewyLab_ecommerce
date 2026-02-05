import { CartItem as CartItemType } from "@/types/cart.types";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItemProps {
    item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
    const { updateQuantity, removeFromCart } = useCart();
    const { toast } = useToast();

    return (
        <div className="flex gap-4 py-4 border-b border-border/40">
            {/* Image */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border/50 bg-card">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-display text-sm font-medium text-foreground line-clamp-2">
                            {item.name}
                        </h3>
                        <p className="ml-4 font-display text-sm font-medium text-gold">
                            ${(item.price * item.quantity).toFixed(2)}
                        </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.weight}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-1 border border-border/50 rounded-md">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => {
                                if (item.quantity >= item.stock) {
                                    toast({
                                        title: "Stock máximo alcanzado",
                                        description: "No puedes agregar más unidades de este producto.",
                                        variant: "destructive",
                                        duration: 2000
                                    });
                                } else {
                                    updateQuantity(item.id, item.quantity + 1);
                                }
                            }}
                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Eliminar producto"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
