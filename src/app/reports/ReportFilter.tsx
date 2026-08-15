"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ReportFilter({ plans, currentPlanId, currentStartDate, currentEndDate, currentPlaca, currentPlanType }: { plans: any[], currentPlanId: string, currentStartDate?: string, currentEndDate?: string, currentPlaca?: string, currentPlanType?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }

    // Reset specific plan if planType is changing
    if (key === "planType") {
      params.delete("planId");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full bg-white/5 border border-white/10 p-2 rounded-2xl shadow-inner backdrop-blur-sm [color-scheme:dark]">
      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2 h-11">
        <span className="text-xs font-bold text-muted-foreground uppercase px-2">Desde</span>
        <input 
          type="date" 
          value={currentStartDate || ""} 
          onChange={(e) => handleFilterChange("startDate", e.target.value)}
          className="bg-transparent border-none text-sm outline-none text-white h-full"
        />
      </div>

      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2 h-11">
        <span className="text-xs font-bold text-muted-foreground uppercase px-2">Hasta</span>
        <input 
          type="date" 
          value={currentEndDate || ""} 
          onChange={(e) => handleFilterChange("endDate", e.target.value)}
          className="bg-transparent border-none text-sm outline-none text-white h-full"
        />
      </div>

      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2 h-11">
        <span className="text-xs font-bold text-muted-foreground uppercase px-2">Placa</span>
        <input 
          type="text"
          placeholder="Ej: ABC"
          value={currentPlaca || ""} 
          onChange={(e) => handleFilterChange("placa", e.target.value)}
          className="bg-transparent border-none text-sm outline-none text-white h-full uppercase w-20"
        />
      </div>

      <select 
        value={currentPlanType || ""} 
        onChange={(e) => handleFilterChange("planType", e.target.value)}
        className="h-11 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 text-white min-w-[140px]"
      >
        <option value="" className="bg-black text-white">Todos los tipos</option>
        <option value="standard" className="bg-black text-white">Estándar</option>
        <option value="convenio" className="bg-black text-white">Convenio</option>
      </select>

      <select 
        value={currentPlanId} 
        onChange={(e) => handleFilterChange("planId", e.target.value)}
        className="flex-1 min-w-[200px] h-11 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 text-white"
      >
        <option value="" className="bg-black text-white">Todos los planes</option>
        <option value="none" className="bg-black text-white">Sin Plan Específico</option>
        {plans
          .filter(p => !currentPlanType || p.type === currentPlanType || (currentPlanType === 'standard' && p.type !== 'convenio'))
          .map(p => (
            <option key={p.id} value={p.id} className="bg-black text-white">
              {p.name}
            </option>
        ))}
      </select>
    </div>
  );
}
