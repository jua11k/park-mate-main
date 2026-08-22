"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditPlanModal } from "./EditPlanModal";

export function EditPlanButton({ tenantId, plan }: { tenantId: string, plan: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setOpen(true)}
        className="w-full h-12 rounded-xl font-bold bg-white/5 hover:bg-white/10"
      >
        Editar Tarifa
      </Button>
      <EditPlanModal 
        open={open} 
        onOpenChange={setOpen} 
        tenantId={tenantId}
        plan={plan}
      />
    </>
  );
}
