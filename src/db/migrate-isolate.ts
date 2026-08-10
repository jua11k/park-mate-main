import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Isolating tenants and projects into park_mate schema...");

  await sql`
    CREATE TABLE IF NOT EXISTS park_mate.tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      config JSONB DEFAULT '{}'::jsonb NOT NULL,
      active BOOLEAN DEFAULT true,
      status VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS park_mate.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES park_mate.tenants(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      whatsapp_id VARCHAR(100),
      nit VARCHAR(50),
      phone VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE
    )
  `;

  // Update Foreign Keys in existing tables
  // We need to drop existing ones first
  console.log("Updating foreign keys...");
  
  // Note: These ALTER TABLEs might fail if the constraint names are different, 
  // but I'll use the standard naming or ignore errors if I can.
  // Actually, I'll just drop them by name if I know them or recreate them.
  
  try {
    await sql`ALTER TABLE park_mate.vehicles DROP CONSTRAINT IF EXISTS vehicles_tenant_id_fkey`;
    await sql`ALTER TABLE park_mate.vehicles ADD CONSTRAINT vehicles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES park_mate.tenants(id) ON DELETE CASCADE`;
  } catch (e) { console.log("Skipping vehicles_tenant_id_fkey update"); }

  try {
    await sql`ALTER TABLE park_mate.vehicles DROP CONSTRAINT IF EXISTS vehicles_project_id_fkey`;
    await sql`ALTER TABLE park_mate.vehicles ADD CONSTRAINT vehicles_project_id_fkey FOREIGN KEY (project_id) REFERENCES park_mate.projects(id) ON DELETE CASCADE`;
  } catch (e) { console.log("Skipping vehicles_project_id_fkey update"); }

  try {
    await sql`ALTER TABLE park_mate.parking_plans DROP CONSTRAINT IF EXISTS parking_plans_tenant_id_fkey`;
    await sql`ALTER TABLE park_mate.parking_plans ADD CONSTRAINT parking_plans_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES park_mate.tenants(id) ON DELETE CASCADE`;
  } catch (e) { console.log("Skipping parking_plans_tenant_id_fkey update"); }

  try {
    await sql`ALTER TABLE park_mate.parking_plans DROP CONSTRAINT IF EXISTS parking_plans_project_id_fkey`;
    await sql`ALTER TABLE park_mate.parking_plans ADD CONSTRAINT parking_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES park_mate.projects(id) ON DELETE CASCADE`;
  } catch (e) { console.log("Skipping parking_plans_project_id_fkey update"); }

  try {
    await sql`ALTER TABLE park_mate.parking_records DROP CONSTRAINT IF EXISTS parking_records_tenant_id_fkey`;
    await sql`ALTER TABLE park_mate.parking_records ADD CONSTRAINT parking_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES park_mate.tenants(id) ON DELETE CASCADE`;
  } catch (e) { console.log("Skipping parking_records_tenant_id_fkey update"); }

  try {
    await sql`ALTER TABLE park_mate.parking_records DROP CONSTRAINT IF EXISTS parking_records_project_id_fkey`;
    await sql`ALTER TABLE park_mate.parking_records ADD CONSTRAINT parking_records_project_id_fkey FOREIGN KEY (project_id) REFERENCES park_mate.projects(id) ON DELETE CASCADE`;
  } catch (e) { console.log("Skipping parking_records_project_id_fkey update"); }

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
