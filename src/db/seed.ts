import { db } from "./index";
import { tenants } from "./schema/tenants";

async function main() {
  console.log("Seeding...");
  await db.insert(tenants).values({
    name: "Parqueadero Central",
    slug: "demo",
    config: {},
  }).onConflictDoNothing();
  console.log("Done!");
}

main().catch(console.error);
