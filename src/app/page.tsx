
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PosLogo } from "@/components/ui/pos-logo";
import { ArrowRight, BarChart2, DollarSign, Package, Users, Store, Landmark } from "lucide-react";
import { useBusinessContext } from "@/hooks/use-business-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  {
    icon: Store,
    title: "Punto de Venta (POS) Ágil",
    description: "Procesa ventas rápidamente con una interfaz intuitiva, manejo de múltiples formas de pago y cálculo de vuelto.",
  },
  {
    icon: Package,
    title: "Gestión de Inventario Completa",
    description: "Controla tu stock, gestiona productos, categorías, marcas y realiza reconteos físicos para mantener todo al día.",
  },
  {
    icon: Users,
    title: "Base de Datos de Clientes",
    description: "Registra a tus clientes, guarda su información de contacto y hasta los vehículos que poseen para un servicio personalizado.",
  },
  {
    icon: BarChart2,
    title: "Reportes y Resumen Financiero",
    description: "Obtén una visión clara de la salud de tu negocio con un dashboard que resume tus ventas, costos y ganancias.",
  },
  {
    icon: Landmark,
    title: "Manejo de Múltiples Tasas",
    description: "Registra y utiliza la tasa del BCV y las tasas de tus proveedores para tener precios siempre actualizados y precisos.",
  },
  {
    icon: DollarSign,
    title: "Cuentas por Cobrar y Pagar",
    description: "Lleva un seguimiento detallado de las deudas de tus clientes y tus compromisos con proveedores.",
  },
];


export default function LandingPage() {
    const { user, isLoading } = useBusinessContext();
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect them to the dashboard
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);
    
    // While loading, we can show a simpler loading state or nothing
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <PosLogo className="text-5xl" />
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <PosLogo className="text-2xl" />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
             <Link href="#features" className="hover:text-primary transition-colors">Características</Link>
             <Link href="#pricing" className="hover:text-primary transition-colors">Precios</Link>
          </nav>
          <Button asChild>
            <Link href="/login">Acceder a la App</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    El Sistema de Punto de Venta <span className="text-primary">Definitivo</span> para tu Negocio en Venezuela
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    FacilitoPOS es la herramienta todo-en-uno que simplifica tu inventario, ventas y finanzas, adaptado a la realidad económica del país.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                     <Link href="/signup">
                        Comienza tu Prueba de 7 Días
                        <ArrowRight className="ml-2 h-4 w-4" />
                     </Link>
                  </Button>
                </div>
              </div>
               <div className="hidden lg:flex items-center justify-center">
                    <img
                        alt="Hero"
                        className="overflow-hidden rounded-xl object-contain"
                        height="400"
                        src="https://placehold.co/600x400.png"
                        data-ai-hint="business point of sale"
                        width="600"
                    />
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Características Clave</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Todo lo que necesitas. Nada que no.</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Desde el control de tu inventario hasta la gestión de clientes, hemos pensado en todo para que tú solo te preocupes por vender.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-2">
                    <div className="flex items-center gap-2">
                        <feature.icon className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-bold">{feature.title}</h3>
                    </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
         <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Un Precio Simple y Justo</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Obtén todas las funcionalidades con un único pago. Sin mensualidades ni costos ocultos.
                </p>
                </div>
                <div className="flex justify-center">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Licencia Permanente</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="text-4xl font-bold">$60</div>
                            <p className="text-muted-foreground">Pago único. Acceso de por vida a todas las funcionalidades actuales y futuras.</p>
                             <Button asChild size="lg" className="w-full">
                                <Link href="/signup">
                                    Obtener Licencia
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 FacilitoPOS por DiazSoft. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Términos de Servicio
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}

