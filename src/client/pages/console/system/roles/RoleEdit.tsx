import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import RoleForm, { PermissionOption } from "./RoleForm";
import { roleFormSchema } from "./roleFormSchema";
import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";

const RoleEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [permissionOptions, setPermissionOptions] = useState<PermissionOption[]>([]);

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Roles",
          onClick: () => navigate("/console/system/role"),
        },
        {
          label: "Role code",
          onClick: () => navigate(`/console/system/role/${id}`),
        },
        {
          label: "Edit",
        },
      ])
    );

  const form = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    mode: "onSubmit",
    reValidateMode:"onSubmit",
    defaultValues: {
      id: "",
      tenantId: user?.activeTenant.id || "",
      code: "",
      name: "",
      description: "",
      permissionIds: [],
    },
  });

  function onSubmit(values: z.infer<typeof roleFormSchema>) {
    console.log(values);
    setIsLoading(true);
    axios
      .put(`/api/system/role/${id}/edit`, values)
      .then(() => {
        //console.log("Role created successfully");
        navigate(`/console/system/role/${id}`);
        toast.success("Role has been updated.");
      })
      .catch((error) => {
        console.error("Error updating role:", error);
        toast.error("Failed to update role.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onCancel() {
    navigate(`/console/system/role/${id}`);
  }

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/system/role/${id}`);
        form.setValue("id", response.data.id);
        form.setValue("tenantId", response.data.tenantId);
        form.setValue("code", response.data.code);
        form.setValue("name", response.data.name);
        form.setValue("description", response.data.description);
        form.setValue("permissionIds", response.data.permissions.map((p:{id:string}) => p.id) || []);
        updateBreadcrumbItem(1, { label: response.data.code });
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRefPermissions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/system/role/ref-permissions');
        const permissions: PermissionOption[] = response.data.map((permission: any) => ({
          id: permission.id,
          code: permission.code,
          name: permission.name
        }));
        
        setPermissionOptions(permissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRefPermissions();
    fetchRole();
    
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Roles</h1>
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
            <RoleForm form={form} onSubmit={onSubmit} onCancel={onCancel} permissionOptions={permissionOptions} />
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleEdit;
