import { db } from "@/db";
import { vehicles, insertVehicleSchema } from "@/db/schema/vehicles";
import { parkingRecords, insertRecordSchema } from "@/db/schema/records";
import { eq, and, desc } from "drizzle-orm";

export async function getParkedVehicles(tenantId: string) {
  return await db.query.parkingRecords.findMany({
    where: and(
      eq(parkingRecords.tenantId, tenantId),
      eq(parkingRecords.status, "parked")
    ),
    with: {
      vehicle: true,
    },
    orderBy: [desc(parkingRecords.entryTime)],
  });
}

export async function registerEntry(tenantId: string, data: { placa: string, tipo: string }) {
  // 1. Find or create vehicle
  let vehicle = await db.query.vehicles.findFirst({
    where: and(
      eq(vehicles.tenantId, tenantId),
      eq(vehicles.placa, data.placa.toUpperCase())
    ),
  });

  if (!vehicle) {
    const [newVehicle] = await db.insert(vehicles).values({
      tenantId,
      placa: data.placa,
      tipo: data.tipo,
    }).returning();
    vehicle = newVehicle;
  }

  // 2. Create parking record
  return await db.insert(parkingRecords).values({
    tenantId,
    vehicleId: vehicle.id,
    status: "parked",
  }).returning();
}

export async function registerExit(tenantId: string, placa: string) {
  const record = await db.query.parkingRecords.findFirst({
    where: and(
      eq(parkingRecords.tenantId, tenantId),
      eq(parkingRecords.status, "parked")
    ),
    with: {
      vehicle: {
        where: eq(vehicles.placa, placa.toUpperCase())
      }
    }
  });

  if (!record) throw new Error("Vehículo no encontrado o no está parqueado");

  return await db.update(parkingRecords)
    .set({
      status: "completed",
      exitTime: new Date(),
    })
    .where(eq(parkingRecords.id, record.id))
    .returning();
}
