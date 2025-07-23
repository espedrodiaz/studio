
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PosLogo } from "../ui/pos-logo";
import { businessCategories } from "@/lib/placeholder-data";
import { useBusinessContext } from "@/hooks/use-business-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

const NavLink = ({ href, children, icon: Icon, onClick }: { href: string, children: React.ReactNode, icon: React.ElementType, onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} passHref onClick={onClick}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Icon className="h-4 w-4" />
              {children}
            </Button>
        </Link>
    )
}

export function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { businessCategory, setBusinessCategory } = useBusinessContext();
  const isAccountsActive = pathname.startsWith('/dashboard/accounts');

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
              <PosLogo />
          </Link>
      </div>
      <div className="flex-1 space-y-2 p-4 overflow-y-auto">
        <nav className="flex-1 space-y-2">
            <NavLink href="/dashboard" icon={LayoutDashboard} onClick={onLinkClick}>Resumen</NavLink>
            <NavLink href="/dashboard/pos" icon={Store} onClick={onLinkClick}>TPV</NavLink>
            <NavLink href="/dashboard/sales" icon={LineChart} onClick={onLinkClick}>Ventas</NavLink>
            <NavLink href="/dashboard/inventory" icon={Package} onClick={onLinkClick}>Inventario</NavLink>
            <NavLink href="/dashboard/customers" icon={Users} onClick={onLinkClick}>Clientes</NavLink>
            <NavLink href="/dashboard/suppliers" icon={Truck} onClick={onLinkClick}>Proveedores</NavLink>
            <NavLink href="/dashboard/exchange-rates" icon={Landmark} onClick={onLinkClick}>Tasas de Cambio</NavLink>
            <NavLink href="/dashboard/payment-methods" icon={Wallet} onClick={onLinkClick}>Formas de Pago</NavLink>

            <Accordion type="single" collapsible defaultValue={isAccountsActive ? "item-1" : ""}>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className={cn(
                    "w-full justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:no-underline",
                    isAccountsActive && "bg-secondary"
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
             <Separator className="my-4" />
             <NavLink href="/dashboard/users" icon={ShieldCheck} onClick={onLinkClick}>Gestionar Usuarios</NavLink>

        </nav>
      </div>

       <div className="mt-auto border-t p-4 space-y-4">
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Simulador de Negocio</span>
            </Label>
            <Select value={businessCategory} onValueChange={setBusinessCategory}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Categoría" />
                </SelectTrigger>
                <SelectContent>
                    {businessCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <NavLink href="/dashboard/settings" icon={Settings} onClick={onLinkClick}>Ajustes</NavLink>
      </div>
    </div>
  );
}
