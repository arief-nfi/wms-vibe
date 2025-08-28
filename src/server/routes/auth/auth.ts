import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from 'src/server/lib/db';
import * as table from 'src/server/lib/db/schema/system';
import { sendResetEmail } from 'src/server/lib/email';
import { authenticated, DecodedToken } from 'src/server/middleware/authMiddleware';
import { validateData } from 'src/server/middleware/validationMiddleware';
import { tenantCodeRegistrationValidationSchema, tenantRegistrationSchema, userForgetPasswordSchema, userLoginSchema, usernameValidationSchema, userRegistrationSchema, userResetPasswordSchema } from 'src/server/schemas/userSchema';



const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'my_access_token_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'my_refresh_token_secret_key';
const RESET_PASSWORD_TOKEN_SECRET = process.env.RESET_PASSWORD_TOKEN_SECRET || 'my_reset_password_token_secret_key';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const authRoutes = Router();

// Login route
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login a user
 *     description: Login a user with a username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid request body
 */
authRoutes.post('/login', validateData(userLoginSchema), async (req, res) => {
  const { username, password } = req.body;

  const results = await db.select().from(table.user).where(
    and(
      eq(table.user.username, username),
      eq(table.user.status, 'active')
    ));

  const user = results.at(0);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Check the password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Create a JWT
  const accessToken = jwt.sign({ username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: '48h' });

  res.json({ accessToken, refreshToken });

});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Register a new user with a username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               fullname:
 *                 type: string
 *                 description: The fullname of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               activeTenantCode:
 *                 type: string
 *                 description: The active tenant code of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *               confirmPassword:
 *                 type: string
 *                 description: The confirm password of the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request body
 */
