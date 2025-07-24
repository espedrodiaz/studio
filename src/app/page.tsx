
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PosLogo } from "@/components/ui/pos-logo";
import { CheckCircle, BarChart2, Package, Users, ShoppingCart, DollarSign, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Loading from "./dashboard/loading";
import { useBusinessContext } from "@/hooks/use-business-context";

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

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="currentColor"
    >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 .9c49.4 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 108.7-88.1 197.3-195.9 197.3h-.1c-32.3 0-63.8-8.2-92.4-23.4l-6.5-4-69.8 18.3L72 359.2l-4.5-6.8c-20-29.5-31.9-63.5-31.9-99.2 0-107.9 87.8-195.7 195.7-195.7zm116.2 153.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
);


export default function WelcomePage() {
    const { isLoading: isAuthLoading } = useBusinessContext();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [dynamicWord, setDynamicWord] = useState('Emprendedores');

    useEffect(() => {
        const words = ['Emprendedores', 'Empresas'];
        let currentIndex = 0;
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % words.length;
            setDynamicWord(words[currentIndex]);
        }, 2000); // Cambia cada 2 segundos

        return () => clearInterval(interval);
    }, []);

    const handleNavigation = (newPath: string) => {
        setIsLoading(true);
        router.push(newPath);
    };

    if (isAuthLoading || isLoading) {
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
                                    El Punto de Venta Diseñado para 
                                    <br className="sm:hidden" />
                                    <span className="text-primary transition-all duration-300 ease-in-out"> {dynamicWord} </span> 
                                    de Venezuela
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
             <a
                href="https://wa.me/584145218085"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
                aria-label="Contactar por WhatsApp"
            >
                <WhatsAppIcon className="h-7 w-7" />
            </a>
        </div>
    );
}
