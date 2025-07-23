
"use client";

import { useState, useMemo } from 'react';
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
import { 
  MoreVertical, 
  PlusCircle, 
  Search, 
  ListFilter,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { products as initialProducts, categories, getCurrentBcvRate } from "@/lib/placeholder-data";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const bcvRate = getCurrentBcvRate();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      const matchesSearch = searchTerm === '' || 
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.ref.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);
  

  const formatUsd = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  const formatBs = (amount: number) => {
    return (amount * bcvRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Gestiona tu inventario de productos.</CardDescription>
            </CardHeader>
             <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <Button size="sm" className="gap-2 w-full sm:w-auto">
                    <PlusCircle />
                    Nuevo Producto
                </Button>
                <div className="relative w-full flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por nombre o referencia..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="w-full sm:w-auto sm:min-w-48">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                             <div className="flex items-center gap-2">
                                <ListFilter className="h-4 w-4" />
                                <SelectValue placeholder="Filtrar por categoría" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las Categorías</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} className="flex flex-col">
                        <CardHeader className="flex-row items-start justify-between pb-2">
                            <div className="flex-1">
                                <CardTitle className="text-base font-bold uppercase leading-tight">{product.name}</CardTitle>
                                <CardDescription className="text-xs">{product.ref}</CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    <DropdownMenuItem>Ver Movimientos</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 text-sm">
                             <div className="text-muted-foreground space-y-1">
                                <p>Ref: <span className="font-medium text-foreground">{product.ref}</span></p>
                                <p>Modelo: <span className="font-medium text-foreground">{product.model}</span></p>
                                <p className="text-xs pt-1">{product.longDescription}</p>
                             </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-red-600 font-semibold">Costo</p>
                                    <p className="font-bold text-lg text-red-600">${formatUsd(product.purchasePrice)}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-xs text-green-600 font-semibold">Precio Venta</p>
                                    <p className="font-bold text-lg text-green-600">${formatUsd(product.salePrice)}</p>
                                    <p className="text-xs text-muted-foreground">Bs {formatBs(product.salePrice)}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center text-xs">
                             <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{product.location}</span>
                             </div>
                             <Badge className={cn("text-base font-bold", {
                                'bg-red-100 text-red-800 border-red-200': product.stock === 0,
                                'bg-yellow-100 text-yellow-800 border-yellow-200': product.stock > 0 && product.stock <= 10,
                                'bg-green-100 text-green-800 border-green-200': product.stock > 10,
                             })}>
                                Stock: {product.stock}
                             </Badge>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 mt-6">
                <Search className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No se encontraron productos</h3>
                <p className="text-sm">Intenta con otro término de búsqueda o ajusta los filtros.</p>
            </div>
        )}
    </div>
  );
}
