
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PosLogo } from "@/components/ui/pos-logo";
import { CheckCircle, BarChart2, Package, Users, ShoppingCart, DollarSign, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "./dashboard/loading";

const Feature = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground text-sm">
            {description}
        </p>
    </div>
);

export default function WelcomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [path, setPath] = useState('');

    const handleNavigation = (newPath: string) => {
        setPath(newPath);
        setIsLoading(true);
        setTimeout(() => {
            router.push(newPath);
        }, 6000); // 6 segundos
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b">
                <Link href="#" className="flex items-center justify-center" aria-label="Página de inicio de FacilitoPOS">
                    <PosLogo className="text-2xl" />
                </Link>
                <nav className="ml-auto flex gap-2 sm:gap-4">
                     <Button variant="ghost" onClick={() => handleNavigation('/login')}>
                        Iniciar Sesión
                    </Button>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-b from-background to-muted/50">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-6 text-center">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                                    El Punto de Venta Diseñado para Venezuela
                                </h1>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    FacilitoPOS simplifica tu inventario, ventas y facturación. Menos papeleo, más ganancias.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Button size="lg" onClick={() => handleNavigation('/signup')}>
                                    Empieza tu Prueba de 7 Días
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                                    Características Clave
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Todo lo que necesitas, en un solo lugar</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Desde el control de tu inventario hasta la gestión de tus clientes, tenemos las herramientas para que tu negocio crezca.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
                            <Feature
                                icon={Package}
                                title="Gestión de Inventario"
                                description="Controla tu stock, conoce tus costos y ganancias estimadas en tiempo real. Nunca más te quedes sin productos."
                            />
                            <Feature
                                icon={ShoppingCart}
                                title="Punto de Venta Rápido"
                                description="Un terminal de ventas intuitivo que agiliza el proceso de cobro, maneja múltiples métodos de pago y genera tickets digitales."
                            />
                             <Feature
                                icon={DollarSign}
                                title="Control de Divisas"
                                description="Maneja precios en Dólares y Bolívares sin esfuerzo. El sistema usa la tasa BCV para mantener tus cuentas claras."
                            />
                            <Feature
                                icon={Users}
                                title="Base de Datos de Clientes"
                                description="Mantén un registro de tus clientes, su historial de compras y datos de contacto para ofrecer un servicio personalizado."
                            />
                            <Feature
                                icon={Landmark}
                                title="Cuentas por Cobrar y Pagar"
                                description="Lleva un seguimiento claro de lo que te deben tus clientes y lo que debes a tus proveedores para una mejor salud financiera."
                            />
                            <Feature
                                icon={BarChart2}
                                title="Reportes y Estadísticas"
                                description="Obtén una visión clara del rendimiento de tu negocio con reportes de ventas, productos más vendidos y salud financiera."
                            />
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} FacilitoPOS. Todos los derechos reservados.
                </p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                     <p className="text-xs text-muted-foreground">Tecnología impulsada por DiazSoft</p>
                </nav>
            </footer>
        </div>
    );
}
