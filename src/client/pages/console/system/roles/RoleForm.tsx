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
import { Pencil, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { roleFormSchema } from "./roleFormSchema";
import Authorized from "@client/components/auth/Authorized";

export interface PermissionOption {
  id: string;
  code: string;
  name: string;
}

interface RoleFormProps {
  form: UseFormReturn<z.infer<typeof roleFormSchema>>;
  onSubmit?: (values: z.infer<typeof roleFormSchema>) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  readonly?: boolean;
  permissionOptions?: PermissionOption[];
}

/**
 * Converts permission options to TreeViewItem format using code field as parent-child relationship
 * @param permissions Array of permission options
 * @param checkedPermissionIds Array of permission IDs that should be checked
 * @returns TreeViewItem array with hierarchical structure based on permission codes
 */
export const convertPermissionsToTreeView = (
  permissions: PermissionOption[],
  checkedPermissionIds: string[] = []
): TreeViewItem[] => {
  const tree: { [key: string]: TreeViewItem } = {};

  // Sort permissions by code to ensure parent nodes are processed before children
  const sortedPermissions = [...permissions].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  sortedPermissions.forEach((permission) => {
    const codeParts = permission.code.split(".");
    let currentPath = "";

    for (let i = 0; i < codeParts.length; i++) {
      const part = codeParts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}.${part}` : part;

      if (!tree[currentPath]) {
        // Find the actual permission data for this path
        const matchingPermission = permissions.find(
          (p) => p.code === currentPath
        );

        const isChecked = matchingPermission
          ? checkedPermissionIds.includes(matchingPermission.id)
          : false;

        tree[currentPath] = {
          id: matchingPermission?.id || currentPath,
          name:
            matchingPermission?.name ||
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
    id: "permissions-root",
    name: "Permissions",
    type: "folder",
    children: rootChildren,
    checked: false,
  };

  return [rootNode];
};

const RoleForm = ({
  form,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  readonly = false,
  permissionOptions = [],
}: RoleFormProps) => {
  const treeViewRef = useRef<TreeViewRef>(null);
  const [treeData, setTreeData] = useState<TreeViewItem[]>([]);

  // Update tree data when external tree items change
  useEffect(() => {
    if (permissionOptions.length > 0) {
      const treeItems = convertPermissionsToTreeView(permissionOptions, form.getValues("permissionIds"));
      setTreeData(treeItems);
    }
  }, [permissionOptions]);

  const handleCheckChange = (item: TreeViewItem, checked: boolean) => {
    //console.log(`Checkbox clicked: ${item.id} - ${checked}`);
    setTreeData((prevData) =>
      updateItemCheckedState(prevData, item.id, checked)
    );
  };

  // Function to get checked permission IDs from tree data
  const getCheckedPermissionIds = (): string[] => {
    return treeViewRef.current?.getCheckedItems().filter((item) => item.type === "file").map((item) => item.id) || [];
  };

  useEffect(() => {
    form.setValue("permissionIds", getCheckedPermissionIds());
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
          name="tenantId"
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
          name="code"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Code <span className="text-destructive">*</span>
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
          name="name"
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
          name="description"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Description
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
          name="permissionIds"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Permissions
              </FormLabel>
              <div className="col-span-12 md:col-span-10 space-y-2">
                <FormControl>
                  <TreeView
                    ref={treeViewRef}
                    data={treeData}
                    showCheckboxes={readonly ? false : true}
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
            <Authorized roles="SYSADMIN" permissions="system.role.edit">
              <Button
                type="button"
                variant="secondary"
                onClick={onEdit ? onEdit : () => {}}
              >
                <Pencil size={20} />
                Edit
              </Button>
            </Authorized>
            <Authorized roles="SYSADMIN" permissions="system.role.delete">
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete ? onDelete : () => {}}
              >
                <X size={20} />
                Delete
              </Button>
            </Authorized>
          </div>
        )}
      </form>
    </Form>
  );
};

export default RoleForm;
