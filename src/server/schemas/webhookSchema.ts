import { z } from 'zod';
import { db } from '../lib/db';
import { webhook } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

export const webhookAddSchema = z.object({
  partnerId: z.string().uuid('Invalid partner ID'),
  eventType: z.string().min(1, 'Event type is required').max(100),
  url: z.string().url('Invalid URL').max(1000),
  isActive: z.boolean().default(true),
});

export const webhookEditSchema = webhookAddSchema.extend({
  id: z.string().uuid('Invalid webhook ID'),
});

export const webhookQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
  eventType: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type WebhookAddData = z.infer<typeof webhookAddSchema>;
export type WebhookEditData = z.infer<typeof webhookEditSchema>;
export type WebhookQueryParams = z.infer<typeof webhookQuerySchema>;