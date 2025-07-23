
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
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

export function SignupForm() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
        // 1. Create user in Firebase Auth
        await createUserWithEmailAndPassword(auth, email, password);
        
        // The rest of the user data will be collected after the first login.
        // For now, we just create the auth user.
        
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
              ¡Bienvenido! Tu cuenta ha sido creada. Ahora puedes iniciar sesión.
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
              Crear Cuenta
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
