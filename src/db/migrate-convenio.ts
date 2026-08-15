import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Adding dates to convenios...");

  await sql`ALTER TABLE park_mate.parking_plans ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ`;
  await sql`ALTER TABLE park_mate.parking_plans ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ`;

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
