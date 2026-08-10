import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Adding owner information to park_mate.vehicles...");

  await sql`
    ALTER TABLE park_mate.vehicles 
    ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(50)
  `;

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
