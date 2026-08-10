import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tenantsSchema from "./schema/tenants";
import * as projectsSchema from "./schema/projects";
import * as usersSchema from "./schema/users";
import * as parkingSchema from "./schema/parking";
import { eq } from "drizzle-orm";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const client = postgres(connectionString);
const db = drizzle(client, { schema: { ...tenantsSchema, ...projectsSchema, ...usersSchema, ...parkingSchema } });

async function main() {
  console.log("🚀 Iniciando Seed en esquema park_mate (Aislado con Usuarios)...");

  const { tenants } = tenantsSchema;
  const { projects } = projectsSchema;
  const { users } = usersSchema;
  const { vehicles, parkingPlans, parkingRecords } = parkingSchema;

  // 1. Tenant
  let tenant = await db.query.tenants.findFirst({ where: eq(tenants.slug, "demo") });
  if (!tenant) {
    const [newTenant] = await db.insert(tenants).values({ name: "Parqueadero Pro", slug: "demo" }).returning();
    tenant = newTenant;
  }

  // 2. Usuario Administrador
  let user = await db.query.users.findFirst({ where: eq(users.email, "admin@parkmate.com") });
  if (!user) {
    console.log("➕ Creando usuario administrador (admin@parkmate.com / 123456)...");
    await db.insert(users).values({
      tenantId: tenant.id,
      name: "Admin ParkMate",
      email: "admin@parkmate.com",
      passwordHash: "pbkdf2_sha256$123456$hashed_password", // Placeholder for test
      role: "admin",
    });
  }

  // 3. Proyecto
  let project = await db.query.projects.findFirst({ where: eq(projects.tenantId, tenant.id) });
  if (!project) {
    const [newProject] = await db.insert(projects).values({ tenantId: tenant.id, name: "Sede Norte" }).returning();
    project = newProject;
  }

  console.log("✅ Seed de Usuarios completado!");
  process.exit(0);
}

main().catch(console.error);
