"use server";

import { registerEntry, registerExit, getVehicleByPlaca, getParkingPlans } from "@/services/parking-service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string[]>;
};

const entrySchema = z.object({
  placa: z.string().min(1, "La placa es obligatoria").trim().toUpperCase(),
  tipo: z.string().min(1, "El tipo de vehículo es obligatorio"),
  planId: z.string().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email("Correo inválido").optional().or(z.literal("")),
  ownerPhone: z.string().optional(),
});

export async function registerEntryAction(tenantId: string, formData: FormData): Promise<ActionResponse<any>> {
  const rawData = {
    placa: formData.get("placa"),
    tipo: formData.get("tipo"),
    planId: formData.get("planId"),
    ownerName: formData.get("ownerName"),
    ownerEmail: formData.get("ownerEmail"),
    ownerPhone: formData.get("ownerPhone"),
  };

  const validated = entrySchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      validationErrors: validated.error.flatten().fieldErrors,
      error: "Datos inválidos",
    };
  }

  try {
    const result = await registerEntry(tenantId, {
      ...validated.data,
      ownerEmail: validated.data.ownerEmail || undefined,
    });
    revalidatePath("/");
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: "Error al registrar el ingreso" };
  }
}

export async function registerExitAction(tenantId: string, placa: string): Promise<ActionResponse<any>> {
  try {
    const result = await registerExit(tenantId, placa);
    revalidatePath("/");
    return { success: true, data: result };
  } catch (e: any) {
    return { success: false, error: e.message || "Error al registrar la salida" };
  }
}

export async function getVehicleInfoAction(tenantId: string, placa: string) {
  try {
    const vehicle = await getVehicleByPlaca(tenantId, placa);
    return { success: true, data: vehicle };
  } catch (e) {
    return { success: false, error: "Vehículo no encontrado" };
  }
}

export async function getParkingPlansAction(tenantId: string) {
  try {
    const plans = await getParkingPlans(tenantId);
    return { success: true, data: plans };
  } catch (e) {
    return { success: false, error: "Error al cargar los planes" };
  }
}

export async function getSubscriptionsAction(tenantId: string) {
  try {
    const { getSubscriptions } = await import("@/services/parking-service");
    const subs = await getSubscriptions(tenantId);
    return { success: true, data: subs };
  } catch (e) {
    return { success: false, error: "Error al cargar convenios" };
  }
}

export async function createPlanAction(tenantId: string, formData: FormData): Promise<ActionResponse<any>> {
  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
    price: formData.get("price") as string,
  };

  if (!data.name || !data.type || !data.price) {
    return { success: false, error: "Faltan datos obligatorios" };
  }

  try {
    const { createPlan } = await import("@/services/parking-service");
    const plan = await createPlan(tenantId, data);
    revalidatePath("/plans");
    return { success: true, data: plan };
  } catch (e) {
    return { success: false, error: "Error al crear la tarifa" };
  }
}

export async function createMembershipAction(tenantId: string, formData: FormData): Promise<ActionResponse<any>> {
  const data = {
    vehicleId: formData.get("vehicleId") as string,
    planId: formData.get("planId") as string,
    startDate: new Date(formData.get("startDate") as string),
    endDate: new Date(formData.get("endDate") as string),
    totalPaid: formData.get("totalPaid") as string,
  };

  if (!data.vehicleId || !data.planId || !data.startDate || !data.endDate || !data.totalPaid) {
    return { success: false, error: "Faltan datos obligatorios" };
  }

  try {
    const { createSubscription } = await import("@/services/parking-service");
    const sub = await createSubscription(tenantId, data);
    revalidatePath("/memberships");
    return { success: true, data: sub };
  } catch (e) {
    return { success: false, error: "Error al crear el convenio" };
  }
}

