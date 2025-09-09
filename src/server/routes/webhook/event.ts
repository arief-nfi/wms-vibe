import { Router } from 'express';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { db } from '../../lib/db';
import { webhook_event } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { webhookEventAddSchema, webhookEventEditSchema, webhookEventQuerySchema } from '../../schemas/webhookEventSchema';

const eventRoutes = Router();
eventRoutes.use(authenticated());

/**
 * @swagger
 * /api/webhook-events:
 *   get:
 *     tags:
 *       - Webhook Events
 *     summary: List webhook events
 *     description: Get paginated list of webhook events for the current tenant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page (default 10)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by event name
 *     responses:
 *       200:
 *         description: List of webhook events
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 */
eventRoutes.get('/', authorized('SYSADMIN', 'webhook.event.view'), async (req, res) => {
  try {
    const tenantId = req.user!.activeTenantId;
    const query = webhookEventQuerySchema.parse(req.query);
    
    // Build where conditions
    let whereConditions = [eq(webhook_event.tenantId, tenantId)];
    
    if (query.isActive !== undefined) {
      whereConditions.push(eq(webhook_event.isActive, query.isActive));
    }
    
    if (query.name) {
      whereConditions.push(sql`${webhook_event.name} ILIKE ${`%${query.name}%`}`);
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(webhook_event)
      .where(and(...whereConditions));

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / query.perPage);

    // Get paginated data
    const events = await db
      .select()
      .from(webhook_event)
      .where(and(...whereConditions))
      .orderBy(desc(webhook_event.createdAt))
      .limit(query.perPage)
      .offset((query.page - 1) * query.perPage);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error listing webhook events:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhook-events:
 *   post:
 *     tags:
 *       - Webhook Events
 *     summary: Create webhook event
 *     description: Create a new webhook event type for the current tenant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "user.created"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Triggered when a new user is created"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Webhook event created successfully
 *       400:
 *         description: Validation error or event name already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 */
eventRoutes.post('/', validateData(webhookEventAddSchema), authorized('SYSADMIN', 'webhook.event.create'), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const tenantId = req.user!.activeTenantId;

    // Check for duplicate event name in tenant (case insensitive)
    const existing = await db
      .select()
      .from(webhook_event)
      .where(and(
        eq(webhook_event.tenantId, tenantId),
        sql`lower(${webhook_event.name}) = ${name.toLowerCase()}`
      ));

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event name already exists in this tenant' 
      });
    }

    const newEvent = await db
      .insert(webhook_event)
      .values({
        id: sql`gen_random_uuid()`,
        name,
        description,
        isActive,
        tenantId,
      })
      .returning();
      
    res.status(201).json({ success: true, data: newEvent[0] });
  } catch (error) {
    console.error('Error creating webhook event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhook-events/{id}:
 *   get:
 *     tags:
 *       - Webhook Events
 *     summary: Get webhook event by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook event details
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Webhook event not found
 */
eventRoutes.get('/:id', authorized('SYSADMIN', 'webhook.event.view'), async (req, res) => {
  try {
    const tenantId = req.user!.activeTenantId;
    const { id } = req.params;

    const event = await db
      .select()
      .from(webhook_event)
      .where(and(eq(webhook_event.id, id), eq(webhook_event.tenantId, tenantId)));

    if (event.length === 0) {
      return res.status(404).json({ success: false, message: 'Webhook event not found' });
    }

    res.json({ success: true, data: event[0] });
  } catch (error) {
    console.error('Error fetching webhook event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhook-events/{id}:
 *   put:
 *     tags:
 *       - Webhook Events
 *     summary: Update webhook event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook event updated successfully
 *       400:
 *         description: Validation error or event name already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Webhook event not found
 */
eventRoutes.put('/:id', validateData(webhookEventEditSchema), authorized('SYSADMIN', 'webhook.event.edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const tenantId = req.user!.activeTenantId;
    
    // Ensure event exists and belongs to tenant
    const existingEvent = await db
      .select()
      .from(webhook_event)
      .where(and(eq(webhook_event.id, id), eq(webhook_event.tenantId, tenantId)));

    if (existingEvent.length === 0) {
      return res.status(404).json({ success: false, message: 'Webhook event not found' });
    }

    // Check for duplicate event name in tenant (case insensitive), excluding current record
    const duplicateCheck = await db
      .select()
      .from(webhook_event)
      .where(and(
        eq(webhook_event.tenantId, tenantId),
        sql`${webhook_event.id} != ${id}`,
        sql`lower(${webhook_event.name}) = ${name.toLowerCase()}`
      ));

    if (duplicateCheck.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event name already exists in this tenant' 
      });
    }

    const updated = await db
      .update(webhook_event)
      .set({ 
        name, 
        description, 
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(webhook_event.id, id))
      .returning();
      
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Error updating webhook event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/webhook-events/{id}:
 *   delete:
 *     tags:
 *       - Webhook Events
 *     summary: Delete webhook event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Webhook event deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Webhook event not found
 */
eventRoutes.delete('/:id', authorized('SYSADMIN', 'webhook.event.delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user!.activeTenantId;

    // Ensure event exists and belongs to tenant
    const existingEvent = await db
      .select()
      .from(webhook_event)
      .where(and(eq(webhook_event.id, id), eq(webhook_event.tenantId, tenantId)));

    if (existingEvent.length === 0) {
      return res.status(404).json({ success: false, message: 'Webhook event not found' });
    }

    await db.delete(webhook_event).where(eq(webhook_event.id, id));

    res.json({ success: true, message: 'Webhook event deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default eventRoutes;