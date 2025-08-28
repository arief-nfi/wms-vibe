import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db';
import { tenant } from '../lib/db/schema/system';

export const tenantSchema = z.object({
  id: z.string().optional(),
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
        .from(tenant)
        .where(sql`lower(${tenant.code}) = ${data.code.toLowerCase} AND ${tenant.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(tenant)
        .where(sql`lower(${tenant.code}) = ${data.code.toLowerCase()}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);

export const tenantCodeValidationSchema = z.object({
  id: z.string().optional(),
  code: z.string().nonempty("Code is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(tenant)
        .where(sql`lower(${tenant.code}) = ${data.code.toLowerCase} AND ${tenant.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(tenant)
        .where(sql`lower(${tenant.code}) = ${data.code.toLowerCase()}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);