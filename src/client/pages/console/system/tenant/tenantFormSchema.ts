import axios from 'axios';
import { z } from 'zod';

export const tenantFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().nonempty("Code is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().optional()
}).refine(
  async (data) => {
    // Check if the tenant code is unique
    try {
      const response = await axios.post('/api/system/tenant/validate-code', data);
      return response.status == 200;
    } catch (error) {
      console.error("Error validating tenant code:", error);
      return false;
    }

  },
  {
    message: "Code must be unique",
    path: ["code"],
  }
);
