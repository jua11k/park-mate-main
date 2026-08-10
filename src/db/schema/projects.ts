import { pgSchema, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const parkMateSchema = pgSchema("park_mate");

export const projects = parkMateSchema.table("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  whatsappId: varchar("whatsapp_id", { length: 100 }),
  nit: varchar("nit", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type Project = typeof projects.$inferSelect;
