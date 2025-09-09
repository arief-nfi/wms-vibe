# Integration API (Inbound API Key Auth) Implementation Guide

## Overview
This guide describes how to add an integration API endpoint (`/int/partner`) that authenticates requests using inbound API keys. The endpoint will return partner info in JSON. The steps follow the base-vibe conventions, including multitenancy and Swagger documentation.

## Table of Contents
1. Server-Side Implementation
2. API Key Authentication Middleware
3. API Endpoint Implementation
4. Swagger Documentation
5. Testing & Validation
6. Completion Checklist

---

## Server-Side Implementation

### Step 1: Create API Key Authentication Middleware
**File**: `/src/server/middleware/integrationApiKeyMiddleware.ts`

- Implement middleware to check for API key in request header (e.g., `x-api-key`).
- Validate the API key against the `integration_inbound` table, ensuring the key is active and belongs to a partner in the current tenant.
- Attach the partner info to `req.partner` if valid, else return 401 Unauthorized.

```typescript
import { db } from '../lib/db';
import { integrationInbound, partner } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function integrationApiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ success: false, message: 'API key required' });
  }
  const keyRecord = await db.select().from(integrationInbound)
    .where(eq(integrationInbound.apiKey, apiKey))
    .limit(1);
  if (!keyRecord.length || keyRecord[0].status !== 'active') {
    return res.status(401).json({ success: false, message: 'Invalid or inactive API key' });
  }
  // Get partner info
  const partnerRecord = await db.select().from(partner)
    .where(eq(partner.id, keyRecord[0].partnerId))
    .limit(1);
  if (!partnerRecord.length) {
    return res.status(401).json({ success: false, message: 'Partner not found' });
  }
  req.partner = partnerRecord[0];
  next();
}
```

---

### Step 2: Create Integration API Route
**Directory**: `/src/server/routes/int/`
**File**: `/src/server/routes/int/partner.ts`

- Create a new Express route file for `/int/partner`.
- Use the API key middleware for authentication.
- Return the partner info in JSON.
- Add Swagger JSDoc for documentation.

```typescript
import { Router } from 'express';
import { integrationApiKeyMiddleware } from '../../middleware/integrationApiKeyMiddleware';

const intPartnerRoutes = Router();

/**
 * @swagger
 * /int/partner:
 *   get:
 *     tags:
 *       - Integration
 *     summary: Get partner info by inbound API key
 *     description: Returns partner info for the authenticated API key
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Inbound API key
 *     responses:
 *       200:
 *         description: Partner info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       401:
 *         description: Invalid or missing API key
 */
intPartnerRoutes.get('/', integrationApiKeyMiddleware, async (req, res) => {
  res.json({ success: true, data: req.partner });
});

export default intPartnerRoutes;
```

---

### Step 3: Register Integration API Route
**File**: `/src/server/routes/int/index.ts`

```typescript
import { Router } from 'express';
import intPartnerRoutes from './partner';

const intRoutes = Router();
intRoutes.use('/partner', intPartnerRoutes);
export default intRoutes;
```

**File**: `/src/server/main.ts`

```typescript
import intRoutes from './routes/int';
app.use('/int', intRoutes);
```

---

### Step 4: Add Swagger Schema for Partner
Ensure the `Partner` schema is defined in Swagger JSDoc (usually in your main Swagger config or partner API docs):

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Partner:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         name:
 *           type: string
 *         picName:
 *           type: string
 *         picEmail:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *         tenantId:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
```

---

## Testing & Validation

1. Start the server: `npm run dev`
2. Use a REST client (e.g., Postman) to call `GET /int/partner` with a valid `x-api-key` header.
3. Verify the response contains the correct partner info.
4. Test with missing/invalid API key to ensure 401 is returned.
5. Check Swagger UI (`/api-docs`) for endpoint documentation.

---

## Completion Checklist
- [ ] Create API key authentication middleware
- [ ] Create `/int/partner` route
- [ ] Register route in Express
- [ ] Add Swagger JSDoc for endpoint and schema
- [ ] Test endpoint with valid/invalid API keys
- [ ] Update documentation

---

## Additional Notes
- Ensure API keys are kept secret and never logged.
- Enforce multitenancy by validating partner and tenant relations.
- Follow existing code and documentation patterns for consistency.

This guide provides a complete, production-ready approach for adding an integration API endpoint authenticated by inbound API keys.
