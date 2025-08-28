import axios from 'axios';
import { z } from 'zod';


export const userFormSchema = z.object({
  id: z.string().optional(),
  activeTenantId: z.string().nonempty("TenantId is required"),
  activeTenantCode: z.string().nonempty("TenantId is required"),
  username: z.string().nonempty("Username is required"),
  fullname: z.string().nonempty("Fullname is required"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  email: z.email().optional(),
  avatar: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  roleIds: z.array(z.string()).optional()
})
.refine( 
  (data) => {
    if (data.id)  {
      if (!data.status || data.status.length === 0) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Status is required",
    path: ["status"],
  }
)
.refine( 
  (data) => {
    if (!data.id)  {
      if (!data.password || data.password.length < 6) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Password must be at least 6 characters long",
    path: ["password"],
  }
)
.refine( 
  (data) => {
    if (data.password && data.password !== data.confirmPassword)  {
      return false;
    }
    return true;
  },
  {
    message: "Password confirmation does not match",
    path: ["confirmPassword"],
  }
)
.refine(
  async (data) => {
    return !data.username.includes('@');
  },
  {
    message: "Username must not contain '@'",
    path: ["username"],
  }
)
.refine(
  async (data) => {
    // Check if the role code is unique within the tenant
    try {
      const response = await axios.post('/api/system/user/validate-username', data);
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
