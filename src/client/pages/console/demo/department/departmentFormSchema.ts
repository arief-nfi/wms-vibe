import axios from 'axios';
import { ref } from 'process';
import { z } from 'zod';

export const departmentFormSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().nonempty("TenantId is required"),
  name: z.string().nonempty("Name is required"),
  group: z.string().nonempty("Group is required"),
  since: z.date().nonoptional("Since is required"),
  inTime: z.date().nonoptional("InTime is required"),
  outTime: z.date().nonoptional("OutTime is required"),
}).refine(
  async (data) => {
    // Check if the option code is unique within the tenant
    try {
      const response = await axios.post('/api/demo/department/validate-name', data);
      return response.status == 200;
    } catch (error) {
      console.error("Error validating department name:", error);
      return false;
    }

  },
  {
    message: "Name must be unique",
    path: ["name"],
  }
);
