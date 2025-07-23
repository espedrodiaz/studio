
"use client";

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
import { Badge } from "@/components/ui/badge";
import { getInventoryMovements } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function InventorySettingsPage() {
  const movements = getInventoryMovements();
  
  const formatVenezuelanDateTime = (isoString: string) => new Date(isoString).toLocaleString('es-VE', { timeZone: 'America/Caracas', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Movimientos de Inventario</CardTitle>
        <CardDescription>
          Registro detallado de todas las entradas, salidas y ajustes de stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo de Movimiento</TableHead>
              <TableHead className="text-center">Cambio</TableHead>
              <TableHead className="text-center">Stock Resultante</TableHead>
              <TableHead>Usuario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((mov) => (
              <TableRow key={mov.id}>
                <TableCell className="text-xs text-muted-foreground">{formatVenezuelanDateTime(mov.date)}</TableCell>
                <TableCell className="font-medium">{mov.product}</TableCell>
                <TableCell>
                  <Badge variant="outline">{mov.type}</Badge>
                </TableCell>
                <TableCell className={cn("text-center font-semibold flex items-center justify-center gap-1", {
                    'text-green-600': mov.quantityChange > 0,
                    'text-red-600': mov.quantityChange < 0,
                })}>
                    {mov.quantityChange > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {mov.quantityChange}
                </TableCell>
                <TableCell className="text-center font-bold">{mov.finalStock}</TableCell>
                <TableCell>{mov.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
