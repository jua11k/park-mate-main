"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMembershipAction } from "@/actions/parking-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CreateMembershipModal({ open, onOpenChange, tenantId, plans, vehicles }: { open: boolean, onOpenChange: (open: boolean) => void, tenantId: string, plans: any[], vehicles: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
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
            Asigna un plan a un vehículo por un tiempo determinado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Vehículo (Placa)</Label>
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
              <Label>Plan Asociado</Label>
              <select name="planId" required className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white">
                <option value="" className="bg-black text-white">Seleccione un plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">
                    {p.name} (${parseFloat(p.price).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <Input name="startDate" type="datetime-local" required className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Fin</Label>
                <Input name="endDate" type="datetime-local" required className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Pagado ($)</Label>
              <Input name="totalPaid" type="number" step="0.01" required placeholder="Ej: 50000" className="bg-white/5 border-white/10" />
            </div>
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full h-12 font-bold rounded-xl">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Crear Convenio
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
