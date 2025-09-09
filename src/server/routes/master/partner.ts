import { Router } from 'express';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import { partner } from '../../lib/db/schema';
import { authenticated, authorized } from '../../middleware/authMiddleware';
import { validateData } from '../../middleware/validationMiddleware';
import { partnerInputSchema, partnerAddSchema, partnerEditInputSchema, partnerEditSchema, partnerQuerySchema } from '../../schemas/partnerSchema';

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
partnerRoutes.get("/", authorized('SYSADMIN', 'master.partner.view'), async (req, res) => {
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

    // Define sortable fields mapping
    const sortFields = {
      code: partner.code,
      name: partner.name,
      picName: partner.picName,
      picEmail: partner.picEmail,
      status: partner.status,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };

    // Get partners with pagination
    const partners = await db
      .select()
      .from(partner)
      .where(and(...whereConditions))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderDirection(sortFields[sort]));

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
partnerRoutes.post("/", validateData(partnerInputSchema), authorized('SYSADMIN', 'master.partner.add'), async (req, res) => {
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
partnerRoutes.get("/:id", authorized('SYSADMIN', 'master.partner.view'), async (req, res) => {
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
partnerRoutes.put("/:id", validateData(partnerEditInputSchema), authorized('SYSADMIN', 'master.partner.edit'), async (req, res) => {
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
partnerRoutes.delete("/:id", authorized('SYSADMIN', 'master.partner.delete'), async (req, res) => {
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