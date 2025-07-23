
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    MoreHorizontal, 
    ChevronLeft, 
    ChevronRight, 
    History,
    DollarSign,
    CreditCard,
    Smartphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sales, paymentMethods, getCurrentBcvRate } from "@/lib/placeholder-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    startOfWeek, 
    endOfWeek, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval,
    format,
    addDays,
    subDays,
    addMonths,
    subMonths,
    isSameDay,
    parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Sale = typeof sales[0];
type PaymentMethod = typeof paymentMethods[0];

export default function SalesPage() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const bcvRate = getCurrentBcvRate();

  const { interval, dateRangeLabel } = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        interval: { start, end },
        dateRangeLabel: `${format(start, 'd/L')} - ${format(end, 'd/L/yyyy')}`,
      };
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return {
        interval: { start, end },
        dateRangeLabel: format(currentDate, 'MMMM yyyy', { locale: es }),
      };
    }
  }, [currentDate, viewMode]);

  const daysInInterval = useMemo(() => {
     if (viewMode === 'week') {
        return eachDayOfInterval(interval);
     }
     return [];
  }, [interval, viewMode]);

  const handleDateChange = (direction: 'prev' | 'next') => {
      if (viewMode === 'week') {
          setCurrentDate(direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7));
      } else {
          setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
      }
      setSelectedDate(null);
  }

  const salesInPeriod = useMemo(() => {
    const period = selectedDate ? { start: selectedDate, end: selectedDate } : interval;
    return sales.filter(sale => {
      const saleDate = parseISO(sale.date);
      return saleDate >= period.start && saleDate <= period.end;
    });
  }, [sales, interval, selectedDate]);
  
  const totalsByPaymentMethod = useMemo(() => {
    const totals: { [key: string]: { usd: number, ves: number } } = {};
    
    paymentMethods.forEach(pm => {
      totals[pm.id] = { usd: 0, ves: 0 };
    });

    salesInPeriod.forEach(sale => {
      sale.payments.forEach(p => {
        const method = paymentMethods.find(pm => pm.id === p.methodId);
        if (method) {
          if (method.currency === '$') {
            totals[method.id].usd += p.amount;
          } else {
            totals[method.id].ves += p.amount;
          }
        }
      });
    });

    return totals;
  }, [salesInPeriod, paymentMethods]);

  const totalSoldInPeriod = useMemo(() => {
    let totalUsd = 0;
    Object.values(totalsByPaymentMethod).forEach(total => {
        totalUsd += total.usd;
        totalUsd += total.ves / bcvRate;
    });
    return totalUsd;
  }, [totalsByPaymentMethod, bcvRate]);


  const groupedSalesByDay = useMemo(() => {
    const grouped: { [key: string]: Sale[] } = {};
    sales.filter(sale => { // Filter for the whole week/month, not just selected day
        const saleDate = parseISO(sale.date);
        return saleDate >= interval.start && saleDate <= interval.end;
    }).forEach(sale => {
      const dayKey = format(parseISO(sale.date), 'yyyy-MM-dd');
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(sale);
    });
    return Object.entries(grouped).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [sales, interval]);

  const formatUsd = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const getPaymentMethodIcon = (methodName: string) => {
    const lowerCaseName = methodName.toLowerCase();
    if (lowerCaseName.includes('usd') || lowerCaseName.includes('dolar') || lowerCaseName.includes('zelle')) {
      return <DollarSign className="w-5 h-5 text-green-600" />;
    }
     if (lowerCaseName.includes('efectivo') && lowerCaseName.includes('bs')) {
      return <CreditCard className="w-5 h-5 text-blue-600" />;
    }
    if (lowerCaseName.includes('tarjeta') || lowerCaseName.includes('punto')) {
      return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
    if (lowerCaseName.includes('pago móvil')) {
      return <Smartphone className="w-5 h-5 text-purple-600" />;
    }
    return <DollarSign className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <History className="h-6 w-6" />
                    Historial de Ventas
                </CardTitle>
                <CardDescription>
                    Consulta todas las ventas registradas por períodos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs value={viewMode} onValueChange={(v) => { setViewMode(v as 'week' | 'month'); setSelectedDate(null); }}>
                    <TabsList className="grid w-full grid-cols-2 max-w-sm">
                        <TabsTrigger value="week">Por Semanas</TabsTrigger>
                        <TabsTrigger value="month">Por Meses</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                    <p className="font-semibold">{viewMode === 'week' ? 'Semana' : 'Mes'}</p>
                    <p className="text-sm text-muted-foreground">{dateRangeLabel}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleDateChange('next')}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardHeader>
            {viewMode === 'week' && (
                <CardContent className="flex justify-center gap-1 md:gap-2">
                    {daysInInterval.map(day => (
                        <Button 
                            key={day.toString()} 
                            variant={isSameDay(day, selectedDate || new Date(0)) ? 'default' : 'outline'}
                            className="flex-1 flex-col h-14"
                            onClick={() => setSelectedDate(isSameDay(day, selectedDate || new Date(0)) ? null : day)}
                        >
                            <span>{format(day, 'd')}</span>
                            <span className="text-xs">{format(day, 'eee', { locale: es })}</span>
                        </Button>
                    ))}
                </CardContent>
            )}
        </Card>

        <Card>
             <CardHeader>
                <CardTitle className="text-base">Resumen del Período</CardTitle>
                <CardDescription className="text-xs">
                    {selectedDate ? `Mostrando totales para el ${format(selectedDate, 'PPP', {locale: es})}` : `Mostrando totales para ${dateRangeLabel}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {paymentMethods.map(pm => {
                 const totals = totalsByPaymentMethod[pm.id] || { usd: 0, ves: 0 };
                 const totalAmount = pm.currency === '$' ? totals.usd : totals.ves;
                 
                 if (totalAmount === 0 && pm.currency === '$' && totals.ves > 0) return null;
                 if (totalAmount === 0 && pm.currency === 'Bs' && totals.usd > 0) return null;
                 if(totalAmount === 0) return null;


                 return (
                    <Card key={pm.id}>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                             <CardTitle className="text-sm font-medium">{pm.name}</CardTitle>
                             {getPaymentMethodIcon(pm.name)}
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {pm.currency === '$' ? `$${formatUsd(totalAmount)}` : `Bs ${formatBs(totalAmount)}`}
                            </p>
                        </CardContent>
                    </Card>
                 )
               })}
            </CardContent>
             <CardFooter className="flex justify-between items-center p-4 mt-4 bg-muted/50 rounded-b-lg">
                <span className="font-semibold">Total Vendido (Período)</span>
                <span className="text-xl font-bold text-primary">${formatUsd(totalSoldInPeriod)}</span>
            </CardFooter>
        </Card>

        <div className="space-y-4">
             {groupedSalesByDay.map(([day, sales]) => {
                const dayDate = parseISO(day);
                const dayTotal = sales.reduce((sum, s) => sum + s.total, 0);
                return (
                    <Collapsible key={day}>
                        <Card>
                            <CollapsibleTrigger className="w-full">
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                                    <p className="font-semibold capitalize">{format(dayDate, 'eeee, d \'de\' MMMM \'de\' yyyy', {locale: es})}</p>
                                    <Badge variant="secondary">${formatUsd(dayTotal)}</Badge>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="border-t">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead>
                                                <span className="sr-only">Acciones</span>
                                            </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sales.map((sale) => (
                                            <TableRow key={sale.id}>
                                                <TableCell className="font-medium">{sale.customer}</TableCell>
                                                <TableCell>
                                                <Badge variant={sale.status === 'Pagada' ? 'default' : 'secondary'} className={cn({
                                                    'bg-green-100 text-green-800': sale.status === 'Pagada',
                                                })}>
                                                    {sale.status}
                                                </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">${formatUsd(sale.total)}</TableCell>
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
                                                    <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                                    <DropdownMenuItem>Imprimir Ticket</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )
            })}
             {groupedSalesByDay.length === 0 && (
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <History className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">No hay ventas registradas</h3>
                    <p className="text-sm">No se encontraron ventas para el período seleccionado.</p>
                </div>
            )}
        </div>
    </div>
  );
}

