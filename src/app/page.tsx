
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component now serves as a simple redirect to the main welcome/landing page.
export default function RedirectToWelcome() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/welcome');
  }, [router]);

  // Render nothing, or a loading spinner, while redirecting.
  return null;
}
