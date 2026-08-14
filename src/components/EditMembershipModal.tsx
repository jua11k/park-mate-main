"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMembershipAction, cancelMembershipAction } from "@/actions/parking-actions";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function EditMembershipModal({ 
  open, 
  onOpenChange, 
  tenantId, 
  plans, 
  subscription 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  tenantId: string, 
  plans: any[], 
  subscription: any 
}) {
  const [isPending, startTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();

  const [endDate, setEndDate] = useState<string>("");
  
  useEffect(() => {
    if (subscription?.endDate) {
      setEndDate(format(new Date(subscription.endDate), "yyyy-MM-dd'T'HH:mm"));
    }
  }, [subscription]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subscription) return;
    
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateMembershipAction(tenantId, subscription.id, formData);
      if (result.success) {
        toast.success("Convenio actualizado con éxito");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al actualizar convenio");
      }
    });
  };

  const handleCancel = () => {
    if (!subscription) return;
    if (!confirm("¿Estás seguro de cancelar este convenio?")) return;

    startCancelTransition(async () => {
      const result = await cancelMembershipAction(tenantId, subscription.id);
      if (result.success) {
        toast.success("Convenio cancelado con éxito");
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al cancelar convenio");
      }
    });
  };

  if (!subscription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Convenio</DialogTitle>
          <DialogDescription className="text-white/40">
            Modifica las condiciones actuales del convenio para {subscription.vehicle?.placa}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Base (Opcional)</label>
              <select name="planId" defaultValue={subscription.planId || ""} className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white">
                <option value="" className="bg-black text-white">Sin plan asociado (Personalizado)</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">
                    {p.name} (${parseFloat(p.price).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium">Precio Pactado ($)</label>
               <Input name="totalPaid" type="number" step="0.01" defaultValue={subscription.totalPaid} required placeholder="Ej: 150000" className="bg-white/5 border-white/10 font-bold text-green-400" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Oficial (Reportes)</label>
              <Input name="companyOfficialEmail" type="email" defaultValue={subscription.companyOfficialEmail || ""} placeholder="Ej: contacto@empresa.com" className="bg-white/5 border-white/10 text-white" />
              <p className="text-xs text-muted-foreground">Opcional. Si se proporciona, los reportes se enviarán a este correo.</p>
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="text-xs font-bold text-primary uppercase tracking-widest">Nueva fecha de vencimiento</label>
              <Input 
                name="endDate"
                type="datetime-local" 
                required 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black/50 border-primary/50 text-sm text-primary" 
              />
            </div>

          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling || isPending} 
              className="h-12 w-12 rounded-xl"
            >
              {isCancelling ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
            </Button>
            
            <Button type="submit" disabled={isPending || isCancelling || !endDate} className="flex-1 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90">
              {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
