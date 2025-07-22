
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

export default async function DashboardPage() {
    // Simulate a 3-second loading time to demonstrate the loading screen.
    await new Promise(resolve => setTimeout(resolve, 3000));

    const totalInventoryCost = products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + p.salePrice * p.stock, 0);
    const estimatedProfit = totalInventoryValue - totalInventoryCost;
    const totalReceivable = accountsReceivable.reduce((sum, acc) => acc.status === 'Pendiente' ? sum + acc.amount : sum, 0);
    const totalPayable = accountsPayable.reduce((sum, acc) => acc.status === 'Pendiente' ? sum + acc.amount : sum, 0);
    
    const isCritical = totalPayable > (totalInventoryCost + totalReceivable);
    const bcvRate = getCurrentBcvRate();

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
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Costo del Inventario</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${formatUsd(totalInventoryCost)}</div>
            <p className="text-xs text-muted-foreground">
              Bs {formatBs(totalInventoryCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Valor del Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">${formatUsd(totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">
               Bs {formatBs(totalInventoryValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Ganancia Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${formatUsd(estimatedProfit)}</div>
            <p className="text-xs text-muted-foreground">
              Bs {formatBs(estimatedProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Cuentas por Cobrar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${formatUsd(totalReceivable)}</div>
            <p className="text-xs text-muted-foreground">
               Bs {formatBs(totalReceivable)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Cuentas por Pagar</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${formatUsd(totalPayable)}</div>
            <p className="text-xs text-muted-foreground">
               Bs {formatBs(totalPayable)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Salud Financiera</CardTitle>
             {isCritical ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
                <ThumbsUp className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
             <div className={`text-xl font-bold ${isCritical ? 'text-yellow-600' : 'text-green-600'}`}>
                {isCritical ? 'Crítico' : 'Saludable'}
            </div>
            <p className={`text-xs ${isCritical ? 'text-yellow-500' : 'text-green-500'}`}>
              {isCritical ? 'Las deudas superan los activos' : 'Operaciones estables'}
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
