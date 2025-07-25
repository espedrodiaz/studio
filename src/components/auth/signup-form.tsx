
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
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { toast } from "@/hooks/use-toast";
import { useBusinessContext } from "@/hooks/use-business-context";

export function SignupForm() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [rif, setRif] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { createUserDataInFirestore } = useBusinessContext();

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!businessCategory) {
        toast({ title: "Información Faltante", description: "Por favor, selecciona una categoría para tu negocio.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await createUserDataInFirestore(user, { fullName, businessName, businessCategory, rif });
        
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

  const handleGoogleSignup = async () => {
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      try {
          // The onAuthStateChanged listener in use-business-context will handle user creation
          await signInWithPopup(auth, provider);
          router.push('/dashboard');
      } catch (error: any) {
          toast({
              title: "Error con Google",
              description: "No se pudo iniciar sesión con Google. Por favor, intenta de nuevo.",
              variant: "destructive",
          });
      } finally {
          setIsGoogleLoading(false);
      }
  }


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
            <div className="grid gap-4">
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.2L381.2 150.1C344.3 117.7 300.6 96 248 96c-88.8 0-160.1 71.1-160.1 160.1s71.3 160.1 160.1 160.1c92.2 0 148.2-64.2 154.7-98.3H248v-65.4h239.1c1.3 12.2 2.1 24.4 2.1 37.8z"></path></svg>}
                    Registrarse con Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">O continuar con</span>
                    </div>
                </div>
            </div>

          <form onSubmit={handleSignup} className="grid gap-4 mt-4">
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
                 <Select value={businessCategory} onValueChange={setBusinessCategory} required>
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
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
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
