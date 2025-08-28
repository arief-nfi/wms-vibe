import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { Router } from "express";
import fileUpload from "express-fileupload";
import { format, parse } from 'fast-csv';
import { db } from "src/server/lib/db";
import { permission, role, rolePermission } from "src/server/lib/db/schema/system";
import { authenticated, authorized } from "src/server/middleware/authMiddleware";
import { validateData } from "src/server/middleware/validationMiddleware";
import { roleCodeValidationSchema, roleSchema } from "src/server/schemas/roleSchema";


const roleRoutes = Router();
roleRoutes.use(authenticated());

/**
 * @swagger
 * /api/system/role:
 *   get:
 *     tags:
 *       - System - Role
 *     summary: Get all roles
 *     description: Retrieve a list of all roles
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *         description: The number of roles to retrieve per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: The field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: The sort order (asc or desc)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: A filter to apply to the role names
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The role ID
 *         code:
 *           type: string
 *           description: The code of the role
 *         name:
 *           type: string
 *           description: The name of the role
 *         description:
 *           type: string
 *           description: A description of the role
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the role
 *         isSystem:
 *           type: boolean
 *           description: Whether the role is a system role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the role was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the role was last updated
 */
roleRoutes.get("/", authorized('SYSADMIN', 'system.role.view'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageParam = req.query.page as string | undefined;
  const perPageParam = req.query.perPage as string | undefined;
  const sortParam = req.query.sort || 'code';
  const orderParam = req.query.order || 'asc';
  const filterParam = req.query.filter || '';

  // Map allowed sort keys to columns
  const sortColumns = {
    id: role.id,
    name: role.name,
    description: role.description
    // add other columns as needed
  } as const;

  // Fallback to 'name' if sortParam is not a valid key
  const sortColumn = sortColumns[sortParam as keyof typeof sortColumns] || role.name;

  const page = pageParam ? parseInt(pageParam) : 1;
  const perPage = perPageParam ? parseInt(perPageParam) : 10;
  const offset = (page - 1) * perPage;

  // Build filter condition
  const filterCondition = filterParam
    ? and(
      or(
        ilike(role.code, `%${filterParam}%`),
        ilike(role.name, `%${filterParam}%`),
        ilike(role.description, `%${filterParam}%`)
      ),
      eq(role.tenantId, req.user?.activeTenantId),
      eq(role.isSystem, false)
    )
    : and(eq(role.tenantId, req.user?.activeTenantId)
      , eq(role.isSystem, false));

  // Get total count with filter
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(role)
    .where(filterCondition);

  const roles = await db
    .select()
    .from(role)
    .where(filterCondition)
    .orderBy(orderParam === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(perPage)
    .offset(offset);

  res.json({
    roles,
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
 * /api/system/role/add:
 *   post:
 *     tags:
 *       - System - Role
 *     summary: Add a new role
 *     description: Create a new role with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Role created successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     RoleForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The role ID
 *         code:
 *           type: string
 *           description: The code of the role
 *         name:
 *           type: string
 *           description: The name of the role
 *         description:
 *           type: string
 *           description: A description of the role
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the role
 */
roleRoutes.post("/add", authorized('SYSADMIN', 'system.role.add'), validateData(roleSchema), async (req, res) => {
  const { code, name, description, tenantId, permissionIds } = req.body;

  let permIds: string[] = [];
  if (Array.isArray(permissionIds) && permissionIds.every(item => typeof item === 'string')) {
    permIds = permissionIds;
  }

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    let newRole: any;
    // transaction
    await db.transaction(async (tx) => {
      // insert role data
      //const roleId = crypto.randomUUID();
      newRole = await tx.insert(role).values({
        id: crypto.randomUUID(),
        code,
        name,
        description,
        tenantId,
        isSystem: false
      }).returning()
        .then((rows) => rows[0]);

      if (permIds.length > 0) {
        // insert role permissions
        await tx.insert(rolePermission).values(permIds.map(permId => ({
          roleId: newRole.id,
          permissionId: permId,
          tenantId: tenantId
        })));
      }
      
    });
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

//export roles to csv
/**
 * @swagger
 * /api/system/role/export:
 *   get:
 *     tags:
 *       - System - Role
 *     summary: Export roles to CSV
 *     description: Export all roles to a CSV file for download
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file containing the exported roles
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
roleRoutes.get("/export", authorized('SYSADMIN', 'system.role.view'), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const roles = await db.select().from(role)
    .where(eq(role.tenantId, req.user?.activeTenantId))
    .then((rows) => rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description
    })));

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');

  // Create a writable stream for fast-csv
  const csvStream = format({ headers: true });

  // Pipe the data to the CSV stream and then to the response
  csvStream.pipe(res);

  // Write each row of data
  roles.forEach(row => csvStream.write(row));

  // End the CSV stream
  csvStream.end();

});

// import roles from csv file
roleRoutes.post("/import", authorized('SYSADMIN', 'system.role.add'), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  interface RoleRow {
    code: string;
    name: string;
    description: string;
  }

  try {

    const file = req.files?.file as fileUpload.UploadedFile;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    if (file.mimetype !== 'text/csv' && !file.name.endsWith('.csv')) {
      return res.status(400).json({ error: "Invalid file type. Only CSV files are allowed." });
    }
    
    console.log(file);

    // Parse CSV read from file.data buffer 
    const parseCSV = (file: fileUpload.UploadedFile): Promise<RoleRow[]> => {
      return new Promise((resolve, reject) => {
        const results: RoleRow[] = [];
        const stream = parse({ headers: true })
          .on('data', (data) => {
            results.push(data);
          })
          .on('end', () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          });
        
        // Write the buffer data to the stream
        stream.write(file.data);
        stream.end();
      });
    };

    const roles = await parseCSV(file);
    console.log(roles);
    
    // Validate and insert roles into the database
    await db.transaction(async (tx) => {
      for (const roleData of roles) {
        const { code, name, description } = roleData;
        await tx.insert(role).values({
          id: crypto.randomUUID(),
          code,
          name,
          description,
          tenantId: req.user!.activeTenantId,
          isSystem: false
        });
      }
    });

    res.status(201).json({ message: "Roles imported successfully." });
  } catch (error) {
    console.error("Error importing roles:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


/**
 * @swagger
 * /api/system/role/ref-permissions:
 *   get:
 *     tags:
 *       - System - Role
 *     summary: Get reference permissions
 *     description: Fetch a list of reference permissions for role management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reference permissions
 *       401:
 *         description: Unauthorized
 */
roleRoutes.get("/ref-permissions", authorized('SYSADMIN', 'system.role.view'), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const permissions = await db.select().from(permission)
      .where(eq(permission.tenantId, req.user?.activeTenantId))
      .then((rows) => rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name
      })));
    res.status(200).json(permissions);
  } catch (error) {
    console.error("Error fetching reference permissions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/role/{id}:
 *   get:
 *     tags:
 *       - System - Role
 *     summary: Get a role by ID
 *     description: Retrieve a specific role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The role details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
roleRoutes.get("/:id", authorized('SYSADMIN', 'system.role.view'), async (req, res) => {
  const idParam = req.params.id;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const data = await db.query.role.findFirst({
      columns: {
        id: true,
        code: true,
        name: true,
        description: true,
        tenantId: true,
      },
      where: and(eq(role.id, idParam), eq(role.tenantId, req.user?.activeTenantId)),
      with: {
        permissions: {
          columns: {
            permissionId: false,
            roleId: false,
            tenantId: false
          },
          where: eq(rolePermission.tenantId, req.user?.activeTenantId),
          with: {
            permission: {
              columns: {
                id: true,
                code: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
    
    if (!data) {
      return res.status(404).json({ error: "Role not found" });
    }

    const permissions = data.permissions.map((p) => ({
      id: p.permission.id,
      code: p.permission.code,
      name: p.permission.name,
      description: p.permission.description
    }));

    res.json({ ...data, permissions });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/role/{id}/edit:
 *   put:
 *     tags:
 *       - System - Role
 *     summary: Update a role
 *     description: Update the details of an existing role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
roleRoutes.put("/:id/edit", authorized('SYSADMIN', 'system.role.edit'), validateData(roleSchema), async (req, res) => {
  const idParam = req.params.id;

  const sanitizedRole = await roleSchema.parseAsync(req.body);
  const { id, code, name, description, tenantId, permissionIds } = sanitizedRole;

  if (req.user?.activeTenantId !== tenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (idParam !== id) {
    return res.status(400).json({ error: "Invalid role ID" });
  }

  let permIds: string[] = [];
  if (Array.isArray(permissionIds) && permissionIds.every(item => typeof item === 'string')) {
    permIds = permissionIds;
  }

  try {
    let updatedRole: any;
    // transaction
    await db.transaction(async (tx) => {
      // delete existing role permissions
      await tx.delete(rolePermission).where(eq(rolePermission.roleId, idParam));
      if (permIds.length > 0) {
        // insert new role permissions
        await tx.insert(rolePermission).values(permIds.map(permId => ({
          roleId: idParam,
          permissionId: permId,
          tenantId: tenantId
        })));
      }
      
      // update role data
      updatedRole = await tx
        .update(role)
        .set({
          code,
          name,
          description
        })
        .where(and(
          eq(role.id, id),
          eq(role.tenantId, tenantId)
        ))
        .returning()
        .then((rows) => rows[0]);
    });


    res.status(200).json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/role/{id}/delete:
 *   delete:
 *     tags:
 *       - System - Role
 *     summary: Delete a role
 *     description: Delete an existing role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 */
roleRoutes.delete("/:id/delete", authorized('SYSADMIN', 'system.role.delete'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idParam = req.params.id;
  const tenantId = req.user.activeTenantId;

  try {
    let deletedRole: any;
    // transaction
    await db.transaction(async (tx) => {
      // delete role permission
      await tx.delete(rolePermission).where(
        and(eq(rolePermission.roleId, idParam), eq(rolePermission.tenantId, tenantId))
      );
      // delete role
      deletedRole = await tx.delete(role).where(
        and(eq(role.id, idParam), eq(role.tenantId, tenantId))
      ).returning().then((rows) => rows[0]);
    });

    if (!deletedRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/role/validate-code:
 *   post:
 *     tags:
 *       - System - Role
 *     summary: Validate role code
 *     description: Check if the role code is unique within the tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleCodeValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role code is valid
 *       400:
 *         description: Role code must be unique within the tenant
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     RoleCodeValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The role ID
 *         code:
 *           type: string
 *           description: The code of the role
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the role
 */
roleRoutes.post("/validate-code", authorized('SYSADMIN', 'system.role.add'), validateData(roleCodeValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Role code is valid." });
});

export default roleRoutes;