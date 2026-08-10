import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Optimizing database performance with indexes...");

  // 1. Vehicles: Quick search by plate within a tenant
  await sql`CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_placa ON park_mate.vehicles (tenant_id, placa)`;

  // 2. Parking Records: Quick find of active vehicles (parked)
  await sql`CREATE INDEX IF NOT EXISTS idx_records_tenant_status ON park_mate.parking_records (tenant_id, status)`;
  
  // 3. Subscriptions: Quick check for active plans
  await sql`CREATE INDEX IF NOT EXISTS idx_subs_tenant_vehicle_status ON park_mate.subscriptions (tenant_id, vehicle_id, status)`;

  console.log("Performance indexes created successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
