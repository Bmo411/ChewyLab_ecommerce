import { CheckoutItem } from "@/types/checkout.types";
import { AlertTriangle, XCircle } from "lucide-react";

interface CheckoutItemRowProps {
    item: CheckoutItem;
}

import { Link } from "react-router-dom";

export const CheckoutItemRow = ({ item }: CheckoutItemRowProps) => {
    return (
        <Link
            to={item.slug ? `/producto/${item.slug}` : "#"}
            className={`group block p-4 mb-4 rounded-xl border border-border bg-card transition-all hover:shadow-md hover:border-gold/50 ${item.isInactive ? "opacity-50 pointer-events-none" : ""}`}
        >
            <div className="flex gap-4">
                {/* Image */}
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 group-hover:scale-105 transition-transform duration-300">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-display text-foreground group-hover:text-gold transition-colors">
                                {item.name}
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground mt-0.5">
                                {item.weight}
                            </p>
                        </div>
                        <div className="text-right">
                            {item.hasPriceChange ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-muted-foreground line-through">
                                        ${item.price.toFixed(2)}
                                    </span>
                                    <span className="text-base font-bold text-amber-500 flex items-center gap-1">
                                        ${item.currentPrice.toFixed(2)}
                                        <AlertTriangle className="h-3 w-3" />
                                    </span>
                                </div>
                            ) : (
                                <p className="text-lg font-bold text-gold">
                                    ${item.price.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div className="text-sm font-medium text-gold bg-gold/5 px-2 py-1 rounded-md">
                            Cant: {item.quantity}
                        </div>

                        {/* Validation Errors */}
                        <div className="space-y-1 text-right">
                            {item.isInactive && (
                                <div className="flex items-center justify-end gap-1.5 text-destructive text-sm font-semibold">
                                    <XCircle className="h-4 w-4" />
                                    <span>No disponible</span>
                                </div>
                            )}

                            {item.hasStockIssue && !item.isInactive && (
                                <div className="flex items-center justify-end gap-1.5 text-destructive text-sm font-semibold">
                                    <XCircle className="h-4 w-4" />
                                    <span>Stock insuficiente ({item.currentStock})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {item.hasPriceChange && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-amber-500 text-xs font-semibold">
                    <AlertTriangle className="h-3 w-3" />
                    <span>El precio de este producto ha cambiado desde que lo agregaste.</span>
                </div>
            )}
        </Link>
    );
};
