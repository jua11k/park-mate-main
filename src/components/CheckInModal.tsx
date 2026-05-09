"use client";

import { useActionState, useEffect } from "react";
import { registerEntryAction } from "@/actions/parking-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function CheckInModal({ open, onOpenChange, tenantId }: CheckInModalProps) {
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => registerEntryAction(tenantId, formData),
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Ingreso registrado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Ingreso</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-4" noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium">Placa del Vehículo</label>
            <Input 
              name="placa" 
              placeholder="Ej. ABC123" 
              className="h-11 uppercase font-bold text-lg" 
              required 
            />
            {state?.validationErrors?.placa && (
              <p className="text-sm text-destructive">{state.validationErrors.placa[0]}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Vehículo</label>
            <Select name="tipo" defaultValue="carro">
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carro">Carro</SelectItem>
                <SelectItem value="moto">Moto</SelectItem>
                <SelectItem value="camioneta">Camioneta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-11 text-lg" disabled={isPending}>
              {isPending ? "Registrando..." : "Confirmar Ingreso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
