import { cn } from "@/lib/utils";

export const PosLogo = ({ className }: { className?: string }) => {
    return (
        <span className={cn("font-bold", className)}>
            Facilito<span style={{ color: '#FFCD00' }}>P</span><span style={{ color: '#0033A0' }}>O</span><span style={{ color: '#CE1126' }}>S</span>
        </span>
    );
}
