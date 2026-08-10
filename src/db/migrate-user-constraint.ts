import postgres from "postgres";

const connectionString = "postgres://postgres:Juankmed!23@72.60.53.150:5432/order_flow_db?sslmode=disable";
const sql = postgres(connectionString);

async function main() {
  console.log("Adjusting users table constraints in park_mate schema...");

  // 1. Drop the tenant-specific unique constraint
  await sql`
    ALTER TABLE park_mate.users 
    DROP CONSTRAINT IF EXISTS users_tenant_id_email_key
  `;

  // 2. Add global unique constraint on email
  await sql`
    ALTER TABLE park_mate.users 
    ADD CONSTRAINT users_email_unique UNIQUE (email)
  `;

  console.log("Migration completed successfully! Users can now login globally by email.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
