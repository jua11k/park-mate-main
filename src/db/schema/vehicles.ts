import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";
import { relations } from "drizzle-orm";
import { parkingRecords } from "./records";

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  placa: varchar("placa", { length: 20 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // carro, moto, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  tenantIdx: index("vehicles_tenant_idx").on(table.tenantId),
  placaIdx: index("vehicles_placa_idx").on(table.tenantId, table.placa),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  records: many(parkingRecords),
}));

export const insertVehicleSchema = createInsertSchema(vehicles).extend({
  placa: z.string()
    .min(1, "La placa es obligatoria")
    .transform(v => v.trim().toUpperCase()),
});

export const selectVehicleSchema = createSelectSchema(vehicles);
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = z.infer<typeof insertVehicleSchema>;
