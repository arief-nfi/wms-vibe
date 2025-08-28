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
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import TenantForm from "./TenantForm";
import { tenantFormSchema } from "./tenantFormSchema";

import ConfirmDialog from "@client/components/console/ConfirmDialog";

const TenantView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Tenants",
          onClick: () => navigate("/console/system/tenant"),
        },
        {
          label: "View Tenant",
        },
      ])
    );

  const form = useForm<z.infer<typeof tenantFormSchema>>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      id: "",
      code: "",
      name: "",
      description: "",
    },
  });

  function onEdit() {
    navigate(`/console/system/tenant/${id}/edit`);
  }

  function onDelete() {
    setConfirmDelete(true);
  }

  function onConfirmDelete() {
    axios
      .delete(`/api/system/tenant/${id}/delete`)
      .then(() => {
        toast.success("Tenant deleted successfully");
        navigate(`/console/system/tenant`);
      })
      .catch((error) => {
        toast.error("Failed to delete tenant");
      });
  }

  useEffect(() => {
    axios.get(`/api/system/tenant/${id}`).then((response) => {
      form.setValue("id", response.data.id);
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
          <h1 className="text-2xl font-semibold">Tenants</h1>
        </div>
        <div className="ml-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      </header>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-2 py-2 md:gap-6">
          <div className="bg-card rounded-lg border p-6 w-full">
            <TenantForm
              form={form}
              onEdit={onEdit}
              onDelete={onDelete}
              readonly={true}
            />
          </div>
        </div>
      </div>
      <ConfirmDialog
        title='Confirm Delete'
        description='This action cannot be undone. This will permanently delete the tenant and remove all associated data.'
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default TenantView;
