"use client";

import { useEffect, useState, useTransition } from "react";
import { registerExitAction } from "@/actions/parking-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface CheckOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  initialPlaca?: string;
}

export function CheckOutModal({ open, onOpenChange, tenantId, initialPlaca }: CheckOutModalProps) {
  const [receipt, setReceipt] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleCheckout = (placaToProcess: string) => {
    startTransition(async () => {
      const result = await registerExitAction(tenantId, placaToProcess);
      if (result.success && result.data) {
        toast.success("Salida procesada");
        setReceipt(result.data);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const placa = formData.get("placa") as string;
    handleCheckout(placa);
  };

  // Auto trigger if initialPlaca is provided when modal opens
  useEffect(() => {
    if (open && initialPlaca && !receipt && !isPending) {
       handleCheckout(initialPlaca);
    }
  }, [open, initialPlaca]);

  // Reset receipt when modal is closed manually or reopened
  useEffect(() => {
    if (!open) {
      setReceipt(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Prevent closing by clicking outside if showing receipt or processing
      if ((receipt || isPending) && !val) return; 
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px] bg-black border border-white/10 text-white rounded-[2rem]">
        {!receipt ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Registrar Salida</DialogTitle>
              <DialogDescription className="text-white/40">
                {initialPlaca 
                  ? `Calculando salida para el vehículo ${initialPlaca.toUpperCase()}...`
                  : 'Ingrese la placa del vehículo para calcular el total a pagar y registrar la salida.'}
              </DialogDescription>
            </DialogHeader>
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Generando factura...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pt-4" noValidate>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placa del Vehículo</label>
                  <Input 
                    name="placa" 
                    defaultValue={initialPlaca}
                    placeholder="Ej. ABC123" 
                    className="h-11 uppercase font-bold text-lg text-center bg-white/5 border-white/10" 
                    required 
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" variant="destructive" className="w-full h-11 text-lg font-bold rounded-xl" disabled={isPending}>
                    Confirmar Salida
                  </Button>
                </DialogFooter>
              </form>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-green-400">Salida Completada</DialogTitle>
              <DialogDescription className="text-white/40 text-center">
                El registro se ha cerrado exitosamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-muted-foreground">Placa</span>
                  <span className="font-black text-2xl uppercase tracking-widest">{receipt.vehicle?.placa || initialPlaca || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ingreso:</span>
                  <span className="text-sm font-medium">{format(new Date(receipt.entryTime), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-sm text-muted-foreground">Salida:</span>
                  <span className="text-sm font-medium">{format(new Date(receipt.exitTime), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                </div>
                <div className="pt-2 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest">Total a Cobrar</span>
                  {parseFloat(receipt.totalAmount) === 0 ? (
                    <span className="text-4xl font-black text-green-400 mt-2 bg-green-400/10 px-4 py-1 rounded-full border border-green-400/20">
                      $0 (Convenio)
                    </span>
                  ) : (
                    <span className="text-5xl font-black text-primary mt-2">
                      ${parseFloat(receipt.totalAmount).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => {
                  setReceipt(null);
                  onOpenChange(false);
                }} 
                className="w-full h-12 text-lg font-bold rounded-xl"
              >
                Cerrar y Continuar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
