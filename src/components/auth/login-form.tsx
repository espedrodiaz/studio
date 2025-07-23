
"use client";

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
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error de Inicio de Sesión",
        description: "El correo electrónico o la contraseña son incorrectos. Por favor, verifique.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, result.user);
        const user = result.user;

        // Check if user already exists in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // If user is new, create a document in Firestore
             const sevenDaysFromNow = new Date();
             sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

            await setDoc(userDocRef, {
                uid: user.uid,
                fullName: user.displayName || "Usuario de Google",
                businessName: `${user.displayName?.split(' ')[0]}'s Store` || "Mi Negocio",
                businessCategory: "Otro",
                rif: "N/A",
                email: user.email,
                licenseKey: "N/A - Google Sign In",
                status: "Trial",
                createdAt: new Date().toISOString(),
                trialEndsAt: sevenDaysFromNow.toISOString(),
            });
             toast({ title: "¡Bienvenido!", description: "Tu cuenta ha sido creada y tu prueba de 7 días ha comenzado." });
        } else {
             toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
        }
        
        router.push("/dashboard");

    } catch (error: any) {
        toast({
            title: "Error con Google",
            description: "No se pudo iniciar sesión con Google. Por favor, intenta de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center gap-2">
            <PosLogo className="text-3xl" />
          </div>
          <CardDescription>
            Ingrese su correo electrónico para iniciar sesión
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesión
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} type="button" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesión con Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
