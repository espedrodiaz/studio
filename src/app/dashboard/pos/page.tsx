

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { products, customers as initialCustomers, getPaymentMethods, getCurrentBcvRate, cashMovements as initialCashMovements, addCashMovement, sales as initialSales, addSale } from "@/lib/placeholder-data";
import { X, PlusCircle, MinusCircle, Search, UserPlus, ArrowLeft, ArrowRight, DollarSign, Printer, MoreVertical, CalendarIcon, FileText, ArrowDownUp, ShoppingCart, Pencil, Car, Trash2, Plus, ChevronDown, ChevronUp, CheckCircle2, Share2, Download, Send, Calculator, ArrowUpCircle, ArrowDownCircle, BadgeEuro } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer, Vehicle, CartItem, SaleDataForTicket } from "@/lib/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBusinessContext } from '@/hooks/use-business-context';
import { DigitalTicket } from '@/components/sales/digital-ticket';


type CashMovement = typeof initialCashMovements[0];
type PaymentMethod = ReturnType<typeof getPaymentMethods>[0];

export default function PosPage() {
    // Global State
    const [paymentMethodsList, setPaymentMethodsList] = useState(getPaymentMethods());
    const bcvRate = getCurrentBcvRate();
    const [currentDate, setCurrentDate] = useState('');
    const { businessCategory } = useBusinessContext();
    const showVehiclesTab = businessCategory === 'Venta de Repuestos';

    // Cash Drawer State
    const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
    const [isCashDrawerModalOpen, setIsCashDrawerModalOpen] = useState(false);
    const [initialBalances, setInitialBalances] = useState<{[key: string]: number}>({});
    const [sales, setSales] = useState<typeof initialSales>([]);
    const [cashMovements, setCashMovements] = useState<CashMovement[]>(initialCashMovements);
    const [selectedCashDrawerFilter, setSelectedCashDrawerFilter] = useState<string>('all');


    const [isCashMovementModalOpen, setIsCashMovementModalOpen] = useState(false);
    const [movementType, setMovementType] = useState<'Entrada' | 'Salida'>('Salida');
    const [movementAmount, setMovementAmount] = useState<number | ''>('');
    const [movementPaymentMethod, setMovementPaymentMethod] = useState('');
    const [movementConcept, setMovementConcept] = useState('');

    // Sale Flow State
    const [step, setStep] = useState(1);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [payments, setPayments] = useState<{methodId: string, amount: number}[]>([]);
    const [changePayments, setChangePayments] = useState<{methodId: string, amount: number}[]>([]);
    
    // UI State
    const [isCartExpanded, setIsCartExpanded] = useState(true);
    const [lastCompletedSale, setLastCompletedSale] = useState<SaleDataForTicket | null>(null);

    // Modal & Form States
    const [isEditingPrice, setIsEditingPrice] = useState<CartItem | null>(null);
    const [priceInUsd, setPriceInUsd] = useState<number | string>('');
    const [priceInVes, setPriceInVes] = useState<number | string>('');

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({ name: '', idNumber: '', address: '', phone: '', secondaryPhone: '', vehicles: [] });
    const [vehicleForm, setVehicleForm] = useState<Vehicle>({ brand: '', model: '', engine: '', year: '' });

    const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');

    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [selectedChangeMethod, setSelectedChangeMethod] = useState<PaymentMethod | null>(null);
    const [changeAmount, setChangeAmount] = useState<number | ''>('');
    
    const formatUsd = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatBs = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const convertToVes = (amountUsd: number) => amountUsd * bcvRate;
    const convertToUsd = (amountVes: number) => amountVes / bcvRate;

    // Derived Calculations
    const cashDrawerState = useMemo(() => {
        const state: { [key: string]: { initial: number; sales: number; movementsIn: number; movementsOut: number; final: number } } = {};
        
        paymentMethodsList.forEach(pm => {
            const initial = initialBalances[pm.id] || 0;
            const salesTotal = sales.reduce((total, sale) => {
                 if (sale.status === 'Anulada') return total;
                 const salePayment = sale.payments.find(p => p.methodId === pm.id);
                 return total + (salePayment ? salePayment.amount : 0);
            }, 0);
             const changeGiven = sales.reduce((total, sale) => {
                  if (sale.status === 'Anulada') return total;
                 const changePayment = sale.changeGiven.find(c => c.methodId === pm.id);
                 return total + (changePayment ? changePayment.amount : 0);
            }, 0);
            const movementsIn = cashMovements.filter(m => m.paymentMethodId === pm.id && m.type === 'Entrada').reduce((sum, m) => sum + m.amount, 0);
            const movementsOut = cashMovements.filter(m => m.paymentMethodId === pm.id && m.type === 'Salida').reduce((sum, m) => sum + m.amount, 0);

            state[pm.id] = {
                initial,
                sales: salesTotal,
                movementsIn,
                movementsOut: movementsOut + changeGiven,
                final: initial + salesTotal + movementsIn - movementsOut - changeGiven
            };
        });
        
        return state;
    }, [initialBalances, sales, cashMovements, paymentMethodsList]);
    
    const totalCashDrawer = useMemo(() => {
        const totals = {
            initial: { usd: 0, ves: 0 },
            final: { usd: 0, ves: 0 }
        };

        Object.entries(cashDrawerState).forEach(([pmId, state]) => {
            const method = paymentMethodsList.find(pm => pm.id === pmId);
            if (!method || !method.managesOpeningBalance) return;

            if (method.currency === '$') {
                totals.initial.usd += state.initial;
                totals.final.usd += state.final;
            } else {
                totals.initial.ves += state.initial;
                totals.final.ves += state.final;
            }
        });

        return totals;
    }, [cashDrawerState, paymentMethodsList]);


    const compiledMovements = useMemo(() => {
        let allMovements: any[] = [];
        const filterPm = paymentMethodsList.find(pm => pm.id === selectedCashDrawerFilter);

        const processMovements = (pm: PaymentMethod) => {
            // Initial Balance
            if (initialBalances[pm.id] && initialBalances[pm.id] > 0) {
                allMovements.push({
                    date: new Date(0).toISOString(),
                    type: 'Apertura',
                    concept: 'Saldo Inicial',
                    amount: initialBalances[pm.id],
                    currency: pm.currency
                });
            }
            // Sales
            sales.forEach(sale => {
                if (sale.status === 'Anulada') return;
                sale.payments.filter(p => p.methodId === pm.id).forEach(p => {
                    allMovements.push({ date: sale.date, type: 'Venta', concept: `Venta #${sale.id}`, amount: p.amount, currency: pm.currency });
                });
                sale.changeGiven.filter(c => c.methodId === pm.id).forEach(c => {
                    allMovements.push({ date: sale.date, type: 'Vuelto', concept: `Vuelto Venta #${sale.id}`, amount: -c.amount, currency: pm.currency });
                });
            });
            // Manual Movements
            cashMovements.filter(m => m.paymentMethodId === pm.id).forEach(m => {
                 allMovements.push({ date: m.date, type: m.type, concept: m.concept, amount: m.type === 'Entrada' ? m.amount : -m.amount, currency: pm.currency });
            });
        };

        if (selectedCashDrawerFilter === 'all') {
           return [];
        } else if (filterPm) {
            processMovements(filterPm);
        }

        return allMovements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [selectedCashDrawerFilter, initialBalances, sales, cashMovements, paymentMethodsList]);


    useEffect(() => {
        const newInputs: Record<string, string> = {};
        cart.forEach(item => {
            newInputs[item.id] = String(item.quantity);
        });
        setQuantityInputs(newInputs);
    }, [cart]);


    useEffect(() => {
        setPaymentMethodsList(getPaymentMethods());
        setCurrentDate(new Date().toLocaleDateString('es-VE', {
            weekday: 'long', month: 'long', day: 'numeric'
        }));
    }, []);

    const handleOpenCashDrawer = () => {
         const hasNegative = Object.values(initialBalances).some(val => val < 0);
        if (hasNegative) {
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
            description: `La sesión de caja ha comenzado.`,
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
            setInitialBalances({});
            setCashMovements([]);
            setSales([]);
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
            return [...prevCart, { ...product, quantity: 1, salePrice: product.salePrice }];
        });
        setProductSearchTerm('');
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
             setQuantityInputs(prev => ({ ...prev, [productId]: '1' }));
             setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity: 1 } : item));
             toast({title: "Error de Cantidad", description: "La cantidad no puede ser cero o menor. Para eliminar el producto, use el botón de la papelera.", variant: "destructive"})
        } else {
            setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
        }
    };
    
    const removeItemFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const handleQuantityInputChange = (productId: string, value: string) => {
        setQuantityInputs(prev => ({ ...prev, [productId]: value }));
    };

    const handleQuantityInputBlur = (productId: string) => {
        const value = quantityInputs[productId];
        if (value === '' || parseInt(value, 10) <= 0) {
             updateQuantity(productId, 1);
             return;
        }
        const newQuantity = parseInt(value, 10);
        if (!isNaN(newQuantity)) {
             updateQuantity(productId, newQuantity);
        }
    };

    const handleQuantityInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, productId: string) => {
        if (event.key === 'Enter') {
            handleQuantityInputBlur(productId);
            event.currentTarget.blur();
        }
    };
    
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
            setCustomerForm({ ...customer, secondaryPhone: customer.secondaryPhone || '' });
        } else {
            setEditingCustomer(null);
            setCustomerForm({ name: '', idNumber: '', address: '', phone: '', secondaryPhone: '', vehicles: [] });
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
        goToStep(3);
    };
    
    const handleOmitCustomer = () => {
        setSelectedCustomer({
            id: 'CUST_OCCASIONAL',
            name: 'Cliente Ocasional',
            idNumber: 'V-00000000',
            address: 'N/A',
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

    const openPaymentModal = (method: PaymentMethod) => {
        const remainingBalance = subtotal - totalPaid;
        const suggestedAmount = method.currency === 'Bs'
            ? parseFloat(convertToVes(remainingBalance).toFixed(2))
            : parseFloat(remainingBalance.toFixed(2));
        
        setPaymentAmount(suggestedAmount > 0 ? suggestedAmount : '');
        setSelectedPaymentMethod(method);
        setIsPaymentModalOpen(true);
    };

    const handleAddPayment = () => {
        if (selectedPaymentMethod && typeof paymentAmount === 'number' && paymentAmount > 0) {
            const remainingBalance = subtotal - totalPaid;
            let paymentAmountInUsd = paymentAmount;
            if (selectedPaymentMethod.currency === 'Bs') {
                paymentAmountInUsd = convertToUsd(paymentAmount);
            }

            if (selectedPaymentMethod.type === 'Digital' && paymentAmountInUsd > remainingBalance + 0.001) {
                toast({
                    title: "Error de Monto",
                    description: `El pago digital no puede exceder el monto restante.`,
                    variant: "destructive",
                });
                return;
            }

            setPayments([...payments, { methodId: selectedPaymentMethod.id, amount: paymentAmount }]);
            setPaymentAmount('');
            setSelectedPaymentMethod(null);
            setIsPaymentModalOpen(false);
        } else {
             toast({ title: "Error", description: "Ingrese un monto válido.", variant: "destructive" });
        }
    };
    
    const removePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

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

    const openChangeModal = (method: PaymentMethod) => {
        const remainingChangeToGive = changeToGive - totalChangeGiven;
        const suggestedAmount = method.currency === 'Bs'
            ? parseFloat(convertToVes(remainingChangeToGive).toFixed(2))
            : parseFloat(remainingChangeToGive.toFixed(2));
        
        setChangeAmount(suggestedAmount > 0 ? suggestedAmount : '');
        setSelectedChangeMethod(method);
        setIsChangeModalOpen(true);
    };

     const handleAddChange = () => {
        if (selectedChangeMethod && typeof changeAmount === 'number' && changeAmount > 0) {
            setChangePayments([...changePayments, { methodId: selectedChangeMethod.id, amount: changeAmount }]);
            setChangeAmount('');
            setSelectedChangeMethod(null);
            setIsChangeModalOpen(false);
        } else {
             toast({ title: "Error", description: "Ingrese un monto de vuelto válido.", variant: "destructive" });
        }
    };

    const removeChangePayment = (index: number) => {
        setChangePayments(changePayments.filter((_, i) => i !== index));
    };


    const handleCompleteSale = () => {
        const salePayments = payments.map(p => ({
            methodId: p.methodId,
            amount: p.amount,
        }));
         const saleChange = changePayments.map(p => ({
            methodId: p.methodId,
            amount: p.amount
        }));

        const newSale = addSale({
            customer: selectedCustomer?.name || "Cliente Ocasional",
            customerData: selectedCustomer,
            total: subtotal,
            status: 'Pagada',
            items: cart.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity, price: item.salePrice })),
            payments: salePayments,
            changeGiven: saleChange,
            bcvRate: bcvRate,
        });

        setSales(prev => [...prev, newSale]);

         const saleForTicket: SaleDataForTicket = {
            id: newSale.id,
            date: newSale.date,
            customer: selectedCustomer,
            items: cart,
            subtotal: subtotal,
            payments: payments.map(p => ({
                method: paymentMethodsList.find(m => m.id === p.methodId),
                amount: p.amount
            })),
            totalPaid: totalPaid,
            changeGiven: changePayments.map(p => ({
                method: paymentMethodsList.find(m => m.id === p.methodId),
                amount: p.amount
            })),
            totalChange: totalChangeGiven,
            bcvRate: bcvRate,
        };
        setLastCompletedSale(saleForTicket);

        // 2. Reset State for next sale
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
                    <div className="flex flex-col gap-6">
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
                     <div className="flex flex-col gap-6">
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
                        <div className="flex justify-between items-end mt-4">
                             <Button variant="outline" onClick={() => goToStep(1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                            <div className="flex gap-4">
                               <div className="text-center">
                                    <Button variant="secondary" onClick={handleOmitCustomer}>Omitir</Button>
                                    <p className="text-xs text-muted-foreground mt-1">Usar Cliente Genérico</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Payment
                return (
                     <div className="flex flex-col gap-4">
                        {renderCart()}
                        <Card>
                            <CardHeader>
                                <CardTitle>Procesar Pago</CardTitle>
                                <p className="text-sm text-muted-foreground pt-2">Cliente: {selectedCustomer?.name || 'Cliente Ocasional'}</p>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <Label className="font-semibold">Seleccione un método de pago</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {paymentMethodsList.map(method => (
                                        <Button key={method.id} variant="outline" className="h-16 flex-col gap-1" onClick={() => openPaymentModal(method)}>
                                            <span className="font-semibold">{method.name}</span>
                                            <span className="text-xs text-muted-foreground">{method.currency} - {method.type}</span>
                                        </Button>
                                    ))}
                                </div>

                                 {payments.length > 0 && (
                                    <div className="pt-4 mt-4 border-t space-y-4">
                                        <div>
                                            <Label className="font-semibold">Pagos Recibidos</Label>
                                            <div className="space-y-2 mt-2">
                                                {payments.map((p, index) => {
                                                    const method = paymentMethodsList.find(m => m.id === p.methodId);
                                                    return (
                                                        <div key={index} className="flex justify-between items-center p-2 border rounded-lg">
                                                            <span>{method?.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{method?.currency === 'Bs' ? formatBs(p.amount) : formatUsd(p.amount)} {method?.currency}</span>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePayment(index)}><X className="h-4 w-4"/></Button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                         <div className="space-y-1 rounded-lg border bg-background p-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Total Pagado:</span>
                                                    <span className="font-medium">Bs {formatBs(convertToVes(totalPaid))} (${formatUsd(totalPaid)})</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal:</span>
                                                    <span className="font-medium">Bs {formatBs(convertToVes(subtotal))} (${formatUsd(subtotal)})</span>
                                                </div>
                                                <Separator className="my-2" />
                                                <div className="flex justify-between font-bold text-lg text-destructive">
                                                    <span>Faltante:</span>
                                                     <span>Bs {formatBs(convertToVes(balance > 0 ? balance : 0))} (${formatUsd(balance > 0 ? balance : 0)})</span>
                                                </div>
                                            </div>
                                    </div>
                                 )}

                                 {changeToGive > 0 && (
                                    <div className="pt-4 mt-4 border-t">
                                        <Label className="font-semibold">Entregar Vuelto</Label>
                                        <p className="text-destructive text-sm font-semibold mb-2">Falta por entregar: Bs {formatBs(convertToVes(remainingChange))} (${formatUsd(remainingChange)})</p>
                                        
                                        <Label className="font-medium text-xs text-muted-foreground">Seleccione método de vuelto</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                                            {paymentMethodsList.filter(m => m.givesChange).map(method => (
                                                <Button key={method.id} variant="outline" className="h-16 flex-col gap-1" onClick={() => openChangeModal(method)}>
                                                    <span className="font-semibold">{method.name}</span>
                                                    <span className="text-xs text-muted-foreground">{method.currency}</span>
                                                </Button>
                                            ))}
                                        </div>
                                        
                                        {changePayments.length > 0 && (
                                            <div className="space-y-2 mt-4">
                                                <Label className="font-medium text-xs text-muted-foreground">Vueltos entregados</Label>
                                                {changePayments.map((p, index) => {
                                                    const method = paymentMethodsList.find(m => m.id === p.methodId);
                                                    return (
                                                        <div key={index} className="flex justify-between items-center p-2 border rounded-lg">
                                                            <span>{method?.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">{method?.currency === 'Bs' ? formatBs(p.amount) : formatUsd(p.amount)} {method?.currency}</span>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeChangePayment(index)}><X className="h-4 w-4"/></Button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                 )}
                            </CardContent>
                        </Card>
                        
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
              <CardContent className={cn("max-h-[50vh] overflow-y-auto pr-4", { 'pt-0': !isCartExpanded })}>
                  {cart.length === 0 ? (
                       <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mb-4" />
                          <p className="font-semibold">El carrito está vacío</p>
                          <p className="text-sm">Busca un producto para empezar a vender.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                           {cart.map(item => (
                            <Card key={item.id} className="p-4">
                                <div className="grid grid-cols-[1fr_auto] gap-x-4">
                                    <p className="font-semibold leading-tight col-span-2">{item.name}</p>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                        <Input
                                            type="number"
                                            value={quantityInputs[item.id] || ''}
                                            onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                                            onBlur={() => handleQuantityInputBlur(item.id)}
                                            onKeyDown={(e) => handleQuantityInputKeyDown(e, item.id)}
                                            className="h-8 w-16 text-center"
                                        />
                                        <span>x {formatBs(convertToVes(item.salePrice))} Bs (${formatUsd(item.salePrice)})</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-end gap-2 row-start-2">
                                        <div className="text-right">
                                            <p className="font-semibold text-base">{formatBs(convertToVes(item.salePrice * item.quantity))}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handlePriceEdit(item)}>
                                                    <Pencil className="mr-2 h-4 w-4"/> Editar Precio
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => removeItemFromCart(item.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4"/> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </Card>
                          ))}
                      </div>
                  )}
              </CardContent>
              {cart.length > 0 && (
                  <CardFooter className="flex-col !items-stretch gap-2 pt-4">
                      <Separator />
                      <div className="flex justify-between font-semibold">
                          <span>Subtotal</span>
                          <div className="text-right">
                            <span className="block">{formatBs(convertToVes(subtotal))} Bs</span>
                            <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(subtotal)})</span>
                          </div>
                      </div>
                      {step === 3 && (
                         <>
                          <div className="flex justify-between text-muted-foreground">
                              <span>Pagado</span>
                                <div className="text-right">
                                    <span className="block">{formatBs(convertToVes(totalPaid))} Bs</span>
                                    <span className="text-muted-foreground text-xs font-normal ml-1">(${formatUsd(totalPaid)})</span>
                                </div>
                          </div>
                          <Separator />
                          <div className={`flex justify-between font-bold text-lg ${balance > 0 ? 'text-destructive' : 'text-primary'}`}>
                                <span>{balance > 0 ? 'Faltante' : 'Total'}</span>
                                {balance > 0 ? (
                                    <div className="text-right">
                                        <span className="block">{formatBs(convertToVes(balance))} Bs</span>
                                        <span className="block text-sm font-normal text-muted-foreground">(${formatUsd(balance)})</span>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                      <span className="block">{formatBs(convertToVes(subtotal))} Bs</span>
                                    </div>
                                )}
                          </div>
                          {changeToGive > 0 && (
                              <div className="flex justify-between font-bold text-lg text-green-600">
                                  <span>Vuelto</span>
                                   <div className="text-right">
                                      <span className="block">{formatBs(convertToVes(changeToGive))} Bs</span>
                                      <span className="block text-sm font-normal text-muted-foreground">(${formatUsd(changeToGive)})</span>
                                  </div>
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

    const Stepper = () => {
        const steps = [
            { id: 1, name: 'Carrito' },
            { id: 2, name: 'Cliente' },
            { id: 3, name: 'Pago' }
        ];

        return (
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {steps.map((s, stepIdx) => (
                        <li key={s.name} className={cn("relative", { 'flex-1': stepIdx !== steps.length -1 })}>
                            {s.id < step ? (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-primary" />
                                    </div>
                                    <button
                                        onClick={() => goToStep(s.id)}
                                        className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-white" aria-hidden="true" />
                                        <span className="sr-only">{s.name}</span>
                                    </button>
                                </>
                            ) : s.id === step ? (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <div
                                        className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background"
                                        aria-current="step"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                                        <span className="sr-only">{s.name}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <div
                                        className="group relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 bg-background hover:border-gray-400"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                                        <span className="sr-only">{s.name}</span>
                                    </div>
                                </>
                            )}
                             <p className={cn("absolute -bottom-5 w-max text-xs", 
                                s.id <= step ? 'font-semibold text-primary' : 'text-muted-foreground',
                                { 'left-[-50%] transform translate-x-1/4 md:translate-x-1/2': s.id > 1 && s.id < steps.length,
                                'left-0' : s.id === 1,
                                'right-0 text-right': s.id === steps.length
                                }
                            )}>{s.name}</p>
                        </li>
                    ))}
                </ol>
            </nav>
        );
    };

    return (
        <>
             <Dialog open={!isCashDrawerOpen} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Apertura de Caja</DialogTitle>
                        <DialogDescription>
                            Ingrese los saldos iniciales para cada forma de pago para comenzar a operar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {paymentMethodsList.filter(pm => pm.managesOpeningBalance).map(pm => (
                            <div key={pm.id} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`balance-${pm.id}`} className="text-right">
                                    {pm.name}
                                </Label>
                                <Input
                                    id={`balance-${pm.id}`}
                                    type="number"
                                    value={initialBalances[pm.id] || ''}
                                    onChange={(e) => setInitialBalances(b => ({ ...b, [pm.id]: parseFloat(e.target.value) || 0 }))}
                                    className="col-span-3"
                                    placeholder="0.00"
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleOpenCashDrawer} className="w-full">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Abrir Caja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isCashDrawerModalOpen} onOpenChange={setIsCashDrawerModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Estado de Caja</DialogTitle>
                         <DialogDescription>
                           Resumen interactivo de los movimientos y saldos de la caja.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[85vh] overflow-y-auto pr-4 -mx-4 px-4">
                        <div className="space-y-6 py-4">
                            <Card>
                                <CardHeader><CardTitle>Resumen General</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Saldo Inicial (VES):</span>
                                        <span className="font-medium">Bs {formatBs(totalCashDrawer.initial.ves)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saldo Inicial (USD):</span>
                                        <span className="font-medium">$ {formatUsd(totalCashDrawer.initial.usd)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-semibold">
                                        <span>Saldo Actual (VES):</span>
                                        <span className="font-bold text-lg">Bs {formatBs(totalCashDrawer.final.ves)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Saldo Actual (USD):</span>
                                        <span className="font-bold text-lg">$ {formatUsd(totalCashDrawer.final.usd)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => { setIsCashMovementModalOpen(true); resetMovementForm(); }}>
                                        <ArrowDownUp className="mr-2 h-4 w-4" />
                                        Registrar Movimiento Manual
                                    </Button>
                                </CardFooter>
                            </Card>
                            
                            <div className="space-y-4">
                                <Label>Saldos Actuales por Método de Pago</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {paymentMethodsList.map(pm => {
                                        const state = cashDrawerState[pm.id];
                                        if (!state) return null;
                                        const format = pm.currency === '$' ? formatUsd : formatBs;
                                        return (
                                            <Button 
                                                key={pm.id} 
                                                variant={selectedCashDrawerFilter === pm.id ? "default" : "outline"} 
                                                className="h-auto flex-col items-start p-3"
                                                onClick={() => setSelectedCashDrawerFilter(pm.id)}
                                            >
                                                <p className="font-semibold text-xs">{pm.name}</p>
                                                <p className="text-lg font-bold">{format(state.final)}</p>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            {selectedCashDrawerFilter !== 'all' && (
                                <div className="space-y-4">
                                    <Label>Historial de Movimientos: {paymentMethodsList.find(pm => pm.id === selectedCashDrawerFilter)?.name}</Label>
                                    <Card>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Tipo</TableHead>
                                                        <TableHead>Concepto</TableHead>
                                                        <TableHead className="text-right">Monto</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {compiledMovements.length > 0 ? compiledMovements.map((mov, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Badge variant={
                                                                    mov.type === 'Venta' || mov.type === 'Entrada' || mov.type === 'Apertura' ? 'default' : 'destructive'
                                                                } className={cn({
                                                                    'bg-green-100 text-green-800': mov.type === 'Venta' || mov.type === 'Entrada' || mov.type === 'Apertura',
                                                                    'bg-red-100 text-red-800': mov.type === 'Salida' || mov.type === 'Vuelto'
                                                                })}>
                                                                    {mov.type}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <p className="font-medium truncate">{mov.concept}</p>
                                                                <p className="text-xs text-muted-foreground">{new Date(mov.date).toLocaleString('es-VE')}</p>
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono">{mov.currency === '$' ? formatUsd(mov.amount) : formatBs(mov.amount)}</TableCell>
                                                        </TableRow>
                                                    )) : (
                                                         <TableRow><TableCell colSpan={3} className="text-center h-24">No hay movimientos para mostrar.</TableCell></TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCashDrawerModalOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isCashMovementModalOpen} onOpenChange={setIsCashMovementModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento de Caja</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label>Tipo de Movimiento</Label>
                            <RadioGroup value={movementType} onValueChange={(v) => setMovementType(v as 'Entrada' | 'Salida')} className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Entrada" id="r-entrada" /><Label htmlFor="r-entrada">Entrada</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Salida" id="r-salida" /><Label htmlFor="r-salida">Salida</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="movement-payment-method">Forma de Pago</Label>
                            <Select value={movementPaymentMethod} onValueChange={setMovementPaymentMethod}>
                                <SelectTrigger id="movement-payment-method"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                <SelectContent>{paymentMethodsList.map(pm => (<SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="movement-amount">Monto</Label>
                            <Input id="movement-amount" type="number" value={movementAmount} onChange={(e) => setMovementAmount(parseFloat(e.target.value) || '')} placeholder="0.00"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="movement-concept">Concepto</Label>
                            <Textarea id="movement-concept" value={movementConcept} onChange={(e) => setMovementConcept(e.target.value)} placeholder="Ej: Pago a proveedor, Compra de hielo..."/>
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
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: showVehiclesTab ? '1fr 1fr' : '1fr' }}>
                            <TabsTrigger value="personal">Información Personal</TabsTrigger>
                            {showVehiclesTab && <TabsTrigger value="vehicles">Vehículos</TabsTrigger>}
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
                                    <Label htmlFor="address">Dirección</Label>
                                    <Input id="address" value={customerForm.address} onChange={handleCustomerFormChange} placeholder="Av. Principal, Casa #1" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                                    <Input id="phone" value={customerForm.phone} onChange={handleCustomerFormChange} placeholder="0414-1234567" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryPhone">Teléfono secundario (Opcional)</Label>
                                    <Input id="secondaryPhone" value={customerForm.secondaryPhone} onChange={handleCustomerFormChange} placeholder="0212-9876543" />
                                </div>
                            </div>
                        </TabsContent>
                        {showVehiclesTab &&
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
                        }
                    </Tabs>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveCustomer}>Guardar Cliente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Pago</DialogTitle>
                        <DialogDescription>
                            Ingrese el monto recibido para <span className="font-semibold">{selectedPaymentMethod?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="payment-amount">Monto ({selectedPaymentMethod?.currency})</Label>
                             <Input 
                                id="payment-amount"
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || '')}
                                placeholder="0.00"
                             />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                         <Button onClick={handleAddPayment}>Añadir Pago</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>

             <Dialog open={isChangeModalOpen} onOpenChange={setIsChangeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Entregar Vuelto</DialogTitle>
                        <DialogDescription>
                            Ingrese el monto a entregar para <span className="font-semibold">{selectedChangeMethod?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                             <Label htmlFor="change-amount">Monto ({selectedChangeMethod?.currency})</Label>
                             <Input 
                                id="change-amount"
                                type="number"
                                value={changeAmount}
                                onChange={(e) => setChangeAmount(parseFloat(e.target.value) || '')}
                                placeholder="0.00"
                             />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setIsChangeModalOpen(false)}>Cancelar</Button>
                         <Button onClick={handleAddChange}>Añadir Vuelto</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>
            
            <DigitalTicket saleData={lastCompletedSale} onClose={() => setLastCompletedSale(null)} />


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
                                <Button variant="outline" size="icon" onClick={() => setIsCashDrawerModalOpen(true)}>
                                    <Calculator className="h-4 w-4" />
                                    <span className="sr-only">Estado de Caja</span>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Opciones de Caja</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
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

                    <div className="space-y-6">
                         <div className="px-4 pt-2 pb-6">
                            <Stepper />
                        </div>
                        {renderStep()}
                    </div>
                </>
            )}
        </>
    );
}

