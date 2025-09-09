import { z } from 'zod';
import { db } from '../lib/db';
import { integrationInbound, partner } from '../lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

// Client-side input schema (without tenant validation)
export const integrationInboundInputSchema = z.object({
  partnerId: z.string().uuid("Invalid partner ID"),
  apiKey: z.string()
    .min(32, "API Key must be at least 32 characters")
    .max(128, "API Key must be at most 128 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "API Key must contain only letters, numbers, underscores, and hyphens"),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// Server-side schema with tenant validation
export const integrationInboundAddSchema = integrationInboundInputSchema
.refine(async (data) => {
  // Check unique API key globally
  const existingByKey = await db
    .select()
    .from(integrationInbound)
    .where(eq(integrationInbound.apiKey, data.apiKey));
  return existingByKey.length === 0;
}, {
  message: "API Key already exists",
  path: ["apiKey"],
});

// Client-side edit input schema 
export const integrationInboundEditInputSchema = integrationInboundInputSchema.extend({
  id: z.string().uuid("Invalid integration inbound ID"),
});

// Server-side edit schema with validation
export const integrationInboundEditSchema = integrationInboundEditInputSchema
.refine(async (data) => {
  // Check unique API key globally (excluding current record)
  const existingByKey = await db
    .select()
    .from(integrationInbound)
    .where(and(
      eq(integrationInbound.apiKey, data.apiKey),
      sql`${integrationInbound.id} != ${data.id}`
    ));
  return existingByKey.length === 0;
}, {
  message: "API Key already exists",
  path: ["apiKey"],
});

export const integrationInboundQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default(1),
  perPage: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default(10),
  sort: z.enum(["apiKey", "status", "createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
  filter: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

// Type exports
export type IntegrationInboundInputData = z.infer<typeof integrationInboundInputSchema>;
export type IntegrationInboundAddData = z.infer<typeof integrationInboundAddSchema>;
export type IntegrationInboundEditInputData = z.infer<typeof integrationInboundEditInputSchema>;
export type IntegrationInboundEditData = z.infer<typeof integrationInboundEditSchema>;
export type IntegrationInboundQueryParams = z.infer<typeof integrationInboundQuerySchema>;