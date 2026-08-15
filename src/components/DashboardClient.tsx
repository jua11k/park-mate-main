"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckInModal } from "./CheckInModal";
import { CheckOutModal } from "./CheckOutModal";
import { Car, Clock, Plus, LogOut, Search, Calendar } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardClientProps {
  vehicles: any[];
  tenantId: string;
}

export function DashboardClient({ vehicles, tenantId }: DashboardClientProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [selectedPlaca, setSelectedPlaca] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckOut = (placa: string) => {
    setSelectedPlaca(placa);
    setIsCheckOutOpen(true);
  };

  return (
    <main className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehículos en Parqueo</h2>
          <p className="text-muted-foreground">Gestiona los ingresos y salidas en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleCheckOut("")} variant="outline" className="h-12 px-6 rounded-xl font-bold gap-2 border-white/10 hover:bg-white/10">
            <LogOut className="h-5 w-5" />
            Registrar Salida
          </Button>
          <Button onClick={() => setIsCheckInOpen(true)} className="h-12 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 bg-primary text-black hover:bg-primary/90">
            <Plus className="h-5 w-5" />
            Nuevo Ingreso
          </Button>
        </div>
      </div>

      {/* Grid of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Car className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <p className="text-xl font-medium text-muted-foreground">No hay vehículos parqueados actualmente.</p>
          </div>
        ) : (
          vehicles.map((record) => {
            const hasSub = record.vehicle?.subscriptions?.[0];
            const daysLeft = hasSub ? differenceInDays(new Date(hasSub.endDate), new Date()) : null;
            
            return (
              <Card key={record.id} className="group relative overflow-hidden rounded-[2rem] border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 space-y-6">
                  {/* Vehicle Info */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black tracking-tighter uppercase">{record.vehicle.placa}</span>
                        <Badge variant="outline" className="rounded-full font-bold uppercase text-[10px]">
                          {record.vehicle.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {mounted ? (
                          `Ingresó hace ${formatDistanceToNow(new Date(record.entryTime), { locale: es })}`
                        ) : (
                          "Calculando tiempo..."
                        )}
                      </p>
                    </div>
                    {record.status === 'subscription_active' ? (
                       <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <Calendar className="h-6 w-6 text-green-500" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Plan/Subscription Badge */}
                  <div className="flex flex-wrap gap-2">
                    {record.status === 'subscription_active' ? (
                      <Badge className="bg-green-500/20 text-green-400 border-none hover:bg-green-500/30 font-bold px-3 py-1 rounded-full">
                        CONVENIO ACTIVO
                      </Badge>
                    ) : (
                      <Badge className="bg-primary/20 text-primary border-none hover:bg-primary/30 font-bold px-3 py-1 rounded-full">
                        {record.plan?.name || "Tarifa Estándar"}
                      </Badge>
                    )}
                    
                    {mounted && daysLeft !== null && (
                      <Badge variant="outline" className="rounded-full border-green-500/30 text-green-500 font-bold">
                        {daysLeft} días restantes
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-white/5 flex gap-3">
                    <Button 
                      onClick={() => handleCheckOut(record.vehicle.placa)}
                      variant="secondary" 
                      className="flex-1 h-12 rounded-xl font-bold bg-white/5 hover:bg-white/10 border-white/5"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Salida
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10">
                      <Search className="h-5 w-5 opacity-50" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <CheckInModal 
        open={isCheckInOpen} 
        onOpenChange={setIsCheckInOpen}
        tenantId={tenantId}
      />

      <CheckOutModal 
        open={isCheckOutOpen}
        onOpenChange={setIsCheckOutOpen}
        tenantId={tenantId}
        initialPlaca={selectedPlaca}
      />
    </main>
  );
}
