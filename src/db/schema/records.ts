import { pgTable, uuid, timestamp, index, decimal, varchar, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tenants } from "./tenants";
import { vehicles } from "./vehicles";
import { relations } from "drizzle-orm";

export const parkingRecords = pgTable("parking_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  entryTime: timestamp("entry_time").defaultNow().notNull(),
  exitTime: timestamp("exit_time"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("parked").notNull(), // parked, completed, cancelled
  cancellationReason: text("cancellation_reason"),
}, (table) => ({
  tenantIdx: index("records_tenant_idx").on(table.tenantId),
  statusIdx: index("records_status_idx").on(table.tenantId, table.status),
}));

export const parkingRecordsRelations = relations(parkingRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [parkingRecords.vehicleId],
    references: [vehicles.id],
  }),
  tenant: one(tenants, {
    fields: [parkingRecords.tenantId],
    references: [tenants.id],
  }),
}));

export const insertRecordSchema = createInsertSchema(parkingRecords);
export const selectRecordSchema = createSelectSchema(parkingRecords);
export type ParkingRecord = typeof parkingRecords.$inferSelect;
export type NewParkingRecord = z.infer<typeof insertRecordSchema>;
