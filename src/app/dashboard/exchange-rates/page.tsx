
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { exchangeRates as initialRates, updateCurrentBcvRate, getCurrentBcvRate, bcvRateSubject } from "@/lib/placeholder-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ExchangeRate = {
  id: string;
  date: string;
  rate: number;
};

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>(
    [...initialRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  const [newRate, setNewRate] = useState<number | "">("");
  const [currentRate, setCurrentRate] = useState(getCurrentBcvRate());

  useEffect(() => {
    const subscription = bcvRateSubject.subscribe(rate => {
      setCurrentRate(rate);
    });
    return () => subscription.unsubscribe();
  }, []);


  const handleAddRate = () => {
    if (typeof newRate !== 'number' || newRate <= 0) {
        toast({
            title: "Error",
            description: "Por favor, ingrese una tasa válida.",
            variant: "destructive",
        });
        return;
    }
    const newRateEntry: ExchangeRate = {
      id: `RATE${new Date().getTime()}`,
      date: new Date().toISOString(),
      rate: newRate,
    };
    const updatedRates = [newRateEntry, ...rates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRates(updatedRates);
    updateCurrentBcvRate(newRateEntry);
    setNewRate("");
    toast({
      title: "Tasa Agregada",
      description: `La nueva tasa de ${newRate} Bs/$ ha sido registrada.`,
    });
  };

  const handleDeleteRate = (id: string) => {
    const newRates = rates.filter(rate => rate.id !== id);
    setRates(newRates);
    
    // If the deleted rate was the current one, update to the next most recent
    const sorted = [...newRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length > 0) {
        updateCurrentBcvRate(sorted[0]);
    } else {
        updateCurrentBcvRate({rate: 0}); // or some default state
    }

     toast({
      title: "Tasa Eliminada",
      description: "La tasa ha sido eliminada del historial.",
      variant: "destructive"
    });
  }

  const getRateChange = (index: number) => {
      if (index >= rates.length - 1) {
          return null; // No previous rate to compare
      }
      const current = rates[index].rate;
      const previous = rates[index + 1].rate;
      const difference = current - previous;
      const percentage = (difference / previous) * 100;

      let trend: 'up' | 'down' | null = null;
      if (difference > 0) trend = 'up';
      if (difference < 0) trend = 'down';

      return {
          trend,
          difference,
          percentage
      }
  }
  
  const formatVenezuelanDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-VE', {
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
  }

  const formatBs = (amount: number) => {
    const fixedAmount = amount.toFixed(2);
    const [integer, decimal] = fixedAmount.split('.');
    const formattedInteger = new Intl.NumberFormat('de-DE').format(Number(integer));
    return `${formattedInteger},${decimal}`;
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasa de Cambio BCV</CardTitle>
          <CardDescription>
            Administra la tasa de cambio de Bolívares (VES) a Dólares (USD)
            según el Banco Central de Venezuela.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col items-center justify-center bg-muted/40 rounded-lg p-8">
                    <p className="text-sm font-medium text-muted-foreground">
                        Tasa Actual (VES / USD)
                    </p>
                    <p className="text-5xl font-bold tracking-tight text-green-600">
                        {currentRate.toFixed(2)}
                    </p>
                </div>
                 <div className="space-y-4">
                  <p className="font-medium">Añadir Nueva Tasa</p>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Nueva Tasa (Bs por 1$)</Label>
                    <div className="flex gap-2">
                    <Input
                      id="rate"
                      type="number"
                      placeholder="Ej: 100.00"
                      value={newRate}
                      onChange={(e) => setNewRate(parseFloat(e.target.value) || "")}
                    />
                     <Button onClick={handleAddRate} disabled={!newRate || newRate <= 0} className="gap-2">
                        <PlusCircle />
                        Añadir
                     </Button>
                    </div>
                  </div>
                </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                    <CardTitle>Historial de Tasas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha y Hora</TableHead>
                                <TableHead className="text-center">Tasa (Bs/$)</TableHead>
                                <TableHead className="text-center">Cambio</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rates.map((rate, index) => {
                                const change = getRateChange(index);
                                return (
                                <TableRow key={rate.id}>
                                    <TableCell className="text-xs">{formatVenezuelanDateTime(rate.date)}</TableCell>
                                    <TableCell className="font-medium text-center">{rate.rate.toFixed(2)}</TableCell>
                                    <TableCell className={cn("text-xs text-center", change?.trend === 'up' ? 'text-green-600' : 'text-red-500')}>
                                      {change && change.trend && (
                                        <div className="flex items-center justify-center gap-1">
                                          {change.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                          <span>{formatBs(change.difference)} ({change.percentage.toFixed(2)}%)</span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleDeleteRate(rate.id)} className="text-destructive gap-2">
                                            <Trash2 /> Eliminar
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
              </Card>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
