
"use client";

import { useEffect, useState } from 'react';
import { PosLogo } from '@/components/ui/pos-logo';

const loadingPhrases = [
  "Estamos cargando tus productos...",
  "No perderás ni un céntimo de tu inversión.",
  "Tus ventas estarán al día.",
  "Tus cuentas claras con nosotros.",
  "Tú trabaja, nosotros hacemos el papeleo."
];

export default function Loading() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % loadingPhrases.length);
    }, 2000); // Change phrase every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
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
