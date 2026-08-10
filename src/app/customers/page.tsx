import { getSession } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getAllVehicles, getParkedVehicles } from "@/services/parking-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Car, Search } from "lucide-react";

export default async function CustomersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [vehicles, parked] = await Promise.all([
    getAllVehicles(session.tenantId),
    getParkedVehicles(session.tenantId)
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        vehicleCount={parked.length}
        tenantName={session.tenantName}
      />

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h2>
            <p className="text-muted-foreground">Historial de vehículos y datos de contacto de propietarios.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar por placa o nombre..." 
                className="h-12 w-full md:w-80 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <p className="text-xl font-medium text-muted-foreground">No hay clientes registrados en el directorio.</p>
            </div>
          ) : (
            vehicles.map((v) => (
              <Card key={v.id} className="rounded-[2rem] border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-2xl font-black uppercase tracking-tighter">{v.placa}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full font-bold uppercase text-[10px]">
                          {v.tipo}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{v.ownerName || "No registrado"}</span>
                    </div>
                    {v.ownerPhone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-blue-400">{v.ownerPhone}</span>
                      </div>
                    )}
                    {v.ownerEmail && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-blue-400">{v.ownerEmail}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl font-bold h-10 border-white/5">Editar Datos</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
