import bcrypt from 'bcryptjs';
import { and, asc, count, desc, eq, ilike, ne, or, sql } from 'drizzle-orm';
import { Router } from 'express';
import { db } from 'src/server/lib/db';
import { role, tenant, user, userRole, userTenant } from "src/server/lib/db/schema/system";
import { authenticated, authorized, hasRoles } from 'src/server/middleware/authMiddleware';
import { validateData } from 'src/server/middleware/validationMiddleware';
import { tenantCodeValidationSchema, tenantSchema } from 'src/server/schemas/tenantSchema';

const tenantRoutes = Router();
tenantRoutes.use(authenticated());

/**
 * @swagger
 * /api/system/tenant:
 *   get:
 *     tags:
 *       - System - Tenant
 *     summary: Get all tenants
 *     description: Retrieve a list of all tenants
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: code
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: asc
 *         description: Sort order (asc or desc)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           default: ''
 *         description: Filter by name
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tenants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The tenant ID
 *         code:
 *           type: string
 *           description: The code of the tenant
 *         name:
 *           type: string
 *           description: The name of the tenant
 *         description:
 *           type: string
 *           description: A description of the tenant
 */
tenantRoutes.get('/', authorized('SYSADMIN', 'system.tenant.view'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get pagination params from URL
  const pageParam = req.query.page as string;
  const perPageParam = req.query.perPage as string;
  const sortParam = req.query.sort || 'code';
  const orderParam = req.query.order || 'asc';
  const filterParam = req.query.filter || '';

  // Map allowed sort keys to columns
  const sortColumns = {
    id: tenant.id,
    code: tenant.code,
    name: tenant.name,
    description: tenant.description
    // add other columns as needed
  } as const;

  // Fallback to 'name' if sortParam is not a valid key
  const sortColumn = sortColumns[sortParam as keyof typeof sortColumns] || tenant.name;

  const page = pageParam ? parseInt(pageParam) : 1;
  const perPage = perPageParam ? parseInt(perPageParam) : 10;
  const offset = (page - 1) * perPage;

  // Build filter condition
  const filterCondition = filterParam
    ? and(
      or(
        ilike(tenant.code, `%${filterParam}%`),
        ilike(tenant.name, `%${filterParam}%`),
        ilike(tenant.description, `%${filterParam}%`)
      ),
      eq(tenant.id, req.user!.activeTenantId)
    )
    : eq(tenant.id, req.user!.activeTenantId);

  // TODO: check filter param

  // Get total count with filter
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(tenant)
    .where(filterCondition);

  // Get paginated, sorted, filtered permissions
  const tenants = await db
    .select()
    .from(tenant)
    .where(filterCondition)
    .orderBy(orderParam === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(perPage)
    .offset(offset);

  return res.json({
    tenants: tenants,
    count: total,
    page,
    perPage,
    sort: sortParam,
    order: orderParam,
    filter: filterParam
  });
});


/**
 * @swagger
 * /api/system/tenant/{id}:
 *   get:
 *     tags:
 *       - System - Tenant
 *     summary: Get a tenant by ID
 *     description: Retrieve a specific tenant by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tenant to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The tenant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tenant'
 */
tenantRoutes.get('/:id', authorized('SYSADMIN', 'system.tenant.view'), async (req, res) => {
  const idParam = req.params.id;

  try {
    const data = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, idParam))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    return res.json(data);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/tenant/add:
 *   post:
 *     tags:
 *       - System - Tenant
 *     summary: Add a new  tenant
 *     description: Create a new tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tenant created successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     TenantForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The tenant ID
 *         code:
 *           type: string
 *           description: The code of the tenant
 *         name:
 *           type: string
 *           description: The name of the tenant
 *         description:
 *           type: string
 *           description: A description of the tenant
 */
tenantRoutes.post('/add', hasRoles('SYSADMIN'), validateData(tenantSchema), async (req, res) => {
  const { code, name, description } = req.body;

  try {

    // get current user
    const currentUser = await db.select().from(user).where(eq(user.username, req.user!.username)).then((rows) => rows[0]);

    let newTenant;
    await db.transaction(async (tx) => {
      // insert new tenant
      newTenant = await tx.insert(tenant).values({
        id: crypto.randomUUID(),
        code,
        name,
        description
      })
        .returning()
        .then((rows) => rows[0]);


      // insert sysadmin role for the new tenant
      const newRole = await tx.insert(role).values({
        id: crypto.randomUUID(),
        tenantId: newTenant.id,
        code: 'SYSADMIN',
        name: 'System Administrator',
        isSystem: true,
        description: 'Full access to all system features',
      }).returning().then((rows) => rows[0]);

      // insert user role for the new tenant
      const newUserRole = await tx.insert(role).values({
        id: crypto.randomUUID(),
        tenantId: newTenant.id,
        code: 'USER',
        name: 'User',
        isSystem: false,
        description: 'Regular user role',
      }).returning().then((rows) => rows[0]);

      // insert sysadmin user role
      await tx.insert(userRole).values({
        tenantId: newTenant.id,
        userId: currentUser.id,
        roleId: newRole.id
      });

      // insert sysadmin user to the new tenant in userTenant
      await tx.insert(userTenant).values({
        tenantId: newTenant.id,
        userId: currentUser.id
      });

    });

    res.status(201).json(newTenant);
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ error: "Internal server error." });
  }

});


/**
 * @swagger
 * /api/system/tenant/{id}/edit:
 *   put:
 *     tags:
 *       - System - Tenant
 *     summary: Edit system tenant
 *     description: Edit system tenant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *       404:
 *         description: Tenant not found
 *       500:
 *         description: Internal server error
 */
tenantRoutes.put('/:id/edit', authorized('SYSADMIN', 'system.tenant.edit'), validateData(tenantSchema), async (req, res) => {
  const idParam = req.params.id;
  const { id, code, name, description } = req.body;

  if (idParam !== id) {
    return res.status(400).json({ message: 'Invalid tenant ID' });
  }

  try {
    const updatedTenant = await db.update(tenant).set({
      code,
      name,
      description
    }).where(and(
      eq(tenant.id, id),
    )
    )
      .returning()
      .then((rows) => rows[0]);

    res.status(200).json(updatedTenant);
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/system/tenant/{id}/delete:
 *   delete:
 *     tags:
 *       - System - Tenant
 *     summary: Delete system tenant
 *     description: Delete an existing tenant by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tenant to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant deleted successfully
 *       404:
 *         description: Tenant not found
 */
tenantRoutes.delete('/:id/delete', hasRoles('SYSADMIN'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idParam = req.params.id;

  try {
    const deletedTenant = await db.delete(tenant).where(and(
      eq(tenant.id, idParam),
    )).returning()
      .then((rows) => rows[0]);

    if (!deletedTenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/system/tenant/validate-code:
 *   post:
 *     tags:
 *       - System - Tenant
 *     summary: Validate tenant code
 *     description: Check if the tenant code is unique 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantCodeValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant code is valid
 *       400:
 *         description: Tenant code must be unique within the tenant
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     TenantCodeValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The tenant ID
 *         code:
 *           type: string
 *           description: The code of the tenant
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the tenant
 */
tenantRoutes.post("/validate-code", authorized('SYSADMIN', 'system.tenant.edit'), validateData(tenantCodeValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Tenant code is valid." });
});

export default tenantRoutes;