import { pgSchema, uuid, varchar, timestamp, decimal, text, index, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { projects } from "./projects";
import { relations } from "drizzle-orm";

export const parkMateSchema = pgSchema("park_mate");

export const vehicles = parkMateSchema.table("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  placa: varchar("placa", { length: 20 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // carro, moto, bicicleta, camioneta
  brand: varchar("brand", { length: 100 }),
  color: varchar("color", { length: 50 }),
  ownerName: varchar("owner_name", { length: 255 }),
  ownerEmail: varchar("owner_email", { length: 255 }),
  ownerPhone: varchar("owner_phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  tenantPlacaIdx: index("vehicles_tenant_placa_idx").on(table.tenantId, table.placa),
}));

export const parkingPlans = parkMateSchema.table("parking_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  name: varchar("name", { length: 100 }).notNull(), // Hora, Día, Mes, Convenio
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'hourly', 'daily', 'fixed'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  tenantIdx: index("plans_tenant_idx").on(table.tenantId),
}));

export const parkingRecords = parkMateSchema.table("parking_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id).notNull(),
  planId: uuid("plan_id").references(() => parkingPlans.id),
  entryTime: timestamp("entry_time").defaultNow().notNull(),
  exitTime: timestamp("exit_time"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull(), // 'parked', 'completed', 'subscription_active'
  cancellationReason: text("cancellation_reason"),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
}, (table) => ({
  tenantStatusIdx: index("records_tenant_status_idx").on(table.tenantId, table.status),
  tenantEntryIdx: index("records_tenant_entry_idx").on(table.tenantId, table.entryTime),
}));

export const subscriptions = parkMateSchema.table("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "cascade" }).notNull(),
  planId: uuid("plan_id").references(() => parkingPlans.id),
  startDate: timestamp("start_date", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  totalPaid: decimal("total_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// RELATIONS
export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  records: many(parkingRecords),
  subscriptions: many(subscriptions),
}));

export const parkingPlansRelations = relations(parkingPlans, ({ many }) => ({
  records: many(parkingRecords),
  subscriptions: many(subscriptions),
}));

export const parkingRecordsRelations = relations(parkingRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [parkingRecords.vehicleId],
    references: [vehicles.id],
  }),
  plan: one(parkingPlans, {
    fields: [parkingRecords.planId],
    references: [parkingPlans.id],
  }),
  tenant: one(tenants, {
    fields: [parkingRecords.tenantId],
    references: [tenants.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [subscriptions.vehicleId],
    references: [vehicles.id],
  }),
  plan: one(parkingPlans, {
    fields: [subscriptions.planId],
    references: [parkingPlans.id],
  }),
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
}));
