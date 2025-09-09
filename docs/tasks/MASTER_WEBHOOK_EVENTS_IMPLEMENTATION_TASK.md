
# Master Webhook Events Implementation Guide

## Overview
This document provides a comprehensive step-by-step guide for implementing Master Webhook Events management in the base-vibe admin application. The goal is to allow administrators to define, manage, and use webhook event types dynamically from the database, replacing hardcoded event types. The implementation maintains multitenancy and follows the established patterns and conventions of the project.

## Table of Contents
1. Server-Side Implementation
2. Database Schema & Migration
3. Validation Schema
4. API Endpoint Implementation
5. Event Dispatcher Refactor
6. Client-Side Integration
7. Testing & Validation
8. Completion Checklist
9. Additional Notes

---

## Server-Side Implementation

### Step 1: Create Webhook Event Database Schema

#### 1.1 Create webhook_event schema file
**File**: `/src/server/lib/db/schema/webhook_event.ts`

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { tenant } from './system';

export const webhook_event = pgTable('webhook_event', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // event type string
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
```

#### 1.2 Update schema index
**File**: `/src/server/lib/db/schema/index.ts`

```typescript
// ...existing exports...
export * from './webhook_event';
```

#### 1.3 Update tenant relations
**File**: `/src/server/lib/db/schema/system.ts`

```typescript
import { webhook_event } from './webhook_event';

export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(userTenant),
  webhookEvents: many(webhook_event),
}));
```

### Step 2: Database Migration

#### 2.1 Generate and apply migration
Run the following commands:

```bash
npm run db:generate
npm run db:migrate
```

#### 2.2 Verify migration
Check the database to ensure the `webhook_event` table is created with the correct schema.

---

## Validation Schema

### Step 3: Create Zod Validation Schemas

**File**: `/src/server/schemas/webhookEventSchema.ts`

```typescript
import { z } from 'zod';
import { db } from '../lib/db';
import { webhook_event } from '../lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export const webhookEventAddSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  name: z.string().min(1, 'Event name is required').max(100, 'Max 100 chars'),
  description: z.string().max(1000, 'Max 1000 chars').optional(),
  isActive: z.boolean().default(true),
}).refine(async (data) => {
  // Unique event name per tenant
  const existing = await db.select().from(webhook_event).where(and(
    eq(webhook_event.tenantId, data.tenantId),
    sql`lower(${webhook_event.name}) = ${data.name.toLowerCase()}`
  ));
  return existing.length === 0;
}, {
  message: 'Event name already exists in this tenant',
  path: ['name'],
});

export const webhookEventEditSchema = webhookEventAddSchema.extend({
  id: z.string().uuid('Invalid event ID'),
});

export type WebhookEventAddData = z.infer<typeof webhookEventAddSchema>;
export type WebhookEventEditData = z.infer<typeof webhookEventEditSchema>;
```

---

## API Endpoint Implementation

### Step 4: Create Controller & Routes

**Directory**: `/src/server/routes/webhook/`
**File**: `/src/server/routes/webhook/event.ts`

```typescript
import { Router } from 'express';
import { db } from '../../lib/db';
import { webhook_event } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { webhookEventAddSchema, webhookEventEditSchema } from '../../schemas/webhookEventSchema';
import { and, eq } from 'drizzle-orm';

const eventRoutes = Router();
eventRoutes.use(authenticated());

// List events
eventRoutes.get('/', authorized('ADMIN', 'webhook.event.view'), async (req, res) => {
  const tenantId = req.user!.activeTenantId;
  const events = await db.select().from(webhook_event).where(eq(webhook_event.tenantId, tenantId));
  res.json({ success: true, data: events });
});

// Create event
eventRoutes.post('/', validateData(webhookEventAddSchema), authorized('ADMIN', 'webhook.event.create'), async (req, res) => {
  const { name, description, isActive } = req.body;
  const tenantId = req.user!.activeTenantId;
  const newEvent = await db.insert(webhook_event).values({
    id: crypto.randomUUID(),
    name,
    description,
    isActive,
    tenantId,
  }).returning();
  res.status(201).json({ success: true, data: newEvent[0] });
});

