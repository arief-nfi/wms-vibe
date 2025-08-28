import TreeView, {
  TreeViewItem,
  TreeViewRef,
  updateItemCheckedState,
} from "@client/components/tree-view";
import { Button } from "@client/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@client/components/ui/form";
import { Input } from "@client/components/ui/input";
import { Lock, Pencil, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { userFormSchema } from "./userFormShema";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@client/components/ui/select";
import Authorized from "@client/components/auth/Authorized";

export interface RoleOption {
  id: string;
  code: string;
  name: string;
}

interface UserFormProps {
  form: UseFormReturn<z.infer<typeof userFormSchema>>;
  onSubmit?: (values: z.infer<typeof userFormSchema>) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangePassword?: () => void;
  readonly?: boolean;
  roleOptions?: RoleOption[];
}

/**
 * Converts permission options to TreeViewItem format using code field as parent-child relationship
 * @param roles Array of permission options
 * @param checkedRoleIds Array of permission IDs that should be checked
 * @returns TreeViewItem array with hierarchical structure based on permission codes
 */
export const convertRolesToTreeView = (
  roles: RoleOption[],
  checkedRoleIds: string[] = []
): TreeViewItem[] => {
  const tree: { [key: string]: TreeViewItem } = {};

  // Sort roles by code to ensure parent nodes are processed before children
  const sortedRoles = [...roles].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  sortedRoles.forEach((role) => {
    const codeParts = role.code.split(";");
    let currentPath = "";

    for (let i = 0; i < codeParts.length; i++) {
      const part = codeParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}.${part}` : part;

      if (!tree[currentPath]) {
        // Find the actual role data for this path
        const matchingRole = roles.find(
          (p) => p.code === currentPath
        );

        const isChecked = matchingRole
          ? checkedRoleIds.includes(matchingRole.id)
          : false;

        tree[currentPath] = {
          id: matchingRole?.id || currentPath,
          name:
            matchingRole?.name ||
            part.charAt(0).toUpperCase() +
              part.slice(1).replace(/([A-Z])/g, " $1"),
          type: i === codeParts.length - 1 ? "file" : "folder",
          children: i === codeParts.length - 1 ? undefined : [], // Only set children for non-leaf nodes
          checked: isChecked,
        };
      }

      // Link parent-child relationship
      if (parentPath && tree[parentPath]) {
        const existingChild = tree[parentPath].children?.find(
          (child) => child.id === tree[currentPath].id
        );
        if (!existingChild) {
          tree[parentPath].children?.push(tree[currentPath]);
        }
      }
    }
  });

  // Create hard-coded root node and add all top-level items under it
  const rootChildren: TreeViewItem[] = [];

  // Find all root-level items (those that don't have a parent in the tree)
  Object.keys(tree).forEach((key) => {
    const parts = key.split(".");
    if (parts.length === 1) {
      rootChildren.push(tree[key]);
    }
  });

  // Create the root node with all permissions under it
  const rootNode: TreeViewItem = {
    id: "roles-root",
    name: "Roles",
    type: "folder",
    children: rootChildren,
    checked: false,
  };

  return [rootNode];
};

const UserForm = ({
  form,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onChangePassword,
  readonly = false,
  roleOptions: roleOptions = [],
}: UserFormProps) => {
  const treeViewRef = useRef<TreeViewRef>(null);
  const [treeData, setTreeData] = useState<TreeViewItem[]>([]);

  // Update tree data when external tree items change
  useEffect(() => {
    if (roleOptions.length > 0) {
      const treeItems = convertRolesToTreeView(roleOptions, form.getValues("roleIds"));
      setTreeData(treeItems);
    }
  }, [roleOptions]);

  const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
    //console.log(`Checkbox clicked: ${item.id} - ${checked}`);
    setTreeData((prevData) =>
      updateItemCheckedState(prevData, item.id, checked)
    );
  };

  // Function to get checked permission IDs from tree data
  const getCheckedRoleIds = (): string[] => {
    return treeViewRef.current?.getCheckedItems().filter((item) => item.type === "file").map((item) => item.id) || [];
  };

  useEffect(() => {
    form.setValue("roleIds", getCheckedRoleIds());
  }, [treeData]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit ? onSubmit : () => {})}
        className="space-y-4"
      >
        <FormField
          disabled={readonly}
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
          disabled={readonly}
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
          disabled={readonly}
          control={form.control}
          name="activeTenantCode"
          render={({ field }) => (
            <FormItem hidden>
              <FormControl>
                <Input {...field} hidden />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          disabled={readonly}
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Username <span className="text-destructive">*</span>
              </FormLabel>
              <div className="col-span-12 md:col-span-10 space-y-2">
                <FormControl>
                  <div className="flex items-center gap-2">
                  <Input {...field} /> <span>@{form.getValues("activeTenantCode")}</span>
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          disabled={readonly}
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Name <span className="text-destructive">*</span>
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
          disabled={readonly}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Email
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
        {form.getValues("id") && 
          <FormField
            disabled={readonly}
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="grid grid-cols-12 gap-2 items-start">
                <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                  Status <span className="text-destructive">*</span>
                </FormLabel>
                <div className="col-span-12 md:col-span-10 space-y-2">
                  <FormControl>
                    {/* <Input {...field} /> */}
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readonly}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="inactive">inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        }
        {!form.getValues("id") && 
          <FormField
            disabled={readonly}
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid grid-cols-12 gap-2 items-start">
                <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                  Password <span className="text-destructive">*</span>
                </FormLabel>
                <div className="col-span-12 md:col-span-10 space-y-2">
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        }
        {!form.getValues("id") && 
          <FormField
            disabled={readonly}
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="grid grid-cols-12 gap-2 items-start">
                <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                  Confirm Password <span className="text-destructive">*</span>
                </FormLabel>
                <div className="col-span-12 md:col-span-10 space-y-2">
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        }
        <FormField
          disabled={readonly}
          control={form.control}
          name="roleIds"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Roles
              </FormLabel>
              <div className="col-span-12 md:col-span-10 space-y-2">
                <FormControl>
                  <TreeView
                    ref={treeViewRef}
                    data={treeData}
                    showCheckboxes={true}
                    readonly={readonly}
                    onCheckChange={handleCheckChange}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {!readonly && (
          <div className="flex gap-2 pt-2">
            <Button type="submit">
              <Save size={20} />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel ? onCancel : () => {}}
            >
              <X size={20} />
              Cancel
            </Button>
          </div>
        )}
        {readonly && (
          <div className="flex gap-2 pt-2">
            <Authorized roles={"SYSADMIN"} permissions={"system.user.edit"}>
              <Button
                type="button"
                variant="secondary"
                onClick={onEdit ? onEdit : () => {}}
              >
                <Pencil size={20} />
                Edit
              </Button>
            </Authorized>
            <Authorized roles={"SYSADMIN"} permissions={"system.user.delete"}>
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete ? onDelete : () => {}}
              >
                <X size={20} />
                Delete
              </Button>
            </Authorized>
            <Authorized roles={"SYSADMIN"} permissions={"system.user.edit"}>
              <Button
                type="button"
                variant="default"
                onClick={onChangePassword ? onChangePassword : () => {}}
              >
                <Lock size={20} />
                Change Password
              </Button>
            </Authorized>
          </div>
        )}
      </form>
    </Form>
  );
};

export default UserForm;
