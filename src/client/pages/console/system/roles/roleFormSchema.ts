import axios from 'axios';
import { ref } from 'process';
import { z } from 'zod';

export const roleFormSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  code: z.string().nonempty("Code is required"),
  name: z.string().nonempty("Name is required"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional()
})
.refine(
  (data) => data.code.toUpperCase() !== "SYSADMIN",
  {
    message: "Role Code is reserved",
    path: ["code"],
  }
)
.refine(
  async (data) => {
    // Check if the role code is unique within the tenant
    try {
      const response = await axios.post('/api/system/role/validate-code', data);
      return response.status == 200;  
    } catch (error) {
      console.error("Error validating role code:", error);
      return false;
    }
    
  },
  {
    message: "Code must be unique",
    path: ["code"],
  }
);

export const roleImportSchema = z.object({
  file: z.instanceof(File, { message: "File is required" })
    .refine((file) => file.size > 0, { message: "File is required" })
    .refine((file) => file.type === "text/csv" || file.name.endsWith(".csv"), { message: "File must be a CSV" }), 
})
