import { db } from "@/db";
import { vehicles, parkingRecords, parkingPlans, subscriptions } from "@/db/schema/parking";
import { eq, and, desc, gt, or } from "drizzle-orm";
import { sendToN8n } from "./n8n-service";

export async function getParkedVehicles(tenantId: string) {
  return await db.query.parkingRecords.findMany({
    where: and(
      eq(parkingRecords.tenantId, tenantId),
      or(
        eq(parkingRecords.status, "parked"),
        eq(parkingRecords.status, "subscription_active")
      )
    ),
    with: {
      vehicle: {
        with: {
          subscriptions: {
            where: (subs, { eq, and, gt }) => and(
              eq(subs.status, "active"),
              gt(subs.endDate, new Date())
            ),
            limit: 1
          }
        }
      },
      plan: true,
    },
    orderBy: [desc(parkingRecords.entryTime)],
  });
}

export async function getVehicleByPlaca(tenantId: string, placa: string) {
  return await db.query.vehicles.findFirst({
    where: and(
      eq(vehicles.tenantId, tenantId),
      eq(vehicles.placa, placa.toUpperCase())
    ),
  });
}

export async function getParkingPlans(tenantId: string) {
  return await db.query.parkingPlans.findMany({
    where: eq(parkingPlans.tenantId, tenantId),
  });
}

export async function getActiveSubscription(tenantId: string, vehicleId: string) {
  return await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.tenantId, tenantId),
      eq(subscriptions.vehicleId, vehicleId),
      eq(subscriptions.status, "active"),
      gt(subscriptions.endDate, new Date())
    ),
  });
}

export async function registerEntry(tenantId: string, data: { 
  placa: string, 
  tipo: string,
  planId?: string,
  ownerName?: string,
  ownerEmail?: string,
  ownerPhone?: string
}) {
  // 1. Find or create vehicle
  let vehicle = await db.query.vehicles.findFirst({
    where: and(
      eq(vehicles.tenantId, tenantId),
      eq(vehicles.placa, data.placa.toUpperCase())
    ),
  });

  // 1.1. Check if vehicle is already parked
  if (vehicle) {
    const activeRecord = await db.query.parkingRecords.findFirst({
      where: and(
        eq(parkingRecords.tenantId, tenantId),
        eq(parkingRecords.vehicleId, vehicle.id),
        or(eq(parkingRecords.status, "parked"), eq(parkingRecords.status, "subscription_active"))
      )
    });

    if (activeRecord) {
      throw new Error(`El vehículo con placa ${data.placa.toUpperCase()} ya se encuentra dentro del parqueadero.`);
    }
  }

  if (!vehicle) {
    const [newVehicle] = await db.insert(vehicles).values({
      tenantId,
      placa: data.placa.toUpperCase(),
      tipo: data.tipo,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
    }).returning();
    vehicle = newVehicle;
  } else {
    // Update owner info if provided
    const [updatedVehicle] = await db.update(vehicles)
      .set({
        ownerName: data.ownerName || vehicle.ownerName,
        ownerEmail: data.ownerEmail || vehicle.ownerEmail,
        ownerPhone: data.ownerPhone || vehicle.ownerPhone,
        tipo: data.tipo || vehicle.tipo,
      })
      .where(eq(vehicles.id, vehicle.id))
      .returning();
    vehicle = updatedVehicle;
  }

  // 1.5. Find plan (provided or default for vehicle type)
  let planId = data.planId;
  let status = "parked";

  // Check for active subscription
  const activeSub = await getActiveSubscription(tenantId, vehicle.id);
  if (activeSub) {
    status = "subscription_active";
  }
  
  if (!planId && !activeSub) {
    const defaultPlan = await db.query.parkingPlans.findFirst({
      where: and(
        eq(parkingPlans.tenantId, tenantId),
        eq(parkingPlans.name, data.tipo === 'moto' ? 'Hora Moto' : 'Hora Carro')
      )
    });
    planId = defaultPlan?.id;
  }

  // 2. Create parking record
  const [result] = await db.insert(parkingRecords).values({
    tenantId,
    vehicleId: vehicle.id,
    planId,
    status: status as any,
  }).returning();

  // 3. Notify n8n
  await sendToN8n('parking_entry', {
    recordId: result.id,
    placa: vehicle.placa,
    entryTime: result.entryTime,
    tenantId
  });

  return result;
}

export async function registerExit(tenantId: string, placa: string) {
  // 1. HIGH PERFORMANCE LOOKUP: Find vehicle first
  const vehicle = await getVehicleByPlaca(tenantId, placa);
  
  if (!vehicle) {
    throw new Error(`Vehículo con placa ${placa.toUpperCase()} no encontrado.`);
  }

  // 2. Find the ACTIVE record using index (tenantId, vehicleId, status)
  const targetedRecord = await db.query.parkingRecords.findFirst({
    where: and(
      eq(parkingRecords.tenantId, tenantId),
      eq(parkingRecords.vehicleId, vehicle.id),
      or(
        eq(parkingRecords.status, "parked"),
        eq(parkingRecords.status, "subscription_active")
      )
    ),
    with: {
      plan: true,
    }
  });

  if (!targetedRecord) {
    throw new Error(`No se encontró un ingreso activo para la placa ${placa.toUpperCase()}`);
  }

  const exitTime = new Date();
  let totalAmount = "0.00";

  // 3. CALCULATION LOGIC
  if (targetedRecord.status === "subscription_active") {
    totalAmount = "0.00"; // Subscription holders don't pay per use
  } else if (targetedRecord.plan) {
    totalAmount = calculateAmount(
      targetedRecord.entryTime,
      exitTime,
      targetedRecord.plan.price,
      targetedRecord.plan.type
    );
  }

  // 4. Update record
  const [updatedRecord] = await db.update(parkingRecords)
    .set({
      exitTime,
      totalAmount,
      status: "completed",
    })
    .where(eq(parkingRecords.id, targetedRecord.id))
    .returning();

  // 5. Notify n8n
  await sendToN8n('parking_exit', {
    ...updatedRecord,
    placa: vehicle.placa,
    ownerData: {
      name: vehicle.ownerName,
      email: vehicle.ownerEmail,
      phone: vehicle.ownerPhone
    }
  });

  return updatedRecord;
}

function calculateAmount(entry: Date, exit: Date, priceStr: string, type: string): string {
  const price = parseFloat(priceStr);
  const diffMs = exit.getTime() - entry.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (type === 'fixed') return price.toFixed(2);
  
  if (type === 'daily') {
    const days = Math.ceil(diffHours / 24);
    return (days * price).toFixed(2);
  }

  // Hourly (Default)
  // Logic: First hour is always paid full, then by fractional hour or rounded up?
  // Most parking garages round up each hour.
  const hoursToCharge = Math.ceil(diffHours);
  return (Math.max(1, hoursToCharge) * price).toFixed(2);
}
