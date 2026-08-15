"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateConvenioModal } from "./CreateConvenioModal";

export function NewMembershipButton({ tenantId, plans, vehicles }: { tenantId: string, plans: any[], vehicles: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto bg-primary text-black hover:bg-primary/90 font-bold h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:shadow-[0_0_30px_rgba(20,241,149,0.5)] transition-all"
      >
        <Plus className="mr-2 h-5 w-5" />
        Nuevo Convenio
      </Button>
      <CreateConvenioModal 
        open={open} 
        onOpenChange={setOpen} 
        tenantId={tenantId}
      />
    </>
  );
}
