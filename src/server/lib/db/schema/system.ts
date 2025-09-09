import { relations } from 'drizzle-orm';
import { boolean, date, pgTable, primaryKey, time, timestamp, unique, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { partner } from './master';
import { webhook } from './webhook';
import { webhook_event } from './webhook_event';

export const tenant = pgTable('sys_tenant', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const user = pgTable('sys_user', {
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullname: varchar('fullname', { length: 255 }).notNull(),
  status: varchar('status', { length: 255, enum: ["active", "inactive"] }).notNull(),
  email: varchar('email', { length: 255 }),
  avatar: varchar('avatar', { length: 255 }),
  activeTenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const role = pgTable('sys_role', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  isSystem: boolean('is_system').notNull(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
},
  (t) => [
     uniqueIndex("role_unique_idx").on(t.code, t.tenantId),
  ]
);

export const permission = pgTable('sys_permission', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
},
  (t) => [
      uniqueIndex("permission_unique_idx").on(t.code, t.tenantId),
  ]
);

export const option = pgTable('sys_option', {
  id: uuid('id').primaryKey(),
  code: varchar('code', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
},
  (t) => [
      uniqueIndex("option_unique_idx").on(t.code, t.tenantId),
  ]
);

export const userTenant = pgTable('sys_user_tenant', {
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
},
  (t) => [
    primaryKey({ columns: [t.userId, t.tenantId] })
  ]
);

export const userRole = pgTable('sys_user_role', {
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
  roleId: uuid('role_id')
    .notNull()
    .references(() => role.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
},
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId, t.tenantId] })
  ]);

export const rolePermission = pgTable('sys_role_permission', {
  roleId: uuid('role_id')
    .notNull()
    .references(() => role.id),
  permissionId: uuid('permission_id')
    .notNull()
    .references(() => permission.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id),
},
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissionId, t.tenantId] })
  ]);

// tenant relations
export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(userTenant),
  partners: many(partner),
  webhooks: many(webhook),
  webhookEvents: many(webhook_event),
}));

// user relations
export const userRelations = relations(user, ({ one, many }) => ({
  activeTenant: one(tenant, {
    fields: [user.activeTenantId],
    references: [tenant.id],
  }),
  tenants: many(userTenant),
  roles: many(userRole),
}));

// role relations
export const roleRelations = relations(role, ({ one, many }) => ({
  tenant: one(tenant, {
    fields: [role.tenantId],
    references: [tenant.id],
  }),
  users: many(userRole),
  permissions: many(rolePermission)
}));

// permission relations
export const permissionRelations = relations(permission, ({ one, many }) => ({
  tenant: one(tenant, {
    fields: [permission.tenantId],
    references: [tenant.id],
  }),
  roles: many(rolePermission),
}));

// user tenant relations
export const userTenantRelations = relations(userTenant, ({ one }) => ({
  tenant: one(tenant, {
    fields: [userTenant.tenantId],
    references: [tenant.id],
  }),
  user: one(user, {
    fields: [userTenant.userId],
    references: [user.id],
  }),
}));

// user role relations
export const userRoleRelations = relations(userRole, ({ one }) => ({
  tenant: one(tenant, {
    fields: [userRole.tenantId],
    references: [tenant.id],
  }),
  role: one(role, {
    fields: [userRole.roleId],
    references: [role.id],
  }),
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
}));



// role permission relations
export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  tenant: one(tenant, {
    fields: [rolePermission.tenantId],
    references: [tenant.id],
  }),
  role: one(role, {
    fields: [rolePermission.roleId],
    references: [role.id],
  }),
  permission: one(permission, {
    fields: [rolePermission.permissionId],
    references: [permission.id],
  }),
}));

export type Tenant = typeof tenant.$inferSelect;

export type User = typeof user.$inferSelect;

export type Role = typeof role.$inferSelect;

export type Permission = typeof permission.$inferSelect;

export type Option = typeof option.$inferSelect;

export type UserTenant = typeof userTenant.$inferSelect;

export type UserRole = typeof userRole.$inferSelect;

export type RolePermission = typeof rolePermission.$inferSelect;
