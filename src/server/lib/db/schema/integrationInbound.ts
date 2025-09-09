import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { partner } from './master';

export const integrationInbound = pgTable('integration_inbound', {
  id: uuid('id').primaryKey(),
  partnerId: uuid('partner_id').notNull().references(() => partner.id),
  apiKey: varchar('api_key', { length: 128 }).notNull().unique(),
  description: varchar('description', { length: 1000 }),
  status: varchar('status', { length: 20, enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  uniqueIndex("integration_api_key_unique_idx").on(t.apiKey),
]);

export const integrationInboundRelations = relations(integrationInbound, ({ one }) => ({
  partner: one(partner, {
    fields: [integrationInbound.partnerId],
    references: [partner.id],
  }),
}));

export type IntegrationInbound = typeof integrationInbound.$inferSelect;
export type NewIntegrationInbound = typeof integrationInbound.$inferInsert;