"use client";

import { useActionState, useEffect } from "react";
import { registerExitAction } from "@/actions/parking-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CheckOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  initialPlaca?: string;
}

export function CheckOutModal({ open, onOpenChange, tenantId, initialPlaca }: CheckOutModalProps) {
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => {
      const placa = formData.get("placa") as string;
      return registerExitAction(tenantId, placa);
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Salida registrada exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Salida</DialogTitle>
          <DialogDescription>
            Ingrese la placa del vehículo para calcular el total a pagar y registrar la salida.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-4" noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium">Placa del Vehículo</label>
            <Input 
              name="placa" 
              defaultValue={initialPlaca}
              placeholder="Ej. ABC123" 
              className="h-11 uppercase font-bold text-lg text-center" 
              required 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" variant="destructive" className="w-full h-11 text-lg" disabled={isPending}>
              {isPending ? "Procesando..." : "Confirmar Salida"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
