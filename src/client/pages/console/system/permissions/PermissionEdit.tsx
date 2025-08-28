import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import PermissionForm from "./PermissionForm";
import { permissionFormSchema } from "./permissionFormSchema";
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from "@client/components/console/Breadcrumbs";

const PermissionEdit = () => {

  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Roles",
          onClick: () => navigate("/console/system/role"),
        },
        {
          label: "Add Role",
        },
      ])
    );

  const form = useForm<z.infer<typeof permissionFormSchema>>({
    resolver: zodResolver(permissionFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      id: "",
      tenantId: user?.activeTenant.id || '',
      code: "",
      name: "",
      description: ""
    }
  });

  function onSubmit(values: z.infer<typeof permissionFormSchema>) {
    //console.log(values);
    setIsLoading(true);
    axios.put(`/api/system/permission/${id}/edit`, values).then(() => {
      //console.log("permission created successfully");
      navigate("/console/system/permission");
      toast.success("Permission has been updated.");
    }).catch((error) => {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission.");
    })
      .finally(() => {
        setIsLoading(false);
    });
  }

  function onCancel() {
    navigate(`/console/system/permission/${id}`);
  }

  useEffect(() => {
    axios.get(`/api/system/permission/${id}`).then((response) => {
      form.setValue("id", response.data.id);
      form.setValue("tenantId", response.data.tenantId);
      form.setValue("code", response.data.code);
      form.setValue("name", response.data.name);
      form.setValue("description", response.data.description);
      updateBreadcrumbItem(1, { label: response.data.code });
    });
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Permissions</h1>
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
            <PermissionForm form={form} onSubmit={onSubmit} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionEdit