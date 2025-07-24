
"use client";

import Link from "next/link";
import {
  PanelLeft,
  User,
  LineChart,
  ShieldCheck,
  LogOut,
  Loader2,
  ShieldX,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { getCurrentBcvRate, bcvRateSubject } from "@/lib/placeholder-data";
import { useState, useEffect } from "react";
import { useBusinessContext } from "@/hooks/use-business-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import { cn } from "@/lib/utils";


const ActivationBanner = () => {
    const { userData, activateLicense, isLicenseInvalid } = useBusinessContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [licenseKey, setLicenseKey] = useState('');

    if (!userData || userData.status === 'Active') {
        return null;
    }

    const handleActivation = () => {
        const success = activateLicense(licenseKey);
        if (success) {
            toast({
                title: "¡Licencia Activada!",
                description: "¡Felicidades! Todas las funciones de su cuenta han sido activadas por un año.",
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
    
    const trialEndDate = userData.trialEndsAt ? new Date(userData.trialEndsAt) : null;
    const daysRemaining = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const isTrial = userData.status === 'Trial';

    return (
        <>
            <div className={cn("text-yellow-900 text-center p-2 text-sm font-medium flex items-center justify-center gap-4 w-full",
                isLicenseInvalid && isTrial ? "bg-yellow-400" : "bg-red-500 text-white"
            )}>
                {isTrial ? (
                    isLicenseInvalid ? (
                         <span>Tu período de prueba ha expirado. Activa tu licencia para continuar.</span>
                    ) : (
                        <span>
                            Estás en modo de prueba. Te quedan ${daysRemaining} días.
                        </span>
                    )
                ) : (
                    <span>Tu licencia ha expirado o está suspendida. Actívala para continuar.</span>
                )}
                <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-900 h-8"
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
                            Introduce la clave de producto que te fue suministrada para activar tu cuenta.
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


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [bcvRate, setBcvRate] = useState(getCurrentBcvRate());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isLoading, user, isLicenseInvalid, userData } = useBusinessContext();
  const router = useRouter();

  useEffect(() => {
    const subscription = bcvRateSubject.subscribe(rate => {
      setBcvRate(rate);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    toast({title: "Sesión Cerrada", description: "Has cerrado sesión exitosamente."})
    router.push('/login');
  }

  const closeSheet = () => {
    setIsSheetOpen(false);
  }

  if (isLoading) {
      return <div className="fixed inset-0 flex items-center justify-center bg-background z-50"><Loading /></div>;
  }
  
  if (!user) {
      // This is a fallback, the auth listener in the provider should handle this.
      router.replace('/login');
      return <div className="fixed inset-0 flex items-center justify-center bg-background z-50"><Loading /></div>;
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
                    <DropdownMenuLabel>{userData?.businessName || 'Mi Cuenta'}</DropdownMenuLabel>
                     {userData?.status === 'Active' && userData.licenseExpiresAt && (
                        <DropdownMenuLabel className="font-normal text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            <span>Vence: {new Date(userData.licenseExpiresAt).toLocaleDateString('es-VE')}</span>
                        </DropdownMenuLabel>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>Ajustes</DropdownMenuItem>
                    <DropdownMenuItem>Soporte</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {isLicenseInvalid ? (
             <Card className="flex flex-col items-center justify-center text-center p-12 gap-4">
                <ShieldX className="h-16 w-16 text-destructive" />
                <CardTitle>Acceso Restringido</CardTitle>
                <CardDescription>
                    Tu período de prueba o licencia ha expirado. Por favor, activa una licencia para continuar.
                </CardDescription>
             </Card>
          ) : (
            children
          )}
        </main>
        <footer className="text-center p-4 text-xs text-muted-foreground">
            Desarrollado por DiazSoft
        </footer>
      </div>
    </div>
  )
}
