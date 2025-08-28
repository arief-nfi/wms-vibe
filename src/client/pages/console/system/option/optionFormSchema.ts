import axios from 'axios';
import { ref } from 'process';
import { z } from 'zod';

export const optionFormSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required"),
  name: z.string().nonempty("Name is required"),
  value: z.string().nonempty("Value is required"),
}).refine(
  async (data) => {
    // Check if the option code is unique within the tenant
    try {
      const response = await axios.post('/api/system/option/validate-code', data);
      return response.status == 200;  
    } catch (error) {
      console.error("Error validating option code:", error);
      return false;
    }
    
  },
  {
    message: "Code must be unique",
    path: ["code"],
  }
);
