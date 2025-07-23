
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Trash2, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus, Edit, CalendarDays, Save, X } from "lucide-react";
import { 
  exchangeRates as initialBcvRates, 
  supplierRates as initialSupplierRates,
  updateCurrentBcvRate, 
  getCurrentBcvRate, 
  bcvRateSubject,
  addSupplierRate,
  updateSupplierRate,
  deleteSupplierRate
} from "@/lib/placeholder-data";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type ExchangeRate = {
  id: string;
  date: string;
  rate: number;
};

type SupplierRate = {
  id: string;
  name: string;
  rate: number;
  lastUpdated: string;
}

export default function ExchangeRatesPage() {
  const [bcvRates, setBcvRates] = useState<ExchangeRate[]>(
    [...initialBcvRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  const [supplierRates, setSupplierRates] = useState<SupplierRate[]>(initialSupplierRates);

  const [newBcvRate, setNewBcvRate] = useState<number | "">("");
  const [currentBcvRate, setCurrentBcvRate] = useState(getCurrentBcvRate());
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const [isBcvModalOpen, setIsBcvModalOpen] = useState(false);
  const [isSupplierManagerOpen, setIsSupplierManagerOpen] = useState(false);
  
  const [editingSupplierRate, setEditingSupplierRate] = useState<SupplierRate | null>(null);
  const [supplierRateName, setSupplierRateName] = useState("");
  const [supplierRateAmount, setSupplierRateAmount] = useState<number | "">("");


  useEffect(() => {
    const subscription = bcvRateSubject.subscribe(rate => {
      setCurrentBcvRate(rate);
      // Force re-render of components that depend on supplier rates differences
      setSupplierRates([...initialSupplierRates]);
    });
    return () => subscription.unsubscribe();
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    bcvRates.forEach(rate => {
      const date = new Date(rate.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months);
  }, [bcvRates]);

  const filteredBcvRates = useMemo(() => {
    if (selectedMonth === 'all') {
      return bcvRates;
    }
    return bcvRates.filter(rate => {
      const date = new Date(rate.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      return monthYear === selectedMonth;
    });
  }, [bcvRates, selectedMonth]);

  const monthSummary = useMemo(() => {
    if (selectedMonth === 'all' || filteredBcvRates.length < 1) {
      return null;
    }
    const monthRates = [...filteredBcvRates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const initialRate = monthRates[0].rate;
    const finalRate = monthRates[monthRates.length - 1].rate;
    const variation = finalRate - initialRate;
    const percentage = initialRate !== 0 ? (variation / initialRate) * 100 : 0;
    
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (variation > 0) trend = 'up';
    if (variation < 0) trend = 'down';

    return { initialRate, finalRate, variation, percentage, trend };
  }, [filteredBcvRates, selectedMonth]);


  const handleAddBcvRate = () => {
    if (typeof newBcvRate !== 'number' || newBcvRate <= 0) {
        toast({ title: "Error", description: "Por favor, ingrese una tasa válida.", variant: "destructive" });
        return;
    }
    const newRateEntry: ExchangeRate = {
      id: `RATE${new Date().getTime()}`,
      date: new Date().toISOString(),
      rate: newBcvRate,
    };
    const updatedRates = [...bcvRates, newRateEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setBcvRates(updatedRates);
    if (updatedRates.length > 0) {
      updateCurrentBcvRate(updatedRates[0]);
    }
    setNewBcvRate("");
    setIsBcvModalOpen(false);
    toast({ title: "Tasa Agregada", description: `La nueva tasa BCV de ${formatBs(newBcvRate)} Bs ha sido registrada.` });
  };

  const handleDeleteBcvRate = (id: string) => {
    const newRates = bcvRates.filter(rate => rate.id !== id);
    setBcvRates(newRates);
    const sorted = [...newRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length > 0) {
        updateCurrentBcvRate(sorted[0]);
    } else {
        updateCurrentBcvRate({rate: 0});
    }
    toast({ title: "Tasa Eliminada", description: "La tasa BCV ha sido eliminada del historial.", variant: "destructive" });
  }

  const handleEditSupplierClick = (rate: SupplierRate) => {
    setEditingSupplierRate(rate);
    setSupplierRateName(rate.name);
    setSupplierRateAmount(rate.rate);
  }

  const clearSupplierForm = () => {
    setEditingSupplierRate(null);
    setSupplierRateName("");
    setSupplierRateAmount("");
  }

  const handleSaveSupplierRate = () => {
    if (!supplierRateName || typeof supplierRateAmount !== 'number' || supplierRateAmount <= 0) {
      toast({ title: "Error", description: "Por favor, ingrese un nombre y una tasa válidos.", variant: "destructive" });
      return;
    }

    if (editingSupplierRate) { // Update
      const updatedRate = updateSupplierRate(editingSupplierRate.id, { name: supplierRateName, rate: supplierRateAmount });
      setSupplierRates(supplierRates.map(r => r.id === editingSupplierRate.id ? updatedRate : r));
      toast({ title: "Tasa Actualizada", description: `La tasa para ${supplierRateName} ha sido actualizada.` });
    } else { // Create
      addSupplierRate({ name: supplierRateName, rate: supplierRateAmount });
       setSupplierRates([...initialSupplierRates]);
       toast({ title: "Tasa de Proveedor Agregada", description: `La tasa para ${supplierRateName} ha sido registrada.` });
    }
    
    clearSupplierForm();
  }
  
  const handleDeleteSupplierRate = (id: string) => {
    deleteSupplierRate(id);
    setSupplierRates(supplierRates.filter(r => r.id !== id));
    toast({ title: "Tasa Eliminada", description: "La tasa del proveedor ha sido eliminada.", variant: "destructive" });
  }


  const getBcvRateChange = (index: number) => {
      if (index >= filteredBcvRates.length - 1) return null;
      const current = filteredBcvRates[index].rate;
      const previous = filteredBcvRates[index + 1].rate;
      const difference = current - previous;
      const percentage = previous !== 0 ? (difference / previous) * 100 : 0;
      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (difference > 0) trend = 'up';
      else if (difference < 0) trend = 'down';
      return { trend, difference, percentage }
  }
  
  const getSupplierRateDifference = (rate: number) => {
    if (currentBcvRate === 0) return { difference: 0, percentage: 0 };
    const difference = rate - currentBcvRate;
    const percentage = (difference / currentBcvRate) * 100;
    return { difference, percentage };
  }

  const formatVenezuelanDateTime = (isoString: string) => new Date(isoString).toLocaleString('es-VE', { timeZone: 'America/Caracas', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  
  const formatBs = (amount: number) => {
    const fixedAmount = amount.toFixed(2);
    const [integer, decimal] = fixedAmount.split('.');
    return `${new Intl.NumberFormat('de-DE').format(Number(integer))},${decimal}`;
  }


  return (
    <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-1">
            <Card>
                <CardHeader><CardTitle>Tasa Actual (BCV)</CardTitle><CardDescription>VES / USD</CardDescription></CardHeader>
                <CardContent><p className="text-4xl font-bold tracking-tight text-green-600">{formatBs(currentBcvRate)}</p></CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                     <div>
                         <Label>Filtrar Historial BCV por mes</Label>
                         <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por mes" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los meses</SelectItem>
                                {availableMonths.map(month => (
                                    <SelectItem key={month} value={month}>{new Date(month).toLocaleString('es-VE', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>

                    <Dialog open={isBcvModalOpen} onOpenChange={setIsBcvModalOpen}>
                        <DialogTrigger asChild><Button className="w-full gap-2"><PlusCircle className="h-4 w-4"/> Añadir Tasa BCV</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Registrar Nueva Tasa BCV</DialogTitle><DialogDescription>Ingrese el nuevo valor de la tasa en Bolívares por Dólar.</DialogDescription></DialogHeader>
                            <div className="py-4"><div className="space-y-2"><Label htmlFor="rate">Nueva Tasa (Bs)</Label><Input id="rate" type="number" placeholder="Ej: 40,50" value={newBcvRate} onChange={(e) => setNewBcvRate(parseFloat(e.target.value) || "")}/></div></div>
                            <DialogFooter><Button variant="outline" onClick={() => setIsBcvModalOpen(false)}>Cancelar</Button><Button onClick={handleAddBcvRate} disabled={!newBcvRate || newBcvRate <= 0}>Registrar Tasa</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isSupplierManagerOpen} onOpenChange={(isOpen) => { setIsSupplierManagerOpen(isOpen); if (!isOpen) clearSupplierForm(); }}>
                        <DialogTrigger asChild><Button variant="outline" className="w-full gap-2" onClick={() => setIsSupplierManagerOpen(true)}><PlusCircle className="h-4 w-4"/> Gestionar Tasas Proveedores</Button></DialogTrigger>
                        <DialogContent className="max-w-2xl">
                             <DialogHeader>
                                <DialogTitle className="text-indigo-600">Tasas de Proveedores</DialogTitle>
                                <DialogDescription>Añada, edite o elimine las tasas de cambio de sus proveedores.</DialogDescription>
                            </DialogHeader>
                             <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] items-end gap-2 py-4 border-b">
                                <div className="space-y-2"><Label htmlFor="supplier-name">Nombre del Proveedor</Label><Input id="supplier-name" value={supplierRateName} onChange={(e) => setSupplierRateName(e.target.value)} placeholder="Ej: Proveedor XYZ"/></div>
                                <div className="space-y-2"><Label htmlFor="supplier-rate">Tasa (Bs)</Label><Input id="supplier-rate" type="number" value={supplierRateAmount} onChange={(e) => setSupplierRateAmount(parseFloat(e.target.value) || "")} placeholder="Ej: 41,20"/></div>
                                <div className="flex items-end gap-2">
                                  <Button onClick={handleSaveSupplierRate} size="icon" aria-label={editingSupplierRate ? "Guardar Cambios" : "Añadir Tasa"}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  {editingSupplierRate && 
                                    <Button variant="ghost" size="icon" onClick={clearSupplierForm} aria-label="Cancelar edición">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  }
                                </div>
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto mt-4 space-y-4 pr-2">
                               {supplierRates.map(rate => {
                                    const diff = getSupplierRateDifference(rate.rate);
                                    const diffColor = diff.difference > 0 ? 'text-red-500 bg-red-100/60' : 'text-green-600 bg-green-100/60';
                                    return (
                                        <Card key={rate.id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{rate.name}</p>
                                                    <p className="text-2xl font-bold tracking-tight text-indigo-600">{formatBs(rate.rate)} <span className="text-sm font-normal text-muted-foreground">Bs</span></p>
                                                </div>
                                                <Badge className={cn("text-xs font-bold", diffColor)} variant="secondary">
                                                    {diff.difference >= 0 ? '+' : ''}{diff.percentage.toFixed(2)}%
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 text-muted-foreground">
                                                <div className="flex items-center gap-2 text-xs">
                                                   <CalendarDays className="h-3 w-3" />
                                                   <span>Act. {formatVenezuelanDateTime(rate.lastUpdated)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditSupplierClick(rate)}>
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Editar</span>
                                                    </Button>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => handleDeleteSupplierRate(rate.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                               })}
                               {supplierRates.length === 0 && (
                                   <p className="text-center text-muted-foreground py-8">No hay tasas de proveedores registradas.</p>
                               )}
                            </div>
                            <DialogFooter className="pt-4">
                               <Button variant="outline" onClick={() => setIsSupplierManagerOpen(false)}>Cerrar</Button>
                           </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
             </Card>
        </div>
        <div className="md:col-span-2 flex flex-col gap-6">
            <Card>
                <CardHeader><CardTitle>Historial de Tasas BCV</CardTitle><CardDescription>Seguimiento de las tasas de cambio publicadas por el BCV.</CardDescription></CardHeader>
                <CardContent>
                    {monthSummary && (
                      <Card className="mb-6 bg-muted/30">
                          <CardHeader className="pb-2"><CardTitle className="text-base">Resumen de {new Date(selectedMonth).toLocaleString('es-VE', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</CardTitle></CardHeader>
                          <CardContent className="grid grid-cols-3 gap-4 text-center">
                              <div><p className="text-sm text-muted-foreground">Tasa Inicial</p><p className="font-semibold">{formatBs(monthSummary.initialRate)}</p></div>
                              <div><p className="text-sm text-muted-foreground">Tasa Final</p><p className="font-semibold">{formatBs(monthSummary.finalRate)}</p></div>
                              <div>
                                <p className="text-sm text-muted-foreground">Variación</p>
                                <div className={cn("flex items-center justify-center gap-1 font-semibold", monthSummary.trend === 'up' ? 'text-green-600' : monthSummary.trend === 'down' ? 'text-red-500' : '')}>
                                  {monthSummary.trend === 'up' && <TrendingUp className="h-4 w-4" />}{monthSummary.trend === 'down' && <TrendingDown className="h-4 w-4" />}{monthSummary.trend === 'neutral' && <Minus className="h-4 w-4" />}
                                  <span>{formatBs(monthSummary.variation)} ({monthSummary.percentage.toFixed(2)}%)</span>
                                </div>
                              </div>
                          </CardContent>
                      </Card>
                    )}
                     <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                        {filteredBcvRates.map((rate, index) => {
                            const change = getBcvRateChange(index);
                            return (
                                <Card key={rate.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-2xl font-bold tracking-tight text-primary">{formatBs(rate.rate)} Bs</p>
                                        </div>
                                        {change && (
                                            <Badge className={cn("text-xs font-bold", change.trend === 'up' ? 'text-green-600 bg-green-100/60' : 'text-red-500 bg-red-100/60')} variant="secondary">
                                                {change.trend === 'up' ? <ArrowUp className="inline h-3 w-3 mr-1"/> : <ArrowDown className="inline h-3 w-3 mr-1"/>}
                                                {formatBs(change.difference)} ({change.percentage.toFixed(2)}%)
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-muted-foreground">
                                        <div className="flex items-center gap-2 text-xs">
                                            <CalendarDays className="h-3 w-3" />
                                            <span>{formatVenezuelanDateTime(rate.date)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Button aria-haspopup="true" size="icon" variant="ghost" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => handleDeleteBcvRate(rate.id)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                        {filteredBcvRates.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No hay tasas del BCV registradas para este mes.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
