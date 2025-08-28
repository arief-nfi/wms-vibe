import axios from "axios";
import z from "zod";
import { tenant } from "../../../server/lib/db/schema/system";

export const userRegistrationSchema = z.object({
  username: z.string().nonempty("Username is required")
  .refine((val) => !val.includes('@'), {
    message: "Username must not contain '@'",
    path: ["username"],
  }),
  activeTenantCode: z.string().nonempty("TenantCode is required"),  
  fullname: z.string().nonempty("Fullname is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().nonempty("Confirm Password is required"),
})
.refine(
  (data) => {
    return data.password === data.confirmPassword
  },
  {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  }
)
.refine(
  async (data) => {
    // Check if the role code is unique within the tenant
    try {
      const response = await axios.post('/api/auth/validate-username', data);
      return response.status == 200;  
    } catch (error) {
      console.error("Error validating username:", error);
      return false;
    }
    
  },
  {
    message: "Username must be unique",
    path: ["username"],
  }
);

export const tenantRegistrationSchema = z.object({
  activeTenantName: z.string().nonempty("Tenant Name is required"),
  activeTenantCode: z.string().nonempty("Tenant Code is required"),
  username: z.string().nonempty("Username is required")
  .refine((val) => !val.includes('@'), {
    message: "Username must not contain '@'",
    path: ["username"],
  }),
  fullname: z.string().nonempty("Fullname is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().nonempty("Confirm Password is required"),
})
.refine(
  (data) => {
    return data.password === data.confirmPassword
  },
  {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  }
)
.refine(
  async (data) => {
    // Check if the role code is unique within the tenant
    try {
      const response = await axios.post('/api/auth/validate-username', data);
      return response.status == 200;  
    } catch (error) {
      console.error("Error validating username:", error);
      return false;
    }
    
  },
  {
    message: "Username must be unique",
    path: ["username"],
  }
)
.refine(
  async (data) => {
    // Check if the role code is unique within the tenant
    try {
      const response = await axios.post('/api/auth/validate-tenantcode', data);
      return response.status == 200;  
    } catch (error) {
      console.error("Error validating tenantCode:", error);
      return false;
    }
    
  },
  {
    message: "Tenant code must be unique",
    path: ["tenantCode"],
  }
);

export const forgetPasswordSchema = z.object({
  username: z.string().nonempty("Username is required")
}); 

export const userResetPasswordSchema = z.object({
  id: z.string().nonempty("ID is required"),
  activeTenantId: z.string().nonempty("TenantId is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().nonempty("Confirm Password is required")
})
.refine(
  (data) => {
    return data.password === data.confirmPassword
  },
  {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  }
);
