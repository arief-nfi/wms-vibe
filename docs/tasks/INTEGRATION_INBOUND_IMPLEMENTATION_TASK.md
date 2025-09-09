
# Integration-Inbound Implementation Guide

## Overview
This document provides a comprehensive step-by-step guide for implementing the Integration-Inbound feature in the base-vibe admin application. The goal is to manage API keys for partners, enabling secure access to your API. The implementation follows the established patterns and conventions of the project, including multitenancy support.

## Table of Contents
1. [Server-Side Implementation](#server-side-implementation)
2. [Client-Side Implementation](#client-side-implementation)
3. [Testing & Validation](#testing--validation)
4. [Final Integration](#final-integration)
5. [Completion Checklist](#completion-checklist)

---

## Server-Side Implementation

### Step 1: Create Integration-Inbound Database Schema

#### 1.1 Create integrationInbound.ts schema file
**File**: `/src/server/lib/db/schema/integrationInbound.ts`

Create a new schema file for integration inbound API keys:

```typescript
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
```

#### 1.2 Update database schema index
**File**: `/src/server/lib/db/schema/index.ts`

Add the integration inbound schema export:

```typescript
// ...existing exports...
export * from './integrationInbound'; // Add this line
```

#### 1.3 Update partner relations in master.ts
**File**: `/src/server/lib/db/schema/master.ts`

Update the partnerRelations to include integration inbound keys:

```typescript
// Update the existing partnerRelations
export const partnerRelations = relations(partner, ({ many }) => ({
  tenant: one(tenant, {
    fields: [partner.tenantId],
    references: [tenant.id],
  }),
  integrationInbounds: many(integrationInbound), // Add this line
}));
```

---

### Step 2: Create Zod Validation Schemas

#### 2.1 Create integration inbound validation schema
**File**: `/src/server/schemas/integrationInboundSchema.ts`

```typescript
import { z } from 'zod';

export const integrationInboundAddSchema = z.object({
  partnerId: z.string().uuid("Invalid partner ID"),
  apiKey: z.string().min(32, "API Key must be at least 32 characters").max(128, "API Key too long"),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const integrationInboundEditSchema = integrationInboundAddSchema.extend({
  id: z.string().uuid("Invalid integration inbound ID"),
});

export const integrationInboundQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default("1"),
  perPage: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default("10"),
  sort: z.enum(["apiKey", "status", "createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
  filter: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type IntegrationInboundAddData = z.infer<typeof integrationInboundAddSchema>;
export type IntegrationInboundEditData = z.infer<typeof integrationInboundEditSchema>;
export type IntegrationInboundQueryParams = z.infer<typeof integrationInboundQuerySchema>;
```

---

### Step 3: Create API Routes

#### 3.1 Create integration inbound routes directory and file
**Directory**: `/src/server/routes/master/`
**File**: `/src/server/routes/master/integrationInbound.ts`

Implement CRUD endpoints with authentication and RBAC:

```typescript
import { Router } from 'express';
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import { integrationInbound } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { integrationInboundAddSchema, integrationInboundEditSchema, integrationInboundQuerySchema } from '../../schemas/integrationInboundSchema';

const integrationInboundRoutes = Router();
integrationInboundRoutes.use(authenticated());

// List API keys
integrationInboundRoutes.get('/', authorized('ADMIN', 'master.integrationInbound.view'), async (req, res) => {
  try {
    const queryParams = integrationInboundQuerySchema.parse(req.query);
    const { page, perPage, sort, order, filter, status } = queryParams;
    const offset = (page - 1) * perPage;
    const orderDirection = order === 'desc' ? desc : asc;
    const whereConditions = [
      // Multitenancy: only show keys for partners in current tenant
      sql`${integrationInbound.partnerId} IN (SELECT id FROM master_partner WHERE tenant_id = ${req.user!.activeTenantId})`
    ];
    if (filter) {
      whereConditions.push(ilike(integrationInbound.apiKey, `%${filter}%`));
    }
    if (status) {
      whereConditions.push(eq(integrationInbound.status, status));
    }
    const keys = await db
      .select()
      .from(integrationInbound)
      .where(and(...whereConditions))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderDirection(integrationInbound[sort as keyof typeof integrationInbound]));
    const totalResult = await db
      .select({ count: count() })
      .from(integrationInbound)
      .where(and(...whereConditions));
    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / perPage);
    res.json({
      success: true,
      data: keys,
      pagination: { page, perPage, total, totalPages }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch API keys' });
  }
});

// Create API key
integrationInboundRoutes.post('/', validateData(integrationInboundAddSchema), authorized('ADMIN', 'master.integrationInbound.create'), async (req, res) => {
  try {
    const { partnerId, apiKey, description, status } = req.body;
    // Ensure partner belongs to current tenant
    const partnerCheck = await db.select().from('master_partner').where(and(
      eq('id', partnerId),
      eq('tenant_id', req.user!.activeTenantId)
    ));
    if (partnerCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Partner not found or not in tenant' });
    }
    const newKey = await db.insert(integrationInbound).values({
      id: crypto.randomUUID(),
      partnerId,
      apiKey,
      description,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    res.status(201).json({ success: true, data: newKey[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create API key' });
  }
});

// Get API key by ID
integrationInboundRoutes.get('/:id', authorized('ADMIN', 'master.integrationInbound.view'), async (req, res) => {
  try {
    const { id } = req.params;
    const foundKey = await db.select().from(integrationInbound).where(and(
      eq(integrationInbound.id, id),
      sql`${integrationInbound.partnerId} IN (SELECT id FROM master_partner WHERE tenant_id = ${req.user!.activeTenantId})`
    )).limit(1);
    if (foundKey.length === 0) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }
    res.json({ success: true, data: foundKey[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch API key' });
  }
});

// Update API key
integrationInboundRoutes.put('/:id', validateData(integrationInboundEditSchema), authorized('ADMIN', 'master.integrationInbound.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { partnerId, apiKey, description, status } = req.body;
    // Ensure partner belongs to current tenant
    const partnerCheck = await db.select().from('master_partner').where(and(
      eq('id', partnerId),
      eq('tenant_id', req.user!.activeTenantId)
    ));
    if (partnerCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Partner not found or not in tenant' });
    }
    const updatedKey = await db.update(integrationInbound).set({
      partnerId,
      apiKey,
      description,
      status,
      updatedAt: new Date(),
    }).where(and(
      eq(integrationInbound.id, id),
      sql`${integrationInbound.partnerId} IN (SELECT id FROM master_partner WHERE tenant_id = ${req.user!.activeTenantId})`
    )).returning();
    if (updatedKey.length === 0) {
      return res.status(404).json({ success: false, message: 'API key not found' });
    }
    res.json({ success: true, data: updatedKey[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update API key' });
  }
});

// Delete API key
integrationInboundRoutes.delete('/:id', authorized('ADMIN', 'master.integrationInbound.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.delete(integrationInbound).where(and(
      eq(integrationInbound.id, id),
      sql`${integrationInbound.partnerId} IN (SELECT id FROM master_partner WHERE tenant_id = ${req.user!.activeTenantId})`
    ));
    res.json({ success: true, message: 'API key deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete API key' });
  }
});

export default integrationInboundRoutes;
```

#### 3.2 Create master routes index
**File**: `/src/server/routes/master/index.ts`

Add the integration inbound routes:

```typescript
import integrationInboundRoutes from './integrationInbound';
// ...existing imports...
masterRoutes.use('/integration-inbound', integrationInboundRoutes);
```

#### 3.3 Register master routes in main server file
**File**: `/src/server/main.ts`

Add the master routes import and registration:

```typescript
import masterRoutes from './routes/master';
app.use('/api/master', masterRoutes);
```

---

### Step 4: Database Migration

#### 4.1 Generate and apply migration
Run the following commands to generate and apply the database migration:

```bash
# Generate migration for the new integration inbound table
npm run db:generate

# Apply the migration to the database
npm run db:migrate
```

#### 4.2 Verify migration
Check the database to ensure the `integration_inbound` table has been created with the correct schema.

---

## Client-Side Implementation

### Step 5: Create Client-Side Schema

#### 5.1 Create integration inbound schema for client
**File**: `/src/client/schemas/integrationInboundSchema.ts`

```typescript
import { z } from 'zod';

export const integrationInboundSchema = z.object({
  partnerId: z.string().uuid("Invalid partner ID"),
  apiKey: z.string().min(32, "API Key must be at least 32 characters").max(128, "API Key too long"),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const integrationInboundEditSchema = integrationInboundSchema.extend({
  id: z.string().uuid("Invalid integration inbound ID"),
});

export type IntegrationInboundFormData = z.infer<typeof integrationInboundSchema>;
export type IntegrationInboundEditFormData = z.infer<typeof integrationInboundEditSchema>;

export interface IntegrationInbound {
  id: string;
  partnerId: string;
  apiKey: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationInboundListResponse {
  success: boolean;
  data: IntegrationInbound[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface IntegrationInboundResponse {
  success: boolean;
  data: IntegrationInbound;
}

export interface IntegrationInboundQueryParams {
  page?: number;
  perPage?: number;
  sort?: 'apiKey' | 'status' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filter?: string;
  status?: 'active' | 'inactive';
}
```

---

### Step 6: Create IntegrationInbound Form Component

#### 6.1 Create integration inbound form component
**File**: `/src/client/components/forms/IntegrationInboundForm.tsx`

Create a form component using shadcn/ui and Zod validation, similar to PartnerForm.

---

### Step 7: Create IntegrationInbound Service/API Layer

#### 7.1 Create integration inbound API service
**File**: `/src/client/lib/api/integrationInboundApi.ts`

Implement CRUD methods using axios, similar to partnerApi.

---

### Step 8: Create IntegrationInbound Pages

#### 8.1 Create integration inbound pages directory structure
**Directory**: `/src/client/pages/master/integration-inbound/`

#### 8.2 Create integration inbound list page
**File**: `/src/client/pages/master/integration-inbound/IntegrationInboundList.tsx`

Implement list, filter, and pagination UI, similar to PartnerList.

#### 8.3 Create add integration inbound page
**File**: `/src/client/pages/master/integration-inbound/IntegrationInboundAdd.tsx`

#### 8.4 Create edit integration inbound page
**File**: `/src/client/pages/master/integration-inbound/IntegrationInboundEdit.tsx`

#### 8.5 Create integration inbound detail/view page
**File**: `/src/client/pages/master/integration-inbound/IntegrationInboundDetail.tsx`

---

### Step 9: Update Routing

#### 9.1 Update main route configuration
**File**: `/src/client/route.ts`

Add the integration inbound routes to your routing configuration:

```typescript
import { IntegrationInboundList } from '@client/pages/master/integration-inbound/IntegrationInboundList';
import { IntegrationInboundAdd } from '@client/pages/master/integration-inbound/IntegrationInboundAdd';
import { IntegrationInboundEdit } from '@client/pages/master/integration-inbound/IntegrationInboundEdit';
import { IntegrationInboundDetail } from '@client/pages/master/integration-inbound/IntegrationInboundDetail';

{
  path: "/console/master/integration-inbound",
  element: <IntegrationInboundList />,
},
{
  path: "/console/master/integration-inbound/add",
  element: <IntegrationInboundAdd />,
},
{
  path: "/console/master/integration-inbound/:id",
  element: <IntegrationInboundDetail />,
},
{
  path: "/console/master/integration-inbound/:id/edit",
  element: <IntegrationInboundEdit />,
},
```

---

### Step 10: Update Navigation

#### 10.1 Add integration inbound navigation to sidebar
Update your sidebar navigation component to include Integration-Inbound menu item:

```tsx
{
  title: "Master Data",
  icon: Database,
  items: [
    {
      title: "Integration Inbound",
      href: "/console/master/integration-inbound",
      icon: Key,
      permissions: ["master.integrationInbound.view"]
    }
  ]
}
```

---

## Testing & Validation

### Step 11: Database Testing

#### 11.1 Verify database schema
```bash
# Open database studio to verify the table structure
npm run db:studio
```

#### 11.2 Test database operations
Create a simple test script to verify CRUD operations work correctly.

### Step 12: API Testing

#### 12.1 Test API endpoints using Swagger
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/api-docs`
3. Test each endpoint:
   - GET `/api/master/integration-inbound` (list with pagination)
   - POST `/api/master/integration-inbound` (create)
   - GET `/api/master/integration-inbound/{id}` (get by ID)
   - PUT `/api/master/integration-inbound/{id}` (update)
   - DELETE `/api/master/integration-inbound/{id}` (delete)

#### 12.2 Test authorization
Verify that endpoints properly check for required permissions:
- `master.integrationInbound.view`
- `master.integrationInbound.create`
- `master.integrationInbound.edit`
- `master.integrationInbound.delete`

### Step 13: Frontend Testing

#### 13.1 Test integration inbound pages
1. Navigate to `/console/master/integration-inbound`
2. Test all functionality:
   - List view with pagination
   - Search and filtering
   - Sorting by different columns
   - Add new API key
   - Edit existing API key
   - View API key details
   - Delete API key

#### 13.2 Test form validation
Verify both client-side and server-side validation:
- Required field validation
- API key length validation
- Partner selection validation

---

## Final Integration

### Step 14: Update Permissions

#### 14.1 Add integration inbound permissions to database
Add the following permissions to your permission seeding or through the admin interface:

- `master.integrationInbound.view`
- `master.integrationInbound.create`
- `master.integrationInbound.edit`
- `master.integrationInbound.delete`

#### 14.2 Assign permissions to roles
Ensure appropriate roles have the necessary permissions to access integration inbound functionality.

### Step 15: Documentation Updates

#### 15.1 Update project documentation
Add integration inbound module documentation to:
- `/docs/PROJECT_DOCUMENTATION.md`
- `/docs/COMPREHENSIVE_PROJECT_GUIDE.md`

#### 15.2 Create integration inbound-specific documentation
**File**: `/docs/INTEGRATION_INBOUND_USAGE.md`

Create detailed usage documentation for the integration inbound module similar to other component usage docs.

---

## Completion Checklist

### Server-Side Implementation
- [ ] Create `integrationInbound.ts` database schema
- [ ] Add integration inbound table with proper relations
- [ ] Update partner relations to include integration inbound keys
- [ ] Create integration inbound Zod validation schemas
- [ ] Implement integration inbound API routes with CRUD operations
- [ ] Add comprehensive Swagger documentation
- [ ] Implement RBAC authorization for all endpoints
- [ ] Generate and apply database migration
- [ ] Register master routes in main server file

### Client-Side Implementation
- [ ] Create integration inbound client-side schemas
- [ ] Implement IntegrationInboundForm component
- [ ] Create integration inbound API service layer
- [ ] Implement IntegrationInboundList page with pagination/filtering
- [ ] Implement IntegrationInboundAdd page
- [ ] Implement IntegrationInboundEdit page
- [ ] Implement IntegrationInboundDetail page
- [ ] Update routing configuration
- [ ] Update navigation sidebar

### Testing & Validation
- [ ] Test database schema and operations
- [ ] Test all API endpoints via Swagger
- [ ] Test RBAC authorization
- [ ] Test frontend functionality
- [ ] Test form validation (client and server)
- [ ] Add required permissions to database
- [ ] Assign permissions to appropriate roles

### Documentation
- [ ] Update project documentation
- [ ] Create integration inbound usage documentation
- [ ] Update comprehensive project guide

---

## Additional Notes

1. **Security**: API keys should be securely generated and stored. Never expose raw API keys in logs or UI.
2. **Multitenancy**: All operations must enforce tenant isolation for partners and their API keys.
3. **Validation**: Comprehensive validation is implemented on both client and server sides with proper error handling.
4. **UI/UX**: The implementation follows the project's design patterns using shadcn/ui components and maintains consistency with existing pages.
5. **Scalability**: The modular structure allows for easy extension and addition of more integration entities following the same patterns.

This implementation provides a complete, production-ready integration inbound management system that integrates seamlessly with the existing React Admin application architecture.
