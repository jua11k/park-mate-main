"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPlanAction } from "@/actions/auth-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Wait, createPlanAction is in parking-actions.ts, not auth-actions!
// I'll import from parking-actions instead.
import { createPlanAction as createPlan } from "@/actions/parking-actions";

export function CreatePlanModal({ open, onOpenChange, tenantId }: { open: boolean, onOpenChange: (open: boolean) => void, tenantId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createPlan(tenantId, formData);
      if (result.success) {
        toast.success("Tarifa creada con éxito");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al crear tarifa");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nueva Tarifa</DialogTitle>
          <DialogDescription className="text-white/40">
            Crea un nuevo plan de cobro para el parqueadero.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la Tarifa</label>
              <Input name="name" required placeholder="Ej: Hora Moto, Mes Carro VIP" className="bg-white/5 border-white/10" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (Opcional)</label>
              <Input name="description" placeholder="Ej: Cobro por hora o fracción" className="bg-white/5 border-white/10" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Cobro</label>
              <select name="type" required className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white">
                <option value="hourly" className="bg-black text-white">Por Hora</option>
                <option value="daily" className="bg-black text-white">Por Día</option>
                <option value="fixed" className="bg-black text-white">Fijo / Mensualidad</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Precio ($)</label>
              <Input name="price" type="number" step="0.01" required placeholder="Ej: 2000" className="bg-white/5 border-white/10" />
            </div>
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full h-12 font-bold rounded-xl">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Guardar Tarifa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
