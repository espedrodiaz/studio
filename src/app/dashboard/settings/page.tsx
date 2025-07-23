
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessContext } from "@/hooks/use-business-context";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, PenSquare } from "lucide-react";

export default function SettingsPage() {
  const { businessName, businessCategory } = useBusinessContext();

  // State for editable fields
  const [address, setAddress] = useState("Av. Principal, Local 1, Ciudad");
  const [phone, setPhone] = useState("0414-1234567");
  const [instagram, setInstagram] = useState("@tu_negocio");
  const [defaultProfitMargin, setDefaultProfitMargin] = useState<number | string>(30);
  const [useMarginProtection, setUseMarginProtection] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState("USD");

  const handleSaveChanges = () => {
    // Here you would typically make an API call to save the settings.
    toast({
      title: "Ajustes Guardados",
      description: "La configuración de tu negocio ha sido actualizada.",
    });
  };
  
  const handleRequestChange = () => {
     toast({
      title: "Solicitud Enviada",
      description: "Tu solicitud de cambio de nombre/RIF ha sido enviada para aprobación.",
    });
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajustes del Negocio</CardTitle>
          <CardDescription>
            Gestiona la configuración de tu cuenta y de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="business">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="business">Información del Negocio</TabsTrigger>
              <TabsTrigger value="products">Productos y Moneda</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Datos Fiscales y de Contacto</CardTitle>
                    <CardDescription>
                        Mantén actualizada la información de tu empresa. Los cambios en el nombre o RIF requieren aprobación.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Nombre del Negocio (Bloqueado)</Label>
                        <div className="flex items-center gap-2">
                            <Input id="businessName" value={businessName} disabled />
                            <Button variant="outline" size="icon" onClick={handleRequestChange}>
                                <PenSquare className="h-4 w-4"/>
                                <span className="sr-only">Solicitar Cambio</span>
                            </Button>
                        </div>
                         <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Para cambiar el nombre o RIF, haz clic en el lápiz y envía una solicitud.
                        </p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="rif">RIF (Bloqueado)</Label>
                         <Input id="rif" value="J-12345678-9" disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Dirección Fiscal</Label>
                        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@tu_negocio"/>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-6">
               <Card>
                 <CardHeader>
                    <CardTitle>Configuración de Productos y Moneda</CardTitle>
                    <CardDescription>
                        Define valores por defecto para agilizar la gestión de tu inventario y finanzas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="defaultProfitMargin">Margen de Ganancia por Defecto (%)</Label>
                        <Input
                            id="defaultProfitMargin"
                            type="number"
                            value={defaultProfitMargin}
                            onChange={(e) => setDefaultProfitMargin(e.target.value)}
                            placeholder="Ej: 30"
                        />
                        <p className="text-xs text-muted-foreground">
                            Este será el margen de ganancia sugerido al crear un nuevo producto.
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="margin-protection" className="text-base">
                                Usar Protección de Margen de Ganancia
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Evita que los precios de venta bajen de tu margen de ganancia mínimo al fluctuar la tasa de proveedores.
                            </p>
                        </div>
                         <Switch
                            id="margin-protection"
                            checked={useMarginProtection}
                            onCheckedChange={setUseMarginProtection}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Moneda Base del Sistema</Label>
                         <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una moneda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD ($) - Dólares Americanos</SelectItem>
                                <SelectItem value="VES">VES (Bs) - Bolívares</SelectItem>
                            </SelectContent>
                        </Select>
                         <p className="text-xs text-muted-foreground">
                            La moneda seleccionada será la principal para los cálculos de costos y precios. La otra se usará como referencia.
                        </p>
                    </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
      </div>
    </div>
  );
}

    