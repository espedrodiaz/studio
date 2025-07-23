
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, UserPlus, Car, Trash2, Plus } from "lucide-react";
import { customers as initialCustomers } from "@/lib/placeholder-data";
import { Customer, Vehicle } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useBusinessContext } from "@/hooks/use-business-context";


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({ name: '', idNumber: '', email: '', phone: '', vehicles: [] });
  const [vehicleForm, setVehicleForm] = useState<Vehicle>({ brand: '', model: '', engine: '', year: '' });
  
  const { businessCategory } = useBusinessContext();
  const showVehiclesTab = businessCategory === 'Venta de Repuestos';


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
          toast({ title: "Cliente Actualizado", description: `Los datos de ${updatedCustomer.name} han sido actualizados.` });
      } else { // Create
          const newCustomer = { id: `CUST${new Date().getTime()}`, ...customerForm };
          setCustomers([...customers, newCustomer]);
          toast({ title: "Cliente Creado", description: `Se ha registrado a ${newCustomer.name}.` });
      }
      setIsCustomerModalOpen(false);
  };


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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula/RIF</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Vehículos</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.idNumber}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.vehicles.length}</TableCell>
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
                        <DropdownMenuItem onClick={() => openCustomerModal(customer)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Historial</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={customerForm.email} onChange={handleCustomerFormChange} placeholder="cliente@email.com" />
                        </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                            <Input id="phone" value={customerForm.phone} onChange={handleCustomerFormChange} placeholder="0414-1234567" />
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
