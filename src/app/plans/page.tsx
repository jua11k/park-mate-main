import { getSession } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getParkingPlans, getParkedVehicles } from "@/services/parking-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Plus, DollarSign, Clock } from "lucide-react";
import { NewPlanButton } from "@/components/NewPlanButton";

export default async function PlansPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [plans, parked] = await Promise.all([
    getParkingPlans(session.tenantId),
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
            <h2 className="text-3xl font-bold tracking-tight">Tarifas y Planes</h2>
            <p className="text-muted-foreground">Configura los precios por hora, día o planes especiales.</p>
          </div>
          <NewPlanButton tenantId={session.tenantId} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="rounded-[2rem] border-white/5 bg-white/5 shadow-xl group hover:border-primary/30 transition-all">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {plan.type === 'hourly' ? <Clock className="h-7 w-7 text-primary" /> : <DollarSign className="h-7 w-7 text-primary" />}
                  </div>
                  <Badge variant="outline" className="rounded-full uppercase font-bold text-[10px] tracking-widest px-3">
                    {plan.type}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description || "Sin descripción disponible."}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-3xl font-black text-primary">
                    ${parseFloat(plan.price).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {plan.type === 'hourly' ? 'hora' : 'período'}
                    </span>
                  </p>
                </div>

                <Button variant="secondary" className="w-full h-12 rounded-xl font-bold bg-white/5 hover:bg-white/10">
                  Editar Tarifa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
