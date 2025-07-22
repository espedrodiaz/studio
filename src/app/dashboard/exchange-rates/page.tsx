
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { MoreHorizontal, PlusCircle, Trash2, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { exchangeRates as initialRates, updateCurrentBcvRate, getCurrentBcvRate, bcvRateSubject } from "@/lib/placeholder-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  useEffect(() => {
    const subscription = bcvRateSubject.subscribe(rate => {
      setCurrentRate(rate);
    });
    return () => subscription.unsubscribe();
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    rates.forEach(rate => {
      const date = new Date(rate.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months);
  }, [rates]);

  const filteredRates = useMemo(() => {
    if (selectedMonth === 'all') {
      return rates;
    }
    return rates.filter(rate => {
      const date = new Date(rate.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      return monthYear === selectedMonth;
    });
  }, [rates, selectedMonth]);

  const monthSummary = useMemo(() => {
    if (selectedMonth === 'all' || filteredRates.length < 1) {
      return null;
    }
    const monthRates = [...filteredRates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const initialRate = monthRates[0].rate;
    const finalRate = monthRates[monthRates.length - 1].rate;
    const variation = finalRate - initialRate;
    const percentage = initialRate !== 0 ? (variation / initialRate) * 100 : 0;
    
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (variation > 0) trend = 'up';
    if (variation < 0) trend = 'down';

    return {
      initialRate,
      finalRate,
      variation,
      percentage,
      trend
    };
  }, [filteredRates, selectedMonth]);


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
    
    // Add new rate and re-sort
    const updatedRates = [...rates, newRateEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setRates(updatedRates);
    
    // The most recent rate becomes the current rate
    if (updatedRates.length > 0) {
      updateCurrentBcvRate(updatedRates[0]);
    }
    
    setNewRate("");
    toast({
      title: "Tasa Agregada",
      description: `La nueva tasa de ${newRate} Bs/$ ha sido registrada.`,
    });
  };

  const handleDeleteRate = (id: string) => {
    const newRates = rates.filter(rate => rate.id !== id);
    setRates(newRates);
    
    const sorted = [...newRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length > 0) {
        updateCurrentBcvRate(sorted[0]);
    } else {
        updateCurrentBcvRate({rate: 0});
    }

     toast({
      title: "Tasa Eliminada",
      description: "La tasa ha sido eliminada del historial.",
      variant: "destructive"
    });
  }

  const getRateChange = (index: number) => {
      if (index >= filteredRates.length - 1) {
          return null; // No previous rate to compare
      }
      const current = filteredRates[index].rate;
      const previous = filteredRates[index + 1].rate;
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
        <CardContent className="grid gap-8 md:grid-cols-3">
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
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Historial de Tasas</CardTitle>
                      <div className="w-48">
                         <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por mes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los meses</SelectItem>
                                {availableMonths.map(month => (
                                    <SelectItem key={month} value={month}>{new Date(month).toLocaleString('es-VE', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {monthSummary && (
                      <Card className="mb-6 bg-muted/30">
                          <CardHeader className="pb-2">
                              <CardTitle className="text-base">
                                Resumen de {new Date(selectedMonth).toLocaleString('es-VE', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                  <p className="text-sm text-muted-foreground">Tasa Inicial</p>
                                  <p className="font-semibold">{formatBs(monthSummary.initialRate)}</p>
                              </div>
                              <div>
                                  <p className="text-sm text-muted-foreground">Tasa Final</p>
                                  <p className="font-semibold">{formatBs(monthSummary.finalRate)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Variación</p>
                                <div className={cn("flex items-center justify-center gap-1 font-semibold", 
                                  monthSummary.trend === 'up' ? 'text-green-600' : 
                                  monthSummary.trend === 'down' ? 'text-red-500' : ''
                                )}>
                                  {monthSummary.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                                  {monthSummary.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                                  {monthSummary.trend === 'neutral' && <Minus className="h-4 w-4" />}
                                  <span>{formatBs(monthSummary.variation)} ({monthSummary.percentage.toFixed(2)}%)</span>
                                </div>
                              </div>
                          </CardContent>
                      </Card>
                    )}
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
                            {filteredRates.map((rate, index) => {
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
