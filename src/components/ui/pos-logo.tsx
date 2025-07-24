import { cn } from "@/lib/utils";

export const PosLogo = ({ className }: { className?: string }) => {
    return (
        <span className={cn("font-bold whitespace-nowrap", className)}>
            Facilito
            <span className="inline-block animate-logo-build" style={{ color: '#FFCD00', animationDelay: '0s' }}>P</span>
            <span className="inline-block animate-logo-build" style={{ color: '#0033A0', animationDelay: '0.15s' }}>O</span>
            <span className="inline-block animate-logo-build" style={{ color: '#CE1126', animationDelay: '0.3s' }}>S</span>
        </span>
    );
}