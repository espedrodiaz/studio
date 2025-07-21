"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { products, customers, paymentMethods } from "@/lib/placeholder-data";
import { X, PlusCircle, MinusCircle, Search, UserPlus, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

type CartItem = typeof products[0] & { quantity: number };

export default function PosPage() {
    const [step, setStep] = useState(1);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
    const [payments, setPayments] = useState<{methodId: string, amount: number}[]>([]);
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
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
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
        });
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0), [cart]);
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const balance = useMemo(() => subtotal - totalPaid, [subtotal, totalPaid]);
    const change = useMemo(() => balance < 0 ? Math.abs(balance) : 0, [balance]);

    const addPayment = () => {
        const firstPaymentMethodId = paymentMethods[0]?.id;
        if (firstPaymentMethodId) {
            setPayments([...payments, { methodId: firstPaymentMethodId, amount: 0 }]);
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
                                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
                                    {filteredProducts.map(product => (
                                        <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => addToCart(product)}>
                                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                                <img src={`https://placehold.co/100x100.png`} alt={product.name} data-ai-hint="product" className="rounded-md mb-2"/>
                                                <p className="font-semibold text-sm">{product.name}</p>
                                                <p className="text-muted-foreground text-xs">${product.salePrice.toFixed(2)}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
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
                                <CardContent className="text-muted-foreground">Cliente: {selectedCustomer?.name || 'Cliente Ocasional'}</CardContent>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                {payments.map((payment, index) => (
                                    <div key={index} className="flex gap-2 items-end p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <Label>Método de Pago</Label>
                                            <Select value={payment.methodId} onValueChange={(value) => updatePayment(index, { ...payment, methodId: value })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethods.map(method => <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label>Monto</Label>
                                            <Input type="number" value={payment.amount} onChange={(e) => updatePayment(index, { ...payment, amount: parseFloat(e.target.value) || 0 })} />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removePayment(index)}><X className="h-4 w-4"/></Button>
                                    </div>
                                ))}
                                <Button variant="outline" onClick={addPayment}>Añadir Método de Pago</Button>
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
                                <img src={`https://placehold.co/40x40.png`} data-ai-hint="product item" alt={item.name} className="w-10 h-10 rounded-md" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">${item.salePrice.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                                    <span>{item.quantity}</span>
                                    <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                                </div>
                                <p className="font-semibold w-16 text-right">${(item.salePrice * item.quantity).toFixed(2)}</p>
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
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {step === 3 && (
                       <>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Pagado</span>
                            <span>${totalPaid.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className={`flex justify-between font-bold text-lg ${balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                            <span>{balance > 0 ? 'Faltante' : 'Total'}</span>
                            <span>${balance > 0 ? balance.toFixed(2) : subtotal.toFixed(2)}</span>
                        </div>
                        {change > 0 && (
                            <div className="flex justify-between font-bold text-lg text-green-600">
                                <span>Vuelto</span>
                                <span>${change.toFixed(2)}</span>
                            </div>
                        )}
                        </>
                    )}
                </CardFooter>
            )}
        </Card>
    );

    return (
        <div className="flex-1 space-y-4">
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
                    <Button disabled={balance > 0}>Completar Venta</Button>
                )}
            </div>
        </div>
    );
}
