import { relations } from 'drizzle-orm';
import { boolean, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { tenant } from './system';

export const partner = pgTable('master_partner', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  picName: varchar('pic_name', { length: 255 }).notNull(),
  picEmail: varchar('pic_email', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  status: varchar('status', { length: 20, enum: ["active", "inactive"] }).notNull().default("active"),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex("partner_code_unique_idx").on(t.code, t.tenantId),
  uniqueIndex("partner_name_unique_idx").on(t.name, t.tenantId),
]);

// Partner relations  
export const partnerRelations = relations(partner, ({ one, many }) => ({
  tenant: one(tenant, {
    fields: [partner.tenantId],
    references: [tenant.id],
  }),
  // Integration inbound relation will be defined in integrationInbound.ts to avoid circular imports
}));

// Type exports
export type Partner = typeof partner.$inferSelect;
export type NewPartner = typeof partner.$inferInsert;