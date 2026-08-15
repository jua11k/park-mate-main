"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditConvenioModal } from "./EditConvenioModal";

export function EditConvenioButton({ tenantId, plan }: { tenantId: string, plan: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="rounded-xl h-11 w-11 p-0 border-white/5 hover:bg-white/10"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <EditConvenioModal 
        open={open} 
        onOpenChange={setOpen} 
        tenantId={tenantId}
        plan={plan}
      />
    </>
  );
}
