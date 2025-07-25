

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  LineChart,
  DollarSign,
  CreditCard,
  Settings,
  Store,
  Landmark,
  Wallet,
  Building,
  ShieldCheck,
  Tags,
  Copyright,
  ScanLine,
  FileCog,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PosLogo } from "../ui/pos-logo";
import { useBusinessContext } from "@/hooks/use-business-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const NavLink = ({ href, children, icon: Icon, onClick, disabled = false }: { href: string, children: React.ReactNode, icon: React.ElementType, onClick?: () => void, disabled?: boolean }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} passHref onClick={onClick} className={cn(disabled && "pointer-events-none")}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              disabled={disabled}
            >
              <Icon className="h-4 w-4" />
              {children}
            </Button>
        </Link>
    )
}

export function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user, userData, isLicenseInvalid } = useBusinessContext();
  const isAccountsActive = pathname.startsWith('/dashboard/accounts');
  const isProductsActive = pathname.startsWith('/dashboard/inventory') || 
                           pathname.startsWith('/dashboard/categories') ||
                           pathname.startsWith('/dashboard/brands') ||
                           pathname.startsWith('/dashboard/recount') ||
                           pathname.startsWith('/dashboard/inventory-settings') ||
                           pathname.startsWith('/dashboard/import-export');

  const navDisabled = isLicenseInvalid;
  
  const isAdmin = user && user.email === 'espedrodiaz94@gmail.com';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
              <PosLogo />
          </Link>
      </div>
       {userData && (
            <div className="p-4 space-y-2 border-b">
                <Label className="text-xs text-muted-foreground">Negocio Activo</Label>
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <div>
                        <p className="font-semibold text-sm leading-none">{userData.businessName}</p>
                        <p className="text-xs text-muted-foreground">{userData.businessCategory}</p>
                    </div>
                </div>
            </div>
        )}
      <div className="flex-1 space-y-2 p-4 overflow-y-auto">
        <nav className="flex-1 space-y-2">
            <NavLink href="/dashboard" icon={LayoutDashboard} onClick={onLinkClick} disabled={navDisabled}>Resumen</NavLink>
            <NavLink href="/dashboard/pos" icon={Store} onClick={onLinkClick} disabled={navDisabled}>Punto de Venta</NavLink>
            <NavLink href="/dashboard/sales" icon={LineChart} onClick={onLinkClick} disabled={navDisabled}>Ventas</NavLink>
            
             <Accordion type="single" collapsible defaultValue={isProductsActive ? "item-1" : ""} disabled={navDisabled}>
                <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className={cn(
                        "w-full justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:no-underline",
                        isProductsActive && "bg-secondary",
                        navDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}>
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Productos</span>
                    </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6 pt-1">
                        <NavLink href="/dashboard/inventory" icon={ShoppingCart} onClick={onLinkClick}>Inventario</NavLink>
                        <NavLink href="/dashboard/categories" icon={Tags} onClick={onLinkClick}>Categorías</NavLink>
                        <NavLink href="/dashboard/brands" icon={Copyright} onClick={onLinkClick}>Marcas</NavLink>
                        <NavLink href="/dashboard/recount" icon={ScanLine} onClick={onLinkClick}>Reconteo Físico</NavLink>
                        <NavLink href="/dashboard/inventory-settings" icon={FileCog} onClick={onLinkClick}>Ajustes de Inventario</NavLink>
                        <NavLink href="/dashboard/import-export" icon={FileDown} onClick={onLinkClick}>Importar/Exportar</NavLink>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <NavLink href="/dashboard/customers" icon={Users} onClick={onLinkClick} disabled={navDisabled}>Clientes</NavLink>
            <NavLink href="/dashboard/suppliers" icon={Truck} onClick={onLinkClick} disabled={navDisabled}>Proveedores</NavLink>
            <NavLink href="/dashboard/exchange-rates" icon={Landmark} onClick={onLinkClick} disabled={navDisabled}>Tasas de Cambio</NavLink>
            <NavLink href="/dashboard/payment-methods" icon={Wallet} onClick={onLinkClick} disabled={navDisabled}>Formas de Pago</NavLink>

            <Accordion type="single" collapsible defaultValue={isAccountsActive ? "item-1" : ""} disabled={navDisabled}>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className={cn(
                    "w-full justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:no-underline",
                    isAccountsActive && "bg-secondary",
                    navDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Cuentas</span>
                </div>
                </AccordionTrigger>
                <AccordionContent className="pl-6 pt-1">
                    <NavLink href="/dashboard/accounts-receivable" icon={CreditCard} onClick={onLinkClick}>Cuentas por Cobrar</NavLink>
                    <NavLink href="/dashboard/accounts-payable" icon={CreditCard} onClick={onLinkClick}>Cuentas por Pagar</NavLink>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
             
             {isAdmin && (
                <>
                    <Separator className="my-4" />
                    <NavLink href="/dashboard/users" icon={ShieldCheck} onClick={onLinkClick}>Gestionar Usuarios</NavLink>
                </>
             )}

        </nav>
      </div>

       <div className="mt-auto border-t p-4 space-y-4">
        {userData?.status !== 'Active' && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Estado de la Licencia: {userData?.status === 'Pending Activation' ? 'Pendiente' : userData?.status}</span>
            </Label>
            <p className="text-xs text-muted-foreground">Activa tu licencia para desbloquear todas las funciones.</p>
          </div>
        )}
        <NavLink href="/dashboard/settings" icon={Settings} onClick={onLinkClick}>Ajustes</NavLink>
      </div>
    </div>
  );
}
