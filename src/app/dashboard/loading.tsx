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
  const [phrase, setPhrase] = useState('');

  useEffect(() => {
    setPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <div className="mb-8">
            <PosLogo className="text-5xl" />
        </div>
        <div className="relative w-64 h-1 bg-muted rounded-full overflow-hidden mb-4">
            <div className="absolute inset-0 h-full bg-primary animate-pulse w-full"></div>
        </div>
        <p className="text-muted-foreground italic mb-12">{phrase}</p>
        <p className="text-xs text-muted-foreground/50">Tecnología Impulsada por DiazSoft</p>
      </div>
    </div>
  );
}
