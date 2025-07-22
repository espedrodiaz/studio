
import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  Package,
  CreditCard,
  Users,
  LineChart,
  AlertTriangle,
  ThumbsUp,
  BarChart,
  CalendarDays,
  Receipt,
  HeartPulse,
  Ban,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sales, products, accountsPayable, accountsReceivable, getCurrentBcvRate } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
    // Simulate a 3-second loading time to demonstrate the loading screen.
    // await new Promise(resolve => setTimeout(resolve, 3000));

    const totalInventoryCost = products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.salePrice * p.stock, 0);
    const estimatedProfit = totalInventoryValue - totalInventoryCost;
    const totalReceivable = accountsReceivable.reduce((sum, acc) => acc.status === 'Pendiente' ? sum + acc.amount : sum, 0);
    const totalPayable = accountsPayable.reduce((sum, acc) => acc.status === 'Pendiente' ? sum + acc.amount : sum, 0);
    
    let financialStatus: 'grave' | 'critico' | 'saludable';
    const totalAssets = totalInventoryValue + totalReceivable;

    if (totalPayable > totalAssets) {
        financialStatus = 'grave';
    } else if (totalPayable > totalReceivable) {
        financialStatus = 'critico';
    } else {
        financialStatus = 'saludable';
    }

    const bcvRate = getCurrentBcvRate();

    const today = new Date();
    const todaySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getDate() === today.getDate() &&
               saleDate.getMonth() === today.getMonth() &&
               saleDate.getFullYear() === today.getFullYear();
    });
    const todayTotalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayTransactions = todaySales.length;

    const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === today.getMonth() &&
               saleDate.getFullYear() === today.getFullYear();
    });
    const monthTotalSales = monthSales.reduce((sum, sale) => sum + sale.total, 0);


    const formatBs = (amount: number) => {
        return (amount * bcvRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const formatUsd = (amount: number) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const formatVenezuelanDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('es-VE', {
            timeZone: 'America/Caracas',
        });
    }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo del Inventario</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(totalInventoryCost)}</div>
            <p className="text-xs text-green-600">
              Bs {formatBs(totalInventoryCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            <Package className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(totalInventoryValue)}</div>
            <p className="text-xs text-green-600">
               Bs {formatBs(totalInventoryValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(estimatedProfit)}</div>
            <p className="text-xs text-green-600">
              Bs {formatBs(estimatedProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(totalReceivable)}</div>
            <p className="text-xs text-green-600">
               Bs {formatBs(totalReceivable)}
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas por Pagar</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(totalPayable)}</div>
            <p className="text-xs text-green-600">
               Bs {formatBs(totalPayable)}
            </p>
          </CardContent>
        </Card>
        <Card className={cn("text-white", {
              'bg-green-500': financialStatus === 'saludable',
              'bg-yellow-500': financialStatus === 'critico',
              'bg-red-600': financialStatus === 'grave',
        })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Salud Financiera</CardTitle>
             <HeartPulse className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
             <div className="text-center text-2xl font-bold text-white pt-2">
                {financialStatus === 'saludable' && 'Saludable'}
                {financialStatus === 'critico' && 'Crítico'}
                {financialStatus === 'grave' && 'Grave'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
            <BarChart className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(todayTotalSales)}</div>
            <p className="text-xs text-green-600">
              Bs {formatBs(todayTotalSales)}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              {todayTransactions} transacciones
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <CalendarDays className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${formatUsd(monthTotalSales)}</div>
            <p className="text-xs text-green-600">
              Bs {formatBs(monthTotalSales)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle className="text-lg">Últimas Ventas</CardTitle>
              <CardDescription>
                Resumen de las ventas más recientes.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/sales">
                Ver Todas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden xl:table-column text-right">Fecha</TableHead>
                   <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.slice(0, 5).map(sale => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.customer}</div>
                  </TableCell>
                  <TableCell className="text-right">${formatUsd(sale.total)}</TableCell>
                  <TableCell className="hidden xl:table-column text-right">{formatVenezuelanDate(sale.date)}</TableCell>
                   <TableCell className="text-right">
                    <Badge variant={sale.status === 'Pagada' ? 'default' : 'secondary'} className={sale.status === 'Pagada' ? 'bg-green-500/20 text-green-700' : ''}>
                        {sale.status}
                    </Badge>
                   </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventario Reciente</CardTitle>
            <CardDescription>
              Productos añadidos o actualizados recientemente.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            {products.slice(0, 4).map(product => (
            <div className="flex items-center gap-4" key={product.id}>
              <Avatar className="hidden h-9 w-9 sm:flex rounded-md bg-muted">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${product.name.charAt(0)}`} alt={product.name} />
                <AvatarFallback className="rounded-md">{product.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  ID: {product.id}
                </p>
              </div>
              <div className="ml-auto font-medium">{product.stock} unidades</div>
            </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
