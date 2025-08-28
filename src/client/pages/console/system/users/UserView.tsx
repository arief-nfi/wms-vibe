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

import ConfirmDialog from "@client/components/console/ConfirmDialog";
import UserForm, { RoleOption } from "./UserForm";
import { userFormSchema } from "./userFormShema";

const UserView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);

  const { items: breadcrumbs, updateItem: updateBreadcrumbItem } =
    useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Users",
          onClick: () => navigate("/console/system/user"),
        },
        {
          label: "View User",
        },
      ])
    );

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
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

  function onEdit() {
    navigate(`/console/system/user/${id}/edit`);
  }

  function onDelete() {
    setConfirmDelete(true);
  }

  function onChangePassword() {
    navigate(`/console/system/user/${id}/reset-password`);
  }

  function onConfirmDelete() {
    axios
      .delete(`/api/system/user/${id}/delete`)
      .then(() => {
        toast.success("User deleted successfully");
        navigate(`/console/system/user`);
      })
      .catch((error) => {
        toast.error("Failed to delete user");
      });
  }

  useEffect(() => {
    const fetchRole = async () => {
      try {
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
        setRoleOptions(response.data.roles);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchRole();
    
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Users</h1>
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
            <UserForm
              form={form}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangePassword={onChangePassword} 
              readonly={true}
              roleOptions={roleOptions}
            />
          </div>
        </div>
      </div>
      <ConfirmDialog
        title='Confirm Delete'
        description='This action cannot be undone. This will permanently delete the role and remove all associated data.'
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default UserView;
