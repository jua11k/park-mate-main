import { getSession } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getCompletedRecords, getParkedVehicles, getParkingPlans } from "@/services/parking-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ReportFilter } from "./ReportFilter";

export default async function ReportsPage(props: { searchParams: Promise<{ planId?: string, startDate?: string, endDate?: string, placa?: string, planType?: string }> }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const searchParams = await props.searchParams;
  const currentPlanId = searchParams.planId || "";
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const placa = searchParams.placa || "";
  const planType = searchParams.planType || "";

  const [records, parked, plans] = await Promise.all([
    getCompletedRecords(session.tenantId, currentPlanId, startDate, endDate, placa, planType),
    getParkedVehicles(session.tenantId),
    getParkingPlans(session.tenantId)
  ]);

  // Basic Metrics Calculation
  const totalRevenue = records.reduce((sum, r) => sum + parseFloat(r.totalAmount || "0"), 0);
  const totalCompleted = records.length;
  const currentOccupancy = parked.length;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        vehicleCount={currentOccupancy}
        tenantName={session.tenantName}
      />

      <main className="container mx-auto p-4 md:p-6 space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Métricas y Reportes</h2>
            <p className="text-muted-foreground">Resumen financiero e historial de parqueo.</p>
          </div>
          <div className="flex flex-col xl:flex-row xl:items-stretch gap-2 w-full">
            <div className="flex-1 w-full">
              <ReportFilter plans={plans} currentPlanId={currentPlanId} currentStartDate={startDate} currentEndDate={endDate} currentPlaca={placa} currentPlanType={planType} />
            </div>
            <div className="w-full xl:w-auto shrink-0 self-stretch flex">
              <ExportExcelButton records={records} />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[2rem] border-white/5 bg-white/5 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Ingresos Filtrados</CardTitle>
              <DollarSign className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-green-400">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="rounded-[2rem] border-white/5 bg-white/5 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Vehículos Atendidos</CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{totalCompleted}</div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/5 bg-white/5 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Ocupación Global</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-blue-400">{currentOccupancy}</div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">
            {currentPlanId ? `Historial Filtrado (${totalCompleted})` : "Historial de Salidas (Últimos 100)"}
          </h3>
          
          <div className="rounded-[2rem] border border-white/5 bg-white/5 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-widest">Placa</th>
                    <th className="px-6 py-4 font-bold tracking-widest">Ingreso</th>
                    <th className="px-6 py-4 font-bold tracking-widest">Salida</th>
                    <th className="px-6 py-4 font-bold tracking-widest">Plan</th>
                    <th className="px-6 py-4 font-bold tracking-widest text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">No hay registros para mostrar.</td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-black text-lg tracking-tighter uppercase">{r.vehicle?.placa}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {format(new Date(r.entryTime), "dd/MM/yyyy HH:mm", { locale: es })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {r.exitTime ? format(new Date(r.exitTime), "dd/MM/yyyy HH:mm", { locale: es }) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="rounded-full">{r.plan?.name || "Tarifa Estándar"}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-400">
                          ${parseFloat(r.totalAmount || "0").toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

