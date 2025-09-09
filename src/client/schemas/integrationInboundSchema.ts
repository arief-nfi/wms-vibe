import { z } from 'zod';

// Integration inbound form data schema
export const integrationInboundFormSchema = z.object({
  partnerId: z.string()
    .min(1, "Partner is required")
    .uuid("Invalid partner ID"),
  apiKey: z.string()
    .min(32, "API Key must be at least 32 characters")
    .max(128, "API Key must be at most 128 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "API Key must contain only letters, numbers, underscores, and hyphens"),
  description: z.string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
  status: z.enum(["active", "inactive"]),
});

// Integration inbound interface (matching server response)
export interface IntegrationInbound {
  id: string;
  partnerId: string;
  apiKey: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  // Partner details (from JOIN)
  partnerName?: string;
  partnerCode?: string;
}

// Form data type
export type IntegrationInboundFormData = z.infer<typeof integrationInboundFormSchema>;

// API response types
export interface IntegrationInboundResponse {
  success: boolean;
  data: IntegrationInbound;
}

export interface IntegrationInboundListResponse {
  success: boolean;
  data: IntegrationInbound[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Query parameters for integration inbound list
export interface IntegrationInboundQueryParams {
  page?: number;
  perPage?: number;
  sort?: 'apiKey' | 'status' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filter?: string;
  status?: 'active' | 'inactive';
}