"use server";

import { registerEntry, registerExit } from "@/services/parking-service";
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
});

export async function registerEntryAction(tenantId: string, formData: FormData): Promise<ActionResponse<any>> {
  const rawData = {
    placa: formData.get("placa"),
    tipo: formData.get("tipo"),
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
    const result = await registerEntry(tenantId, validated.data);
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
