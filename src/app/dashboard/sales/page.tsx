
"use client";

import { useState, useMemo, useEffect } from 'react';
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
    Smartphone,
    ChevronDown,
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
    isWithinInterval,
    startOfDay,
    endOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Sale = typeof sales[0];

export default function SalesPage() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const bcvRate = getCurrentBcvRate();

  const sortedSales = useMemo(() => 
    [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  []);

  const { firstSaleDate, lastSaleDate } = useMemo(() => {
    if (sortedSales.length === 0) return { firstSaleDate: new Date(), lastSaleDate: new Date() };
    const dates = sortedSales.map(s => parseISO(s.date));
    return {
        firstSaleDate: startOfDay(dates[dates.length - 1]),
        lastSaleDate: endOfDay(dates[0])
    };
  }, [sortedSales]);

    useEffect(() => {
        if (sortedSales.length > 0) {
            setCurrentDate(lastSaleDate);
        }
    }, [sortedSales.length, lastSaleDate]);


  const { interval, dateRangeLabel, isPrevDisabled, isNextDisabled } = useMemo(() => {
    let start, end, label;
    
    if (viewMode === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
      label = `${format(start, 'd/L')} - ${format(end, 'd/L/yyyy')}`;
    } else { // month
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
      label = format(currentDate, 'MMMM yyyy', { locale: es });
    }
    
    const prevDisabled = start < firstSaleDate;
    const nextDisabled = end > lastSaleDate;

    return { 
      interval: { start, end }, 
      dateRangeLabel: label, 
      isPrevDisabled: prevDisabled,
      isNextDisabled: nextDisabled
    };
  }, [currentDate, viewMode, firstSaleDate, lastSaleDate]);

  const daysInInterval = useMemo(() => {
     if (viewMode === 'week') {
        return eachDayOfInterval(interval);
     }
     return [];
  }, [interval, viewMode]);

  const handleViewChange = (v: string) => {
    const newViewMode = v as 'week' | 'month';
    setViewMode(newViewMode);
    setSelectedDate(null);
    if(sortedSales.length > 0) {
      setCurrentDate(lastSaleDate);
    }
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
      const changeFn = direction === 'prev' 
        ? (viewMode === 'week' ? subDays : subMonths)
        : (viewMode === 'week' ? addDays : addMonths);
      
      const amount = viewMode === 'week' ? 7 : 1;

      setCurrentDate(d => changeFn(d, amount));
      setSelectedDate(null);
  }

  
  const salesForPeriod = useMemo(() => {
    const period = selectedDate 
      ? { start: startOfDay(selectedDate), end: endOfDay(selectedDate) } 
      : { start: startOfDay(interval.start), end: endOfDay(interval.end) };
      
    return sortedSales.filter(sale => {
      const saleDate = parseISO(sale.date);
      return isWithinInterval(saleDate, period);
    });
  }, [sortedSales, interval, selectedDate]);
  
  const totalsByPaymentMethod = useMemo(() => {
    const totals: { [key: string]: { usd: number, ves: number } } = {};
    
    paymentMethods.forEach(pm => {
      totals[pm.id] = { usd: 0, ves: 0 };
    });

    salesForPeriod.forEach(sale => {
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
  }, [salesForPeriod]);

  const totalSoldInPeriod = useMemo(() => {
    let totalUsd = 0;
    Object.values(totalsByPaymentMethod).forEach(total => {
        totalUsd += total.usd;
        if (bcvRate > 0) {
            totalUsd += total.ves / bcvRate;
        }
    });
    return totalUsd;
  }, [totalsByPaymentMethod, bcvRate]);


  const groupedSalesByDay = useMemo(() => {
    const grouped: { [key: string]: Sale[] } = {};
    salesForPeriod.forEach(sale => {
      const dayKey = format(parseISO(sale.date), 'yyyy-MM-dd');
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(sale);
    });
    return Object.entries(grouped).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
  }, [salesForPeriod]);

  const formatUsd = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (amount: number) => (amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const getPaymentMethodIcon = (methodName: string) => {
    const lowerCaseName = methodName.toLowerCase();
    if (lowerCaseName.includes('zelle')) {
      return <DollarSign className="w-5 h-5 text-green-600" />;
    }
     if (lowerCaseName.includes('efectivo')) {
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
                 <Tabs value={viewMode} onValueChange={handleViewChange}>
                    <TabsList className="grid w-full grid-cols-2 max-w-sm">
                        <TabsTrigger value="week">Por Semanas</TabsTrigger>
                        <TabsTrigger value="month">Por Meses</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')} disabled={isPrevDisabled}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                    <p className="font-semibold">{viewMode === 'week' ? 'Semana' : 'Mes'}</p>
                    <p className="text-sm text-muted-foreground capitalize">{dateRangeLabel}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleDateChange('next')} disabled={isNextDisabled}>
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
                            disabled={day < firstSaleDate || day > lastSaleDate}
                        >
                            <span>{format(day, 'd')}</span>
                            <span className="text-xs capitalize">{format(day, 'eee', { locale: es })}</span>
                        </Button>
                    ))}
                </CardContent>
            )}
        </Card>

        <Card>
             <CardHeader>
                <CardTitle className="text-base">Resumen del Período</CardTitle>
                <CardDescription className="text-xs capitalize">
                    {selectedDate ? `Mostrando totales para el ${format(selectedDate, 'PPP', {locale: es})}` : `Mostrando totales para ${dateRangeLabel}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {paymentMethods.map(pm => {
                 const totals = totalsByPaymentMethod[pm.id] || { usd: 0, ves: 0 };
                 const totalAmount = pm.currency === '$' ? totals.usd : totals.ves;
                 
                 if (totalAmount === 0) return null;

                 return (
                    <Card key={pm.id}>
                        <CardContent className="p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">{pm.name}</span>
                                {getPaymentMethodIcon(pm.name)}
                            </div>
                            <p className="text-xl font-bold">
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
             {groupedSalesByDay.length > 0 ? groupedSalesByDay.map(([day, sales]) => {
                const dayDate = parseISO(day);
                const dayTotal = sales.reduce((sum, s) => sum + s.total, 0);
                return (
                    <Collapsible key={day} defaultOpen={selectedDate ? isSameDay(dayDate, selectedDate) : true}>
                        <Card>
                            <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                                    <p className="font-semibold capitalize">{format(dayDate, 'eeee, d \'de\' MMMM \'de\' yyyy', {locale: es})}</p>
                                    <Badge variant="secondary">${formatUsd(dayTotal)}</Badge>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="border-t">
                                    {sales.map((sale) => (
                                        <Collapsible key={sale.id} className="border-b last:border-b-0">
                                            <CollapsibleTrigger asChild>
                                                <div className="flex items-center p-4 cursor-pointer hover:bg-muted/10">
                                                    <div className="flex-1 font-medium">{sale.customer}</div>
                                                    <div className="flex-1 text-right font-semibold">
                                                        Bs {formatBs(sale.total * bcvRate)}
                                                        <div className="text-xs text-muted-foreground font-normal">(${formatUsd(sale.total)})</div>
                                                    </div>
                                                    <div className="flex-1 flex justify-end items-center">
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
                                                         <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="px-4 pb-4 bg-muted/30">
                                                <div className="border-t pt-2 mt-2">
                                                     <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-xs h-8">Cant.</TableHead>
                                                                <TableHead className="text-xs h-8">Producto</TableHead>
                                                                <TableHead className="text-xs h-8 text-right">Monto</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {sale.items.map((item, index) => (
                                                                <TableRow key={index} className="text-xs">
                                                                    <TableCell>{item.quantity}</TableCell>
                                                                    <TableCell>{item.name}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="font-semibold">Bs {formatBs(item.price * item.quantity * bcvRate)}</div>
                                                                        <div className="text-muted-foreground">(${formatUsd(item.price * item.quantity)})</div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                     </Table>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )
            }) : (
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
