# Master Partner Implementation Guide

## Overview
This document provides a comprehensive step-by-step guide for implementing the Master Partner feature in the React Admin application. The implementation follows the established patterns and conventions of the project.

## Table of Contents
1. [Server-Side Implementation](#server-side-implementation)
2. [Client-Side Implementation](#client-side-implementation)
3. [Testing & Validation](#testing--validation)
4. [Final Integration](#final-integration)

---

## Server-Side Implementation

### Step 1: Create Master Database Schema

#### 1.1 Create master.ts schema file
**File**: `/src/server/lib/db/schema/master.ts`

Create a new schema file for master data tables:

```typescript
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
export const partnerRelations = relations(partner, ({ one }) => ({
  tenant: one(tenant, {
    fields: [partner.tenantId],
    references: [tenant.id],
  }),
}));

// Type exports
export type Partner = typeof partner.$inferSelect;
export type NewPartner = typeof partner.$inferInsert;
```

#### 1.2 Update database schema index
**File**: `/src/server/lib/db/schema/index.ts`

Add the master schema export:

```typescript
// existing exports...
export * from './system';
export * from './master';  // Add this line
```

#### 1.3 Update tenant relations in system.ts
**File**: `/src/server/lib/db/schema/system.ts`

Update the tenantRelations to include partners:

```typescript
// Update the existing tenantRelations
export const tenantRelations = relations(tenant, ({ many }) => ({
  users: many(userTenant),
  partners: many(partner), // Add this line
}));
```

Add the import for partner at the top of the file:

```typescript
import { partner } from './master';
```

### Step 2: Create Zod Validation Schemas

#### 2.1 Create partner validation schema
**File**: `/src/server/schemas/partnerSchema.ts`

```typescript
import { z } from 'zod';
import { db } from '../lib/db';
import { partner } from '../lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export const partnerAddSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID"),
  code: z.string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, underscores, and hyphens"),
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  picName: z.string()
    .min(1, "PIC Name is required")
    .max(255, "PIC Name must be at most 255 characters"),
  picEmail: z.string()
    .email("Invalid email format")
    .max(255, "PIC Email must be at most 255 characters"),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(["active", "inactive"]).default("active"),
})
.refine(async (data) => {
  // Check unique code per tenant
  const existingByCode = await db
    .select()
    .from(partner)
    .where(and(
      eq(partner.tenantId, data.tenantId),
      sql`lower(${partner.code}) = ${data.code.toLowerCase()}`
    ));
  return existingByCode.length === 0;
}, {
  message: "Partner code already exists in this tenant",
  path: ["code"],
})
.refine(async (data) => {
  // Check unique name per tenant
  const existingByName = await db
    .select()
    .from(partner)
    .where(and(
      eq(partner.tenantId, data.tenantId),
      sql`lower(${partner.name}) = ${data.name.toLowerCase()}`
    ));
  return existingByName.length === 0;
}, {
  message: "Partner name already exists in this tenant",
  path: ["name"],
});

export const partnerEditSchema = z.object({
  id: z.string().uuid("Invalid partner ID"),
  code: z.string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, underscores, and hyphens"),
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  picName: z.string()
    .min(1, "PIC Name is required")
    .max(255, "PIC Name must be at most 255 characters"),
  picEmail: z.string()
    .email("Invalid email format")
    .max(255, "PIC Email must be at most 255 characters"),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(["active", "inactive"]),
})
.refine(async (data) => {
  // Check unique code per tenant (excluding current record)
  const existingByCode = await db
    .select()
    .from(partner)
    .where(and(
      sql`lower(${partner.code}) = ${data.code.toLowerCase()}`,
      sql`${partner.id} != ${data.id}`
    ));
  return existingByCode.length === 0;
}, {
  message: "Partner code already exists",
  path: ["code"],
})
.refine(async (data) => {
  // Check unique name per tenant (excluding current record)
  const existingByName = await db
    .select()
    .from(partner)
    .where(and(
      sql`lower(${partner.name}) = ${data.name.toLowerCase()}`,
      sql`${partner.id} != ${data.id}`
    ));
  return existingByName.length === 0;
}, {
  message: "Partner name already exists",
  path: ["name"],
});

export const partnerQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default("1"),
  perPage: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default("10"),
  sort: z.enum(["code", "name", "picName", "picEmail", "status", "createdAt", "updatedAt"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  filter: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

// Type exports
export type PartnerAddData = z.infer<typeof partnerAddSchema>;
export type PartnerEditData = z.infer<typeof partnerEditSchema>;
export type PartnerQueryParams = z.infer<typeof partnerQuerySchema>;
```

### Step 3: Create API Routes

#### 3.1 Create partner routes directory and file
**Directory**: `/src/server/routes/master/`
**File**: `/src/server/routes/master/partner.ts`

```typescript
import { Router } from 'express';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import { partner } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { partnerAddSchema, partnerEditSchema, partnerQuerySchema } from '../../schemas/partnerSchema';

const partnerRoutes = Router();

// Apply authentication middleware to all routes
partnerRoutes.use(authenticated());

/**
 * @swagger
 * components:
 *   schemas:
 *     Partner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Partner unique identifier
 *         code:
 *           type: string
 *           maxLength: 50
 *           description: Partner code (unique per tenant)
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Partner name
 *         picName:
 *           type: string
 *           maxLength: 255
 *           description: Person in charge name
 *         picEmail:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Person in charge email
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Partner description
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: Partner status
 *         tenantId:
 *           type: string
 *           format: uuid
 *           description: Tenant identifier
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     PartnerInput:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - picName
 *         - picEmail
 *       properties:
 *         code:
 *           type: string
 *           maxLength: 50
 *           pattern: '^[A-Za-z0-9_-]+$'
 *           description: Partner code (unique per tenant)
 *         name:
 *           type: string
 *           maxLength: 255
 *           description: Partner name
 *         picName:
 *           type: string
 *           maxLength: 255
 *           description: Person in charge name
 *         picEmail:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Person in charge email
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Partner description
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Partner status
 */

/**
 * @swagger
 * /api/master/partner:
 *   get:
 *     tags:
 *       - Master - Partner
 *     summary: Get all partners with pagination, sorting, and filtering
 *     description: Retrieve a paginated list of partners with optional filtering and sorting
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [code, name, picName, picEmail, status, createdAt, updatedAt]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Search filter for code, name, or PIC name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of partners with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Partner'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
partnerRoutes.get("/", authorized('ADMIN', 'master.partner.view'), async (req, res) => {
  try {
    const queryParams = partnerQuerySchema.parse(req.query);
    const { page, perPage, sort, order, filter, status } = queryParams;

    const offset = (page - 1) * perPage;
    const orderDirection = order === 'desc' ? desc : asc;

    // Build where conditions
    const whereConditions = [
      eq(partner.tenantId, req.user!.activeTenantId)
    ];

    if (filter) {
      whereConditions.push(
        or(
          ilike(partner.code, `%${filter}%`),
          ilike(partner.name, `%${filter}%`),
          ilike(partner.picName, `%${filter}%`)
        )!
      );
    }

    if (status) {
      whereConditions.push(eq(partner.status, status));
    }

    // Get partners with pagination
    const partners = await db
      .select()
      .from(partner)
      .where(and(...whereConditions))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderDirection(partner[sort as keyof typeof partner]));

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(partner)
      .where(and(...whereConditions));

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / perPage);

    res.json({
      success: true,
      data: partners,
      pagination: {
        page,
        perPage,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners'
    });
  }
});

/**
 * @swagger
 * /api/master/partner:
 *   post:
 *     tags:
 *       - Master - Partner
 *     summary: Create a new partner
 *     description: Create a new partner with the provided data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerInput'
 *     responses:
 *       201:
 *         description: Partner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
partnerRoutes.post("/", validateData(partnerAddSchema), authorized('ADMIN', 'master.partner.create'), async (req, res) => {
  try {
    const { code, name, picName, picEmail, description, status } = req.body;

    const newPartner = await db
      .insert(partner)
      .values({
        id: crypto.randomUUID(),
        code,
        name,
        picName,
        picEmail,
        description,
        status,
        tenantId: req.user!.activeTenantId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newPartner[0]
    });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create partner'
    });
  }
});

/**
 * @swagger
 * /api/master/partner/{id}:
 *   get:
 *     tags:
 *       - Master - Partner
 *     summary: Get partner by ID
 *     description: Retrieve a specific partner by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Partner ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
partnerRoutes.get("/:id", authorized('ADMIN', 'master.partner.view'), async (req, res) => {
  try {
    const { id } = req.params;

    const foundPartner = await db
      .select()
      .from(partner)
      .where(and(
        eq(partner.id, id),
        eq(partner.tenantId, req.user!.activeTenantId)
      ))
      .limit(1);

    if (foundPartner.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: foundPartner[0]
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner'
    });
  }
});

/**
 * @swagger
 * /api/master/partner/{id}:
 *   put:
 *     tags:
 *       - Master - Partner
 *     summary: Update partner by ID
 *     description: Update a specific partner by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Partner ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerInput'
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
partnerRoutes.put("/:id", validateData(partnerEditSchema), authorized('ADMIN', 'master.partner.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, picName, picEmail, description, status } = req.body;

    // Check if partner exists and belongs to tenant
    const existingPartner = await db
      .select()
      .from(partner)
      .where(and(
        eq(partner.id, id),
        eq(partner.tenantId, req.user!.activeTenantId)
      ))
      .limit(1);

    if (existingPartner.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const updatedPartner = await db
      .update(partner)
      .set({
        code,
        name,
        picName,
        picEmail,
        description,
        status,
        updatedAt: new Date(),
      })
      .where(and(
        eq(partner.id, id),
        eq(partner.tenantId, req.user!.activeTenantId)
      ))
      .returning();

    res.json({
      success: true,
      data: updatedPartner[0]
    });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update partner'
    });
  }
});

/**
 * @swagger
 * /api/master/partner/{id}:
 *   delete:
 *     tags:
 *       - Master - Partner
 *     summary: Delete partner by ID
 *     description: Delete a specific partner by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Partner ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Partner not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
partnerRoutes.delete("/:id", authorized('ADMIN', 'master.partner.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if partner exists and belongs to tenant
    const existingPartner = await db
      .select()
      .from(partner)
      .where(and(
        eq(partner.id, id),
        eq(partner.tenantId, req.user!.activeTenantId)
      ))
      .limit(1);

    if (existingPartner.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    await db
      .delete(partner)
      .where(and(
        eq(partner.id, id),
        eq(partner.tenantId, req.user!.activeTenantId)
      ));

    res.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete partner'
    });
  }
});

export default partnerRoutes;
```

#### 3.2 Create master routes index
**File**: `/src/server/routes/master/index.ts`

```typescript
import { Router } from 'express';
import partnerRoutes from './partner';

const masterRoutes = Router();

masterRoutes.use('/partner', partnerRoutes);

export default masterRoutes;
```

#### 3.3 Register master routes in main server file
**File**: `/src/server/main.ts`

Add the master routes import and registration:

```typescript
// Add import for master routes
import masterRoutes from './routes/master';

// Register the routes (add this line after existing route registrations)
app.use('/api/master', masterRoutes);
```

### Step 4: Database Migration

#### 4.1 Generate and apply migration
Run the following commands to generate and apply the database migration:

```bash
# Generate migration for the new partner table
npm run db:generate

# Apply the migration to the database
npm run db:migrate
```

#### 4.2 Verify migration
Check the database to ensure the `master_partner` table has been created with the correct schema.

---

## Client-Side Implementation

### Step 5: Create Client-Side Schema

#### 5.1 Create partner schema for client
**File**: `/src/client/schemas/partnerSchema.ts`

```typescript
import { z } from 'zod';

export const partnerSchema = z.object({
  code: z.string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, underscores, and hyphens"),
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  picName: z.string()
    .min(1, "PIC Name is required")
    .max(255, "PIC Name must be at most 255 characters"),
  picEmail: z.string()
    .email("Invalid email format")
    .max(255, "PIC Email must be at most 255 characters"),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const partnerEditSchema = partnerSchema.extend({
  id: z.string().uuid("Invalid partner ID"),
});

// Type exports
export type PartnerFormData = z.infer<typeof partnerSchema>;
export type PartnerEditFormData = z.infer<typeof partnerEditSchema>;

// Partner type for API responses
export interface Partner {
  id: string;
  code: string;
  name: string;
  picName: string;
  picEmail: string;
  description?: string;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// API response types
export interface PartnerListResponse {
  success: boolean;
  data: Partner[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface PartnerResponse {
  success: boolean;
  data: Partner;
}

// Query parameters
export interface PartnerQueryParams {
  page?: number;
  perPage?: number;
  sort?: 'code' | 'name' | 'picName' | 'picEmail' | 'status' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filter?: string;
  status?: 'active' | 'inactive';
}
```

### Step 6: Create Partner Form Component

#### 6.1 Create partner form component
**File**: `/src/client/components/forms/PartnerForm.tsx`

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Label } from '@client/components/ui/label';
import { Textarea } from '@client/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@client/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { partnerSchema, PartnerFormData, Partner } from '@client/schemas/partnerSchema';

interface PartnerFormProps {
  partner?: Partner;
  onSubmit: (data: PartnerFormData) => Promise<void>;
  isLoading?: boolean;
  isReadOnly?: boolean;
  onCancel?: () => void;
}

export const PartnerForm: React.FC<PartnerFormProps> = ({
  partner,
  onSubmit,
  isLoading = false,
  isReadOnly = false,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      code: partner?.code || '',
      name: partner?.name || '',
      picName: partner?.picName || '',
      picEmail: partner?.picEmail || '',
      description: partner?.description || '',
      status: partner?.status || 'active',
    }
  });

  const statusValue = watch('status');

  const handleFormSubmit = async (data: PartnerFormData) => {
    if (!isReadOnly) {
      await onSubmit(data);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isReadOnly ? 'Partner Details' : partner ? 'Edit Partner' : 'Add New Partner'}
        </CardTitle>
        <CardDescription>
          {isReadOnly 
            ? 'View partner information' 
            : partner 
              ? 'Update the partner information below' 
              : 'Enter the partner information below'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Partner Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="Enter partner code"
                disabled={isReadOnly}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter partner name"
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="picName">PIC Name</Label>
              <Input
                id="picName"
                {...register('picName')}
                placeholder="Enter PIC name"
                disabled={isReadOnly}
                className={errors.picName ? 'border-red-500' : ''}
              />
              {errors.picName && (
                <p className="text-sm text-red-500">{errors.picName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="picEmail">PIC Email</Label>
              <Input
                id="picEmail"
                type="email"
                {...register('picEmail')}
                placeholder="Enter PIC email"
                disabled={isReadOnly}
                className={errors.picEmail ? 'border-red-500' : ''}
              />
              {errors.picEmail && (
                <p className="text-sm text-red-500">{errors.picEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter partner description (optional)"
              disabled={isReadOnly}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : partner ? 'Update Partner' : 'Create Partner'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
```

### Step 7: Create Partner Service/API Layer

#### 7.1 Create partner API service
**File**: `/src/client/lib/api/partnerApi.ts`

```typescript
import axios from 'axios';
import { 
  Partner, 
  PartnerFormData, 
  PartnerListResponse, 
  PartnerResponse, 
  PartnerQueryParams 
} from '@client/schemas/partnerSchema';

const BASE_URL = '/api/master/partner';

export const partnerApi = {
  // Get all partners with pagination and filtering
  getPartners: async (params: PartnerQueryParams = {}): Promise<PartnerListResponse> => {
    const response = await axios.get<PartnerListResponse>(BASE_URL, { params });
    return response.data;
  },

  // Get partner by ID
  getPartner: async (id: string): Promise<PartnerResponse> => {
    const response = await axios.get<PartnerResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new partner
  createPartner: async (data: PartnerFormData): Promise<PartnerResponse> => {
    const response = await axios.post<PartnerResponse>(BASE_URL, data);
    return response.data;
  },

  // Update partner
  updatePartner: async (id: string, data: PartnerFormData): Promise<PartnerResponse> => {
    const response = await axios.put<PartnerResponse>(`${BASE_URL}/${id}`, { ...data, id });
    return response.data;
  },

  // Delete partner
  deletePartner: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};
```

### Step 8: Create Partner Pages

#### 8.1 Create partner pages directory structure
**Directory**: `/src/client/pages/master/partner/`

#### 8.2 Create partner list page
**File**: `/src/client/pages/master/partner/PartnerList.tsx`

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@client/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { DataPagination } from '@client/components/data-pagination';
import { SortButton } from '@client/components/sort-button';
import { Authorized } from '@client/components/auth/Authorized';
import { partnerApi } from '@client/lib/api/partnerApi';
import { Partner, PartnerQueryParams } from '@client/schemas/partnerSchema';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

export const PartnerList: React.FC = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0
  });
  const [queryParams, setQueryParams] = useState<PartnerQueryParams>({
    page: 1,
    perPage: 10,
    sort: 'name',
    order: 'asc',
    filter: '',
    status: undefined
  });

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await partnerApi.getPartners(queryParams);
      setPartners(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSearch = (value: string) => {
    setQueryParams(prev => ({ ...prev, filter: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setQueryParams(prev => ({ 
      ...prev, 
      status: value === 'all' ? undefined : value as 'active' | 'inactive',
      page: 1 
    }));
  };

  const handleSort = (field: string) => {
    setQueryParams(prev => ({
      ...prev,
      sort: field as any,
      order: prev.sort === field && prev.order === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const handlePerPageChange = (perPage: number) => {
    setQueryParams(prev => ({ ...prev, perPage, page: 1 }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete partner "${name}"?`)) {
      try {
        await partnerApi.deletePartner(id);
        fetchPartners(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete partner:', error);
        alert('Failed to delete partner. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Partners</CardTitle>
              <CardDescription>Manage your business partners</CardDescription>
            </div>
            <Authorized permissions="master.partner.create">
              <Button onClick={() => navigate('/console/master/partner/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
            </Authorized>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search partners..."
                  value={queryParams.filter || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={queryParams.status || 'all'}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton
                      field="code"
                      currentSort={queryParams.sort}
                      currentOrder={queryParams.order}
                      onSort={handleSort}
                    >
                      Code
                    </SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton
                      field="name"
                      currentSort={queryParams.sort}
                      currentOrder={queryParams.order}
                      onSort={handleSort}
                    >
                      Name
                    </SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton
                      field="picName"
                      currentSort={queryParams.sort}
                      currentOrder={queryParams.order}
                      onSort={handleSort}
                    >
                      PIC Name
                    </SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton
                      field="picEmail"
                      currentSort={queryParams.sort}
                      currentOrder={queryParams.order}
                      onSort={handleSort}
                    >
                      PIC Email
                    </SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton
                      field="status"
                      currentSort={queryParams.sort}
                      currentOrder={queryParams.order}
                      onSort={handleSort}
                    >
                      Status
                    </SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton
                      field="createdAt"
                      currentSort={queryParams.sort}
                      currentOrder={queryParams.order}
                      onSort={handleSort}
                    >
                      Created
                    </SortButton>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No partners found
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.code}</TableCell>
                      <TableCell>{partner.name}</TableCell>
                      <TableCell>{partner.picName}</TableCell>
                      <TableCell>{partner.picEmail}</TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>
                        {new Date(partner.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Authorized permissions="master.partner.view">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/console/master/partner/${partner.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Authorized>
                          <Authorized permissions="master.partner.edit">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/console/master/partner/${partner.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Authorized>
                          <Authorized permissions="master.partner.delete">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(partner.id, partner.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Authorized>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && partners.length > 0 && (
            <div className="mt-6">
              <DataPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                perPage={pagination.perPage}
                total={pagination.total}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

#### 8.3 Create add partner page
**File**: `/src/client/pages/master/partner/PartnerAdd.tsx`

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PartnerForm } from '@client/components/forms/PartnerForm';
import { partnerApi } from '@client/lib/api/partnerApi';
import { PartnerFormData } from '@client/schemas/partnerSchema';
import { Authorized } from '@client/components/auth/Authorized';

export const PartnerAdd: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: PartnerFormData) => {
    try {
      await partnerApi.createPartner(data);
      navigate('/console/master/partner', { 
        state: { message: 'Partner created successfully' } 
      });
    } catch (error) {
      console.error('Failed to create partner:', error);
      throw new Error('Failed to create partner. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/console/master/partner');
  };

  return (
    <Authorized permissions="master.partner.create">
      <div className="container mx-auto py-6">
        <PartnerForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </Authorized>
  );
};
```

#### 8.4 Create edit partner page
**File**: `/src/client/pages/master/partner/PartnerEdit.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PartnerForm } from '@client/components/forms/PartnerForm';
import { partnerApi } from '@client/lib/api/partnerApi';
import { Partner, PartnerFormData } from '@client/schemas/partnerSchema';
import { Authorized } from '@client/components/auth/Authorized';

export const PartnerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) {
        navigate('/console/master/partner');
        return;
      }

      try {
        const response = await partnerApi.getPartner(id);
        setPartner(response.data);
      } catch (error) {
        console.error('Failed to fetch partner:', error);
        navigate('/console/master/partner');
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id, navigate]);

  const handleSubmit = async (data: PartnerFormData) => {
    if (!id) return;

    try {
      await partnerApi.updatePartner(id, data);
      navigate('/console/master/partner', { 
        state: { message: 'Partner updated successfully' } 
      });
    } catch (error) {
      console.error('Failed to update partner:', error);
      throw new Error('Failed to update partner. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/console/master/partner');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Partner not found</div>
      </div>
    );
  }

  return (
    <Authorized permissions="master.partner.edit">
      <div className="container mx-auto py-6">
        <PartnerForm 
          partner={partner}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </Authorized>
  );
};
```

#### 8.5 Create partner detail/view page
**File**: `/src/client/pages/master/partner/PartnerDetail.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@client/components/ui/button';
import { PartnerForm } from '@client/components/forms/PartnerForm';
import { partnerApi } from '@client/lib/api/partnerApi';
import { Partner, PartnerFormData } from '@client/schemas/partnerSchema';
import { Authorized } from '@client/components/auth/Authorized';
import { ArrowLeft, Edit } from 'lucide-react';

export const PartnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) {
        navigate('/console/master/partner');
        return;
      }

      try {
        const response = await partnerApi.getPartner(id);
        setPartner(response.data);
      } catch (error) {
        console.error('Failed to fetch partner:', error);
        navigate('/console/master/partner');
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/console/master/partner');
  };

  const handleEdit = () => {
    navigate(`/console/master/partner/${id}/edit`);
  };

  // Dummy submit handler (won't be called since form is read-only)
  const handleSubmit = async (data: PartnerFormData) => {
    // No-op for read-only form
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Partner not found</div>
      </div>
    );
  }

  return (
    <Authorized permissions="master.partner.view">
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Button>
          <Authorized permissions="master.partner.edit">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Partner
            </Button>
          </Authorized>
        </div>

        <PartnerForm 
          partner={partner}
          onSubmit={handleSubmit}
          isReadOnly={true}
        />
      </div>
    </Authorized>
  );
};
```

### Step 9: Update Routing

#### 9.1 Update main route configuration
**File**: `/src/client/route.ts`

Add the partner routes to your routing configuration:

```typescript
// Import partner components
import { PartnerList } from '@client/pages/master/partner/PartnerList';
import { PartnerAdd } from '@client/pages/master/partner/PartnerAdd';
import { PartnerEdit } from '@client/pages/master/partner/PartnerEdit';
import { PartnerDetail } from '@client/pages/master/partner/PartnerDetail';

// Add these routes to your router configuration
{
  path: "/console/master/partner",
  element: <PartnerList />,
},
{
  path: "/console/master/partner/add",
  element: <PartnerAdd />,
},
{
  path: "/console/master/partner/:id",
  element: <PartnerDetail />,
},
{
  path: "/console/master/partner/:id/edit",
  element: <PartnerEdit />,
},
```

### Step 10: Update Navigation

#### 10.1 Add partner navigation to sidebar
**File**: Update your sidebar navigation component to include master data navigation

Add a Master section to your navigation with Partner submenu:

```tsx
// In your navigation component, add:
{
  title: "Master Data",
  icon: Database,
  items: [
    {
      title: "Partners",
      href: "/console/master/partner",
      icon: Building2,
      permissions: ["master.partner.view"]
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
   - GET `/api/master/partner` (list with pagination)
   - POST `/api/master/partner` (create)
   - GET `/api/master/partner/{id}` (get by ID)
   - PUT `/api/master/partner/{id}` (update)
   - DELETE `/api/master/partner/{id}` (delete)

#### 12.2 Test authorization
Verify that endpoints properly check for required permissions:
- `master.partner.view`
- `master.partner.create`
- `master.partner.edit`
- `master.partner.delete`

### Step 13: Frontend Testing

#### 13.1 Test partner pages
1. Navigate to `/console/master/partner`
2. Test all functionality:
   - List view with pagination
   - Search and filtering
   - Sorting by different columns
   - Add new partner
   - Edit existing partner
   - View partner details
   - Delete partner

#### 13.2 Test form validation
Verify both client-side and server-side validation:
- Required field validation
- Email format validation
- Code uniqueness validation
- Name uniqueness validation

---

## Final Integration

### Step 14: Update Permissions

#### 14.1 Add master partner permissions to database
Add the following permissions to your permission seeding or through the admin interface:

- `master.partner.view`
- `master.partner.create`
- `master.partner.edit`
- `master.partner.delete`

#### 14.2 Assign permissions to roles
Ensure appropriate roles have the necessary permissions to access partner functionality.

### Step 15: Documentation Updates

#### 15.1 Update project documentation
Add partner module documentation to:
- `/docs/PROJECT_DOCUMENTATION.md`
- `/docs/COMPREHENSIVE_PROJECT_GUIDE.md`

#### 15.2 Create partner-specific documentation
**File**: `/docs/MASTER_PARTNER_USAGE.md`

Create detailed usage documentation for the partner module similar to other component usage docs.

---

## Completion Checklist

### Server-Side Implementation
- [ ] Create `master.ts` database schema
- [ ] Add partner table with proper relations
- [ ] Update tenant relations to include partners
- [ ] Create partner Zod validation schemas
- [ ] Implement partner API routes with CRUD operations
- [ ] Add comprehensive Swagger documentation
- [ ] Implement RBAC authorization for all endpoints
- [ ] Generate and apply database migration
- [ ] Register master routes in main server file

### Client-Side Implementation
- [ ] Create partner client-side schemas
- [ ] Implement PartnerForm component
- [ ] Create partner API service layer
- [ ] Implement PartnerList page with pagination/filtering
- [ ] Implement PartnerAdd page
- [ ] Implement PartnerEdit page
- [ ] Implement PartnerDetail page
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
- [ ] Create partner usage documentation
- [ ] Update comprehensive project guide

---

## Additional Notes

1. **Performance Considerations**: The implementation includes proper indexing on frequently queried columns (code, name, tenantId).

2. **Security**: All endpoints are protected with authentication and authorization middleware following the project's RBAC patterns.

3. **Validation**: Comprehensive validation is implemented on both client and server sides with proper error handling.

4. **UI/UX**: The implementation follows the project's design patterns using shadcn/ui components and maintains consistency with existing pages.

5. **Scalability**: The modular structure allows for easy extension and addition of more master data entities following the same patterns.

This implementation provides a complete, production-ready partner management system that integrates seamlessly with the existing React Admin application architecture.
