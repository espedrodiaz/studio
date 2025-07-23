
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
import { categories as initialCategories } from "@/lib/placeholder-data";

type Category = {
  id: string;
  name: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const sortedAndFilteredCategories = useMemo(() => {
    return categories
      .filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchTerm]);

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      // Update
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, name: categoryName } : c
        )
      );
      toast({
        title: "Categoría Actualizada",
        description: `La categoría "${categoryName}" ha sido actualizada.`,
      });
    } else {
      // Create
      const newCategory = {
        id: `cat-${new Date().getTime()}`,
        name: categoryName,
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Categoría Creada",
        description: `La categoría "${categoryName}" ha sido añadida.`,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (category: Category) => {
    setCategories(categories.filter((c) => c.id !== category.id));
    toast({
      title: "Categoría Eliminada",
      description: `La categoría "${category.name}" ha sido eliminada.`,
      variant: "destructive",
    });
  };

  const getProductCountForCategory = (categoryId: string) => {
    // This is a placeholder. In a real app, you would fetch this data.
    return Math.floor(Math.random() * 100);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Categorías</CardTitle>
            <CardDescription>
              Organiza tus productos en categorías para facilitar la gestión.
            </CardDescription>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categoría..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" className="gap-1" onClick={() => openModal()}>
              <PlusCircle className="h-4 w-4" />
              Añadir Categoría
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <ul className="divide-y">
              {sortedAndFilteredCategories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {getProductCountForCategory(category.id)} productos asociados
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
                      <DropdownMenuItem onClick={() => openModal(category)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
             {sortedAndFilteredCategories.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    <p>No se encontraron categorías.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Crear Nueva Categoría"}
            </DialogTitle>
             <DialogDescription>
                Las categorías te ayudan a organizar y generar reportes de tus productos.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="category-name">Nombre de la Categoría</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ej: Bebidas"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
