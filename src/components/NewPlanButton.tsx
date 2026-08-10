"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreatePlanModal } from "./CreatePlanModal";

export function NewPlanButton({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-12 rounded-xl font-bold gap-2">
        <Plus className="h-5 w-5" />
        Nueva Tarifa
      </Button>
      
      <CreatePlanModal open={open} onOpenChange={setOpen} tenantId={tenantId} />
    </>
  );
}
