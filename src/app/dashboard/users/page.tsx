
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ShieldCheck, ShieldX, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
    getRegisteredUsers, 
    updateUserStatus,
    deleteUser,
    RegisteredUser 
} from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useBusinessContext } from "@/hooks/use-business-context";
import Loading from "../loading";


export default function UsersPage() {
    const [users, setUsers] = useState<RegisteredUser[]>(getRegisteredUsers());
    const { user, isLoading } = useBusinessContext();

    // THIS IS A TEMPORARY ADMIN CHECK
    const isAdmin = user && user.email === 'espedrodiaz94@gmail.com'; 

    const handleUpdateStatus = (userId: string, status: "Active" | "Suspended") => {
        updateUserStatus(userId, status);
        setUsers(getRegisteredUsers());
        toast({
            title: "Estado Actualizado",
            description: `La licencia del usuario ha sido ${status === 'Active' ? 'activada' : 'suspendida'}.`
        });
    }
    
    const handleDeleteUser = (userId: string) => {
        deleteUser(userId);
        setUsers(getRegisteredUsers());
        toast({
            title: "Usuario Eliminado",
            description: "El registro del negocio ha sido eliminado.",
            variant: "destructive"
        });
    }
    
    if (isLoading) {
        return <Loading />
    }

    if (!isAdmin) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Acceso Denegado</CardTitle>
                    <CardDescription>
                    No tienes permisos para acceder a esta sección.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Esta área es solo para administradores de la plataforma.</p>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios y Licencias</CardTitle>
        <CardDescription>
          Activa, suspende o gestiona los negocios registrados en la plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nombre del Negocio</TableHead>
                <TableHead>RIF</TableHead>
                <TableHead>Clave de Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">
                        <div>{user.businessName}</div>
                        <div className="text-xs text-muted-foreground">{user.fullName}</div>
                    </TableCell>
                    <TableCell>{user.rif}</TableCell>
                    <TableCell className="font-mono text-xs">{user.licenseKey}</TableCell>
                    <TableCell>{user.businessCategory}</TableCell>
                    <TableCell>
                    <Badge variant={
                        user.status === 'Active' ? 'default' : user.status === 'Suspended' ? 'destructive' : 'secondary'
                    } className={cn({
                        'bg-green-100 text-green-800': user.status === 'Active',
                        'bg-yellow-100 text-yellow-800': user.status === 'Pending Activation',
                        'bg-red-100 text-red-800': user.status === 'Suspended',
                    })}>
                        {user.status === 'Active' ? 'Activa' : user.status === 'Suspended' ? 'Suspendida' : 'Pendiente'}
                    </Badge>
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones de Licencia</DropdownMenuLabel>
                        {(user.status === 'Pending Activation' || user.status === 'Suspended') && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'Active')}>
                                <ShieldCheck className="mr-2 h-4 w-4 text-green-600"/>
                                Activar Licencia
                            </DropdownMenuItem>
                        )}
                        {user.status === 'Active' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(user.id, 'Suspended')}>
                                <ShieldX className="mr-2 h-4 w-4 text-destructive"/>
                                Suspender Licencia
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar Negocio
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <Users className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No hay usuarios registrados</h3>
                <p className="text-sm">Cuando un nuevo negocio se registre, aparecerá aquí.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
