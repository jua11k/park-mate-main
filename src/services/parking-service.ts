import { db } from "@/db";
import { vehicles, parkingRecords, parkingPlans, subscriptions } from "@/db/schema/parking";
import { eq, and, desc, gt, gte, lte, or } from "drizzle-orm";
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
    with: {
      plan: true
    }
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
  let activeSub = await getActiveSubscription(tenantId, vehicle.id);
  
  // If a specific plan is chosen and we don't have an active sub for it
  if (planId && !activeSub) {
    const chosenPlan = await db.query.parkingPlans.findFirst({
      where: and(
        eq(parkingPlans.tenantId, tenantId),
        eq(parkingPlans.id, planId)
      )
    });

    if (chosenPlan && chosenPlan.type === 'convenio') {
      // Auto-associate vehicle to convenio
      // Use the plan's endDate if it has one, otherwise default to +10 years
      let endDate = chosenPlan.endDate;
      if (!endDate) {
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 10);
      }
      
      const [newSub] = await db.insert(subscriptions).values({
        tenantId,
        vehicleId: vehicle.id,
        planId: chosenPlan.id,
        endDate,
        totalPaid: "0",
        status: "active"
      }).returning();
      
      activeSub = newSub;
    }
  }

  if (activeSub) {
    status = "subscription_active";
    planId = activeSub.planId;
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

export async function getSubscriptions(tenantId: string) {
  return await db.query.subscriptions.findMany({
    where: eq(subscriptions.tenantId, tenantId),
    with: {
      vehicle: true,
      plan: true,
    },
    orderBy: [desc(subscriptions.createdAt)],
  });
}

export async function getAllVehicles(tenantId: string) {
  return await db.query.vehicles.findMany({
    where: eq(vehicles.tenantId, tenantId),
    orderBy: [desc(vehicles.createdAt)],
  });
}

export async function createPlan(tenantId: string, data: { name: string, description: string, type: string, price: string, companyOfficialEmail?: string, startDate?: Date, endDate?: Date }) {
  const [plan] = await db.insert(parkingPlans).values({
    tenantId,
    name: data.name,
    description: data.description,
    type: data.type,
    price: data.price,
    companyOfficialEmail: data.companyOfficialEmail,
    startDate: data.startDate,
    endDate: data.endDate,
  }).returning();
  return plan;
}

export async function updatePlan(tenantId: string, id: string, data: { name?: string, description?: string, price?: string, companyOfficialEmail?: string, startDate?: Date, endDate?: Date }) {
  const [plan] = await db.update(parkingPlans)
    .set({
      name: data.name,
      description: data.description,
      price: data.price,
      companyOfficialEmail: data.companyOfficialEmail,
      startDate: data.startDate,
      endDate: data.endDate,
      updatedAt: new Date()
    })
    .where(and(eq(parkingPlans.id, id), eq(parkingPlans.tenantId, tenantId)))
    .returning();
  return plan;
}

export async function createSubscription(tenantId: string, data: { vehicleId: string, planId: string, startDate: Date, endDate: Date, totalPaid: string, companyOfficialEmail?: string }) {
  const [sub] = await db.insert(subscriptions).values({
    tenantId,
    vehicleId: data.vehicleId,
    planId: data.planId,
    startDate: data.startDate,
    endDate: data.endDate,
    status: 'active',
    totalPaid: data.totalPaid,
    companyOfficialEmail: data.companyOfficialEmail,
  }).returning();
  return sub;
}

export async function updateSubscription(tenantId: string, id: string, data: { planId?: string, endDate?: Date, totalPaid?: string, companyOfficialEmail?: string }) {
  const [sub] = await db.update(subscriptions)
    .set({
      ...(data.planId !== undefined && { planId: data.planId }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.totalPaid !== undefined && { totalPaid: data.totalPaid }),
      ...(data.companyOfficialEmail !== undefined && { companyOfficialEmail: data.companyOfficialEmail }),
    })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.tenantId, tenantId)))
    .returning();
  return sub;
}

export async function cancelSubscription(tenantId: string, id: string) {
  const [sub] = await db.update(subscriptions)
    .set({ status: 'cancelled' })
    .where(and(eq(subscriptions.id, id), eq(subscriptions.tenantId, tenantId)))
    .returning();
  return sub;
}

export async function getCompletedRecords(tenantId: string, planId?: string, startDateStr?: string, endDateStr?: string) {
  const conditions = [
    eq(parkingRecords.tenantId, tenantId),
    eq(parkingRecords.status, "completed")
  ];
  
  if (planId) {
    if (planId === "none") {
      // Filter for standard/no plan records
      conditions.push(eq(parkingRecords.planId, null as any));
    } else {
      conditions.push(eq(parkingRecords.planId, planId));
    }
  }

  if (startDateStr) {
    conditions.push(gte(parkingRecords.entryTime, new Date(startDateStr)));
  }

  if (endDateStr) {
    // Add time to end of day
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(parkingRecords.entryTime, endDate));
  }

  return await db.query.parkingRecords.findMany({
    where: and(...conditions),
    with: {
      vehicle: true,
      plan: true,
    },
    orderBy: [desc(parkingRecords.exitTime)],
    limit: (planId || startDateStr || endDateStr) ? 5000 : 100, // Fetch more if filtering for export
  });
}

