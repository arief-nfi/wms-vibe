import { sql } from 'drizzle-orm';
import { refine, z } from 'zod';
import { db } from '../lib/db';
import { role } from '../lib/db/schema/system';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { ref } from 'process';

const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window);

export const roleSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required")
  .refine(
    (val) => val.toUpperCase() !== "SYSADMIN",
    {
      message: "Role Code is reserved",
      path: ["code"],
    }
  )
  .transform(val => val ? DOMPurifyInstance.sanitize(val) : val),
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional()
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(role)
        .where(sql`${role.code} = ${data.code} AND ${role.tenantId} = ${data.tenantId} AND ${role.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(role)
        .where(sql`${role.code} = ${data.code} AND ${role.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);

export const roleCodeValidationSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required")
  .refine(
    (val) => val !== "SYSADMIN",
    {
      message: "Role Code is reserved",
      path: ["code"],
    }
  ),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(role)
        .where(sql`${role.code} = ${data.code} AND ${role.tenantId} = ${data.tenantId} AND ${role.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(role)
        .where(sql`${role.code} = ${data.code} AND ${role.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);
