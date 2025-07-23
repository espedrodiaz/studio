
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
import { MailCheck, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessCategory: "",
    rif: "",
    email: "",
    password: "",
  });

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) key += '-';
    }
    return key;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, businessCategory: value });
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if ( !formData.businessCategory ) {
        toast({ title: "Error", description: "Por favor, selecciona una categoría de negocio.", variant: "destructive"});
        return;
    }

    setIsLoading(true);

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // 2. Create user document in Firestore
        const licenseKey = generateLicenseKey();
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: formData.fullName,
            businessName: formData.businessName,
            businessCategory: formData.businessCategory,
            rif: formData.rif,
            email: formData.email,
            licenseKey: licenseKey,
            status: "Pending Activation",
            createdAt: new Date().toISOString(),
        });
        
        setIsSubmitted(true);

    } catch (error: any) {
        let description = "Ocurrió un error inesperado. Por favor, intenta de nuevo.";
        if (error.code === 'auth/email-already-in-use') {
            description = "Este correo electrónico ya está registrado. Por favor, intenta con otro o inicia sesión.";
        } else if (error.code === 'auth/weak-password') {
            description = "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
        }
        toast({
            title: "Error de Registro",
            description: description,
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
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
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" placeholder="Tu Nombre" required onChange={handleInputChange} value={formData.fullName} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="businessName">Nombre de Empresa o Emprendimiento</Label>
                <Input id="businessName" placeholder="Tu Negocio C.A." required onChange={handleInputChange} value={formData.businessName}/>
              </div>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="business-category">Categoría del Negocio</Label>
                    <Select required onValueChange={handleSelectChange}>
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
                    <Input id="rif" placeholder="J-12345678-9" required onChange={handleInputChange} value={formData.rif}/>
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="nombre@ejemplo.com" required onChange={handleInputChange} value={formData.email}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required onChange={handleInputChange} value={formData.password} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
