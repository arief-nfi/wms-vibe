import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import OptionForm from "./OptionForm";
import { optionFormSchema } from "./optionFormSchema";
import Breadcrumbs, {
  BreadcrumbItem,
  useBreadcrumbs,
  createBreadcrumbItems,
} from "@client/components/console/Breadcrumbs";

const OptionAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Using the enhanced breadcrumbs with React state
  const { items: breadcrumbs, updateItem } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Options",
        onClick: () => navigate("/console/system/option"),
      },
      {
        label: "Add Option",
      },
    ])
  );

  const form = useForm<z.infer<typeof optionFormSchema>>({
    resolver: zodResolver(optionFormSchema),
    mode: "onSubmit",
    reValidateMode:"onSubmit",
    defaultValues: {
      id: "",
      tenantId: user?.activeTenant.id || "",
      code: "",
      name: "",
      value: "",
    },
  });

  function onSubmit(values: z.infer<typeof optionFormSchema>) {
    //console.log(values);
    setIsLoading(true);

    axios
      .post("/api/system/option/add", values)
      .then(() => {
        //console.log("Option created successfully");
        navigate("/console/system/option");
        toast.success("Option has been created.");
      })
      .catch((error) => {
        console.error("Error creating option:", error);
        toast.error("Failed to create option.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onCancel() {
    navigate("/console/system/option");
  }

  useEffect(() => {
    //form.setValue("tenantId", user?.activeTenant.id || '');
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Options</h1>
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
            <OptionForm form={form} onSubmit={onSubmit} onCancel={onCancel} />
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionAdd;
