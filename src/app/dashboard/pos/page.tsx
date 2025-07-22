
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { products, customers, getPaymentMethods, getCurrentBcvRate } from "@/lib/placeholder-data";
import { X, PlusCircle, MinusCircle, Search, UserPlus, ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

type CartItem = typeof products[0] & { quantity: number };

export default function PosPage() {
    const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
    const [initialBalances, setInitialBalances] = useState({ usd: 0, ves: 0 });

    const [step, setStep] = useState(1);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
    const [payments, setPayments] = useState<{methodId: string, amount: number}[]>([]);
    const [changePayments, setChangePayments] = useState<{methodId: string, amount: number}[]>([]);
    
    const [paymentMethodsList, setPaymentMethodsList] = useState(getPaymentMethods());
    const bcvRate = getCurrentBcvRate();

    useEffect(() => {
        setPaymentMethodsList(getPaymentMethods());
    }, []);

    const handleOpenCashDrawer = () => {
        if (initialBalances.usd < 0 || initialBalances.ves < 0) {
            toast({
                title: "Error",
                description: "Los saldos iniciales no pueden ser negativos.",
                variant: "destructive",
            });
            return;
        }
        setIsCashDrawerOpen(true);
        toast({
            title: "Caja Abierta",
            description: `Caja iniciada con $${formatUsd(initialBalances.usd)} y Bs ${formatBs(convertToBs(initialBalances.usd))}.`,
        });
    }

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const addToCart = (product: typeof products[0]) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
        setSearchTerm('');
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
        });
    };

    const formatUsd = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBs = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const convertToBs = (amountUsd: number) => amountUsd * bcvRate;

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0), [cart]);
    
    const totalPaid = useMemo(() => {
        return payments.reduce((acc, p) => {
            const method = paymentMethodsList.find(m => m.id === p.methodId);
            if (method?.currency === 'Bs') {
                return acc + (p.amount / bcvRate);
            }
            return acc + p.amount;
        }, 0);
    }, [payments, paymentMethodsList, bcvRate]);

    const balance = useMemo(() => subtotal - totalPaid, [subtotal, totalPaid]);
    const changeToGive = useMemo(() => balance < 0 ? Math.abs(balance) : 0, [balance]);
    
    const totalChangeGiven = useMemo(() => {
        return changePayments.reduce((acc, p) => {
             const method = paymentMethodsList.find(m => m.id === p.methodId);
            if (method?.currency === 'Bs') {
                return acc + (p.amount / bcvRate);
            }
            return acc + p.amount;
        }, 0)
    }, [changePayments, paymentMethodsList, bcvRate]);

    const remainingChange = useMemo(() => changeToGive - totalChangeGiven, [changeToGive, totalChangeGiven]);


    const addPayment = () => {
        const firstDigitalMethod = paymentMethodsList.find(m => m.type === 'Digital');
        const firstMethodId = firstDigitalMethod?.id || paymentMethodsList[0]?.id;
        if (firstMethodId) {
            setPayments([...payments, { methodId: firstMethodId, amount: 0 }]);
        }
    };
    
    const updatePayment = (index: number, newPayment: { methodId: string, amount: number }) => {
        const newPayments = [...payments];
        newPayments[index] = newPayment;
        setPayments(newPayments);
    };

    const removePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

     const addChangePayment = () => {
        const changeGivingMethods = paymentMethodsList.filter(m => m.givesChange);
        const firstChangeMethodId = changeGivingMethods[0]?.id;
        if (firstChangeMethodId) {
            setChangePayments([...changePayments, { methodId: firstChangeMethodId, amount: 0 }]);
        }
    };
    
    const updateChangePayment = (index: number, newPayment: { methodId: string, amount: number }) => {
        const newPayments = [...changePayments];
        newPayments[index] = newPayment;
        setChangePayments(newPayments);
    };

    const removeChangePayment = (index: number) => {
        setChangePayments(changePayments.filter((_, i) => i !== index));
    };

    const handleCompleteSale = () => {
        // In a real app, this would save the sale, update stock, etc.
        toast({ title: "Venta Completada", description: "La venta ha sido registrada con éxito." });
        // Reset state for next sale
        setStep(1);
        setCart([]);
        setSelectedCustomer(null);
        setPayments([]);
        setChangePayments([]);
        setSearchTerm('');
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Product Selection
                return (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Productos</CardTitle>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Buscar productos por nombre..." 
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 min-h-[60vh] max-h-[60vh] overflow-y-auto p-4">
                                     {filteredProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => addToCart(product)}>
                                            <p className="font-semibold text-sm flex-1">{product.name}</p>
                                            <div className="text-right">
                                                <p className="text-primary font-bold">{formatBs(convertToBs(product.salePrice))} Bs</p>
                                                <p className="text-muted-foreground text-xs">(${formatUsd(product.salePrice)})</p>
                                            </div>
                                        </div>
                                    ))}
                                    {searchTerm && filteredProducts.length === 0 && (
                                        <div className="col-span-full text-center text-muted-foreground py-10">
                                            No se encontraron productos.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        {renderCart()}
                    </div>
                );
            case 2: // Customer Selection
                return (
                     <div className="grid md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Seleccionar Cliente</CardTitle>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="relative flex-grow">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Buscar por nombre o cédula..." className="pl-8" />
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline"><UserPlus className="mr-2 h-4 w-4"/> Nuevo Cliente</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Crear Nuevo Cliente</DialogTitle></DialogHeader>
                                            {/* New Customer Form */}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="max-h-[60vh] overflow-y-auto">
                                {customers.map(customer => (
                                    <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className={`p-4 border rounded-lg cursor-pointer mb-2 ${selectedCustomer?.id === customer.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}>
                                        <p className="font-semibold">{customer.name}</p>
                                        <p className="text-sm text-muted-foreground">{customer.idNumber}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        {renderCart()}
                    </div>
                );
            case 3: // Payment
                return (
                     <div className="grid md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Procesar Pago</CardTitle>
                                <CardContent className="text-muted-foreground p-0 pt-2">Cliente: {selectedCustomer?.name || 'Cliente Ocasional'}</CardContent>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <Label className="font-semibold">Recibir Pago</Label>
                                {payments.map((payment, index) => {
                                    const method = paymentMethodsList.find(m => m.id === payment.methodId);
                                    return (
                                        <div key={index} className="flex gap-2 items-end p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <Label>Método de Pago</Label>
                                                <Select value={payment.methodId} onValueChange={(value) => updatePayment(index, { ...payment, methodId: value, amount: 0 })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {paymentMethodsList.map(method => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-1">
                                                <Label>Monto ({method?.currency})</Label>
                                                <Input type="number" value={payment.amount} onChange={(e) => updatePayment(index, { ...payment, amount: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removePayment(index)}><X className="h-4 w-4"/></Button>
                                        </div>
                                    )
                                })}
                                <Button variant="outline" onClick={addPayment}>Añadir Método de Pago</Button>
                                 {changeToGive > 0 && (
                                    <div className="pt-4 mt-4 border-t">
                                        <Label className="font-semibold">Entregar Vuelto</Label>
                                        <p className="text-destructive text-sm font-semibold mb-2">Faltan ${formatUsd(remainingChange)} de vuelto por entregar.</p>
                                        {changePayments.map((payment, index) => {
                                             const method = paymentMethodsList.find(m => m.id === payment.methodId);
                                             return (
                                                <div key={index} className="flex gap-2 items-end p-4 border rounded-lg mt-2">
                                                    <div className="flex-1">
                                                        <Label>Método de Vuelto</Label>
                                                        <Select value={payment.methodId} onValueChange={(value) => updateChangePayment(index, { ...payment, methodId: value, amount: 0 })}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                {paymentMethodsList.filter(m => m.givesChange).map(method => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label>Monto ({method?.currency})</Label>
                                                        <Input type="number" value={payment.amount} onChange={(e) => updateChangePayment(index, { ...payment, amount: parseFloat(e.target.value) || 0 })} />
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeChangePayment(index)}><X className="h-4 w-4"/></Button>
                                                </div>
                                             )
                                        })}
                                         <Button variant="outline" className="mt-2" onClick={addChangePayment}>Añadir Vuelto</Button>
                                    </div>
                                 )}
                            </CardContent>
                        </Card>
                        {renderCart()}
                    </div>
                );
            default:
                return null;
        }
    };
    
    const renderCart = () => (
        <Card>
            <CardHeader>
                <CardTitle>Carrito de Compra</CardTitle>
                {selectedCustomer && <Badge variant="secondary" className="w-fit">{selectedCustomer.name}</Badge>}
            </CardHeader>
            <CardContent className="max-h-[50vh] overflow-y-auto">
                {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">El carrito está vacío</p>
                ) : (
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">${formatUsd(item.salePrice)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                                    <span>{item.quantity}</span>
                                    <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                                </div>
                                <div className="w-28 text-right">
                                    <p className="font-semibold text-sm">{formatBs(convertToBs(item.salePrice * item.quantity))} Bs</p>
                                    <p className="font-normal text-xs text-muted-foreground">${formatUsd(item.salePrice * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            {cart.length > 0 && (
                <CardFooter className="flex-col !items-stretch gap-2 pt-4">
                    <Separator />
                    <div className="flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>
                            {formatBs(convertToBs(subtotal))} Bs
                            <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(subtotal)})</span>
                        </span>
                    </div>
                    {step === 3 && (
                       <>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Pagado</span>
                             <span>
                                {formatBs(convertToBs(totalPaid))} Bs
                                <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(totalPaid)})</span>
                            </span>
                        </div>
                        <Separator />
                        <div className={`flex justify-between font-bold text-lg ${balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                            <span>{balance > 0 ? 'Faltante' : 'Total'}</span>
                             <span>
                                {balance > 0 
                                    ? `${formatBs(convertToBs(balance))} Bs`
                                    : `${formatBs(convertToBs(subtotal))} Bs`
                                }
                            </span>
                        </div>
                        {changeToGive > 0 && (
                            <div className="flex justify-between font-bold text-lg text-green-600">
                                <span>Vuelto</span>
                                <span>
                                    {formatBs(convertToBs(changeToGive))} Bs
                                    <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(changeToGive)})</span>
                                </span>
                            </div>
                        )}
                        </>
                    )}
                </CardFooter>
            )}
        </Card>
    );

    return (
        <>
             <Dialog open={!isCashDrawerOpen} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Apertura de Caja</DialogTitle>
                        <DialogDescription>
                            Ingrese los saldos iniciales en efectivo para comenzar a operar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="usd-balance" className="text-right">
                                Efectivo (USD)
                            </Label>
                            <Input
                                id="usd-balance"
                                type="number"
                                value={initialBalances.usd}
                                onChange={(e) => setInitialBalances(b => ({ ...b, usd: parseFloat(e.target.value) || 0 }))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ves-balance" className="text-right">
                                Efectivo (Bs)
                            </Label>
                            <Input
                                id="ves-balance"
                                type="number"
                                value={initialBalances.ves}
                                onChange={(e) => setInitialBalances(b => ({ ...b, ves: parseFloat(e.target.value) || 0 }))}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleOpenCashDrawer} className="w-full">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Abrir Caja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isCashDrawerOpen && (
                <>
                    <div className="space-y-4">
                        {renderStep()}
                        <div className="flex justify-between mt-8">
                            <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                            {step < 3 ? (
                                <Button onClick={() => setStep(s => Math.min(3, s + 1))} disabled={cart.length === 0 || (step === 2 && !selectedCustomer)}>
                                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleCompleteSale} disabled={balance > 0 || (changeToGive > 0 && remainingChange > 0.001)}>Completar Venta</Button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
