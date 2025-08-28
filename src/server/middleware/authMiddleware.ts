import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // You'll need to install jsonwebtoken: npm install jsonwebtoken @types/jsonwebtoken
import { db } from '../lib/db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { permission, role, rolePermission, user, userRole } from '../lib/db/schema/system';

export interface DecodedToken {
  username: string;
  // Add other properties from your JWT payload
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'my_access_token_secret_key'; // Use environment variable for production

export const authenticated = () => async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No Bearer token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;
    if (!decoded.username) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    const currentUser = await db
      .select()
      .from(user)
      .where(and(
        eq(user.username, decoded.username),
        eq(user.status, "active"))
      )
      .limit(1)
      .then((rows) => rows[0]);
    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    req.user = { username: currentUser.username, activeTenantId: currentUser.activeTenantId }; // Attach decoded user information to the request
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const authorized = (
  roles: string | string[],
  permissions: string | string[],
  operator: 'or' | 'and' = 'or') => async (req: Request, res: Response, next: NextFunction) => {

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const username = req.user.username;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    try {
      const hasRole = await userHasRoles(username, requiredRoles);
      const hasPermission = await userHasPermissions(username, requiredPermissions);
      //console.log("hasRole : ", hasRole);
      //console.log("hasPermission : ", hasPermission);
      if (operator === 'or' && (hasRole || hasPermission)) {
        next();
      } else if (operator === 'and' && hasRole && hasPermission) {
        next();
      } else {
        return res.status(403).json({ message: 'Forbidden.' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };

export const hasRoles = (roles: string | string[]) => async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  const username = req.user.username;
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  try {
    const hasRole = await userHasRoles(username, requiredRoles);
    //console.log("hasRole : ", hasRole);
    if (hasRole) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const hasPermissions = (permissions: string | string[]) => async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  const username = req.user.username;
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  try {
    const hasPermission = await userHasPermissions(username, requiredPermissions);
    //console.log("hasPermission : ", hasPermission);
    if (hasPermission) {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const userHasRoles = async (username: string, roleCodes: string[]): Promise<boolean> => {
  if (roleCodes.length === 0) {
    return true;
  }
  const subquery = db
    .select()
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .innerJoin(user, eq(userRole.userId, user.id))
    .where(
      and(
        eq(user.username, username),
        inArray(role.code, roleCodes),
        eq(userRole.tenantId, user.activeTenantId),
        eq(role.tenantId, user.activeTenantId)
      )
    );

  const result = await db
    .select({
      exists: sql<boolean>`exists(${subquery})`
    })
    .from(sql`(select 1) as dummy`)
    .limit(1);

  return result[0]?.exists || false;
}

const userHasPermissions = async (username: string, permissionCodes: string[]): Promise<boolean> => {
  if (permissionCodes.length === 0) {
    return true;
  }
  const subquery = db
    .select()
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .innerJoin(rolePermission, eq(role.id, rolePermission.roleId))
    .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
    .innerJoin(user, eq(userRole.userId, user.id))
    .where(
      and(
        eq(user.username, username),
        inArray(permission.code, permissionCodes),
        eq(userRole.tenantId, user.activeTenantId),
        eq(role.tenantId, user.activeTenantId),
        eq(rolePermission.tenantId, user.activeTenantId),
        eq(permission.tenantId, user.activeTenantId)
      )
    );

  const result = await db
    .select({
      exists: sql<boolean>`exists(${subquery})`
    })
    .from(sql`(select 1) as dummy`)
    .limit(1);

  return result[0]?.exists || false;
}