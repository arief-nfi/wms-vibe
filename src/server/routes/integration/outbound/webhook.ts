import { Router } from 'express';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { webhook, partner } from '../../../lib/db/schema';
import { authenticated, authorized } from '../../../middleware/authMiddleware';
import { validateData } from '../../../middleware/validationMiddleware';
import { webhookAddSchema, webhookEditSchema, webhookQuerySchema } from '../../../schemas/webhookSchema';

const webhookRoutes = Router();
webhookRoutes.use(authenticated());

/**
 * @swagger
 * /api/integration/outbound/webhook:
 *   get:
 *     tags:
 *       - Integration Outbound
 *     summary: List webhooks
 *     description: Get paginated list of webhooks with filtering options
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
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of webhooks
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
 *                     $ref: '#/components/schemas/Webhook'
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
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 */
webhookRoutes.get('/', authorized('SYSADMIN', 'master.webhook.view'), async (req, res) => {
  try {

    const query = webhookQuerySchema.parse(req.query);
    
    // Build where conditions
    let whereConditions = [eq(webhook.tenantId, req.user!.activeTenantId)];
    
    if (query.eventType) {
      whereConditions.push(eq(webhook.eventType, query.eventType));
    }
    
    if (query.isActive !== undefined) {
      whereConditions.push(eq(webhook.isActive, query.isActive));
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(webhook)
      .where(and(...whereConditions));

    const total = totalResult[0].count;
    const totalPages = Math.ceil(total / query.perPage);

    // Get paginated data with partner info
    const webhooks = await db
      .select({
        id: webhook.id,
        partnerId: webhook.partnerId,
        tenantId: webhook.tenantId,
        eventType: webhook.eventType,
        url: webhook.url,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
        partnerName: partner.name,
        partnerCode: partner.code,
      })
      .from(webhook)
      .leftJoin(partner, eq(webhook.partnerId, partner.id))
      .where(and(...whereConditions))
      .orderBy(desc(webhook.createdAt))
      .limit(query.perPage)
      .offset((query.page - 1) * query.perPage);

    res.json({
      success: true,
      data: webhooks,
      pagination: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integration/outbound/webhook:
 *   post:
 *     tags:
 *       - Integration Outbound
 *     summary: Create webhook
 *     description: Create a new webhook for event notifications
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
 *               - eventType
 *               - url
 *             properties:
 *               partnerId:
 *                 type: string
 *                 format: uuid
 *               eventType:
 *                 type: string
 *                 maxLength: 100
 *               url:
 *                 type: string
 *                 format: uri
 *                 maxLength: 1000
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Webhook created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 */
webhookRoutes.post('/', validateData(webhookAddSchema), authorized('SYSADMIN', 'master.webhook.create'), async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure partner belongs to the same tenant
    const partnerCheck = await db
      .select()
      .from(partner)
      .where(and(eq(partner.id, data.partnerId), eq(partner.tenantId, req.user!.activeTenantId)));

    if (partnerCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid partner' });
    }

    // Create webhook
    const newWebhook = await db
      .insert(webhook)
      .values({
        id: sql`gen_random_uuid()`,
        partnerId: data.partnerId,
        tenantId: req.user!.activeTenantId,
        eventType: data.eventType,
        url: data.url,
        isActive: data.isActive,
      })
      .returning();

    res.status(201).json({ success: true, data: newWebhook[0] });
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integration/outbound/webhook/{id}:
 *   get:
 *     tags:
 *       - Integration Outbound
 *     summary: Get webhook by ID
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
 *         description: Webhook details
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Webhook not found
 */
webhookRoutes.get('/:id', authorized('SYSADMIN', 'master.webhook.view'), async (req, res) => {
  try {

    const webhookData = await db
      .select({
        id: webhook.id,
        partnerId: webhook.partnerId,
        tenantId: webhook.tenantId,
        eventType: webhook.eventType,
        url: webhook.url,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
        partnerName: partner.name,
        partnerCode: partner.code,
      })
      .from(webhook)
      .leftJoin(partner, eq(webhook.partnerId, partner.id))
      .where(and(eq(webhook.id, req.params.id), eq(webhook.tenantId, req.user!.activeTenantId)));

    if (webhookData.length === 0) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    res.json({ success: true, data: webhookData[0] });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integration/outbound/webhook/{id}:
 *   put:
 *     tags:
 *       - Integration Outbound
 *     summary: Update webhook
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
 *               - partnerId
 *               - eventType
 *               - url
 *             properties:
 *               partnerId:
 *                 type: string
 *                 format: uuid
 *               eventType:
 *                 type: string
 *                 maxLength: 100
 *               url:
 *                 type: string
 *                 format: uri
 *                 maxLength: 1000
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Webhook not found
 */
webhookRoutes.put('/:id', validateData(webhookEditSchema), authorized('SYSADMIN', 'master.webhook.edit'), async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure webhook exists and belongs to tenant
    const existingWebhook = await db
      .select()
      .from(webhook)
      .where(and(eq(webhook.id, req.params.id), eq(webhook.tenantId, req.user!.activeTenantId)));

    if (existingWebhook.length === 0) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    // Ensure partner belongs to the same tenant
    const partnerCheck = await db
      .select()
      .from(partner)
      .where(and(eq(partner.id, data.partnerId), eq(partner.tenantId, req.user!.activeTenantId)));

    if (partnerCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid partner' });
    }

    // Update webhook
    const updatedWebhook = await db
      .update(webhook)
      .set({
        partnerId: data.partnerId,
        eventType: data.eventType,
        url: data.url,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(webhook.id, req.params.id))
      .returning();

    res.json({ success: true, data: updatedWebhook[0] });
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integration/outbound/webhook/{id}:
 *   delete:
 *     tags:
 *       - Integration Outbound
 *     summary: Delete webhook
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
 *         description: Webhook deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Webhook not found
 */
webhookRoutes.delete('/:id', authorized('SYSADMIN', 'master.webhook.delete'), async (req, res) => {
  try {

    // Ensure webhook exists and belongs to tenant
    const existingWebhook = await db
      .select()
      .from(webhook)
      .where(and(eq(webhook.id, req.params.id), eq(webhook.tenantId, req.user!.activeTenantId)));

    if (existingWebhook.length === 0) {
      return res.status(404).json({ success: false, message: 'Webhook not found' });
    }

    // Delete webhook
    await db.delete(webhook).where(eq(webhook.id, req.params.id));

    res.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/integration/outbound/webhook/test-event:
 *   post:
 *     tags:
 *       - Integration Outbound
 *     summary: Test webhook delivery
 *     description: Manually trigger a test webhook event to verify webhook delivery
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: "user.created"
 *               testData:
 *                 type: object
 *                 example: {"userId": "123", "email": "test@example.com"}
 *     responses:
 *       200:
 *         description: Test webhook dispatched successfully
 *       400:
 *         description: Invalid event type
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Insufficient permissions
 */
webhookRoutes.post('/test-event', authorized('SYSADMIN', 'master.webhook.view'), async (req, res) => {
  try {
    const { eventType, testData } = req.body;
    
    if (!eventType) {
      return res.status(400).json({ success: false, message: 'Event type is required' });
    }

    console.log(`🧪 [TEST WEBHOOK] Manual webhook test triggered by user for event: ${eventType}`);
    
    // Import the dispatcher function
    const { dispatchWebhooks } = await import('../../../lib/events/webhookDispatcher');
    
    // Dispatch the test webhook
    await dispatchWebhooks(eventType, req.user!.activeTenantId, {
      test: true,
      triggeredBy: 'manual-test',
      timestamp: new Date().toISOString(),
      ...testData
    });

    res.json({ 
      success: true, 
      message: `Test webhook event '${eventType}' dispatched successfully. Check console logs for delivery details.`
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default webhookRoutes;