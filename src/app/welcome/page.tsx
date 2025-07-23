
"use client";

import { Button } from "@/components/ui/button";
import { PosLogo } from "@/components/ui/pos-logo";
import { ArrowRight, BarChart, FileText, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card shadow-sm">
        <div className="p-3 mb-4 bg-primary/10 text-primary rounded-full">
            <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
            <Link href="#" className="mr-6 flex items-center space-x-2">
                <PosLogo className="text-2xl"/>
            </Link>
             <div className="flex flex-1 items-center justify-end space-x-2">
                <Button asChild variant="ghost">
                    <Link href="/login">Iniciar Sesión</Link>
                </Button>
                 <Button asChild>
                    <Link href="/signup">Registrarse Gratis</Link>
                </Button>
            </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
            <div className="container">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                    El Punto de Venta <span className="text-primary">inteligente</span> para tu negocio en Venezuela
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
                    Desde el control de tu inventario hasta la facturación y reportes. FacilitoPOS es la herramienta todo en uno que necesitas para crecer.
                </p>
                <Button asChild size="lg">
                    <Link href="/signup">
                        Comienza tu Prueba de 7 Días <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
            <div className="container">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Todo lo que necesitas, en un solo lugar</h2>
                    <p className="text-muted-foreground mt-2">Diseñado para simplificar tu día a día.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={Package}
                        title="Gestión de Inventario"
                        description="Controla tu stock, precios de costo, precios de venta y ubicaciones de forma sencilla y centralizada."
                    />
                     <FeatureCard 
                        icon={FileText}
                        title="Facturación Rápida"
                        description="Crea ventas y emite tickets digitales en segundos con un punto de venta ágil y adaptable a múltiples formas de pago."
                    />
                     <FeatureCard 
                        icon={BarChart}
                        title="Reportes y Análisis"
                        description="Obtén una visión clara de la salud de tu negocio con reportes de ventas, ganancias y salud financiera."
                    />
                </div>
            </div>
        </section>

         {/* Image Section */}
        <section className="py-20">
             <div className="container text-center">
                <h2 className="text-3xl font-bold mb-4">Interfaz Intuitiva y Moderna</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Una experiencia de usuario diseñada para que te concentres en vender, no en descifrar un software complicado.</p>
                 <div className="relative w-full max-w-4xl mx-auto">
                    <Image 
                        src="https://placehold.co/1200x675.png"
                        alt="Dashboard de FacilitoPOS"
                        width={1200}
                        height={675}
                        className="rounded-xl border shadow-2xl"
                        data-ai-hint="dashboard computer"
                    />
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FacilitoPOS. Desarrollado por DiazSoft. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
