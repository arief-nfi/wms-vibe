import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db';
import { option } from '../lib/db/schema/system';

export const optionSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required"),
  name: z.string().nonempty("Name is required"),
  value: z.string().nonempty("Value is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(option)
        .where(sql`${option.code} = ${data.code} AND ${option.tenantId} = ${data.tenantId} AND ${option.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(option)
        .where(sql`${option.code} = ${data.code} AND ${option.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);

export const optionCodeValidationSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(option)
        .where(sql`${option.code} = ${data.code} AND ${option.tenantId} = ${data.tenantId} AND ${option.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(option)
        .where(sql`${option.code} = ${data.code} AND ${option.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Code already exists",
    path: ["code"],
  }
);
