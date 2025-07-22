
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exchangeRates } from "@/lib/placeholder-data";
import { toast } from "@/hooks/use-toast";

export default function ExchangeRatesPage() {
  const [currentRate, setCurrentRate] = useState(exchangeRates.bcv);
  const [newRate, setNewRate] = useState(exchangeRates.bcv);

  const handleSave = () => {
    setCurrentRate(newRate);
    toast({
      title: "Tasa Actualizada",
      description: `La nueva tasa BCV es ${newRate} Bs por 1 USD.`,
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasa de Cambio BCV</CardTitle>
          <CardDescription>
            Administra la tasa de cambio de Bolívares (VES) a Dólares (USD)
            según el Banco Central de Venezuela.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center bg-muted/40 rounded-lg p-8">
              <p className="text-sm font-medium text-muted-foreground">
                Tasa Actual (VES / USD)
              </p>
              <p className="text-5xl font-bold tracking-tight">
                {currentRate.toFixed(2)}
              </p>
            </div>
            <div className="space-y-4">
              <p className="font-medium">Actualizar Tasa</p>
               <div className="space-y-2">
                <Label htmlFor="rate">Nueva Tasa BCV (Bs por 1$)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="Ej: 100.00"
                  value={newRate}
                  onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={newRate === currentRate || newRate <= 0}>Guardar Cambios</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

