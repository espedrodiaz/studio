
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PosLogo } from "../ui/pos-logo";
import { MailCheck } from "lucide-react";

const businessCategories = [
    "Abastos y Bodegas",
    "Restaurantes y Cafés",
    "Farmacias",
    "Ferreterías",
    "Tiendas de Ropa y Accesorios",
    "Servicios Profesionales",
    "Venta de Repuestos",
    "Supermercados",
    "Panaderías y Pastelerías",
    "Otro",
];

export function SignupForm() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would typically handle the form submission, e.g., API call
    // For now, we'll just simulate the success state.
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader className="space-y-4 text-center">
             <div className="inline-flex items-center justify-center">
                <MailCheck className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-balance">
              Hemos recibido tus datos. En breve, recibirás un correo electrónico con tu clave de producto y los siguientes pasos para activar tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={() => router.push('/login')} className="w-full">
              Volver a Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <Card className="mx-auto max-w-lg w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center gap-2">
            <PosLogo className="text-3xl" />
          </div>
          <CardTitle>Crea tu Cuenta</CardTitle>
          <CardDescription>Completa el formulario para registrar tu negocio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Nombre completo</Label>
                <Input id="full-name" placeholder="Tu Nombre" required />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="business-name">Nombre de Empresa o Emprendimiento</Label>
                <Input id="business-name" placeholder="Tu Negocio C.A." required />
              </div>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="business-category">Categoría del Negocio</Label>
                    <Select required>
                        <SelectTrigger id="business-category">
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {businessCategories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="rif">RIF</Label>
                    <Input id="rif" placeholder="J-12345678-9" required />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Registrar mi Negocio
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline font-semibold">
              Iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
