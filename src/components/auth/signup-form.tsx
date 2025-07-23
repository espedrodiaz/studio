
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
import { PosLogo } from "../ui/pos-logo";
import { MailCheck, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessCategories } from "@/lib/placeholder-data";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export function SignupForm() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [rif, setRif] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessCategory) {
        toast({ title: "Error", description: "Por favor, selecciona una categoría de negocio.", variant: "destructive" });
        return;
    }
    setIsLoading(true);

    try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Generate a unique license key (simple version)
        const licenseKey = `FPV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        // 3. Save user business data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName,
            businessName,
            businessCategory,
            rif,
            email,
            licenseKey,
            status: "Trial", // Start as Trial
            createdAt: new Date().toISOString(),
            trialEndsAt: sevenDaysFromNow.toISOString(),
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
              ¡Bienvenido! Tu cuenta ha sido creada y tu período de prueba de 7 días ha comenzado. Ahora puedes iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={() => router.push('/login')} className="w-full">
              Ir a Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center gap-2">
            <PosLogo className="text-3xl" />
          </div>
          <CardTitle>Crea tu Cuenta</CardTitle>
          <CardDescription>Completa el formulario para registrarte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="fullName">Nombre y Apellido</Label>
                <Input id="fullName" placeholder="Ej: Pedro Pérez" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessName">Nombre del Negocio</Label>
              <Input id="businessName" placeholder="Ej: Bodega La Esquina" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="businessCategory">Categoría del Negocio</Label>
                 <Select value={businessCategory} onValueChange={setBusinessCategory}>
                    <SelectTrigger id="businessCategory">
                        <SelectValue placeholder="Selecciona una categoría..." />
                    </SelectTrigger>
                    <SelectContent>
                        {businessCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="rif">RIF del Negocio</Label>
                <Input id="rif" placeholder="Ej: J-12345678-9" required value={rif} onChange={(e) => setRif(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="nombre@ejemplo.com" required onChange={(e) => setEmail(e.target.value)} value={email}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required onChange={(e) => setPassword(e.target.value)} value={password} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta e Iniciar Prueba
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
