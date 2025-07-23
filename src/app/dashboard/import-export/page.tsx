
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, Download, Upload, FileType, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ImportExportPage() {

  const handleExport = (fileType: 'csv' | 'pdf') => {
    toast({
        title: "Exportación Iniciada",
        description: `Se está generando el archivo ${fileType.toUpperCase()}. Esto es una simulación.`
    })
  }
  
  const handleDownloadTemplate = () => {
     toast({
        title: "Plantilla Descargada",
        description: `Se ha descargado la plantilla de Excel. (Simulación)`
    })
  }
  
  const handleFileUpload = () => {
    // In a real app, this would trigger a file input dialog.
     toast({
        title: "Subida de Archivo",
        description: `Funcionalidad de subida de archivo no implementada. (Simulación)`
    })
  }


  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Exportar Inventario</CardTitle>
              <CardDescription>
                Descarga tu lista de productos actual en formato CSV o PDF.
              </CardDescription>
            </div>
            <FileDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Genera un archivo con todos tus productos, incluyendo stock actual, precios de compra y venta, categorías y marcas.
            </p>
        </CardContent>
        <CardFooter className="flex gap-4">
            <Button onClick={() => handleExport('csv')} className="flex-1 gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Exportar a CSV
            </Button>
            <Button onClick={() => handleExport('pdf')} variant="secondary" className="flex-1 gap-2">
                <FileType className="h-4 w-4" /> Exportar a PDF
            </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
           <div className="flex items-start justify-between">
            <div>
              <CardTitle>Importar Inventario</CardTitle>
              <CardDescription>
                Añade o actualiza productos masivamente desde un archivo.
              </CardDescription>
            </div>
            <FileUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
                Para asegurar una importación exitosa, descarga nuestra plantilla, llénala con tus datos y luego súbela.
            </p>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
                <strong>Importante:</strong> El sistema usará el ID del producto para actualizar. Si el ID no existe, se creará un nuevo producto.
            </div>
        </CardContent>
        <CardFooter className="flex gap-4">
             <Button onClick={handleDownloadTemplate} variant="outline" className="flex-1 gap-2">
                <Download className="h-4 w-4" /> Descargar Plantilla
            </Button>
            <Button onClick={handleFileUpload} className="flex-1 gap-2">
                <Upload className="h-4 w-4" /> Subir Archivo
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
