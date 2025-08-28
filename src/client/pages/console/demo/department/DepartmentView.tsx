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
import DepartmentForm from "./DepartmentForm";
import { departmentFormSchema } from "./departmentFormSchema";

import ConfirmDialog from "@client/components/console/ConfirmDialog";
import { parse } from "date-fns";

const DepartmentView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Departments",
          onClick: () => navigate("/console/demo/department"),
        },
        {
          label: "View Department",
        },
      ])
    );

  const form = useForm<z.infer<typeof departmentFormSchema>>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      id: "",
      tenantId: user?.activeTenant.id || "",
      name: "",
      group: "",
      since: new Date(),
      inTime: new Date(),
      outTime: new Date(),
    },
  });

  function onEdit() {
    navigate(`/console/demo/department/${id}/edit`);
  }

  function onDelete() {
    setConfirmDelete(true);
  }

  function onConfirmDelete() {
    axios
      .delete(`/api/demo/department/${id}/delete`)
      .then(() => {
        toast.success("Department deleted successfully");
        navigate(`/console/demo/department`);
      })
      .catch((error) => {
        toast.error("Failed to delete department");
      });
  }

  useEffect(() => {
    axios.get(`/api/demo/department/${id}`).then((response) => {
      form.setValue("id", response.data.id);
      form.setValue("tenantId", response.data.tenantId);
      form.setValue("name", response.data.name);
      form.setValue("group", response.data.group);
      form.setValue("since", parse(response.data.since, "yyyy-MM-dd", new Date()));
      form.setValue("inTime", parse(response.data.inTime, "HH:mm:ss", new Date()));
      form.setValue("outTime", parse(response.data.outTime, "HH:mm:ss", new Date()));
      updateBreadcrumbItem(1, { label: response.data.name });
    });
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Departments</h1>
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
            <DepartmentForm
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
        description='This action cannot be undone. This will permanently delete the department and remove all associated data.'
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default DepartmentView;