authRoutes.post('/register', validateData(userRegistrationSchema), async (req, res) => {
  const { username, password, fullname, email } = req.body;

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // get public tenant
    const publicTenant = (await db.select().from(table.tenant).where(eq(table.tenant.code, 'PUBLIC'))).at(0);
    if (!publicTenant) {
      return res.status(500).json({ message: 'Public tenant not found' });
    }

    // get public tenant USER role
    const publicUserRole = (await db.select().from(table.role).where(and(eq(table.role.code, 'USER'), eq(table.role.tenantId, publicTenant.id)))).at(0);
    if (!publicUserRole) {
      return res.status(500).json({ message: 'Public user role not found' });
    }

    const newUserId = crypto.randomUUID();
    const newUsername = `${username}@${publicTenant.code}`;
    await db.transaction(async (tx) => {
      await tx.insert(table.user).values({ id: newUserId, username: newUsername, passwordHash, fullname, email, status: 'active', activeTenantId: publicTenant.id });
      await tx.insert(table.userTenant).values({ userId: newUserId, tenantId: publicTenant.id });
      await tx.insert(table.userRole).values({ userId: newUserId, roleId: publicUserRole.id, tenantId: publicTenant.id });
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (e) {
    console.error('Error during registration:', e);
    return res.status(400).json({ message: 'Bad request' });
  }
});

/**
 * @swagger
 * /api/auth/register-tenant:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new tenant
 *     description: Register a new tenant with admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantCode:
 *                 type: string
 *                 description: The code of the tenant
 *               tenantName:
 *                 type: string
 *                 description: The name of the tenant
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               fullname:
 *                 type: string
 *                 description: The fullname of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *               confirmPassword:
 *                 type: string
 *                 description: The confirm password of the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request body
 */
authRoutes.post('/register-tenant', validateData(tenantRegistrationSchema), async (req, res) => {
  const { activeTenantCode, activeTenantName, username, password, fullname, email } = req.body;

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  try {

    await db.transaction(async (tx) => {

      // insert new tenant
      const newTenantCode = activeTenantCode;
      const newTenant = await tx.insert(table.tenant).values(
        {id: crypto.randomUUID(), code : newTenantCode, name : activeTenantName}
      ).returning().then((rows) => rows[0]);

      // insert sysadmin role for the new tenant
      const newAdminRole = await tx.insert(table.role).values({
        id: crypto.randomUUID(),
        tenantId: newTenant.id,
        code: 'ADMIN',
        name: 'Administrator',
        isSystem: false,
        description: 'Full access to all features',
      }).returning().then((rows) => rows[0]);

      // insert user role & guest rolefor the new tenant
      await tx.insert(table.role).values([
        {id: crypto.randomUUID(),tenantId: newTenant.id, code: 'USER', name: 'User', isSystem: false, description: 'Regular user role'},
        {id: crypto.randomUUID(),tenantId: newTenant.id, code: 'GUEST', name: 'Guest', isSystem: false, description: 'Guest role'}
      ]);

      const newUsername = `${username}@${newTenant.code}`;
      const newUser = await tx.insert(table.user).values({ 
        id: crypto.randomUUID(), username : newUsername, passwordHash, fullname, email, status: 'active', activeTenantId: newTenant.id 
      }).returning().then((rows) => rows[0]);;

      await tx.insert(table.userTenant).values({ userId: newUser.id, tenantId: newTenant.id });
      await tx.insert(table.userRole).values({ userId: newUser.id, roleId: newAdminRole.id, tenantId: newTenant.id });

      const permIds = await tx.insert(table.permission).values([
        //  tenant permission
        { id: crypto.randomUUID(), code: "system.tenant.view", name: "View Tenant", description: "Permission to view tenant", tenantId: newTenant.id },
        //{ id: crypto.randomUUID(), code: "system.tenant.add", name: "Create Tenant", description: "Permission to add tenant", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.tenant.edit", name: "Edit Tenant", description: "Permission to edit tenant", tenantId: newTenant.id },
        //{ id: crypto.randomUUID(), code: "system.tenant.delete", name: "Delete Tenant", description: "Permission to delete tenant", tenantId: newTenant.id },

        { id: crypto.randomUUID(), code: "system.user.view", name: "View User", description: "Permission to view user", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.user.add", name: "Create User", description: "Permission to add user", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.user.edit", name: "Edit User", description: "Permission to edit user", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.user.delete", name: "Delete User", description: "Permission to delete user", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.user.reset_password", name: "Reset Password", description: "Permission to reset password user", tenantId: newTenant.id },

        { id: crypto.randomUUID(), code: "system.role.view", name: "View Role", description: "Permission to view role", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.role.add", name: "Create Role", description: "Permission to add role", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.role.edit", name: "Edit Role", description: "Permission to edit role", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.role.delete", name: "Delete Role", description: "Permission to delete role", tenantId: newTenant.id },

        { id: crypto.randomUUID(), code: "system.permission.view", name: "View Permission", description: "Permission to view permission", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.permission.add", name: "Create Permission", description: "Permission to add permission", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.permission.edit", name: "Edit Permission", description: "Permission to edit permission", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.permission.delete", name: "Delete Permission", description: "Permission to delete permission", tenantId: newTenant.id },  
    
        { id: crypto.randomUUID(), code: "system.option.view", name: "View Option", description: "Permission to view option", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.option.add", name: "Create Option", description: "Permission to add option", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.option.edit", name: "Edit Option", description: "Permission to edit option", tenantId: newTenant.id },
        { id: crypto.randomUUID(), code: "system.option.delete", name: "Delete Option", description: "Permission to delete option", tenantId: newTenant.id },
      ]).returning().then((rows) => rows.map(r => r.id));

      permIds.forEach(async permId => {
        await tx.insert(table.rolePermission).values({ tenantId: newTenant.id, roleId: newAdminRole.id, permissionId: permId });
      });

    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (e) {
    console.error('Error during registration:', e);
    return res.status(400).json({ message: 'Bad request' });
  }
});

/**
 * @swagger
 * /api/auth/validate-username:
 *   post:
 *     tags:
 *       - Auth
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
authRoutes.post("/validate-username", validateData(usernameValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Username is valid." });
});

/**
 * @swagger
 * /api/auth/validate-tenantcode:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Validate tenant code
 *     description: Check if the tenant code is unique
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TenantCodeRegistrationValidation'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tenant code is valid
 *       400:
 *         description: Tenant code must be unique
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     TenantCodeRegistrationValidation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The tenant ID
 *         activeTenantCode:
 *           type: string
 *           description: The code of the tenant
 *         tenantId:
 *           type: string
 *           description: The tenant ID associated with the tenant
 */
authRoutes.post("/validate-tenantcode", validateData(tenantCodeRegistrationValidationSchema), async (req, res) => {
  res.status(200).json({ message: "Tenant code is valid." });
});

/** 
* @swagger
* /api/auth/forget-password:
*   post:
*     tags:
*       - Auth
*     summary: Forget password
*     description: Send a password reset link to the user's email
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/AuthForgetPassword'
*     responses:
*       200:
*         description: Password reset link sent successfully
*       400:
*         description: Invalid request body
*/
/**
 * @swagger
 * components:
 *   schemas:
 *     AuthForgetPassword:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 */
authRoutes.post("/forget-password", validateData(userForgetPasswordSchema), async (req, res) => {
  const { username } = req.body;
  console.log("Forget password request for username:", username);

  const user = await db.select().from(table.user).where(eq(table.user.username, username))
    .limit(1)
    .then(results => results.at(0));

  if (user && user.email !== null) {
    const token = jwt.sign(
      { username: user.username, type: 'password-reset' },
      RESET_PASSWORD_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    const resetLink = `${BASE_URL}/auth/reset-password?token=${token}`;
    await sendResetEmail(user.email, resetLink);
  }

  res.status(200).json({ message: "Password reset link sent." });

});

// get user by reset password jwt token
/**
 * @swagger
 * /api/auth/reset-password:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user by reset password token
 *     description: Retrieve user information using the reset password token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: The reset password token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       400:
 *         description: Invalid token
 */
authRoutes.get("/reset-password", async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(token, RESET_PASSWORD_TOKEN_SECRET) as DecodedToken;
    if (!decoded.username) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const user = await db.select().from(table.user).where(eq(table.user.username, decoded.username)).limit(1).then(results => results.at(0));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ id: user.id, activeTenantId: user.activeTenantId });
  } catch (error) {
    console.error("Error verifying reset password token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//post reset password
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password
 *     description: Reset user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthResetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request body
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResetPassword:
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
authRoutes.post("/reset-password", validateData(userResetPasswordSchema), async (req, res) => {
  const { id, activeTenantId, password } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    // Update the user's password in the database
    await db.update(table.user).set({ passwordHash }).where(eq(table.user.id, id));

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Refresh access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token of the user
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Invalid request body
 */
authRoutes.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as DecodedToken;
      const accessToken = jwt.sign({ username: decoded.username }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      return res.json({ accessToken });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired.' });
      }
      return res.status(401).json({ message: 'Invalid token.' });
    }
  } else {
    return res.status(400).json({ message: 'Invalid request body' });
  }
})


// User route
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /api/auth/user:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get user information
 *     description: Get user information using access token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       500:
 *         description: User information not found after authentication.
 */
authRoutes.get('/user', authenticated(), async (req, res) => {
  if (req.user) {
    // First get the user
    const user = await db.query.user.findFirst({
      columns: {
        id: true,
        username: true,
        fullname: true,
        email: true,
        avatar: true,
        status: true
      },
      where: eq(table.user.username, req.user?.username),
      with: {
        activeTenant: {
          columns: {
            id: true,
            code: true,
            name: true,
            description: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Username not found' });
      return
    };

    // Then get roles and permissions for the active tenant
    const rolesWithPermissions = await db.query.userRole.findMany({
      where: and(
        eq(table.userRole.userId, user.id),
        eq(table.userRole.tenantId, user.activeTenant.id)
      ),
      with: {
        role: {
          columns: {
            code: true
          },
          with: {
            permissions: {
              where: eq(table.rolePermission.tenantId, user.activeTenant.id),
              with: {
                permission: {
                  columns: {
                    code: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Combine the results
    const result = {
      ...user,
      roles: rolesWithPermissions.map(ur => ({
        role: ur.role
      }))
    };

    const roles = result?.roles?.map((role) => role.role.code) || [];
    const permissions = result?.roles?.flatMap((role) => role.role.permissions?.map((permission) => permission.permission.code)) || [];
    res.json({
      ...user,
      roles,
      permissions
    });

  } else {
    res.status(500).json({ message: 'User information not found after authentication.' });
  }
});

export default authRoutes;
