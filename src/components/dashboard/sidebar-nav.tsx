
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
  Gem,
  Settings,
  User,
  PanelLeft,
  Store,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isAccountsActive = pathname.startsWith('/dashboard/accounts');

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={onLinkClick}>
              <Gem className="h-6 w-6 text-primary" />
              <span className="">FacilPOS</span>
          </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <NavLink href="/dashboard" icon={LayoutDashboard} onClick={onLinkClick}>Resumen</NavLink>
        <NavLink href="/pos" icon={Store} onClick={onLinkClick}>TPV</NavLink>
        <NavLink href="/dashboard/sales" icon={LineChart} onClick={onLinkClick}>Ventas</NavLink>
        <NavLink href="/dashboard/inventory" icon={Package} onClick={onLinkClick}>Inventario</NavLink>
        <NavLink href="/dashboard/customers" icon={Users} onClick={onLinkClick}>Clientes</NavLink>
        <NavLink href="/dashboard/suppliers" icon={Truck} onClick={onLinkClick}>Proveedores</NavLink>
        <NavLink href="/dashboard/exchange-rates" icon={Landmark} onClick={onLinkClick}>Tasas de Cambio</NavLink>
        
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
      </nav>
      <div className="mt-auto border-t p-4">
        <NavLink href="/dashboard/settings" icon={Settings} onClick={onLinkClick}>Ajustes</NavLink>
      </div>
    </div>
  );
}
