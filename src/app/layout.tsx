import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { BusinessProvider } from '@/hooks/use-business-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Facilito POS Venezuela',
  description: 'Point of Sale system for small businesses in Venezuela',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FacilitoPOS" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="font-body antialiased">
        <BusinessProvider>
          {children}
        </BusinessProvider>
        <Toaster />
      </body>
    </html>
  );
}
