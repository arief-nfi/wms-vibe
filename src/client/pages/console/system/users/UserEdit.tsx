import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";
import UserForm, { RoleOption } from "./UserForm";
import { userFormSchema } from "./userFormShema";
import { useErrorHandler } from "@client/hooks/useErrorHandler";

const UserEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const { isAuthorized } = useAuth();
  const { throwError } = useErrorHandler();

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Users",
          onClick: () => navigate("/console/system/user"),
        },
        {
          label: "Username",
          onClick: () => navigate(`/console/system/user/${id}`),
        },
        {
          label: "Edit",
        },
      ])
    );

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    mode: "onSubmit",
    reValidateMode:"onSubmit",
    defaultValues: {
      id: "",
      activeTenantId: user?.activeTenant.id || "",
      activeTenantCode: user?.activeTenant.code || "",
      username: "",
      fullname: "",
      email: "",
      avatar: "",
      status: "active",
      roleIds: [],
    },
  });

  function onSubmit(values: z.infer<typeof userFormSchema>) {
    console.log(values);
    setIsLoading(true);
    axios
      .put(`/api/system/user/${id}/edit`, values)
      .then(() => {
        //console.log("Role created successfully");
        navigate(`/console/system/user/${id}`);
        toast.success("User has been updated.");
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        toast.error("Failed to update user.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onCancel() {
    navigate(`/console/system/user/${id}`);
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/system/user/${id}`);
        form.setValue("id", response.data.id);
        form.setValue("activeTenantId", response.data.activeTenantId);
        form.setValue("username", response.data.username.split('@')[0]);
        form.setValue("fullname", response.data.fullname);
        form.setValue("email", response.data.email || "");
        form.setValue("avatar", response.data.avatar || "");
        form.setValue("status", response.data.status);
        form.setValue("roleIds", response.data.roles.map((r:{id:string}) => r.id) || []);
        updateBreadcrumbItem(1, { label: response.data.username });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRefRoles = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/system/user/ref-roles');
        const roles: RoleOption[] = response.data.map((role: any) => ({
          id: role.id,
          code: role.code,
          name: role.name
        }));
        
        setRoleOptions(roles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRefRoles();
    fetchUser();
    
  }, []);

  useEffect(() => {
    if (!isAuthorized("SYSADMIN", "system.user.edit")) {
      throwError("User is not authorized to edit users");
    }
  }, [isLoading]);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Users</h1>
        </div>
        <div className="ml-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Breadcrumbs items={breadcrumbs} loading={isLoading} />
          </div>
        </div>
      </header>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-2 py-2 md:gap-6">
          <div className="bg-card rounded-lg border p-6 w-full">
            <UserForm form={form} onSubmit={onSubmit} onCancel={onCancel} roleOptions={roleOptions} />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserEdit;
