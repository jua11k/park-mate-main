"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

export function ExportExcelButton({ records }: { records: any[] }) {
  const handleExport = () => {
    if (records.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const dataToExport = records.map(r => ({
      "Placa": r.vehicle?.placa || "N/A",
      "Ingreso": format(new Date(r.entryTime), "yyyy-MM-dd HH:mm:ss"),
      "Salida": r.exitTime ? format(new Date(r.exitTime), "yyyy-MM-dd HH:mm:ss") : "N/A",
      "Plan": r.plan?.name || "Tarifa Estandar",
      "Total Pagado": parseFloat(r.totalAmount || "0")
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");
    
    // Generates file and triggers download
    XLSX.writeFile(workbook, `historial_parqueo_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <Button onClick={handleExport} variant="outline" className="w-full h-full min-h-[3rem] rounded-xl font-bold gap-2">
      <Download className="h-4 w-4" />
      Exportar Excel
    </Button>
  );
}
