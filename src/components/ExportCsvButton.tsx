"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

export function ExportCsvButton({ records }: { records: any[] }) {
  const handleExport = () => {
    if (records.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const headers = ["Placa", "Ingreso", "Salida", "Plan", "Total Pagado"];
    const csvContent = [
      headers.join(","),
      ...records.map(r => {
        const placa = r.vehicle?.placa || "N/A";
        const entry = format(new Date(r.entryTime), "yyyy-MM-dd HH:mm:ss");
        const exit = r.exitTime ? format(new Date(r.exitTime), "yyyy-MM-dd HH:mm:ss") : "N/A";
        const plan = r.plan?.name || "Tarifa Estandar";
        const total = r.totalAmount || "0";
        return `${placa},${entry},${exit},"${plan}",${total}`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_parqueo_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleExport} variant="outline" className="h-12 rounded-xl font-bold gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white">
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
