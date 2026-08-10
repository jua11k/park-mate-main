import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tenantsSchema from "./schema/tenants";
import * as parkingSchema from "./schema/parking";
import { eq, and, desc } from "drizzle-orm";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const client = postgres(connectionString);
const db = drizzle(client, { schema: { ...tenantsSchema, ...parkingSchema } });

const { tenants } = tenantsSchema;
const { vehicles, parkingRecords, parkingPlans } = parkingSchema;

// Helper duplicated from parking-service for testing
function calculateAmount(entryTime: Date, exitTime: Date, planPrice: string, planType: string) {
  const diffMs = exitTime.getTime() - entryTime.getTime();
  const price = parseFloat(planPrice);
  
  if (planType === 'hourly') {
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    return (hours * price).toFixed(2);
  } else if (planType === 'daily') {
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return (days * price).toFixed(2);
  }
  
  return price.toFixed(2);
}

async function test() {
  console.log("🧪 Probando cálculo de salida...");
  
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.slug, "demo"),
  });

  if (!tenant) throw new Error("No hay tenant demo");

  const placa = "ABC123";
  
  const records = await db.query.parkingRecords.findMany({
    where: and(
      eq(parkingRecords.tenantId, tenant.id),
      eq(parkingRecords.status, "parked")
    ),
    with: {
      vehicle: true,
      plan: true,
    }
  });

  const targetedRecord = records.find(r => r.vehicle.placa === placa.toUpperCase());

  if (!targetedRecord) {
    throw new Error(`No se encontró un ingreso activo para la placa ${placa.toUpperCase()}`);
  }

  const exitTime = new Date();
  let totalAmount = "0.00";

  if (targetedRecord.plan) {
    totalAmount = calculateAmount(
      targetedRecord.entryTime,
      exitTime,
      targetedRecord.plan.price,
      targetedRecord.plan.type
    );
  }

  const [result] = await db.update(parkingRecords)
    .set({
      status: "completed",
      exitTime,
      totalAmount,
    })
    .where(eq(parkingRecords.id, targetedRecord.id))
    .returning();
  
  console.log("✅ Salida registrada exitosamente:");
  console.log(`Placa: ${placa}`);
  console.log(`Plan: ${targetedRecord.plan?.name}`);
  console.log(`Entrada: ${targetedRecord.entryTime.toLocaleString()}`);
  console.log(`Salida: ${exitTime.toLocaleString()}`);
  console.log(`Monto Total: $${totalAmount}`);
  
  process.exit(0);
}

test().catch(console.error);
