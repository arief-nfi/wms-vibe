import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db';
import { permission } from '../lib/db/schema/system';

export const permissionSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().max(255, "Description must be up to 255 characters")
    .optional()
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(permission)
        .where(sql`${permission.code} = ${data.code} AND ${permission.tenantId} != ${data.tenantId} AND ${permission.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(permission)
        .where(sql`${permission.code} = ${data.code} AND ${permission.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);

export const permissionCodeValidationSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(permission)
        .where(sql`${permission.code} = ${data.code} AND ${permission.tenantId} = ${data.tenantId} AND ${permission.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(permission)
        .where(sql`${permission.code} = ${data.code} AND ${permission.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);