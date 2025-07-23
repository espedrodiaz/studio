import { cn } from "@/lib/utils";

export const PosLogo = ({ className }: { className?: string }) => {
    return (
        <span className={cn("font-bold", className)}>
            Facilito
            <span className="inline-block animate-wave-bounce" style={{ color: '#FFCD00', animationDelay: '0s' }}>P</span>
            <span className="inline-block animate-wave-bounce" style={{ color: '#0033A0', animationDelay: '0.1s' }}>O</span>
            <span className="inline-block animate-wave-bounce" style={{ color: '#CE1126', animationDelay: '0.2s' }}>S</span>
        </span>
    );
}
