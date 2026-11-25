import type { NutritionInfo } from '@/hooks/useProduct';

export function NutritionFacts({ info }: { info: NutritionInfo | null }) {
  if(!info)return null;
  const rows = [
    ['Energía',`${info.calories} kcal`],['Proteína',`${info.protein.value} ${info.protein.unit}`],['Carbohidratos',`${info.total_carbohydrates.value} ${info.total_carbohydrates.unit}`],['Azúcares',`${info.sugars.value} ${info.sugars.unit}`],['Grasas totales',`${info.total_fat.value} ${info.total_fat.unit}`],['Sodio',`${info.sodium.value} ${info.sodium.unit}`],
  ];
  return <details className="brand-accordion mt-10 border-y border-border py-5"><summary className="flex items-center justify-between gap-4 cursor-pointer"><h2 className="text-base font-semibold">Información nutrimental</h2><span aria-hidden="true" className="accordion-symbol text-gold text-2xl">+</span></summary><table className="w-full mt-6 text-sm"><caption className="text-left text-xs text-muted-foreground pb-4">Datos de la ficha del producto. Consulta también la etiqueta del lote.</caption><tbody>{rows.map(([label,value])=><tr key={label} className="border-t border-border"><th scope="row" className="text-left font-normal py-4 pr-4">{label}</th><td className="font-technical text-right py-4">{value}</td></tr>)}</tbody></table></details>;
}
