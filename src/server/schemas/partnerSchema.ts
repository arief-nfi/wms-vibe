import { z } from 'zod';
import { db } from '../lib/db';
import { partner } from '../lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

// Client-side input schema (without tenantId)
export const partnerInputSchema = z.object({
  code: z.string()
    .min(1, "Code is required")
    .max(50, "Code must be at most 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, underscores, and hyphens"),
  name: z.string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  picName: z.string()
    .min(1, "PIC Name is required")
    .max(255, "PIC Name must be at most 255 characters"),
  picEmail: z.string()
    .email("Invalid email format")
    .max(255, "PIC Email must be at most 255 characters"),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Server-side schema with tenantId (for validation after adding tenantId)
export const partnerAddSchema = partnerInputSchema.extend({
  tenantId: z.string().uuid("Invalid tenant ID"),
})
.refine(async (data) => {
  // Check unique code per tenant
  const existingByCode = await db
    .select()
    .from(partner)
    .where(and(
      eq(partner.tenantId, data.tenantId),
      sql`lower(${partner.code}) = ${data.code.toLowerCase()}`
    ));
  return existingByCode.length === 0;
}, {
  message: "Partner code already exists in this tenant",
  path: ["code"],
})
.refine(async (data) => {
  // Check unique name per tenant
  const existingByName = await db
    .select()
    .from(partner)
    .where(and(
      eq(partner.tenantId, data.tenantId),
      sql`lower(${partner.name}) = ${data.name.toLowerCase()}`
    ));
  return existingByName.length === 0;
}, {
  message: "Partner name already exists in this tenant",
  path: ["name"],
});

// Client-side edit input schema 
export const partnerEditInputSchema = partnerInputSchema.extend({
  id: z.string().uuid("Invalid partner ID"),
});

// Server-side edit schema with tenantId
export const partnerEditSchema = partnerEditInputSchema.extend({
  tenantId: z.string().uuid("Invalid tenant ID"),
})
.refine(async (data) => {
  // Check unique code per tenant (excluding current record)
  const existingByCode = await db
    .select()
    .from(partner)
    .where(and(
      sql`lower(${partner.code}) = ${data.code.toLowerCase()}`,
      sql`${partner.id} != ${data.id}`
    ));
  return existingByCode.length === 0;
}, {
  message: "Partner code already exists",
  path: ["code"],
})
.refine(async (data) => {
  // Check unique name per tenant (excluding current record)
  const existingByName = await db
    .select()
    .from(partner)
    .where(and(
      sql`lower(${partner.name}) = ${data.name.toLowerCase()}`,
      sql`${partner.id} != ${data.id}`
    ));
  return existingByName.length === 0;
}, {
  message: "Partner name already exists",
  path: ["name"],
});

export const partnerQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default(1),
  perPage: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default(10),
  sort: z.enum(["code", "name", "picName", "picEmail", "status", "createdAt", "updatedAt"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  filter: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

// Type exports
export type PartnerInputData = z.infer<typeof partnerInputSchema>;
export type PartnerAddData = z.infer<typeof partnerAddSchema>;
export type PartnerEditInputData = z.infer<typeof partnerEditInputSchema>;
export type PartnerEditData = z.infer<typeof partnerEditSchema>;
export type PartnerQueryParams = z.infer<typeof partnerQuerySchema>;