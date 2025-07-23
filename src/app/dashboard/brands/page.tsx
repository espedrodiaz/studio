
"use client";

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { brands as initialBrands } from "@/lib/placeholder-data";

type Brand = {
  id: string;
  name: string;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");

  const sortedAndFilteredBrands = useMemo(() => {
    return brands
      .filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [brands, searchTerm]);

  const openModal = (brand: Brand | null = null) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.name);
    } else {
      setEditingBrand(null);
      setBrandName("");
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!brandName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la marca no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }

    if (editingBrand) {
      // Update
      setBrands(
        brands.map((b) =>
          b.id === editingBrand.id ? { ...b, name: brandName } : b
        )
      );
      toast({
        title: "Marca Actualizada",
        description: `La marca "${brandName}" ha sido actualizada.`,
      });
    } else {
      // Create
      const newBrand = {
        id: `brand-${new Date().getTime()}`,
        name: brandName,
      };
      setBrands([...brands, newBrand]);
      toast({
        title: "Marca Creada",
        description: `La marca "${brandName}" ha sido añadida.`,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (brand: Brand) => {
    setBrands(brands.filter((b) => b.id !== brand.id));
    toast({
      title: "Marca Eliminada",
      description: `La marca "${brand.name}" ha sido eliminada.`,
      variant: "destructive",
    });
  };
  
  const getProductCountForBrand = (brandId: string) => {
    // This is a placeholder. In a real app, you would fetch this data.
    return Math.floor(Math.random() * 50);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Marcas</CardTitle>
            <CardDescription>
              Gestiona las marcas de los productos que vendes.
            </CardDescription>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar marca..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" className="gap-1" onClick={() => openModal()}>
              <PlusCircle className="h-4 w-4" />
              Añadir Marca
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <ul className="divide-y">
              {sortedAndFilteredBrands.map((brand) => (
                <li
                  key={brand.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-semibold">{brand.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {getProductCountForBrand(brand.id)} productos asociados
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openModal(brand)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(brand)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
            {sortedAndFilteredBrands.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    <p>No se encontraron marcas.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Editar Marca" : "Crear Nueva Marca"}
            </DialogTitle>
             <DialogDescription>
                Las marcas ayudan a organizar y filtrar tus productos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="brand-name">Nombre de la Marca</Label>
            <Input
              id="brand-name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ej: Empresas Polar"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingBrand ? "Guardar Cambios" : "Crear Marca"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

