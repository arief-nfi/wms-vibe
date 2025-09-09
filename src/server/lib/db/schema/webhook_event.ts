import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { tenant } from './system';

export const webhook_event = pgTable('webhook_event', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // event type string like 'user.created'
  description: varchar('description', { length: 1000 }),
  isActive: boolean('is_active').notNull().default(true),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const webhookEventRelations = relations(webhook_event, ({ one }) => ({
  tenant: one(tenant, {
    fields: [webhook_event.tenantId],
    references: [tenant.id],
  }),
}));

export type WebhookEvent = typeof webhook_event.$inferSelect;
export type NewWebhookEvent = typeof webhook_event.$inferInsert;