import { z } from 'zod';

export const webhookEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});

export type WebhookEventFormData = z.infer<typeof webhookEventSchema>;

export interface WebhookEvent {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEventListResponse {
  success: boolean;
  data: WebhookEvent[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface WebhookEventResponse {
  success: boolean;
  data: WebhookEvent;
}

export interface WebhookEventDeleteResponse {
  success: boolean;
  message: string;
}