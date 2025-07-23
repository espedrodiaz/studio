
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessContext } from '@/hooks/use-business-context';
import Loading from './dashboard/loading';

export default function HomePage() {
  const { user, isLoading } = useBusinessContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return <Loading />;
}
