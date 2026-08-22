import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Adding differential rates and grace period columns to parking_plans...");

  await sql`ALTER TABLE park_mate.parking_plans ADD COLUMN IF NOT EXISTS grace_period_min INTEGER DEFAULT 0`;
  await sql`ALTER TABLE park_mate.parking_plans ADD COLUMN IF NOT EXISTS differential_rate_price NUMERIC(12, 2)`;
  await sql`ALTER TABLE park_mate.parking_plans ADD COLUMN IF NOT EXISTS differential_rate_after_hr INTEGER`;

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
