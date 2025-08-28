import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";
import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { parse } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import DepartmentForm from "./DepartmentForm";
import { departmentFormSchema } from "./departmentFormSchema";

const DepartmentEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Departments",
          onClick: () => navigate("/console/demo/department"),
        },
        {
          label: "Add Department",
        },
      ])
    );

  const form = useForm<z.infer<typeof departmentFormSchema>>({
    resolver: zodResolver(departmentFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
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

  function onSubmit(values: z.infer<typeof departmentFormSchema>) {
    //console.log(values);
    setIsLoading(true);
    axios
      .put(`/api/demo/department/${id}/edit`, values)
      .then(() => {
        //console.log("Department created successfully");
        navigate("/console/demo/department");
        toast.success("Department has been updated.");
      })
      .catch((error) => {
        console.error("Error updating department:", error);
        toast.error("Failed to update department.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onCancel() {
    navigate(`/console/demo/department/${id}`);
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
            <Breadcrumbs items={breadcrumbs} loading={isLoading} />
          </div>
        </div>
      </header>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-2 py-2 md:gap-6">
          <div className="bg-card rounded-lg border p-6 w-full">
            <DepartmentForm form={form} onSubmit={onSubmit} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DepartmentEdit;
