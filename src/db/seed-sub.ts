import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tenantsSchema from "./schema/tenants";
import * as parkingSchema from "./schema/parking";
import { eq } from "drizzle-orm";
import { addMonths } from "date-fns";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const client = postgres(connectionString);
const db = drizzle(client, { schema: { ...tenantsSchema, ...parkingSchema } });

async function main() {
  console.log("🚀 Creando suscripción de prueba para XYZ789...");

  const tenant = await db.query.tenants.findFirst({ where: eq(tenantsSchema.tenants.slug, "demo") });
  if (!tenant) throw new Error("Tenant demo no existe");

  const vehicle = await db.query.vehicles.findFirst({
    where: eq(parkingSchema.vehicles.placa, "XYZ789")
  });

  if (!vehicle) throw new Error("Vehículo XYZ789 no existe. Corre el seed base primero.");

  // Crear suscripción activa por 1 mes
  await db.insert(parkingSchema.subscriptions).values({
    tenantId: tenant.id,
    vehicleId: vehicle.id,
    startDate: new Date(),
    endDate: addMonths(new Date(), 1),
    status: "active",
    totalPaid: "150000.00" // Valor de un mes
  });

  console.log("✅ Suscripción creada exitosamente!");
  process.exit(0);
}

main().catch(console.error);
