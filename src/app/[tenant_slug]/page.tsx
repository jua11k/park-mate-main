import { getParkedVehicles } from "@/services/parking-service";
import { Header } from "@/components/Header";
import { DashboardClient } from "@/components/DashboardClient";
import { db } from "@/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function TenantPage({ params }: { params: { tenant_slug: string } }) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, params.tenant_slug),
  });

  if (!tenant) {
    notFound();
  }

  const vehicles = await getParkedVehicles(tenant.id);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        vehicleCount={vehicles.length}
        tenantName={tenant.name}
      />

      <DashboardClient 
        vehicles={vehicles} 
        tenantId={tenant.id} 
      />
    </div>
  );
}
