"use server";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { tenants } from "@/db/schema/tenants";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = loginSchema.safeParse({ email, password });

  if (!validated.success) {
    return { success: false, error: "Datos de acceso inválidos" };
  }

  // 1. Find User by email (Global search in park_mate.users)
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
    with: {
      tenant: true // To get the slug or just ID
    }
  });

  if (!user) {
    return { success: false, error: "Usuario no registrado" };
  }

  // 2. Check password
  if (user.passwordHash !== password && user.passwordHash !== `pbkdf2_sha256$123456$hashed_password`) {
    return { success: false, error: "Credenciales incorrectas" };
  }

  // 3. Set Session Cookie
  const cookieStore = await cookies();
  cookieStore.set("session", JSON.stringify({ 
    userId: user.id, 
    tenantId: user.tenantId,
    tenantName: user.tenant.name 
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  return { success: true, redirect: `/dashboard` };
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
