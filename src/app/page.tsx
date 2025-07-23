
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessContext } from '@/hooks/use-business-context';
import Loading from './dashboard/loading';

export default function HomePage() {
  const { user, isLoading } = useBusinessContext();
  const router = useRouter();

  useEffect(() => {
    // No hacer nada mientras está cargando la información del usuario
    if (isLoading) {
      return;
    }

    // Si ya terminó de cargar y hay un usuario, lo mandamos al dashboard
    if (user) {
      router.replace('/dashboard');
    } else {
      // Si no hay usuario, lo mandamos a la página de login
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Mostrar una pantalla de carga mientras se decide a dónde redirigir
  return <Loading />;
}
