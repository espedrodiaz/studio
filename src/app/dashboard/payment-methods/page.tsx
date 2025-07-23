
"use client";

import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  paymentMethods
} from "@/lib/placeholder-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type PaymentMethod = typeof paymentMethods[0];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<"$" | "Bs">("$");
  const [type, setType] = useState<"Efectivo" | "Digital">("Digital");
  const [givesChange, setGivesChange] = useState(false);
  const [managesOpeningBalance, setManagesOpeningBalance] = useState(false);

  useEffect(() => {
    setMethods(getPaymentMethods());
  }, []);

  const resetForm = () => {
    setName("");
    setCurrency("$");
    setType("Digital");
    setGivesChange(false);
    setManagesOpeningBalance(false);
    setEditingMethod(null);
  };

  const handleOpenModal = (method: PaymentMethod | null = null) => {
    if (method) {
      setEditingMethod(method);
      setName(method.name);
      setCurrency(method.currency as "$" | "Bs");
      setType(method.type as "Efectivo" | "Digital");
      setGivesChange(method.givesChange);
      setManagesOpeningBalance(method.managesOpeningBalance);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  }

  const handleSubmit = () => {
    if (!name) {
      toast({ title: "Error", description: "El nombre es obligatorio.", variant: "destructive" });
      return;
    }

    const methodData = { name, currency, type, givesChange, managesOpeningBalance };

    if (editingMethod) {
      updatePaymentMethod(editingMethod.id, methodData);
      toast({ title: "Éxito", description: "Forma de pago actualizada." });
    } else {
      addPaymentMethod(methodData);
      toast({ title: "Éxito", description: "Forma de pago añadida." });
    }

    setMethods(getPaymentMethods());
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
      deletePaymentMethod(id);
      setMethods(getPaymentMethods());
      toast({ title: "Eliminado", description: "La forma de pago ha sido eliminada.", variant: "destructive" });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Formas de Pago</CardTitle>
          <CardDescription>
            Gestiona las formas de pago aceptadas en tu negocio.
          </CardDescription>
        </div>
        <Button size="sm" className="gap-1" onClick={() => handleOpenModal()}>
          <PlusCircle className="h-4 w-4" />
          Añadir Forma de Pago
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Da Vuelto</TableHead>
              <TableHead>Maneja Saldo Apertura</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id}>
                <TableCell className="font-medium">{method.name}</TableCell>
                <TableCell>{method.currency}</TableCell>
                <TableCell>
                  <Badge variant={method.type === 'Efectivo' ? 'secondary' : 'outline'}>
                      {method.type}
                  </Badge>
                </TableCell>
                <TableCell>{method.givesChange ? 'Sí' : 'No'}</TableCell>
                <TableCell>{method.managesOpeningBalance ? 'Sí' : 'No'}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleOpenModal(method)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(method.id)}>
                         <Trash2 className="mr-2 h-4 w-4" />
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? 'Editar' : 'Añadir'} Forma de Pago</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Efectivo USD" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as "$" | "Bs")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="$">$ (Dólar)</SelectItem>
                        <SelectItem value="Bs">Bs (Bolívar)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as "Efectivo" | "Digital")}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Digital">Digital</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="givesChange" checked={givesChange} onCheckedChange={(checked) => setGivesChange(Boolean(checked))} />
                <label
                    htmlFor="givesChange"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                   Usar esta forma de pago para dar vuelto
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="managesOpeningBalance" checked={managesOpeningBalance} onCheckedChange={(checked) => setManagesOpeningBalance(Boolean(checked))} />
                <label
                    htmlFor="managesOpeningBalance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                   Maneja saldo de Apertura de Caja
                </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
