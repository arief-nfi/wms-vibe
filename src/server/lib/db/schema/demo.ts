import { relations } from 'drizzle-orm';
import { boolean, date, pgTable, primaryKey, time, timestamp, unique, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { tenant } from './system';

export const department = pgTable('demo_department', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  group: varchar('group', { length: 255 }).notNull(),
  since: date("date").notNull(),
  inTime: time('in_time').notNull(),
  outTime: time('out_time').notNull(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
},
  (t) => [
      uniqueIndex("demo_department_unique_idx").on(t.name, t.tenantId),
  ]
);
