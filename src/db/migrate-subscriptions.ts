import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Creating subscriptions table in park_mate schema...");

  await sql`
    CREATE TABLE IF NOT EXISTS park_mate.subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES park_mate.tenants(id) ON DELETE CASCADE,
      vehicle_id UUID NOT NULL REFERENCES park_mate.vehicles(id) ON DELETE CASCADE,
      plan_id UUID REFERENCES park_mate.parking_plans(id),
      start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      status VARCHAR(50) DEFAULT 'active' NOT NULL,
      total_paid DECIMAL(12, 2) DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      deleted_at TIMESTAMP WITH TIME ZONE
    )
  `;

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
