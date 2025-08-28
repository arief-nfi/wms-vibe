import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import RoleForm from "./PermissionForm";
import { permissionFormSchema } from "./permissionFormSchema";
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from "@client/components/console/Breadcrumbs";

const PermissionAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);


  // Using the enhanced breadcrumbs with React state
  const { items: breadcrumbs, updateItem } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Permissions",
        onClick: () => navigate("/console/system/permission"),
      },
      {
        label: "Add Permission",
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

    axios.post("/api/system/permission/add", values).then(() => {
      //console.log("Permission created successfully");
      navigate("/console/system/permission");
      toast.success("Permission has been created.");
    }).catch((error) => {
      console.error("Error creating permission:", error);
      toast.error("Failed to create permission.");
    })
      .finally(() => {
        setIsLoading(false);
    });
  }

  function onCancel() {
    navigate("/console/system/permission");
  }

  useEffect(() => {
    //form.setValue("tenantId", user?.activeTenant.id || '');
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
            <RoleForm form={form} onSubmit={onSubmit} onCancel={onCancel} />
          </div>
        </div>
      </div>

    </>
  );
};

export default PermissionAdd;
