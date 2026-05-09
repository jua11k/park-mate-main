import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tenants from "./schema/tenants";
import * as vehicles from "./schema/vehicles";
import * as records from "./schema/records";

const schema = { ...tenants, ...vehicles, ...records };

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
