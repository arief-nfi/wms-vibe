import { z } from 'zod';

// Partner form data schema
export const partnerFormSchema = z.object({
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
  status: z.enum(["active", "inactive"]),
});

// Partner interface (matching server response)
export interface Partner {
  id: string;
  code: string;
  name: string;
  picName: string;
  picEmail: string;
  description?: string;
  status: 'active' | 'inactive';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Form data type
export type PartnerFormData = z.infer<typeof partnerFormSchema>;

// API response types
export interface PartnerResponse {
  success: boolean;
  data: Partner;
}

export interface PartnerListResponse {
  success: boolean;
  data: Partner[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// Query parameters for partner list
export interface PartnerQueryParams {
  page?: number;
  perPage?: number;
  sort?: 'code' | 'name' | 'picName' | 'picEmail' | 'status' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filter?: string;
  status?: 'active' | 'inactive';
}