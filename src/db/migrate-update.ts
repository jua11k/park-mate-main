import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Updating tables with project_id...");

  await sql`ALTER TABLE park_mate.vehicles ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id)`;
  await sql`ALTER TABLE park_mate.parking_plans ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id)`;
  await sql`ALTER TABLE park_mate.parking_records ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id)`;

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
