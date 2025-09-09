
# Integration-Outbound Implementation Guide

## Overview
This document provides a comprehensive step-by-step guide for implementing the Integration-Outbound (webhook management) feature in the base-vibe admin application. The goal is to allow partners to register webhook endpoints that will be called automatically when specific system events occur, with payloads relevant to the event. The implementation follows established project patterns, including multitenancy, modular architecture, and robust validation.

## Table of Contents
1. Server-Side Implementation
2. Database Schema Design & Migration
3. Zod Validation Schemas
4. Webhook Management API
5. Event Triggering & Delivery Logic
6. Multitenancy Enforcement
7. Swagger Documentation
8. Client-Side Implementation
9. Routing & Navigation
10. Testing & Validation
11. Permissions & RBAC
12. Completion Checklist
13. Additional Notes

---

## 1. Server-Side Implementation

### Step 1: Create Webhook Database Schema

#### 1.1 Create webhook.ts schema file
**File**: `/src/server/lib/db/schema/webhook.ts`

```typescript
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
```

#### 1.2 Update database schema index
**File**: `/src/server/lib/db/schema/index.ts`

```typescript
// ...existing exports...
export * from './webhook';
```

#### 1.3 Update tenant relations in system.ts
**File**: `/src/server/lib/db/schema/system.ts`

```typescript
import { webhook } from './webhook';
// ...existing code...
export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(userTenant),
  partners: many(partner),
  webhooks: many(webhook), // Add this line
}));
```

### Step 2: Generate and Apply Migration

Run the following commands:

```bash
# Generate migration for the new webhook table
npm run db:generate

# Apply the migration to the database
npm run db:migrate
```

Verify the `integration_webhook` table is created with correct schema.

---

## 2. Zod Validation Schemas

### Step 3: Create webhook validation schema
**File**: `/src/server/schemas/webhookSchema.ts`

```typescript
import { z } from 'zod';

export const webhookAddSchema = z.object({
  partnerId: z.string().uuid('Invalid partner ID'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  eventType: z.string().min(1, 'Event type is required').max(100),
  url: z.string().url('Invalid URL').max(1000),
  isActive: z.boolean().default(true),
});

export const webhookEditSchema = webhookAddSchema.extend({
  id: z.string().uuid('Invalid webhook ID'),
});

export const webhookQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default('1'),
  perPage: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default('10'),
  eventType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type WebhookAddData = z.infer<typeof webhookAddSchema>;
export type WebhookEditData = z.infer<typeof webhookEditSchema>;
export type WebhookQueryParams = z.infer<typeof webhookQuerySchema>;
```

---

## 3. Webhook Management API

### Step 4: Create API Routes

#### 4.1 Create webhook routes directory and file
**Directory**: `/src/server/routes/integration/outbound/`
**File**: `/src/server/routes/integration/outbound/webhook.ts`

Implement CRUD endpoints for webhooks, protected by authentication and RBAC middleware. Use Zod validation for payloads. Example:

```typescript
import { Router } from 'express';
import { db } from '../../lib/db';
import { webhook } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { webhookAddSchema, webhookEditSchema, webhookQuerySchema } from '../../schemas/webhookSchema';

const webhookRoutes = Router();
webhookRoutes.use(authenticated());

// List webhooks
webhookRoutes.get('/', authorized('ADMIN', 'integration.webhook.view'), async (req, res) => {
  // ...pagination, filtering, multitenancy enforcement...
});

// Create webhook
webhookRoutes.post('/', validateData(webhookAddSchema), authorized('ADMIN', 'integration.webhook.create'), async (req, res) => {
  // ...insert logic...
});

// Get webhook by ID
webhookRoutes.get('/:id', authorized('ADMIN', 'integration.webhook.view'), async (req, res) => {
  // ...fetch logic...
});

// Update webhook
webhookRoutes.put('/:id', validateData(webhookEditSchema), authorized('ADMIN', 'integration.webhook.edit'), async (req, res) => {
  // ...update logic...
});

// Delete webhook
webhookRoutes.delete('/:id', authorized('ADMIN', 'integration.webhook.delete'), async (req, res) => {
  // ...delete logic...
});

export default webhookRoutes;
```

#### 4.2 Register integration routes in main server file
**File**: `/src/server/main.ts`

```typescript
import integrationRoutes from './routes/integration';
app.use('/api/integration', integrationRoutes);
```

---

## 4. Event Triggering & Delivery Logic

### Step 5: Implement Event Listeners

Identify system events (e.g., `user.created`, `order.completed`). In relevant API modules, trigger webhook delivery:

