import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db';
import { department } from '../lib/db/schema/demo';

export const departmentSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  name: z.string().nonempty("Name is required"),
  group: z.string().nonempty("Group is required"),
  since: z.coerce.date().nonoptional("Since is required"),
  inTime: z.coerce.date().nonoptional("InTime is required"),
  outTime: z.coerce.date().nonoptional("OutTime is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(department)
        .where(sql`${department.name} = ${data.name} AND ${department.tenantId} = ${data.tenantId} AND ${department.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(department)
        .where(sql`${department.name} = ${data.name} AND ${department.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Name already exists",
    path: ["name"],
  }
);

export const departmentNameValidationSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  name: z.string().nonempty("Name is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(department)
        .where(sql`${department.name} = ${data.name} AND ${department.tenantId} = ${data.tenantId} AND ${department.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(department)
        .where(sql`${department.name} = ${data.name} AND ${department.tenantId} = ${data.tenantId}`);
      return existing.length === 0;
    }
  },
  {
    message: "Name already exists",
    path: ["name"],
  }
);
