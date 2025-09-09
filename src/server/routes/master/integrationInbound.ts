import { Router } from 'express';
import crypto from 'crypto';
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import { integrationInbound, partner } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { 
  integrationInboundInputSchema,
  integrationInboundEditInputSchema,
  integrationInboundQuerySchema 
} from '../../schemas/integrationInboundSchema';

const integrationInboundRoutes = Router();

// Apply authentication middleware to all routes
integrationInboundRoutes.use(authenticated());

/**
 * @swagger
 * /api/master/integration-inbound:
 *   get:
 *     tags:
 *       - Master - Integration Inbound
 *     summary: Get all integration inbound API keys
 *     description: Retrieve a paginated list of integration inbound API keys with filtering and sorting
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
 *           enum: [apiKey, status, createdAt, updatedAt]
 *           default: createdAt
 *         description: Sort field
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
 *         description: Filter by API key
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
 *         description: List of integration inbound API keys
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
 *                     $ref: '#/components/schemas/IntegrationInbound'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
integrationInboundRoutes.get("/", authorized('SYSADMIN', 'master.integrationInbound.view'), async (req, res) => {
  try {
    const queryParams = integrationInboundQuerySchema.parse(req.query);
    const { page, perPage, sort, order, filter, status } = queryParams;
    const offset = (page - 1) * perPage;
    const orderDirection = order === 'desc' ? desc : asc;

    // Build where conditions with tenant isolation
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

    // Get integration inbound keys with partner details
    const keys = await db
      .select({
        id: integrationInbound.id,
        partnerId: integrationInbound.partnerId,
        apiKey: integrationInbound.apiKey,
        description: integrationInbound.description,
        status: integrationInbound.status,
        createdAt: integrationInbound.createdAt,
        updatedAt: integrationInbound.updatedAt,
        partnerName: partner.name,
        partnerCode: partner.code,
      })
      .from(integrationInbound)
      .leftJoin(partner, eq(integrationInbound.partnerId, partner.id))
      .where(and(...whereConditions))
      .limit(perPage)
      .offset(offset)
      .orderBy(
        sort === 'apiKey' ? orderDirection(integrationInbound.apiKey) :
        sort === 'status' ? orderDirection(integrationInbound.status) :
        sort === 'updatedAt' ? orderDirection(integrationInbound.updatedAt) :
        orderDirection(integrationInbound.createdAt)
      );

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(integrationInbound)
      .where(and(...whereConditions));

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / perPage);

    res.json({
      success: true,
      data: keys,
      pagination: {
        page,
        perPage,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching integration inbound keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integration inbound keys'
    });
  }
});

/**
 * @swagger
 * /api/master/integration-inbound:
 *   post:
 *     tags:
 *       - Master - Integration Inbound
 *     summary: Create new integration inbound API key
 *     description: Create a new integration inbound API key for a partner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *               - apiKey
 *             properties:
 *               partnerId:
 *                 type: string
 *                 format: uuid
 *               apiKey:
 *                 type: string
 *                 minLength: 32
 *                 maxLength: 128
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Integration inbound API key created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/IntegrationInbound'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
integrationInboundRoutes.post("/", validateData(integrationInboundInputSchema), authorized('SYSADMIN', 'master.integrationInbound.add'), async (req, res) => {
  try {
    const { partnerId, apiKey, description, status } = req.body;

    // Ensure partner belongs to current tenant
    const partnerCheck = await db
      .select()
      .from(partner)
      .where(and(
        eq(partner.id, partnerId),
        eq(partner.tenantId, req.user!.activeTenantId)
      ));

    if (partnerCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Partner not found or not in your tenant'
      });
    }

    const newKey = await db
      .insert(integrationInbound)
      .values({
        id: crypto.randomUUID(),
        partnerId,
        apiKey,
        description,
        status,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newKey[0]
    });
  } catch (error) {
    console.error('Error creating integration inbound key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create integration inbound key'
    });
  }
});

/**
 * @swagger
 * /api/master/integration-inbound/{id}:
 *   get:
 *     tags:
 *       - Master - Integration Inbound
 *     summary: Get integration inbound API key by ID
 *     description: Retrieve a specific integration inbound API key by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Integration inbound API key ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Integration inbound API key details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/IntegrationInbound'
 *       404:
 *         description: Integration inbound API key not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
integrationInboundRoutes.get("/:id", authorized('SYSADMIN', 'master.integrationInbound.view'), async (req, res) => {
  try {
    const { id } = req.params;

    const foundKey = await db
      .select({
        id: integrationInbound.id,
        partnerId: integrationInbound.partnerId,
        apiKey: integrationInbound.apiKey,
        description: integrationInbound.description,
        status: integrationInbound.status,
        createdAt: integrationInbound.createdAt,
        updatedAt: integrationInbound.updatedAt,
        partnerName: partner.name,
        partnerCode: partner.code,
      })
      .from(integrationInbound)
      .leftJoin(partner, eq(integrationInbound.partnerId, partner.id))
      .where(and(
        eq(integrationInbound.id, id),
        eq(partner.tenantId, req.user!.activeTenantId)
      ))
      .limit(1);

    if (foundKey.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration inbound API key not found'
      });
    }

    res.json({
      success: true,
      data: foundKey[0]
    });
  } catch (error) {
    console.error('Error fetching integration inbound key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integration inbound key'
    });
  }
});

/**
 * @swagger
 * /api/master/integration-inbound/{id}:
 *   put:
 *     tags:
 *       - Master - Integration Inbound
 *     summary: Update integration inbound API key
 *     description: Update an existing integration inbound API key
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Integration inbound API key ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partnerId
 *               - apiKey
 *             properties:
 *               partnerId:
 *                 type: string
 *                 format: uuid
 *               apiKey:
 *                 type: string
 *                 minLength: 32
 *                 maxLength: 128
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Integration inbound API key updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/IntegrationInbound'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Integration inbound API key not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
integrationInboundRoutes.put("/:id", validateData(integrationInboundEditInputSchema), authorized('SYSADMIN', 'master.integrationInbound.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { partnerId, apiKey, description, status } = req.body;

    // Ensure partner belongs to current tenant
    const partnerCheck = await db
      .select()
      .from(partner)
      .where(and(
        eq(partner.id, partnerId),
        eq(partner.tenantId, req.user!.activeTenantId)
      ));

    if (partnerCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Partner not found or not in your tenant'
      });
    }

    const updatedKey = await db
      .update(integrationInbound)
      .set({
        partnerId,
        apiKey,
        description,
        status,
      })
      .where(and(
        eq(integrationInbound.id, id),
        sql`${integrationInbound.partnerId} IN (SELECT id FROM master_partner WHERE tenant_id = ${req.user!.activeTenantId})`
      ))
      .returning();

    if (updatedKey.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration inbound API key not found'
      });
    }

    res.json({
      success: true,
      data: updatedKey[0]
    });
  } catch (error) {
    console.error('Error updating integration inbound key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update integration inbound key'
    });
  }
});

/**
 * @swagger
 * /api/master/integration-inbound/{id}:
 *   delete:
 *     tags:
 *       - Master - Integration Inbound
 *     summary: Delete integration inbound API key
 *     description: Delete an integration inbound API key by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Integration inbound API key ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Integration inbound API key deleted
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
 *         description: Integration inbound API key not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
integrationInboundRoutes.delete("/:id", authorized('SYSADMIN', 'master.integrationInbound.delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db
      .delete(integrationInbound)
      .where(and(
        eq(integrationInbound.id, id),
        sql`${integrationInbound.partnerId} IN (SELECT id FROM master_partner WHERE tenant_id = ${req.user!.activeTenantId})`
      ))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Integration inbound API key not found'
      });
    }

    res.json({
      success: true,
      message: 'Integration inbound API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting integration inbound key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete integration inbound key'
    });
  }
});

export default integrationInboundRoutes;