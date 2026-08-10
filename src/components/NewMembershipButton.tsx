"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateMembershipModal } from "./CreateMembershipModal";

export function NewMembershipButton({ tenantId, plans, vehicles }: { tenantId: string, plans: any[], vehicles: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-12 rounded-xl font-bold gap-2">
        <Plus className="h-5 w-5" />
        Nuevo Convenio
      </Button>
      
      <CreateMembershipModal 
        open={open} 
        onOpenChange={setOpen} 
        tenantId={tenantId} 
        plans={plans}
        vehicles={vehicles}
      />
    </>
  );
}
