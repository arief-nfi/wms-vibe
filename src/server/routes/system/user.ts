import bcrypt from "bcryptjs";
import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { Router } from "express";
import { db } from "src/server/lib/db";
import { role, tenant, user, userRole, userTenant } from "src/server/lib/db/schema/system";
import { authenticated, authorized } from "src/server/middleware/authMiddleware";
import { validateData } from "src/server/middleware/validationMiddleware";
import { userAddSchema, userEditSchema, usernameValidationSchema, userResetPasswordSchema } from "src/server/schemas/userSchema";
import { s } from "node_modules/framer-motion/dist/types.d-Cjd591yU";
import { ac } from "node_modules/react-router/dist/development/context-DohQKLID.mjs";



const userRoutes = Router();
userRoutes.use(authenticated());

/**
 * @swagger
 * /api/system/user:
 *   get:
 *     tags:
 *       - System - User
 *     summary: Get all users
 *     description: Retrieve a list of all users
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
 *         description: The number of users to retrieve per page
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
 *         description: A filter to apply to the users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         username:
 *           type: string
 *           description: The username of the user
 *         fullname:
 *           type: string
 *           description: The fullname of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         activeTenantId:
 *           type: string
 *           description: The active tenant ID associated with the user
 *         avatar:
 *           type: string
 *           description: The avatar URL of the user
 *         status:
 *           type: string
 *           description: The status of the user (e.g., active, inactive)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated
 */
