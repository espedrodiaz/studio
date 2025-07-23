
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajustes</CardTitle>
        <CardDescription>
          Gestiona la configuración de tu cuenta y de la aplicación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground p-8">
            <h3 className="text-lg font-semibold">Página en Construcción</h3>
            <p>Aquí podrás configurar los detalles de tu negocio, preferencias de la aplicación y mucho más.</p>
            <p className="mt-2 text-sm">¡Vuelve pronto!</p>
        </div>
      </CardContent>
    </Card>
  );
}
