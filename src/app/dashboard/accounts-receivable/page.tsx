
"use client";

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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { accountsReceivable } from "@/lib/placeholder-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AccountsReceivablePage() {
  const formatUsd = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cuentas por Cobrar</CardTitle>
          <CardDescription>
            Seguimiento de deudas de clientes (ventas a crédito).
          </CardDescription>
        </div>
         <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Registrar Venta a Crédito
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha de Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountsReceivable.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.customer}</TableCell>
                <TableCell>{account.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={account.status === 'Pagada' ? 'default' : 'destructive'}>
                    {account.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${formatUsd(account.amount)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                       <DropdownMenuItem>Registrar Abono</DropdownMenuItem>
                       <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
