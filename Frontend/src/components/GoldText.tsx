import type { ElementType, ReactNode } from 'react';
interface GoldTextProps { children: ReactNode; className?: string; as?: ElementType; }
export function GoldText({ children, className = '', as: Component = 'span' }: GoldTextProps) { return <Component className={`text-gold ${className}`}>{children}</Component>; }
export function GoldTextHover({ children, className = '', as: Component = 'span' }: GoldTextProps) { return <Component className={`transition-colors hover:text-gold ${className}`}>{children}</Component>; }
