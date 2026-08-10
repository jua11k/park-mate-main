import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as tenants from "./schema/tenants";
import * as projects from "./schema/projects";
import * as users from "./schema/users";
import * as parking from "./schema/parking";

const schema = { ...tenants, ...projects, ...users, ...parking };

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
