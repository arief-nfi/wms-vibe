import { Button } from "@client/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@client/components/ui/form";
import { Input } from "@client/components/ui/input";
import { Pencil, Save, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { optionFormSchema } from "./optionFormSchema";
import Authorized from "@client/components/auth/Authorized";

interface OptionFormProps {
  form: UseFormReturn<z.infer<typeof optionFormSchema>>;
  onSubmit?: (values: z.infer<typeof optionFormSchema>) => void;
  onCancel?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  readonly?: boolean;
}

const OptionForm = ({ form, onSubmit, onCancel, onEdit, onDelete, readonly = false }: OptionFormProps) => {

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit ? onSubmit : () => {})} className="space-y-4">
        <FormField
          disabled={readonly}
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem hidden>
                <FormControl >
                  <Input {...field} hidden/>
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
                <FormControl >
                  <Input {...field} hidden/>
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
                <FormControl >
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
                <FormControl >
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
          name="value"
          render={({ field }) => (
            <FormItem className="grid grid-cols-12 gap-2 items-start">
              <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                Value
              </FormLabel>
              <div className="col-span-12 md:col-span-10 space-y-2">
                <FormControl >
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        {!readonly && (
          <div className="flex gap-2 pt-2">
            <Button type="submit">
              <Save size={20}/>Save
            </Button>
            <Button type="button" variant="outline" onClick={onCancel? onCancel : () => {}}>
              <X size={20}/>Cancel
            </Button>
          </div>
        )}
        {readonly && (
          <div className="flex gap-2 pt-2">
            <Authorized roles="SYSADMIN" permissions="system.option.edit">
            <Button type="button" variant="secondary" onClick={onEdit ? onEdit : () => {}}>
              <Pencil size={20}/>Edit
            </Button>
            </Authorized>
            <Authorized roles="SYSADMIN" permissions="system.option.edit">
            <Button type="button" variant="destructive" onClick={onDelete ? onDelete : () => {}}>
              <X size={20}/>Delete
            </Button>
            </Authorized>
          </div>
        )}
        
      </form>
    </Form>
  )
}

export default OptionForm