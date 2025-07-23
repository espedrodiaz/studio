
"use client";

import Link from "next/link";
import {
  PanelLeft,
  User,
  LineChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { getCurrentBcvRate, bcvRateSubject } from "@/lib/placeholder-data";
import { useState, useEffect } from "react";
import { BusinessProvider } from "@/hooks/use-business-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bcvRate, setBcvRate] = useState(getCurrentBcvRate());
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const subscription = bcvRateSubject.subscribe(rate => {
      setBcvRate(rate);
    });
    return () => subscription.unsubscribe();
  }, []);

  const closeSheet = () => {
    setIsSheetOpen(false);
  }

  return (
    <BusinessProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <SidebarNav />
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                <SidebarNav onLinkClick={closeSheet} />
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                  <span>Tasa BCV: <span className="font-semibold text-green-600">{bcvRate.toFixed(2)} Bs/$</span></span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Ajustes</DropdownMenuItem>
                <DropdownMenuItem>Soporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
          <footer className="text-center p-4 text-xs text-muted-foreground">
              Desarrollado por DiazSoft
          </footer>
        </div>
      </div>
    </BusinessProvider>
  );
}
