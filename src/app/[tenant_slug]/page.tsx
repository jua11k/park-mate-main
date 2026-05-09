import { getParkedVehicles } from "@/services/parking-service";
import { Header } from "@/components/Header";
import { VehicleCard } from "@/components/VehicleCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
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

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-bold"
          >
            <Plus className="mr-2 h-6 w-6" />
            Registrar Ingreso
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg font-bold"
          >
            <LogOut className="mr-2 h-6 w-6" />
            Registrar Salida
          </Button>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((record) => (
              <VehicleCard
                key={record.id}
                vehicle={record}
                onClick={() => {}} // Handle in client component
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
