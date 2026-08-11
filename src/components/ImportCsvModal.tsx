"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importVehiclesToMembershipAction } from "@/actions/parking-actions";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { addWeeks, addMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import Papa from "papaparse";

type BillingPeriod = "semanal" | "mensual" | "bimensual" | "trimestral" | "semestral" | "personalizado";

export function ImportCsvModal({ open, onOpenChange, tenantId, plans }: { open: boolean, onOpenChange: (open: boolean) => void, tenantId: string, plans: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensual");
  const [endDate, setEndDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open && !startDate) {
      setStartDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    }
    if (!open) {
      setFile(null);
    }
  }, [open, startDate]);

  useEffect(() => {
    if (!startDate) return;
    
    const start = new Date(startDate);
    let end = new Date(start);

    switch (billingPeriod) {
      case "semanal": end = addWeeks(start, 1); break;
      case "mensual": end = addMonths(start, 1); break;
      case "bimensual": end = addMonths(start, 2); break;
      case "trimestral": end = addMonths(start, 3); break;
      case "semestral": end = addMonths(start, 6); break;
      case "personalizado": if (customEndDate) end = new Date(customEndDate); break;
    }

    if (billingPeriod !== "personalizado" || customEndDate) {
       setEndDate(format(end, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [startDate, billingPeriod, customEndDate]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Debes seleccionar un archivo CSV");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const planId = formData.get("planId") as string;
    const totalPaid = formData.get("totalPaid") as string;

    startTransition(() => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            toast.error("Error al leer el CSV. Revisa el formato.");
            return;
          }

          // normalize headers (lowercase)
          const normalizedData = results.data.map((row: any) => {
            const newRow: any = {};
            for (const key in row) {
              newRow[key.toLowerCase().trim()] = row[key];
            }
            return newRow;
          });

          const result = await importVehiclesToMembershipAction(tenantId, {
            planId,
            startDate,
            endDate,
            totalPaid,
            vehicles: normalizedData,
          });

          if (result.success) {
            toast.success(`Se importaron ${result.data.count} vehículos exitosamente.`);
            onOpenChange(false);
          } else {
            toast.error(result.error || "Error al importar vehículos");
          }
        },
        error: () => {
          toast.error("No se pudo leer el archivo CSV.");
        }
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black border border-white/10 text-white rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Importar Convenio (CSV)</DialogTitle>
          <DialogDescription className="text-white/40">
            Carga un listado de vehículos para asociarlos en lote a un convenio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo CSV</label>
              <div className="relative border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center">
                  {file ? file.name : "Arrastra o selecciona tu archivo .csv"}
                </span>
                <input 
                  type="file" 
                  accept=".csv" 
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">Columnas esperadas: placa, tipo, marca, color, propietario, email, telefono.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Base (Convenio Corporativo)</label>
              <select name="planId" className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm outline-none focus:border-primary/50 text-white">
                <option value="" className="bg-black text-white">Sin plan asociado (Personalizado)</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id} className="bg-black text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Vigencia Lote</label>
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
                 <label className="text-sm font-medium">Precio por Vehículo</label>
                 <Input name="totalPaid" type="number" step="0.01" defaultValue={0} required className="bg-white/5 border-white/10 font-bold text-green-400" />
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
              </div>
            </div>

          </div>
          
          <Button type="submit" disabled={isPending || !endDate || !file} className="w-full h-12 font-bold rounded-xl bg-blue-500 text-white hover:bg-blue-600">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Importar e Iniciar Convenio
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
