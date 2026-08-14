"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditMembershipModal } from "./EditMembershipModal";

export function EditMembershipButton({ tenantId, plans, subscription }: { tenantId: string, plans: any[], subscription: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="flex-1 rounded-xl font-bold h-11 border-white/5"
      >
        Editar
      </Button>
      
      <EditMembershipModal 
        open={open} 
        onOpenChange={setOpen} 
        tenantId={tenantId} 
        plans={plans}
        subscription={subscription}
      />
    </>
  );
}
