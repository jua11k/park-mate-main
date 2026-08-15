"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ImportExcelModal } from "./ImportExcelModal";

export function ImportExcelButton({ tenantId, plans }: { tenantId: string, plans: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="h-11 rounded-xl font-bold gap-2 bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-400">
        <Upload className="h-4 w-4" />
        Importar Excel
      </Button>
      <ImportExcelModal open={open} onOpenChange={setOpen} tenantId={tenantId} plans={plans} />
    </>
  );
}
