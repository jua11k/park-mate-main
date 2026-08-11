"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ReportFilter({ plans, currentPlanId }: { plans: any[], currentPlanId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (val) {
      params.set("planId", val);
    } else {
      params.delete("planId");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">Filtrar Convenio:</span>
      <select 
        value={currentPlanId} 
        onChange={handleFilterChange}
        className="w-full sm:w-auto h-12 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-primary/50 text-white min-w-[200px]"
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
