import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { tenant } from './system';
import { partner } from './master';

export const webhook = pgTable('integration_webhook', {
  id: uuid('id').primaryKey(),
  partnerId: uuid('partner_id').notNull().references(() => partner.id),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const webhookRelations = relations(webhook, ({ one }) => ({
  tenant: one(tenant, { fields: [webhook.tenantId], references: [tenant.id] }),
  partner: one(partner, { fields: [webhook.partnerId], references: [partner.id] }),
}));

export type Webhook = typeof webhook.$inferSelect;
export type NewWebhook = typeof webhook.$inferInsert;