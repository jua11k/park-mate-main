import { getSession } from "@/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getSubscriptions, getParkedVehicles } from "@/services/parking-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, CreditCard, Plus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function MembershipsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [subs, parked] = await Promise.all([
    getSubscriptions(session.tenantId),
    getParkedVehicles(session.tenantId)
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        vehicleCount={parked.length}
        tenantName={session.tenantName}
      />

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Convenios</h2>
            <p className="text-muted-foreground">Administra los planes mensuales y suscripciones activas.</p>
          </div>
          <Button className="h-12 rounded-xl font-bold gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Convenio
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subs.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-muted/30 rounded-[2rem] border-2 border-dashed">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium text-muted-foreground">No hay convenios registrados.</p>
            </div>
          ) : (
            subs.map((sub) => (
              <Card key={sub.id} className="rounded-[2rem] border-white/5 bg-white/5 shadow-xl overflow-hidden group hover:bg-white/10 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-2xl font-black uppercase tracking-tighter">{sub.vehicle.placa}</span>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {sub.vehicle.ownerName || "Sin nombre"}
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-none rounded-full px-3 py-1 font-bold">
                      {sub.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Vence el:</span>
                      <span className="font-bold">{format(new Date(sub.endDate), "PPP", { locale: es })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-bold">{sub.plan?.name || "Personalizado"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Pagado:</span>
                      <span className="font-bold text-primary">${parseFloat(sub.totalPaid).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl font-bold h-11 border-white/5">Editar</Button>
                    <Button variant="outline" className="rounded-xl h-11 w-11 p-0 border-white/5">
                      <CreditCard className="h-4 w-4" />
                    </Button>
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
