import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";
import { Button } from "@client/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@client/components/ui/form";
import { Input } from "@client/components/ui/input";
import { useAuth } from "@client/provider/AuthProvider";
import axios from "axios";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { userResetPasswordSchema } from "./userFormShema";

const UserResetPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

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
          label: "Reset Password",
        },
      ])
    );

  const form = useForm<z.infer<typeof userResetPasswordSchema>>({
    resolver: zodResolver(userResetPasswordSchema),
    mode: "onSubmit",
    reValidateMode:"onSubmit",
    defaultValues: {
      id: "",
      activeTenantId: user?.activeTenant.id || "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof userResetPasswordSchema>) {
    console.log(values);
    setIsLoading(true);
    axios
      .post(`/api/system/user/${id}/reset-password`, values)
      .then(() => {
        //console.log("Role created successfully");
        navigate(`/console/system/user/${id}`);
        toast.success("User password has been reset.");
      })
      .catch((error) => {
        console.error("Error updating  password:", error);
        toast.error("Failed to reset user password.");
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
        updateBreadcrumbItem(1, { label: response.data.username });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    
  }, []);

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
            
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem hidden>
                      <FormControl>
                        <Input {...field} hidden />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activeTenantId"
                  render={({ field }) => (
                    <FormItem hidden>
                      <FormControl>
                        <Input {...field} hidden />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-12 gap-2 items-start">
                      <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                        Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="col-span-12 md:col-span-10 space-y-2">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-12 gap-2 items-start">
                      <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                        Confirm Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <div className="col-span-12 md:col-span-10 space-y-2">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-2">
                  <Button type="submit">
                    <Save size={20} />
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    <X size={20} />
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>

          </div>
        </div>
      </div>
    </>
  );
};

export default UserResetPassword;
