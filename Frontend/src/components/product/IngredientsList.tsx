import { Badge } from "@/components/ui/badge";

interface IngredientsListProps {
    ingredients: string;
}

export function IngredientsList({ ingredients }: IngredientsListProps) {
    // Function to split by comma but ignore commas inside parentheses
    const parseIngredients = (text: string) => {
        const result = [];
        let current = "";
        let depth = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === "(") depth++;
            if (char === ")") depth--;

            if (char === "," && depth === 0) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }
        if (current.trim()) result.push(current.trim());
        return result;
    };

    const list = parseIngredients(ingredients);

    return (
        <div className="flex flex-wrap gap-2">
            {list.map((item, index) => (
                <Badge
                    key={index}
                    variant="secondary"
                    className="bg-secondary/50 hover:bg-gold/10 hover:text-gold transition-colors text-muted-foreground font-normal px-3 py-1"
                >
                    {item}
                </Badge>
            ))}
        </div>
    );
}
