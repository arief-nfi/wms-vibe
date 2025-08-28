import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../lib/db';
import { role, tenant, user } from '../lib/db/schema/system';

export const userRegistrationSchema = z.object({
  username: z.string().nonempty("Username is required")
  .refine((val) => !val.includes('@'), {
    message: "Username must not contain '@'",
    path: ["username"],
  }),
  activeTenantCode: z.string().nonempty("ActiveTenantCode is required"),
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
    // check unique code when create data
    const newUsername = `${data.username}@${data.activeTenantCode}`;
    const existing = await db
      .select()
      .from(user)
      .where(sql`lower(${user.username}) = ${newUsername.toLowerCase()}`);
    return existing.length === 0;
  },
  {
    message: "Username already exists",
    path: ["username"],
  }
);

export const userLoginSchema = z.object({
  username: z.string().nonempty("Username is required"),
  password: z.string().nonempty("Password is required"),
});

export const userAddSchema = z.object({
  activeTenantId: z.string().nonempty("TenantId is required"),
  activeTenantCode: z.string().nonempty("TenantCode is required"),
  username: z.string().nonempty("Username is required")
  .refine((val) => !val.includes('@'), {
    message: "Username must not contain '@'",
    path: ["username"],
  }),
  fullname: z.string().nonempty("Fullname is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().nonempty("Confirm Password is required"),
  email: z.email().optional(),
  avatar: z.string().optional(),
  roleIds: z.array(z.string()).optional()
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
    // check unique code when create data
    const newUsername = `${data.username}@${data.activeTenantCode}`;
    console.log("New username:", newUsername);
    const existing = await db
      .select()
      .from(user)
      .where(sql`lower(${user.username}) = ${newUsername.toLowerCase()}`);
    return existing.length === 0;
  },
  {
    message: "Username already exists",
    path: ["username"],
  }
)
.refine(
  async (data) => {
    // check roleIds in the same tenant
    for (const roleId of data.roleIds || []) {
      const existing = await db
        .select()
        .from(role)
        .where(sql`${role.id} = ${roleId} AND ${role.tenantId} = ${data.activeTenantId}`);
      if (existing.length === 0) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Role ID is invalid",
    path: ["roleIds"],
  }
);

export const userEditSchema = z.object({
  id: z.string().nonempty("ID is required"),
  username: z.string().nonempty("Username is required")
  .refine((val) => !val.includes('@'), {
    message: "Username must not contain '@'",
    path: ["username"],
  }),
  activeTenantId: z.string().nonempty("TenantId is required"),
  activeTenantCode: z.string().nonempty("TenantCode is required"),
  fullname: z.string().nonempty("Fullname is required"),
  email: z.email().optional(),
  avatar: z.string().optional(),
  status: z.enum(["active", "inactive"]).nonoptional("Status is required"),
  roleIds: z.array(z.string()).optional()
})
.refine(
  async (data) => {
    // check unique code when edit data
    const updatedUsername = `${data.username}@${data.activeTenantCode}`;
    const existing = await db
      .select()
      .from(user)
      .where(sql`lower(${user.username}) = ${updatedUsername.toLowerCase()} AND ${user.id} != ${data.id}`);
    return existing.length === 0;
  },
  {
    message: "Username already exists",
    path: ["username"],
  }
)
.refine(
  async (data) => {
    // check roleIds in the same tenant
    for (const roleId of data.roleIds || []) {
      const existing = await db
        .select()
        .from(role)
        .where(sql`${role.id} = ${roleId} AND ${role.tenantId} = ${data.activeTenantId}`);
      if (existing.length === 0) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Role ID is invalid",
    path: ["roleIds"],
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

export const usernameValidationSchema = z.object({
  id: z.string().optional(),
  activeTenantCode: z.string().nonempty("ActiveTenantCode is required"),
  username: z.string().nonempty("Username is required")
  .refine((val) => !val.includes('@'), {
    message: "Username must not contain '@'",
    path: ["username"],
  }),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const username = `${data.username}@${data.activeTenantCode}`;
      const existing = await db
        .select()
        .from(user)
        .where(sql`lower(${user.username}) = ${username.toLowerCase()} AND ${user.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const username = `${data.username}@${data.activeTenantCode}`;
      const existing = await db
        .select()
        .from(user)
        .where(sql`lower(${user.username}) = ${username.toLowerCase()}`);
      return existing.length === 0;
    }
  },
  {
    message: "Username already exists",
    path: ["username"],
  }
);

export const userForgetPasswordSchema = z.object({
  username: z.string().nonempty("Username is required")
})

export const tenantRegistrationSchema = z.object({
  activeTenantName: z.string().nonempty("ActiveTenantName Name is required"),
  activeTenantCode: z.string().nonempty("ActiveTenantCode is required"),
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
    // check unique code when create data
    const newUsername = `${data.username}@${data.activeTenantCode}`;
    const existing = await db
      .select()
      .from(user)
      .where(sql`lower(${user.username}) = ${newUsername.toLowerCase()}`);
    return existing.length === 0;
  },
  {
    message: "Username already exists",
    path: ["username"],
  }
)
.refine(
  async (data) => {
    // check unique code when create data
    const existing = await db
      .select()
      .from(tenant)
      .where(sql`lower(${tenant.code}) = ${data.activeTenantCode.toLowerCase()}`);
    return existing.length === 0;
  },
  {
    message: "Tenant code already exists",
    path: ["tenantCode"],
  }
);

export const tenantCodeRegistrationValidationSchema = z.object({
  id: z.string().optional(),
  activeTenantCode: z.string().nonempty("ActiveTenantCode is required"),
}).refine(
  async (data) => {
    if (data.id) {
      // check unique code when edit data
      const existing = await db
        .select()
        .from(tenant)
        .where(sql`lower(${tenant.code}) = ${data.activeTenantCode.toLowerCase} AND ${tenant.id} != ${data.id}`);
      return existing.length === 0;
    } else {
      // check unique code when create data
      const existing = await db
        .select()
        .from(tenant)
        .where(sql`lower(${tenant.code}) = ${data.activeTenantCode.toLowerCase()}`);
      return existing.length === 0;
    }
  },
  {
    message: "ActiveTenantCode already exists",
    path: ["activeTenantCode"],
  }
);