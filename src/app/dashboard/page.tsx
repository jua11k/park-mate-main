import { getParkedVehicles } from "@/services/parking-service";
import { Header } from "@/components/Header";
import { DashboardClient } from "@/components/DashboardClient";
import { getSession } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const vehicles = await getParkedVehicles(session.tenantId);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        vehicleCount={vehicles.length}
        tenantName={session.tenantName}
      />

      <DashboardClient 
        vehicles={vehicles} 
        tenantId={session.tenantId} 
      />
    </div>
  );
}
