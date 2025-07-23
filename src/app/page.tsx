
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PosLogo } from '@/components/ui/pos-logo';

const loadingPhrases = [
  "Cargando tu punto de venta...",
  "Simplificando tus finanzas.",
  "Todo para tu negocio.",
  "El control en un solo lugar.",
  "Ventas más fáciles que nunca."
];

export default function WelcomePage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Navigate to signup after 10 seconds
    const navigationTimer = setTimeout(() => {
      router.push('/signup');
    }, 10000);

    // Change phrase every 2 seconds
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % loadingPhrases.length);
    }, 2000);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(navigationTimer);
      clearInterval(phraseTimer);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="mb-8">
          <PosLogo className="text-5xl" />
        </div>
        <div className="relative w-64 h-1 bg-muted rounded-full overflow-hidden mb-4">
          <div className="absolute inset-0 h-full bg-primary animate-pulse w-full"></div>
        </div>
        <div className="h-6 mb-12">
          <p key={phraseIndex} className="text-muted-foreground italic animate-fade-in">
            {loadingPhrases[phraseIndex]}
          </p>
        </div>
        <p className="text-xs text-muted-foreground/50">Tecnología Impulsada por DiazSoft</p>
      </div>
    </div>
  );
}
