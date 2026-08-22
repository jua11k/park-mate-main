"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePlanAction } from "@/actions/parking-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export function EditPlanModal({ open, onOpenChange, tenantId, plan }: { open: boolean, onOpenChange: (open: boolean) => void, tenantId: string, plan: any }) {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (open && plan) {
      if (plan.startDate) {
        setStartDate(format(new Date(plan.startDate), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setStartDate("");
      }
      if (plan.endDate) {
        setEndDate(format(new Date(plan.endDate), "yyyy-MM-dd'T'HH:mm"));
      } else {
        setEndDate("");
      }
    }
  }, [open, plan]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updatePlanAction(tenantId, plan.id, formData);
      if (result.success) {
        toast.success("Convenio actualizado con éxito");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al actualizar convenio");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Tarifa</DialogTitle>
          <DialogDescription className="text-white/40">
            Modifica la configuración de la tarifa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Convenio</label>
              <Input name="name" defaultValue={plan.name} required placeholder="Ej: Convenio Microsoft" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Precio Pactado ($)</label>
              <Input name="price" defaultValue={plan.price} type="number" step="0.01" required placeholder="Ej: 150000" className="bg-white/5 border-white/10 font-bold text-green-400" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (Opcional)</label>
              <Input name="description" defaultValue={plan.description || ""} placeholder="Ej: Aplica para empleados con carnet" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiempo de Gracia (minutos)</label>
              <Input name="gracePeriodMin" defaultValue={plan.gracePeriodMin || ""} type="number" placeholder="Ej: 15" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tarifa Diferencial ($) (Opcional)</label>
              <Input name="differentialRatePrice" defaultValue={plan.differentialRatePrice || ""} type="number" step="0.01" placeholder="Ej: 1500" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">A partir de (horas)</label>
              <Input name="differentialRateAfterHr" defaultValue={plan.differentialRateAfterHr || ""} type="number" placeholder="Ej: 2" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Oficial (Reportes)</label>
              <Input name="companyOfficialEmail" defaultValue={plan.companyOfficialEmail || ""} type="email" placeholder="Ej: facturacion@microsoft.com" className="bg-white/5 border-white/10 text-white" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inicia (Opcional)</label>
                <Input 
                  name="startDate" 
                  type="datetime-local" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-black/50 border-white/5 text-sm" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Vence (Opcional)</label>
                <Input 
                  name="endDate" 
                  type="datetime-local" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-black/50 border-primary/50 text-sm text-primary" 
                />
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Guardar Cambios
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
