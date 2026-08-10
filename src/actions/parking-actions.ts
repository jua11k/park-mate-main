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
