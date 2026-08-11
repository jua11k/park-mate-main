"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMembershipAction } from "@/actions/parking-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { addWeeks, addMonths, format } from "date-fns";
import { es } from "date-fns/locale";

type BillingPeriod = "semanal" | "mensual" | "bimensual" | "trimestral" | "semestral" | "personalizado";

export function CreateMembershipModal({ open, onOpenChange, tenantId, plans, vehicles }: { open: boolean, onOpenChange: (open: boolean) => void, tenantId: string, plans: any[], vehicles: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensual");
  const [endDate, setEndDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  useEffect(() => {
    if (open && !startDate) {
      setStartDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    }
  }, [open, startDate]);

  useEffect(() => {
    if (!startDate) return;
    
    const start = new Date(startDate);
    let end = new Date(start);

    switch (billingPeriod) {
      case "semanal":
        end = addWeeks(start, 1);
        break;
      case "mensual":
        end = addMonths(start, 1);
        break;
      case "bimensual":
        end = addMonths(start, 2);
        break;
      case "trimestral":
        end = addMonths(start, 3);
        break;
      case "semestral":
        end = addMonths(start, 6);
        break;
      case "personalizado":
        if (customEndDate) {
          end = new Date(customEndDate);
        }
        break;
    }

    if (billingPeriod !== "personalizado" || customEndDate) {
       setEndDate(format(end, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [startDate, billingPeriod, customEndDate]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // ensure endDate is in formData even if input is disabled or hidden
    formData.set("endDate", endDate);

    startTransition(async () => {
      const result = await createMembershipAction(tenantId, formData);
      if (result.success) {
        toast.success("Convenio creado con éxito");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al crear convenio");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nuevo Convenio</DialogTitle>
          <DialogDescription className="text-white/40">
            Configura el periodo de vigencia y el precio del acuerdo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehículo (Placa)</label>
              <select name="vehicleId" required className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white">
                <option value="" className="bg-black text-white">Seleccione un vehículo</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-black text-white">
                    {v.placa} - {v.ownerName || 'Sin propietario'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Base (Opcional)</label>
              <select name="planId" className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white">
                <option value="" className="bg-black text-white">Sin plan asociado (Personalizado)</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">
                    {p.name} (${parseFloat(p.price).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Tipo de Mensualidad</label>
                 <select 
                   value={billingPeriod} 
                   onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)} 
                   className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white"
                 >
                   <option value="semanal" className="bg-black text-white">Semanal</option>
                   <option value="mensual" className="bg-black text-white">Mensual</option>
                   <option value="bimensual" className="bg-black text-white">Bimensual (2 meses)</option>
                   <option value="trimestral" className="bg-black text-white">Trimestral (3 meses)</option>
                   <option value="semestral" className="bg-black text-white">Semestral (6 meses)</option>
                   <option value="personalizado" className="bg-black text-white">Personalizado</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Precio Pactado ($)</label>
                 <Input name="totalPaid" type="number" step="0.01" required placeholder="Ej: 150000" className="bg-white/5 border-white/10 font-bold text-green-400" />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inicia</label>
                <Input 
                  name="startDate" 
                  type="datetime-local" 
                  required 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-black/50 border-white/5 text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Vence</label>
                {billingPeriod === "personalizado" ? (
                  <Input 
                    type="datetime-local" 
                    required 
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-black/50 border-primary/50 text-sm text-primary" 
                  />
                ) : (
                  <div className="h-10 px-3 py-2 bg-black/50 border border-white/5 rounded-md text-sm text-primary font-bold flex items-center">
                    {endDate ? format(new Date(endDate), "dd MMM yyyy, HH:mm", { locale: es }) : ""}
                  </div>
                )}
                <input type="hidden" name="endDate" value={endDate} />
              </div>
            </div>

          </div>
          
          <Button type="submit" disabled={isPending || !endDate} className="w-full h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Activar Convenio
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
