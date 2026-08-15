import { getSession } from "@/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getSubscriptions, getParkedVehicles, getParkingPlans, getAllVehicles } from "@/services/parking-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, CreditCard, Plus, Briefcase } from "lucide-react";
import { NewMembershipButton } from "@/components/NewMembershipButton";
import { EditMembershipButton } from "@/components/EditMembershipButton";
import { EditConvenioButton } from "@/components/EditConvenioButton";
import { ImportCsvButton } from "@/components/ImportCsvButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function MembershipsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [subs, parked, plans, vehicles] = await Promise.all([
    getSubscriptions(session.tenantId),
    getParkedVehicles(session.tenantId),
    getParkingPlans(session.tenantId),
    getAllVehicles(session.tenantId)
  ]);

  const convenios = plans.filter(p => p.type === 'convenio');

  return (
    <div className="min-h-screen bg-background">
      <Header 
        vehicleCount={parked.length}
        tenantName={session.tenantName}
      />

      <main className="container mx-auto p-4 md:p-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Convenios</h2>
            <p className="text-muted-foreground">Administra los acuerdos corporativos y los vehículos asociados.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="w-full sm:w-auto">
              <ImportCsvButton tenantId={session.tenantId} plans={plans} />
            </div>
            <div className="w-full sm:w-auto">
              <NewMembershipButton tenantId={session.tenantId} plans={plans} vehicles={vehicles} />
            </div>
          </div>
        </div>

        {/* Sección de Convenios (Planes) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Briefcase className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Acuerdos Corporativos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convenios.length === 0 ? (
              <div className="col-span-full py-10 text-center bg-muted/10 rounded-[2rem] border border-white/5">
                <p className="text-muted-foreground">No hay acuerdos corporativos creados aún.</p>
              </div>
            ) : (
              convenios.map((convenio) => (
                <Card key={convenio.id} className="rounded-[2rem] border-primary/20 bg-primary/5 shadow-xl overflow-hidden group hover:bg-primary/10 transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-2xl font-black tracking-tight text-primary">{convenio.name}</span>
                        {convenio.description && (
                          <p className="text-sm text-muted-foreground">{convenio.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Vence:</span>
                        <span className="font-bold">{convenio.endDate ? format(new Date(convenio.endDate), "PPP", { locale: es }) : "Indefinido"}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Precio Pactado:</span>
                        <span className="font-bold text-green-400">${parseFloat(convenio.price).toLocaleString()}</span>
                      </div>
                      {convenio.companyOfficialEmail && (
                        <div className="flex flex-col text-sm bg-black/40 p-2 rounded-lg">
                          <span className="text-muted-foreground text-xs">Correo Reportes:</span>
                          <span className="font-medium text-white truncate">{convenio.companyOfficialEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex gap-2">
                      <EditConvenioButton tenantId={session.tenantId} plan={convenio} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Sección de Vehículos Asociados (Suscripciones) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <User className="h-6 w-6 text-white" />
            <h3 className="text-2xl font-bold">Vehículos Vinculados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-muted/30 rounded-[2rem] border-2 border-dashed">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-medium text-muted-foreground">No hay vehículos vinculados a ningún convenio.</p>
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
                        <span className="font-bold">{sub.endDate ? format(new Date(sub.endDate), "PPP", { locale: es }) : "Indefinido"}</span>
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
                      <EditMembershipButton tenantId={session.tenantId} plans={plans} subscription={sub} />
                      <Button variant="outline" className="rounded-xl h-11 w-11 p-0 border-white/5">
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
