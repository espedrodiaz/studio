
"use client";

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categories, products } from "@/lib/placeholder-data";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Search, PackageOpen, CheckCircle } from 'lucide-react';

type CountedProduct = typeof products[0] & { countedStock?: number };

export default function RecountPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productList, setProductList] = useState<CountedProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const filteredProducts = products.filter(p => p.categoryId === categoryId);
    setProductList(filteredProducts);
    setSearchTerm('');
  };

  const handleCountChange = (productId: string, count: string) => {
    const newCount = parseInt(count, 10);
    setProductList(prevList =>
      prevList.map(p =>
        p.id === productId ? { ...p, countedStock: isNaN(newCount) ? undefined : newCount } : p
      )
    );
  };

  const filteredProductList = useMemo(() => {
    if (!searchTerm) return productList;
    return productList.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [productList, searchTerm]);

  const allProductsCounted = useMemo(() => {
    return productList.length > 0 && productList.every(p => p.countedStock !== undefined);
  }, [productList]);

  const handleFinalizeCount = () => {
    // In a real app, this would send the data to a backend to create inventory adjustments.
    console.log(productList.map(p => ({ id: p.id, original: p.stock, counted: p.countedStock })));
    toast({
        title: "Reconteo Finalizado",
        description: `Se han registrado los ajustes para la categoría seleccionada.`,
    });
    // Reset state
    setSelectedCategory('');
    setProductList([]);
    setSearchTerm('');
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Reconteo Físico de Inventario</CardTitle>
          <CardDescription>
            Selecciona una categoría para empezar a contar el stock físico de tus productos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-sm">
            <Label htmlFor="category-select">Categoría</Label>
            <Select onValueChange={handleCategoryChange} value={selectedCategory}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Selecciona una categoría..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar producto por nombre o código..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          )}

        </CardContent>
      </Card>
      
      {productList.length > 0 ? (
        <Card>
            <CardHeader>
                <CardTitle>Lista de Productos a Contar</CardTitle>
                <CardDescription>
                    Introduce la cantidad física contada para cada producto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg overflow-hidden">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-center">Stock Actual</TableHead>
                        <TableHead className="w-48 text-center">Cantidad Contada</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProductList.map(product => (
                        <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-center">{product.stock}</TableCell>
                            <TableCell className="text-center">
                            <Input
                                type="number"
                                className="text-center font-bold h-9"
                                placeholder="0"
                                value={product.countedStock ?? ''}
                                onChange={(e) => handleCountChange(product.id, e.target.value)}
                            />
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                 </div>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={handleFinalizeCount} disabled={!allProductsCounted}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar y Registrar Conteo
                </Button>
            </CardFooter>
        </Card>
      ) : (
        selectedCategory && (
             <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <PackageOpen className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No hay productos</h3>
                <p className="text-sm">No se encontraron productos para la categoría seleccionada.</p>
            </div>
        )
      )}
    </div>
  );
}
