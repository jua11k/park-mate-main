"use client";

import { useActionState, useEffect, useState } from "react";
import { registerEntryAction, getVehicleInfoAction, getParkingPlansAction } from "@/actions/parking-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Phone, Mail, ChevronDown, ChevronUp, Search, Loader2, Ticket } from "lucide-react";

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function CheckInModal({ open, onOpenChange, tenantId }: CheckInModalProps) {
  const [showOwner, setShowOwner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [placa, setPlaca] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [activeSub, setActiveSub] = useState<any>(null);
  
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => registerEntryAction(tenantId, formData),
    null
  );

  // Auto-fill states
  const [ownerData, setOwnerData] = useState({
    name: "",
    phone: "",
    email: "",
    tipo: "carro",
    planId: ""
  });

  // Load plans on open
  useEffect(() => {
    if (open) {
      getParkingPlansAction(tenantId).then(res => {
        if (res.success && res.data) {
          setPlans(res.data);
          // Set default plan based on tipo
          const defaultPlan = res.data.find((p: any) => p.name === (ownerData.tipo === 'moto' ? 'Hora Moto' : 'Hora Carro'));
          if (defaultPlan) setOwnerData(prev => ({ ...prev, planId: defaultPlan.id }));
        }
      });
    }
  }, [open, tenantId]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Ingreso registrado exitosamente");
      onOpenChange(false);
      setPlaca("");
      setOwnerData({ name: "", phone: "", email: "", tipo: "carro", planId: "" });
      setActiveSub(null);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  const handlePlacaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setPlaca(value);

    if (value.length >= 6) {
      setIsSearching(true);
      const result = await getVehicleInfoAction(tenantId, value);
      if (result.success && result.data) {
        toast.info("Vehículo reconocido");
        
        let planIdToSet = result.data.activeSubscription?.planId || "";
        if (!planIdToSet) {
           const defaultPlan = plans.find((p: any) => p.name === (result.data.tipo === 'moto' ? 'Hora Moto' : 'Hora Carro'));
           planIdToSet = defaultPlan?.id || "";
        }

        setOwnerData(prev => ({
          ...prev,
          name: result.data.ownerName || "",
          phone: result.data.ownerPhone || "",
          email: result.data.ownerEmail || "",
          tipo: (result.data.tipo as any) || "carro",
          planId: planIdToSet
        }));

        if (result.data.activeSubscription) {
          setActiveSub(result.data.activeSubscription);
        } else {
          setActiveSub(null);
        }

        setShowOwner(true);
      } else {
        setActiveSub(null);
      }
      setIsSearching(false);
    } else {
      setActiveSub(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Ingreso</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4 pt-2" noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium">Placa del Vehículo</label>
            <div className="relative">
              <Input 
                name="placa" 
                value={placa}
                onChange={handlePlacaChange}
                placeholder="Ej. ABC123" 
                className="h-11 uppercase font-bold text-lg pr-10" 
                required 
              />
              <div className="absolute right-3 top-3">
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Search className="h-5 w-5 text-muted-foreground opacity-50" />}
              </div>
            </div>
          </div>

          {activeSub && (
            <div className="bg-primary/20 border border-primary/50 text-primary p-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
              <Ticket className="h-6 w-6" />
              <div>
                <p className="font-bold">Vehículo asociado a convenio</p>
                <p className="text-xs font-bold mt-1 text-white opacity-90">{activeSub.plan?.name || "Convenio Activo"}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select name="tipo" value={ownerData.tipo} onValueChange={(v) => setOwnerData({...ownerData, tipo: v})}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">Carro</SelectItem>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="camioneta">Camioneta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan de Cobro</label>
              <Select name="planId" value={ownerData.planId} onValueChange={(v) => setOwnerData({...ownerData, planId: v})} disabled={!!activeSub}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccione Plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${parseFloat(plan.price).toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <button 
              type="button"
              onClick={() => setShowOwner(!showOwner)}
              className="flex items-center justify-between w-full text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <span>Información del Dueño {ownerData.name ? "(Reconocido)" : "(Opcional)"}</span>
              {showOwner ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showOwner && (
              <div className="space-y-3 mt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input name="ownerName" value={ownerData.name} onChange={(e) => setOwnerData({...ownerData, name: e.target.value})} placeholder="Nombre completo" className="h-11 pl-10" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input name="ownerPhone" value={ownerData.phone} onChange={(e) => setOwnerData({...ownerData, phone: e.target.value})} placeholder="Teléfono" className="h-11 pl-10" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input name="ownerEmail" type="email" value={ownerData.email} onChange={(e) => setOwnerData({...ownerData, email: e.target.value})} placeholder="Correo electrónico" className="h-11 pl-10" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isPending}>
              {isPending ? "Registrando..." : "Confirmar Ingreso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
