
"use client";

import Link from "next/link";
import {
  PanelLeft,
  User,
  LineChart,
  ShieldCheck,
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
import { BusinessProvider, useBusinessContext } from "@/hooks/use-business-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const ActivationBanner = () => {
    const { isActivated, activateLicense } = useBusinessContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [licenseKey, setLicenseKey] = useState('');

    if (isActivated) {
        return null;
    }

    const handleActivation = () => {
        const success = activateLicense(licenseKey);
        if (success) {
            toast({
                title: "¡Licencia Activada!",
                description: "Bienvenido. Su cuenta ha sido activada y personalizada.",
            });
            setIsModalOpen(false);
        } else {
             toast({
                title: "Error de Activación",
                description: "La clave de producto no es válida. Por favor, verifique e intente de nuevo.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <div className="bg-yellow-400 text-yellow-900 text-center p-2 text-sm font-medium flex items-center justify-center gap-4">
                <span>Estás en modo de demostración.</span>
                <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 bg-yellow-50 hover:bg-yellow-100 h-8"
                    onClick={() => setIsModalOpen(true)}
                >
                    <ShieldCheck className="h-4 w-4" />
                    Activar Licencia
                </Button>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activar Licencia de Producto</DialogTitle>
                        <DialogDescription>
                            Introduce la clave de producto que te fue suministrada para personalizar tu experiencia.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="license-key">Clave de Producto</Label>
                            <Input id="license-key" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleActivation} disabled={!licenseKey.trim()}>Activar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};


const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
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
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarNav />
      </div>
      <div className="flex flex-col">
         <header className="flex h-auto items-center gap-4 border-b bg-muted/40 px-4 lg:px-6 flex-col">
            <ActivationBanner />
            <div className="flex h-14 w-full items-center">
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
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
        <footer className="text-center p-4 text-xs text-muted-foreground">
            Desarrollado por DiazSoft
        </footer>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </BusinessProvider>
  );
}
