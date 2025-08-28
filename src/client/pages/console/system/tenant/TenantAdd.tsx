import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs
} from "@client/components/console/Breadcrumbs";
import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import TenantForm from "./TenantForm";
import { tenantFormSchema } from "./tenantFormSchema";

const TenantAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Using the enhanced breadcrumbs with React state
  const { items: breadcrumbs, updateItem } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Tenants",
        onClick: () => navigate("/console/system/tenant"),
      },
      {
        label: "Add Tenant",
      },
    ])
  );

  const form = useForm<z.infer<typeof tenantFormSchema>>({
    resolver: zodResolver(tenantFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      id: "",
      code: "",
      name: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof tenantFormSchema>) {
    //console.log(values);
    setIsLoading(true);

    axios
      .post("/api/system/tenant/add", values)
      .then(() => {
        //console.log("Tenant created successfully");
        navigate("/console/system/tenant");
        toast.success("Tenant has been created.");
      })
      .catch((error) => {
        console.error("Error creating tenant:", error);
        toast.error("Failed to create tenant.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onCancel() {
    navigate("/console/system/tenant");
  }

  useEffect(() => {
    //form.setValue("tenantId", user?.activeTenant.id || '');
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Tenants</h1>
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
            <TenantForm form={form} onSubmit={onSubmit} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </>
  );
};

export default TenantAdd;
