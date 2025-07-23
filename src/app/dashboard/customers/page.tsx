
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, UserPlus, Car, Trash2, Plus, Users, MessageSquare, Home, Eye } from "lucide-react";
import { customers as initialCustomers } from "@/lib/placeholder-data";
import { Customer, Vehicle } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useBusinessContext } from "@/hooks/use-business-context";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({ name: '', idNumber: '', address: '', phone: '', secondaryPhone: '', vehicles: [] });
  const [vehicleForm, setVehicleForm] = useState<Vehicle>({ brand: '', model: '', engine: '', year: '' });
  
  const { businessCategory } = useBusinessContext();
  const showVehiclesTab = businessCategory === 'Venta de Repuestos';


  const openCustomerModal = (customer: Customer | null) => {
      if (customer) {
          setEditingCustomer(customer);
          setCustomerForm({ ...customer });
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
          toast({ title: "Cliente Actualizado", description: `Los datos de ${updatedCustomer.name} han sido actualizados.` });
      } else { // Create
          const newCustomer = { id: `CUST${new Date().getTime()}`, ...customerForm };
          setCustomers([...customers, newCustomer]);
          toast({ title: "Cliente Creado", description: `Se ha registrado a ${newCustomer.name}.` });
      }
      setIsCustomerModalOpen(false);
  };
  
  const handleDeleteCustomer = (customerId: string) => {
      setCustomers(customers.filter(c => c.id !== customerId));
      toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado de la base de datos.", variant: "destructive" });
  }
  
  const formatPhoneNumberForWhatsApp = (phone: string) => {
    // Remove non-digit characters and the leading '0'
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('0')) {
        return `58${digitsOnly.substring(1)}`;
    }
    // Assuming it might already be in a format like 4141234567, add country code
    if(digitsOnly.length === 10) {
        return `58${digitsOnly}`;
    }
    return phone; // Fallback
  }


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Administra la base de datos de tus clientes.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => openCustomerModal(null)}>
            <PlusCircle className="h-4 w-4" />
            Añadir Cliente
          </Button>
        </CardHeader>
        <CardContent>
            {customers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {customers.map((customer) => (
                        <Card key={customer.id} className="flex flex-col">
                            <CardHeader className="flex-row gap-4 items-start pb-4">
                               <div className="flex-1">
                                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                                    <CardDescription>{customer.idNumber}</CardDescription>
                               </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => openCustomerModal(customer)}><Eye className="mr-2 h-4 w-4" />Ver Detalles</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openCustomerModal(customer)}>Editar</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCustomer(customer.id)}>
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                             <CardContent className="flex-1 space-y-3 text-sm">
                                <Link
                                    href={`https://wa.me/${formatPhoneNumberForWhatsApp(customer.phone)}`}
                                    target="_blank"
                                    className="flex items-center gap-2 text-green-600 font-semibold hover:underline"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{customer.phone}</span>
                                </Link>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Home className="h-4 w-4" />
                                    <span className="truncate">{customer.address}</span>
                                </div>
                                 {showVehiclesTab && customer.vehicles.length > 0 && (
                                     <>
                                        <Separator/>
                                         <div className="flex items-start gap-2 text-muted-foreground">
                                             <Car className="h-4 w-4 mt-0.5" />
                                             <div>
                                                 <p className="font-medium text-foreground">{customer.vehicles[0].brand} {customer.vehicles[0].model} ({customer.vehicles[0].year})</p>
                                                 {customer.vehicles.length > 1 && (
                                                    <p className="text-xs">+ {customer.vehicles.length -1} vehículo(s) más</p>
                                                 )}
                                             </div>
                                         </div>
                                     </>
                                 )}
                             </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                    <Users className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">No hay clientes registrados</h3>
                    <p className="text-sm">Haz clic en "Añadir Cliente" para empezar.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
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
                {showVehiclesTab && (
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
                        <div className="mt-6 space-y-4 max-h-60 overflow-y-auto pr-2">
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
                            {customerForm.vehicles.length === 0 && (
                                <p className="text-center text-muted-foreground">Este cliente no tiene vehículos registrados.</p>
                            )}
                        </div>
                    </TabsContent>
                )}
            </Tabs>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsCustomerModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveCustomer}>Guardar Cliente</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