userRoutes.get("/", authorized('SYSADMIN', 'system.user.view'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const pageParam = req.query.page as string | undefined;
  const perPageParam = req.query.perPage as string | undefined;
  const sortParam = req.query.sort || 'username';
  const orderParam = req.query.order || 'asc';
  const filterParam = req.query.filter || '';

  // Map allowed sort keys to columns
  const sortColumns = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    email: user.email
  } as const;

  // Fallback to 'name' if sortParam is not a valid key
  const sortColumn = sortColumns[sortParam as keyof typeof sortColumns] || user.username;

  const page = pageParam ? parseInt(pageParam) : 1;
  const perPage = perPageParam ? parseInt(perPageParam) : 10;
  const offset = (page - 1) * perPage;

  // Build filter condition
  const filterCondition = filterParam
    ? and(
      or(
        ilike(user.username, `%${filterParam}%`),
        ilike(user.fullname, `%${filterParam}%`),
        ilike(user.email, `%${filterParam}%`)
      ),
      eq(user.activeTenantId, req.user?.activeTenantId),
      ne(user.username, 'sysadmin')
    )
    : and(eq(user.activeTenantId, req.user?.activeTenantId), 
      ne(user.username, 'sysadmin'));

  // Get total count with filter
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(user)
    .where(filterCondition);

  const users = await db
    .select(
      {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        activeTenantId: user.activeTenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    )
    .from(user)
    .where(filterCondition)
    .orderBy(orderParam === 'asc' ? asc(sortColumn) : desc(sortColumn))
    .limit(perPage)
    .offset(offset);

  res.json({
    users,
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
 * /api/system/user/add:
 *   post:
 *     tags:
 *       - System - User
 *     summary: Add a new user
 *     description: Create a new user with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserAddForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created successfully
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserAddForm:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         fullname:
 *           type: string
 *           description: The fullname of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         activeTenantId:
 *           type: string
 *           description: The active tenant ID associated with the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         avatar:
 *           type: string
 *           description: The avatar of the user
 *         roleIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The list of role IDs associated with the user
 */
userRoutes.post("/add", authorized('SYSADMIN', 'system.user.add'), validateData(userAddSchema), async (req, res) => {
  const { username, fullname, password, activeTenantId, email, avatar, roleIds } = req.body;

  let selectedRoleIds: string[] = [];
  if (Array.isArray(roleIds) && roleIds.every(item => typeof item === 'string')) {
    selectedRoleIds = roleIds;
  }

  if (req.user?.activeTenantId !== activeTenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // get tenant
  const currentTenant = await db.select().from(tenant).where(eq(tenant.id, activeTenantId)).limit(1).then((rows) => rows[0]);

  if (!currentTenant) {
    return res.status(404).json({ error: "Tenant not found" }); 
  }

  try {
    const newUsername = `${username}@${currentTenant.code}`;
    let newUser: any;
    const passwordHash = await bcrypt.hash(password, 10);
    // transaction
    await db.transaction(async (tx) => {
      // insert role data
      //const roleId = crypto.randomUUID();
      newUser = await tx.insert(user).values({
        id: crypto.randomUUID(),
        username : newUsername,
        fullname,
        passwordHash,
        activeTenantId,
        email,
        avatar,
        status: 'active'
      }).returning()
        .then((rows) => rows[0]);

      await tx.insert(userTenant).values({ userId: newUser.id, tenantId: activeTenantId });

      if (selectedRoleIds.length>0) {
        // insert user roles
        await tx.insert(userRole).values(selectedRoleIds.map(roleId => ({
          userId: newUser.id,
          roleId,
          tenantId: activeTenantId
        })));
      }
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
      avatar: newUser.avatar,
      status: newUser.status,
      activeTenantId: newUser.activeTenantId,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/user/ref-roles:
 *   get:
 *     tags:
 *       - System - User
 *     summary: Get reference roles
 *     description: Fetch a list of reference roles for user management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reference roles
 *       401:
 *         description: Unauthorized
 */
userRoutes.get("/ref-roles", authorized('SYSADMIN', 'system.user.view'), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const roles = await db.select().from(role)
      .where(eq(role.tenantId, req.user?.activeTenantId))
      .then((rows) => rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name
      })));
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching reference roles:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// get userTenants
/**
 * @swagger
 * /api/system/user/user-tenants:
 *   get:
 *     tags:
 *       - System - User
 *     summary: Get user tenants
 *     description: Retrieve a list of tenants associated with the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user tenants
 *       404:
 *         description: User not found
 */
userRoutes.get('/user-tenants', authorized('SYSADMIN', 'system.user.view'), async (req, res) => {
  const username = req.user?.username;

  if (!username) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userTenants = await db.query.user.findFirst({
      where: eq(user.username, username),
      with: {
        tenants: {
          columns: {
            userId: false,
            tenantId: false
          },
          with: {
            tenant: {
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

    if (userTenants == null) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userTenants.tenants.map(ut => ut.tenant));
  } catch (error) {
    console.error("Error fetching user tenants:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}); 

// post switch-tenant
/**
 * @swagger
 * /api/system/user/switch-tenant:
 *   post:
 *     tags:
 *       - System - User
 *     summary: Set active tenant
 *     description: Update the active tenant for the current user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *                 description: The ID of the tenant to set as active
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active tenant updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Tenant not found
 */
userRoutes.post('/switch-tenant', async (req, res) => {
  const { tenantId } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const currentUser = await db.select().from(user).where(eq(user.username, req.user.username)).limit(1).then((rows) => rows[0]);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const selectedTenant = await db.query.userTenant.findFirst({
      where: and(eq(userTenant.userId, currentUser.id), eq(userTenant.tenantId, tenantId))
    });

    if (!selectedTenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    await db.update(user).set({ activeTenantId: tenantId }).where(eq(user.id, currentUser.id));
    res.status(200).json({ message: "Active tenant updated successfully." });
  } catch (error) {
    console.error("Error setting active tenant:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/user/{id}:
 *   get:
 *     tags:
 *       - System - User
 *     summary: Get a user by ID
 *     description: Retrieve a specific user by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetails'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserDetails:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         username:
 *           type: string
 *           description: The username of the user
 *         fullname:
 *           type: string
 *           description: The fullname of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         activeTenantId:
 *           type: string
 *           description: The active tenant ID associated with the user
 *         avatar:
 *           type: string
 *           description: The avatar URL of the user
 *         status:
 *           type: string
 *           description: The status of the user (e.g., active, inactive)
 *         roles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The role ID
 *               code:
 *                 type: string
 *                 description: The code of the role
 *               name:
 *                 type: string
 *                 description: The name of the role
 *               description:
 *                 type: string
 *                 description: A description of the role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated
 */
userRoutes.get("/:id", authorized('SYSADMIN', 'system.user.view'), async (req, res) => {
  const idParam = req.params.id;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const data = await db.query.user.findFirst({
      columns: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        avatar: true,
        status: true,
        activeTenantId: true,
        createdAt: true,
        updatedAt: true
      },
      where: and(eq(user.id, idParam), eq(user.activeTenantId, req.user?.activeTenantId)),
      with: {
        roles: {
          columns: {
            userId: false,
            roleId: false,
            tenantId: false
          },
          where: eq(userRole.tenantId, req.user?.activeTenantId),
          with: {
            role: {
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
      return res.status(404).json({ error: "User not found" });
    }

    const roles = data.roles.map((p) => ({
      id: p.role.id,
      code: p.role.code,
      name: p.role.name,
      description: p.role.description
    }));

    res.json({ ...data, roles: roles });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/user/{id}/edit:
 *   put:
 *     tags:
 *       - System - User
 *     summary: Update a user
 *     description: Update the details of an existing user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserEditForm'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserEditForm:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         username:
 *           type: string
 *           description: The username of the user
 *         fullname:
 *           type: string
 *           description: The fullname of the user
 *         activeTenantId:
 *           type: string
 *           description: The active tenant ID associated with the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         avatar:
 *           type: string
 *           description: The avatar of the user
 *         status:
 *           type: string
 *           description: The status of the user (e.g., active, inactive)
 *         roleIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The list of role IDs associated with the user
 */
userRoutes.put("/:id/edit", authorized('SYSADMIN', 'system.user.edit'), validateData(userEditSchema), async (req, res) => {
  const idParam = req.params.id;
  const { id, username, fullname, status, activeTenantId, email, avatar, roleIds } = req.body;

  if (req.user?.activeTenantId !== activeTenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (idParam !== id) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // get tenant
  const currentTenant = await db.select().from(tenant).where(eq(tenant.id, activeTenantId)).limit(1).then((rows) => rows[0]);

  if (!currentTenant) {
    return res.status(404).json({ error: "Tenant not found" }); 
  }

  let selectedRoleIds: string[] = [];
  if (Array.isArray(roleIds) && roleIds.every(item => typeof item === 'string')) {
    selectedRoleIds = roleIds;
  }

  try {
    let updatedUser: any;
    // transaction
    await db.transaction(async (tx) => {
      // delete existing user roles
      await tx.delete(userRole).where(eq(userRole.userId, idParam));

      if (selectedRoleIds.length > 0) {
        // insert new role permissions
        await tx.insert(userRole).values(selectedRoleIds.map(roleId => ({
          userId: idParam,
          roleId: roleId,
          tenantId: activeTenantId
        })));
      }
      
      // update user data
      const updatedUsername = `${username}@${currentTenant.code}`;
      updatedUser = await tx
        .update(user)
        .set({
          username: updatedUsername,
          fullname,
          email,
          avatar,
          status
        })
        .where(and(
          eq(user.id, id),
          eq(user.activeTenantId, activeTenantId)
        ))
        .returning()
        .then((rows) => rows[0]);
    });


    res.status(200).json({
      id: updatedUser.id,
      username: updatedUser.username,
      fullname: updatedUser.fullname,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      status: updatedUser.status,
      activeTenantId: updatedUser.activeTenantId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/user/{id}/reset-password:
 *   post:
 *     tags:
 *       - System - User
 *     summary: Reset user password
 *     description: Reset the password of an existing user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose password is to be reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserResetPassword'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserResetPassword:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         activeTenantId:
 *           type: string
 *           description: The active tenant ID associated with the user
 *         password:
 *           type: string
 *           description: The new password for the user
 *         confirmPassword:
 *           type: string
 *           description: The confirmation of the new password
 */
userRoutes.post("/:id/reset-password", authorized('SYSADMIN', 'system.user.edit'), validateData(userResetPasswordSchema), async (req, res) => {
  const idParam = req.params.id;
  const { id, activeTenantId, password, confirmPassword } = req.body;

  if (req.user?.activeTenantId !== activeTenantId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (idParam !== id) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    let updatedUser: any;
    const passwordHash = await bcrypt.hash(password, 10);
    // transaction
    await db.transaction(async (tx) => {
      // update user data
      updatedUser = await tx
        .update(user)
        .set({
          passwordHash
        })
        .where(and(
          eq(user.id, id),
          eq(user.activeTenantId, activeTenantId)
        ))
        .returning()
        .then((rows) => rows[0]);
    });


    res.status(200).json({
      id: updatedUser.id,
      username: updatedUser.username,
      fullname: updatedUser.fullname,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      status: updatedUser.status,
      activeTenantId: updatedUser.activeTenantId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/user/{id}/delete:
 *   delete:
 *     tags:
 *       - System - User
 *     summary: Delete a user
 *     description: Delete an existing user by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
userRoutes.delete("/:id/delete", authorized('SYSADMIN', 'system.user.delete'), async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idParam = req.params.id;
  const tenantId = req.user.activeTenantId;

  try {
    let deletedUser: any;
    // transaction
    await db.transaction(async (tx) => {
      // delete role permission
      await tx.delete(userRole).where(
        and(eq(userRole.userId, idParam), eq(userRole.tenantId, tenantId))
      );

      // delete user tenant
      await tx.delete(userTenant).where(
        and(eq(userTenant.userId, idParam), eq(userTenant.tenantId, tenantId))
      );

      // delete user
      deletedUser = await tx.delete(user).where(
        and(eq(user.id, idParam), eq(user.activeTenantId, tenantId))
      ).returning().then((rows) => rows[0]);
    });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @swagger
 * /api/system/user/validate-username:
 *   post:
 *     tags:
 *       - System - User
 *     summary: Validate username
 *     description: Check if the username is unique
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsernameValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Username is valid
 *       400:
 *         description: Username must be unique 
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UsernameValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID
 *         username:
 *           type: string
 *           description: The username
 *
 */
userRoutes.post("/validate-username", authorized('SYSADMIN', 'system.user.add'), validateData(usernameValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Username is valid." });
});

export default userRoutes;