// Edit event
eventRoutes.put('/:id', validateData(webhookEventEditSchema), authorized('ADMIN', 'webhook.event.edit'), async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;
  const tenantId = req.user!.activeTenantId;
  const updated = await db.update(webhook_event).set({ name, description, isActive }).where(and(eq(webhook_event.id, id), eq(webhook_event.tenantId, tenantId))).returning();
  res.json({ success: true, data: updated[0] });
});

// Delete event
eventRoutes.delete('/:id', authorized('ADMIN', 'webhook.event.delete'), async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user!.activeTenantId;
  await db.delete(webhook_event).where(and(eq(webhook_event.id, id), eq(webhook_event.tenantId, tenantId)));
  res.json({ success: true, message: 'Event deleted' });
});

export default eventRoutes;
```

**Register routes in main server file**
**File**: `/src/server/main.ts`

```typescript
import eventRoutes from './routes/webhook/event';
app.use('/api/webhook-events', eventRoutes);
```

---

## Event Dispatcher Refactor

### Step 5: Refactor getAvailableEventTypes

**File**: `/src/server/lib/events/webhookDispatcher.ts`

Replace the hardcoded function with:

```typescript
import { webhook_event } from '../db/schema';
import { and, eq } from 'drizzle-orm';

export async function getAvailableEventTypes(tenantId: string): Promise<string[]> {
  const events = await db.select().from(webhook_event).where(and(eq(webhook_event.tenantId, tenantId), eq(webhook_event.isActive, true)));
  return events.map(e => e.name);
}
```

Update all usages to use the new async function and pass tenantId.

---

## Client-Side Integration

### Step 6: Create Client-Side Schema

**File**: `/src/client/schemas/webhookEventSchema.ts`

```typescript
import { z } from 'zod';

export const webhookEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});

export type WebhookEventFormData = z.infer<typeof webhookEventSchema>;

export interface WebhookEvent {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEventListResponse {
  success: boolean;
  data: WebhookEvent[];
}
```

### Step 7: Create Webhook Event API Service

**File**: `/src/client/lib/api/webhookEventApi.ts`

```typescript
import axios from 'axios';
import { WebhookEvent, WebhookEventFormData, WebhookEventListResponse } from '@client/schemas/webhookEventSchema';

const BASE_URL = '/api/webhook-events';

export const webhookEventApi = {
  getEvents: async (): Promise<WebhookEventListResponse> => {
    const response = await axios.get<WebhookEventListResponse>(BASE_URL);
    return response.data;
  },
  createEvent: async (data: WebhookEventFormData): Promise<WebhookEvent> => {
    const response = await axios.post<WebhookEvent>(BASE_URL, data);
    return response.data;
  },
  updateEvent: async (id: string, data: WebhookEventFormData): Promise<WebhookEvent> => {
    const response = await axios.put<WebhookEvent>(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
```

### Step 8: Update Integration-Outbound Pages

**Directory**: `/src/client/pages/integration-outbound/`

- Update forms and dropdowns to fetch event options from `webhookEventApi.getEvents()`.
- Use React Query or SWR for data fetching.
- Ensure tenant context is included in API requests.
- Replace static event type lists with dynamic options from API.

---

## Testing & Validation

### Step 9: Backend Testing
- Test all CRUD endpoints for webhook events (valid/invalid tenant, permissions).
- Test event dispatcher logic to ensure only active events are returned per tenant.

### Step 10: Frontend Testing
- Test UI for listing, creating, editing, and deleting webhook events.
- Test integration-outbound forms to ensure event options are loaded from API.

### Step 11: API Documentation
- Verify Swagger docs for all new endpoints.

---

## Completion Checklist
- [ ] Create `webhook_event` table and migration
- [ ] Implement CRUD API endpoints with RBAC and multitenancy
- [ ] Add Swagger documentation
- [ ] Refactor dispatcher to use DB event types
- [ ] Update client-side integration-outbound pages
- [ ] Test backend and frontend functionality
- [ ] Update project documentation

---

## Additional Notes
- **Security:** Enforce RBAC and tenant isolation everywhere.
- **Scalability:** Modular structure allows easy extension for more event types.
- **Validation:** Use Zod for request validation.
- **UI/UX:** Use shadcn/ui components for consistency.
- **Documentation:** Update docs as features evolve.

This guide ensures a robust, scalable, and secure implementation of Master Webhook Events, fully integrated with the base-vibe admin application and its multitenancy architecture.
