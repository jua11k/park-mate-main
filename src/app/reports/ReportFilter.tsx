"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ReportFilter({ plans, currentPlanId, currentStartDate, currentEndDate }: { plans: any[], currentPlanId: string, currentStartDate?: string, currentEndDate?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-2 w-full">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 h-12">
        <span className="text-xs font-bold text-muted-foreground uppercase px-2">Desde</span>
        <input 
          type="date" 
          value={currentStartDate || ""} 
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
          className="bg-transparent border-none text-sm outline-none text-white h-full"
        />
      </div>

      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 h-12">
        <span className="text-xs font-bold text-muted-foreground uppercase px-2">Hasta</span>
        <input 
          type="date" 
          value={currentEndDate || ""} 
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
          className="bg-transparent border-none text-sm outline-none text-white h-full"
        />
      </div>

      <select 
        value={currentPlanId} 
        onChange={(e) => handleFilterChange("planId", e.target.value)}
        className="w-full lg:w-auto h-12 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 text-white min-w-[200px]"
      >
        <option value="" className="bg-black text-white">Todos los registros</option>
        <option value="none" className="bg-black text-white">Tarifa Estándar (Sin convenio)</option>
        {plans.map(p => (
          <option key={p.id} value={p.id} className="bg-black text-white">
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
