
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { products, customers as initialCustomers, getPaymentMethods, getCurrentBcvRate, cashMovements as initialCashMovements, addCashMovement } from "@/lib/placeholder-data";
import { X, PlusCircle, MinusCircle, Search, UserPlus, ArrowLeft, ArrowRight, DollarSign, Printer, MoreVertical, CalendarIcon, FileText, ArrowDownUp, ShoppingCart, Pencil, Car, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, Vehicle } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';


type CartItem = typeof products[0] & { quantity: number; salePrice: number };
type CashMovement = typeof initialCashMovements[0];


export default function PosPage() {
    const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
    const [initialBalances, setInitialBalances] = useState({ usd: 0, ves: 0 });
    const [cashMovements, setCashMovements] = useState<CashMovement[]>(initialCashMovements);

    const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);
    const [movementType, setMovementType] = useState<'Entrada' | 'Salida'>('Salida');
    const [movementAmount, setMovementAmount] = useState<number | ''>('');
    const [movementPaymentMethod, setMovementPaymentMethod] = useState('');
    const [movementConcept, setMovementConcept] = useState('');

    const [step, setStep] = useState(1);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [payments, setPayments] = useState<{methodId: string, amount: number}[]>([]);
    const [changePayments, setChangePayments] = useState<{methodId: string, amount: number}[]>([]);
    
    const [paymentMethodsList, setPaymentMethodsList] = useState(getPaymentMethods());
    const bcvRate = getCurrentBcvRate();

    const [currentDate, setCurrentDate] = useState('');

    const [isCartExpanded, setIsCartExpanded] = useState(true);

    // State for modals
    const [isEditingPrice, setIsEditingPrice] = useState<CartItem | null>(null);
    const [priceInUsd, setPriceInUsd] = useState<number | string>('');
    const [priceInVes, setPriceInVes] = useState<number | string>('');

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({ name: '', idNumber: '', email: '', phone: '', vehicles: [] });
    const [vehicleForm, setVehicleForm] = useState<Vehicle>({ brand: '', model: '', engine: '', year: '' });


    useEffect(() => {
        setPaymentMethodsList(getPaymentMethods());
        setCurrentDate(new Date().toLocaleDateString('es-VE', {
            weekday: 'long', month: 'long', day: 'numeric'
        }));
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
            description: `Caja iniciada con $${formatUsd(initialBalances.usd)} y Bs ${formatBs(convertToVes(initialBalances.usd))}.`,
        });
    }

    const handleCloseCashDrawer = (reportType: 'X' | 'Z') => {
        toast({
            title: `Reporte ${reportType} Generado`,
            description: "La funcionalidad de impresión y lógica de reportes se implementará en el futuro.",
        });

        if (reportType === 'Z') {
            setIsCashDrawerOpen(false);
            setStep(1);
            setCart([]);
            setSelectedCustomer(null);
            setPayments([]);
            setChangePayments([]);
            setProductSearchTerm('');
            setInitialBalances({ usd: 0, ves: 0 });
            setCashMovements([]);
             toast({
                title: "Caja Cerrada",
                description: "La sesión de caja ha finalizado. Puede iniciar una nueva.",
            });
        }
    }
    
    const resetMovementForm = () => {
        setMovementType('Salida');
        setMovementAmount('');
        setMovementPaymentMethod('');
        setMovementConcept('');
    };

    const handleAddCashMovement = () => {
        if (!movementAmount || movementAmount <= 0 || !movementPaymentMethod || !movementConcept) {
             toast({
                title: "Error",
                description: "Todos los campos son obligatorios para registrar el movimiento.",
                variant: "destructive",
            });
            return;
        }
        const newMovement = addCashMovement({
            type: movementType,
            paymentMethodId: movementPaymentMethod,
            amount: movementAmount,
            concept: movementConcept
        });
        setCashMovements(prev => [...prev, newMovement]);
         toast({
            title: "Movimiento Registrado",
            description: `Se ha registrado una ${movementType.toLowerCase()} de caja.`,
        });
        resetMovementForm();
        setIsCashMovementModalOpen(false);
    }


    const filteredProducts = useMemo(() => {
        if (!productSearchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()));
    }, [productSearchTerm]);
    
    const filteredCustomers = useMemo(() => {
        if (!customerSearchTerm) return [];
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
            c.idNumber.toLowerCase().includes(customerSearchTerm.toLowerCase())
        );
    }, [customerSearchTerm, customers]);

    const addToCart = (product: typeof products[0]) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
        setProductSearchTerm('');
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
    
    const convertToVes = (amountUsd: number) => {
        return amountUsd * bcvRate;
    }
    const convertToUsd = (amountVes: number) => {
        return amountVes / bcvRate;
    }

    const handlePriceEdit = (item: CartItem) => {
        setIsEditingPrice(item);
        setPriceInUsd(item.salePrice.toFixed(2));
        setPriceInVes(convertToVes(item.salePrice).toFixed(2));
    };

    const handleUsdPriceChange = (value: string) => {
        const newUsd = parseFloat(value) || 0;
        setPriceInUsd(value);
        setPriceInVes(convertToVes(newUsd).toFixed(2));
    }
    
    const handleVesPriceChange = (value: string) => {
        const newVes = parseFloat(value) || 0;
        setPriceInVes(value);
        setPriceInUsd(convertToUsd(newVes).toFixed(2));
    }

    const handleUpdatePrice = () => {
        if (isEditingPrice) {
            const newPriceUsd = parseFloat(priceInUsd as string);
            setCart(cart.map(item => item.id === isEditingPrice.id ? { ...item, salePrice: newPriceUsd } : item));
            toast({ title: "Precio Actualizado", description: `El precio de ${isEditingPrice.name} se ha actualizado.` });
            setIsEditingPrice(null);
            setPriceInUsd('');
            setPriceInVes('');
        }
    }
    
    // Customer Management
    const openCustomerModal = (customer: Customer | null) => {
        if (customer) {
            setEditingCustomer(customer);
            setCustomerForm({ ...customer });
        } else {
            setEditingCustomer(null);
            setCustomerForm({ name: '', idNumber: '', email: '', phone: '', vehicles: [] });
        }
        setIsCustomerModalOpen(true);
    };

    const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerForm({ ...customerForm, [e.target.id]: e.target.value });
    };

    const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVehicleForm({ ...vehicleForm, [e.target.id]: e.target.value });
    };

    const addVehicle = () => {
        if (vehicleForm.brand && vehicleForm.model && vehicleForm.year) {
            setCustomerForm({ ...customerForm, vehicles: [...customerForm.vehicles, vehicleForm] });
            setVehicleForm({ brand: '', model: '', engine: '', year: '' });
        } else {
            toast({ title: "Error", description: "Marca, Modelo y Año son obligatorios para el vehículo.", variant: "destructive" });
        }
    };
    
    const removeVehicle = (index: number) => {
        setCustomerForm({ ...customerForm, vehicles: customerForm.vehicles.filter((_, i) => i !== index) });
    };

    const handleSaveCustomer = () => {
        if (!customerForm.name || !customerForm.idNumber) {
            toast({ title: "Error", description: "Nombre y Cédula/RIF son obligatorios.", variant: "destructive" });
            return;
        }

        if (editingCustomer) { // Update
            const updatedCustomer = { ...editingCustomer, ...customerForm };
            setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
            setSelectedCustomer(updatedCustomer);
            toast({ title: "Cliente Actualizado", description: `Los datos de ${updatedCustomer.name} han sido actualizados.` });
        } else { // Create
            const newCustomer = { id: `CUST${new Date().getTime()}`, ...customerForm };
            setCustomers([...customers, newCustomer]);
            setSelectedCustomer(newCustomer);
            toast({ title: "Cliente Creado", description: `Se ha registrado a ${newCustomer.name}.` });
        }
        setIsCustomerModalOpen(false);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm('');
    };
    
    const handleOmitCustomer = () => {
        setSelectedCustomer({
            id: 'CUST_OCCASIONAL',
            name: 'Cliente Ocasional',
            idNumber: 'V-00000000',
            email: '',
            phone: '',
            vehicles: []
        });
        setStep(3);
    };


    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0), [cart]);
    
    const totalPaid = useMemo(() => {
        return payments.reduce((acc, p) => {
            const method = paymentMethodsList.find(m => m.id === p.methodId);
            if (method?.currency === 'Bs') {
                return acc + convertToUsd(p.amount);
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
                return acc + convertToUsd(p.amount);
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
        toast({ title: "Venta Completada", description: "La venta ha sido registrada con éxito." });
        setStep(1);
        setIsCartExpanded(true);
        setCart([]);
        setSelectedCustomer(null);
        setPayments([]);
        setChangePayments([]);
        setProductSearchTerm('');
    };
    
    const goToStep = (targetStep: number) => {
      setStep(targetStep);
      if (targetStep > 1) {
        setIsCartExpanded(false);
      } else {
        setIsCartExpanded(true);
      }
    }

    const renderStep = () => {
        switch (step) {
            case 1: // Product Selection & Cart
                return (
                    <div className="flex flex-col gap-8">
                       <Card>
                          <CardHeader>
                            <CardTitle>Buscar Productos</CardTitle>
                          </CardHeader>
                          <CardContent>
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar productos por nombre..." 
                                    className="pl-8"
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                />
                                {productSearchTerm && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => addToCart(product)}>
                                        <p className="font-semibold text-sm flex-1">{product.name}</p>
                                        <div className="text-right">
                                            <p className="text-primary font-bold">{formatBs(convertToVes(product.salePrice))} Bs</p>
                                            <p className="text-muted-foreground text-xs">(${formatUsd(product.salePrice)})</p>
                                        </div>
                                        </div>
                                    ))
                                    ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No se encontraron productos.
                                    </div>
                                    )}
                                </div>
                                )}
                            </div>
                          </CardContent>
                       </Card>

                       {renderCart()}

                       <div className="flex justify-end mt-4">
                           <Button onClick={() => goToStep(2)} disabled={cart.length === 0}>
                                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                       </div>
                    </div>
                );
            case 2: // Customer Selection
                 return (
                     <div className="flex flex-col gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Seleccionar Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="relative flex-grow">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Buscar por nombre o cédula..." 
                                            className="pl-8" 
                                            value={customerSearchTerm}
                                            onChange={e => setCustomerSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" onClick={() => openCustomerModal(null)}><UserPlus className="mr-2 h-4 w-4"/> Nuevo Cliente</Button>
                                </div>

                                {customerSearchTerm && (
                                    <div className="max-h-[60vh] overflow-y-auto mt-4 border rounded-lg">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                                            <div key={customer.id} onClick={() => handleSelectCustomer(customer)} className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted`}>
                                                <p className="font-semibold">{customer.name}</p>
                                                <p className="text-sm text-muted-foreground">{customer.idNumber}</p>
                                            </div>
                                        )) : (
                                            <p className="p-4 text-center text-muted-foreground">No se encontraron clientes.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {renderCart()}
                        <div className="flex justify-between mt-4">
                             <Button variant="outline" onClick={() => goToStep(1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                            <div className="flex gap-4">
                                <Button variant="secondary" onClick={handleOmitCustomer}>Omitir y Usar Cliente Ocasional</Button>
                                <Button onClick={() => goToStep(3)} disabled={!selectedCustomer}>
                                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Payment
                return (
                     <div className="flex flex-col gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Procesar Pago</CardTitle>
                                <p className="text-sm text-muted-foreground pt-2">Cliente: {selectedCustomer?.name || 'Cliente Ocasional'}</p>
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
                        <div className="flex justify-between mt-4">
                            <Button variant="outline" onClick={() => goToStep(2)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                            <Button onClick={handleCompleteSale} disabled={balance > 0 || (changeToGive > 0 && remainingChange > 0.001)}>Completar Venta</Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const renderCart = () => (
      <Card>
        <Collapsible open={isCartExpanded} onOpenChange={setIsCartExpanded}>
          <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                      <CardTitle>
                        <span>Carrito ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
                      </CardTitle>
                      {isCartExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                   {!isCartExpanded && (
                      <div className="text-right">
                          <p className="font-semibold text-lg">{formatBs(convertToVes(subtotal))} Bs</p>
                          <p className="text-muted-foreground text-sm">(${formatUsd(subtotal)})</p>
                      </div>
                   )}
              </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
              {selectedCustomer && !isCartExpanded && (
                  <div className="px-6 pb-4">
                      <Badge variant="secondary" className="w-fit mt-1">{selectedCustomer.name}</Badge>
                  </div>
              )}
              <CardContent className={cn("max-h-[50vh] overflow-y-auto", { 'pt-0': !isCartExpanded })}>
                  {cart.length === 0 ? (
                       <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mb-4" />
                          <p className="font-semibold">El carrito está vacío</p>
                          <p className="text-sm">Busca un producto para empezar a vender.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {selectedCustomer && isCartExpanded && <Badge variant="secondary" className="w-fit mt-1">{selectedCustomer.name}</Badge>}
                          {cart.map(item => (
                              <div key={item.id} className="flex items-center gap-4">
                                  <div className="flex-grow">
                                      <p className="font-semibold text-sm">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">${formatUsd(item.salePrice)}</p>
                                  </div>
                                  <div className="w-16">
                                      <Input
                                          type="number"
                                          value={item.quantity}
                                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                                          className="h-8 text-center p-1"
                                      />
                                  </div>
                                   <Button size="icon" variant="ghost" onClick={() => handlePriceEdit(item)}>
                                      <Pencil className="h-4 w-4" />
                                  </Button>
                                  <div className="w-28 text-right">
                                      <p className="font-semibold text-sm">{formatBs(convertToVes(item.salePrice * item.quantity))} Bs</p>
                                      <p className="font-normal text-xs text-muted-foreground">${formatUsd(item.salePrice * item.quantity)}</p>
                                  </div>
                                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateQuantity(item.id, 0)}>
                                    <X className="h-4 w-4"/>
                                  </Button>
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
                              {formatBs(convertToVes(subtotal))} Bs
                              <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(subtotal)})</span>
                          </span>
                      </div>
                      {step === 3 && (
                         <>
                          <div className="flex justify-between text-muted-foreground">
                              <span>Pagado</span>
                               <span>
                                  {formatBs(convertToVes(totalPaid))} Bs
                                  <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(totalPaid)})</span>
                              </span>
                          </div>
                          <Separator />
                          <div className={`flex justify-between font-bold text-lg ${balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                              <span>{balance > 0 ? 'Faltante' : 'Total'}</span>
                               <span>
                                  {balance > 0 
                                      ? `${formatBs(convertToVes(balance))} Bs`
                                      : `${formatBs(convertToVes(subtotal))} Bs`
                                  }
                              </span>
                          </div>
                          {changeToGive > 0 && (
                              <div className="flex justify-between font-bold text-lg text-green-600">
                                  <span>Vuelto</span>
                                  <span>
                                      {formatBs(convertToVes(changeToGive))} Bs
                                      <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(changeToGive)})</span>
                                  </span>
                              </div>
                          )}
                          </>
                      )}
                  </CardFooter>
              )}
          </CollapsibleContent>
        </Collapsible>
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
                                value={initialBalances.usd === 0 ? '' : initialBalances.usd}
                                onChange={(e) => setInitialBalances(b => ({ ...b, usd: parseFloat(e.target.value) || 0 }))}
                                className="col-span-3"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ves-balance" className="text-right">
                                Efectivo (Bs)
                            </Label>
                            <Input
                                id="ves-balance"
                                type="number"
                                 value={initialBalances.ves === 0 ? '' : initialBalances.ves}
                                onChange={(e) => setInitialBalances(b => ({ ...b, ves: parseFloat(e.target.value) || 0 }))}
                                className="col-span-3"
                                placeholder="0.00"
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

            <Dialog open={isCashMovementModalOpen} onOpenChange={setIsCashMovementModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
                        <DialogDescription>
                            Añada una entrada o salida de dinero que no corresponda a una venta.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                           <Label>Tipo de Movimiento</Label>
                           <RadioGroup defaultValue="Salida" value={movementType} onValueChange={(v) => setMovementType(v as 'Entrada' | 'Salida')}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Salida" id="r-salida" />
                                    <Label htmlFor="r-salida">Salida de Dinero</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Entrada" id="r-entrada" />
                                    <Label htmlFor="r-entrada">Entrada de Dinero</Label>
                                </div>
                           </RadioGroup>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="movement-payment-method">Forma de Pago</Label>
                             <Select value={movementPaymentMethod} onValueChange={setMovementPaymentMethod}>
                                <SelectTrigger id="movement-payment-method">
                                    <SelectValue placeholder="Seleccione una caja" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethodsList.map(pm => (
                                        <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="movement-amount">Monto</Label>
                            <Input
                                id="movement-amount"
                                type="number"
                                value={movementAmount}
                                onChange={(e) => setMovementAmount(parseFloat(e.target.value) || '')}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="movement-concept">Concepto</Label>
                            <Textarea
                                id="movement-concept"
                                value={movementConcept}
                                onChange={(e) => setMovementConcept(e.target.value)}
                                placeholder="Ej: Pago a proveedor, Compra de hielo..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCashMovementModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddCashMovement}>Registrar Movimiento</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isEditingPrice !== null} onOpenChange={() => setIsEditingPrice(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Precio</DialogTitle>
                        <DialogDescription>{isEditingPrice?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="price-usd">Precio en USD</Label>
                            <Input id="price-usd" type="number" value={priceInUsd} onChange={(e) => handleUsdPriceChange(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="price-ves">Precio en Bs</Label>
                            <Input id="price-ves" type="number" value={priceInVes} onChange={(e) => handleVesPriceChange(e.target.value)} />
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditingPrice(null)}>Cancelar</Button>
                        <Button onClick={handleUpdatePrice}>Actualizar Precio</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                         <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="personal">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="personal">Información Personal</TabsTrigger>
                            <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal" className="py-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input id="name" value={customerForm.name} onChange={handleCustomerFormChange} placeholder="Nombre del Cliente" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="idNumber">Cédula / RIF</Label>
                                    <Input id="idNumber" value={customerForm.idNumber} onChange={handleCustomerFormChange} placeholder="V-12345678" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" value={customerForm.email} onChange={handleCustomerFormChange} placeholder="cliente@email.com" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                                    <Input id="phone" value={customerForm.phone} onChange={handleCustomerFormChange} placeholder="0414-1234567" />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="vehicles" className="py-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Añadir Vehículo</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="brand">Marca</Label>
                                        <Input id="brand" value={vehicleForm.brand} onChange={handleVehicleFormChange} placeholder="Ej: Toyota" />
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="model">Modelo</Label>
                                        <Input id="model" value={vehicleForm.model} onChange={handleVehicleFormChange} placeholder="Ej: Corolla" />
                                    </div>
                                    <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="engine">Motor</Label>
                                        <Input id="engine" value={vehicleForm.engine} onChange={handleVehicleFormChange} placeholder="Ej: 1.8L" />
                                    </div>
                                     <div className="space-y-2 md:col-span-1">
                                        <Label htmlFor="year">Año</Label>
                                        <Input id="year" type="number" value={vehicleForm.year} onChange={handleVehicleFormChange} placeholder="Ej: 2022" />
                                    </div>
                                    <Button onClick={addVehicle} size="icon"><Plus className="h-4 w-4" /></Button>
                                </CardContent>
                            </Card>
                            <div className="mt-6 space-y-4">
                                {customerForm.vehicles.map((vehicle, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <Car className="h-6 w-6 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                                                <p className="text-sm text-muted-foreground">Motor: {vehicle.engine}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeVehicle(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCustomer}>Guardar Cliente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isCashDrawerOpen && (
                <>
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Terminal de Venta</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <CalendarIcon className="h-4 w-4"/> {currentDate}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium">Caja Inicial</p>
                                    <p className="text-xs text-muted-foreground">${formatUsd(initialBalances.usd)} / {formatBs(convertToVes(initialBalances.usd))} Bs</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Opciones de Caja</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones de Caja</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => {
                                            resetMovementForm();
                                            setIsCashMovementModalOpen(true);
                                        }}>
                                            <ArrowDownUp className="mr-2 h-4 w-4" />
                                            <span>Entrada/Salida de Caja</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Reportes y Cierre</DropdownMenuLabel>
                                         <DropdownMenuItem onClick={() => handleCloseCashDrawer('X')}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>Imprimir Cierre X</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleCloseCashDrawer('Z')} className="text-destructive">
                                            <Printer className="mr-2 h-4 w-4" />
                                            <span>Imprimir Cierre Z y Cerrar Caja</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                    </Card>

                    <div className="space-y-4">
                        {renderStep()}
                    </div>
                </>
            )}
        </>
    );
}
