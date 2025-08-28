import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm';
import { Router } from 'express';
import { db } from 'src/server/lib/db';
import { permission } from "src/server/lib/db/schema/system";
import { authenticated, authorized } from 'src/server/middleware/authMiddleware';
import { validateData } from 'src/server/middleware/validationMiddleware';
import { permissionCodeValidationSchema, permissionSchema } from 'src/server/schemas/permissionSchema';

const permissionRoutes = Router();
permissionRoutes.use(authenticated());

/**
 * @swagger
 * /api/system/permission:
 *   get:
 *     tags:
 *       - System - Permission
 *     summary: Get all permissions
 *     description: Retrieve a list of all permissions
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
 *         description: A list of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The permission ID
 *         code:
 *           type: string
 *           description: The code of the permission
 *         name:
 *           type: string
 *           description: The name of the permission
 *         description:
 *           type: string
 *           description: A description of the permission
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the permission
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the permission was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the permission was last updated
 */
permissionRoutes.get('/', authorized('SYSADMIN', 'system.permission.view'), async (req, res) => {

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
    id: permission.id,
    code: permission.code,
    name: permission.name,
    description: permission.description
    // add other columns as needed
  } as const;

  // Fallback to 'name' if sortParam is not a valid key
  const sortColumn = sortColumns[sortParam as keyof typeof sortColumns] || permission.name;

  const page = pageParam ? parseInt(pageParam) : 1;
  const perPage = perPageParam ? parseInt(perPageParam) : 10;
  const offset = (page - 1) * perPage;

  // Build filter condition
    const filterCondition = filterParam
      ? and(
          or(
            ilike(permission.code, `%${filterParam}%`), 
            ilike(permission.name, `%${filterParam}%`),
            ilike(permission.description, `%${filterParam}%`)
          ), 
          eq(permission.tenantId, req.user?.activeTenantId)
        )
      : eq(permission.tenantId, req.user?.activeTenantId);

  // Get total count with filter
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(permission)
    .where(filterCondition);

  // Get paginated, sorted, filtered permissions
  const permissions = await db
    .select()
    .from(permission)
    .where(filterCondition)
    .orderBy(orderParam === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(perPage)
    .offset(offset);

  return res.json({
    permissions: permissions,
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
 * /api/system/permission/{id}:
 *   get:
 *     tags:
 *       - System - Permission
 *     summary: Get a permission by ID
 *     description: Retrieve a specific permission by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the permission to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The permission details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRoutes.get('/:id', authorized('SYSADMIN', 'system.permission.view'), async (req, res) => {
  const idParam = req.params.id;

  try {
    const data = await db
      .select()
      .from(permission)
      .where(eq(permission.id, idParam))
      .limit(1)
      .then((rows) => rows[0]);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (req.user?.activeTenantId !== data.tenantId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json(data);
  } catch (error) {
    console.error("Error fetching permission:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/permission/add:
 *   post:
 *     tags:
 *       - System - Permission
 *     summary: Add a new  permission
 *     description: Create a new permission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Permission created successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The permission ID
 *         code:
 *           type: string
 *           description: The code of the permission
 *         name:
 *           type: string
 *           description: The name of the permission
 *         description:
 *           type: string
 *           description: A description of the permission
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the permission
 */
permissionRoutes.post('/add', authorized('SYSADMIN', 'system.permission.add'), validateData(permissionSchema), async (req, res) => {
  const { code, name, description, tenantId } = req.body;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const newPermission = await db.insert(permission).values({
      id: crypto.randomUUID(),
      code,
      name,
      description,
      tenantId
    })
      .returning()
      .then((rows) => rows[0]);

    res.status(201).json(newPermission);
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ error: "Internal server error." });
  }

});


/**
 * @swagger
 * /api/system/permission/{id}/edit:
 *   put:
 *     tags:
 *       - System - Permission
 *     summary: Edit system permission
 *     description: Edit system permission
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
 *             $ref: '#/components/schemas/PermissionForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
permissionRoutes.put('/:id/edit', authorized('SYSADMIN', 'system.permission.edit'), validateData(permissionSchema), async (req, res) => {
  const idParam = req.params.id;
  const { id, code, name, description, tenantId } = req.body;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (idParam !== id) {
    return res.status(400).json({ message: 'Invalid permission ID' });
  }

  try {
    const updatedPermission = await db.update(permission).set({
      code,
      name,
      description
    }).where(and(
      eq(permission.id, id),
      eq(permission.tenantId, tenantId)
    )
    )
      .returning()
      .then((rows) => rows[0]);

    res.status(200).json(updatedPermission);
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/system/permission/{id}/delete:
 *   delete:
 *     tags:
 *       - System - Permission
 *     summary: Delete system permission
 *     description: Delete an existing permission by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the permission to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 */
permissionRoutes.delete('/:id/delete', authorized('SYSADMIN', 'system.permission.delete'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idParam = req.params.id;
  const tenantId = req.user.activeTenantId;

  try {
    const deletedPermission = await db.delete(permission).where(and(
      eq(permission.id, idParam),
      eq(permission.tenantId, tenantId)
    )).returning()
      .then((rows) => rows[0]);

    if (!deletedPermission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/system/permission/validate-code:
 *   post:
 *     tags:
 *       - System - Permission
 *     summary: Validate permission code
 *     description: Check if the permission code is unique within the tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionCodeValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission code is valid
 *       400:
 *         description: Permission code must be unique within the tenant
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionCodeValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The permission ID
 *         code:
 *           type: string
 *           description: The code of the permission
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the permission
 */
permissionRoutes.post("/validate-code", authorized('SYSADMIN', 'system.permission.add'), validateData(permissionCodeValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Permission code is valid." });
});

export default permissionRoutes;