**File**: `/src/server/lib/events/webhookDispatcher.ts`

```typescript
import axios from 'axios';
import { db } from '../db';
import { webhook } from '../db/schema';

export async function dispatchWebhooks(eventType: string, tenantId: string, payload: any) {
  const activeWebhooks = await db.select().from(webhook).where(/* eventType, tenantId, isActive */);
  for (const wh of activeWebhooks) {
    try {
      await axios.post(wh.url, payload, { timeout: 5000 });
      // Log success
    } catch (err) {
      // Log failure, optionally retry
    }
  }
}
```

Call `dispatchWebhooks` from event sources (e.g., after user creation).

---

## 5. Multitenancy Enforcement

- All webhook operations must filter by `tenant_id`.
- Partners can only manage webhooks for their own tenant.
- Event delivery only triggers webhooks for the relevant tenant.

---

## 6. Swagger Documentation

- Document all endpoints and request/response schemas using Swagger JSDoc.
- Update `/api-docs` to include Integration-Outbound routes.

---

## 7. Client-Side Implementation

### Step 6: Create Client-Side Schema
**File**: `/src/client/schemas/webhookSchema.ts`

```typescript
import { z } from 'zod';

export const webhookSchema = z.object({
  partnerId: z.string().uuid('Invalid partner ID'),
  eventType: z.string().min(1).max(100),
  url: z.string().url().max(1000),
  isActive: z.boolean().default(true),
});

export const webhookEditSchema = webhookSchema.extend({
  id: z.string().uuid('Invalid webhook ID'),
});

export type WebhookFormData = z.infer<typeof webhookSchema>;
export type WebhookEditFormData = z.infer<typeof webhookEditSchema>;

export interface Webhook {
  id: string;
  partnerId: string;
  tenantId: string;
  eventType: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookListResponse {
  success: boolean;
  data: Webhook[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface WebhookResponse {
  success: boolean;
  data: Webhook;
}

export interface WebhookQueryParams {
  page?: number;
  perPage?: number;
  eventType?: string;
  isActive?: boolean;
}
```

### Step 7: Create Webhook Form Component
**File**: `/src/client/components/forms/WebhookForm.tsx`

// ...similar to PartnerForm, with fields for eventType, url, isActive...

### Step 8: Create Webhook Service/API Layer
**File**: `/src/client/lib/api/webhookApi.ts`

// ...CRUD methods for webhooks, similar to partnerApi...

### Step 9: Create Webhook Pages
**Directory**: `/src/client/pages/console/integration/outbound/`

- WebhookList.tsx: List, filter, sort webhooks
- WebhookAdd.tsx: Add new webhook
- WebhookEdit.tsx: Edit webhook
- WebhookDetail.tsx: View webhook details

### Step 10: Update Routing
**File**: `/src/client/route.ts`

// Add webhook routes to router configuration

### Step 11: Update Navigation
**File**: Sidebar navigation component

// Add Integration-Outbound section with Webhook submenu

---

## 8. Testing & Validation

### Step 12: Database Testing
- Verify schema and CRUD operations

### Step 13: API Testing
- Test endpoints via Swagger
- Test RBAC enforcement

### Step 14: Frontend Testing
- Test all UI functionality (list, add, edit, view, delete)
- Test form validation

### Step 15: Event Delivery Testing
- Mock partner endpoints, trigger events, verify payload delivery and logging

---

## 9. Permissions & RBAC

- Add permissions: `integration.webhook.view`, `integration.webhook.create`, `integration.webhook.edit`, `integration.webhook.delete`
- Assign permissions to appropriate roles

---

## 10. Completion Checklist

- [ ] Create webhook database schema and migration
- [ ] Implement server-side CRUD endpoints
- [ ] Add event triggering logic
- [ ] Enforce multitenancy in all layers
- [ ] Add Swagger documentation
- [ ] Build client-side management pages
- [ ] Write tests for API and UI
- [ ] Add required permissions to database
- [ ] Assign permissions to appropriate roles
- [ ] Update documentation

---

## 11. Additional Notes

1. **Security**: Secure webhook URLs, never expose sensitive data in payloads, consider signing payloads for verification.
2. **Multitenancy**: All operations must enforce tenant isolation.
3. **Validation**: Comprehensive validation on both client and server sides.
4. **UI/UX**: Use shadcn/ui components for consistency.
5. **Scalability**: Modular structure allows easy extension for more integration entities.

This guide ensures a robust, scalable, and secure implementation of outbound webhook management, fully integrated with the base-vibe admin application and its multitenancy architecture.
