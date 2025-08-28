import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { roleImportSchema } from './roleFormSchema';
import z, { set } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@client/components/ui/form';
import { Input } from '@client/components/ui/input';
import { Button } from '@client/components/ui/button';
import { Download, Loader2, Upload } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@client/components/ui/alert-dialog';

const RoleImport = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { items: breadcrumbs, updateItem } = useBreadcrumbs(
      createBreadcrumbItems([
        {
          label: "Roles",
          onClick: () => navigate("/console/system/role"),
        },
        {
          label: "Import Role",
        },
      ])
    );
  
  const form = useForm<z.infer<typeof roleImportSchema>>({
    resolver: zodResolver(roleImportSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  function onSubmit(values: z.infer<typeof roleImportSchema>) {
    //console.log(values);
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", values.file);
    axios
      .post("/api/system/role/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        navigate(`/console/system/role`);
        toast.success("Roles imported successfully.", { duration: 8000 });
      })
      .catch((error) => {
        console.error("Error to import roles :", error);
        toast.error("Failed to import roles.");
      })
      .finally(() => {
        setIsLoading(false);
      });   
  }

  return (
    <>
      <header className="flex items-center justify-between gap-2 px-2 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Roles</h1>
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
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="grid grid-cols-12 gap-2 items-start">
                    <FormLabel className="mb-2 mt-3 col-span-12 md:col-span-2">
                      Import File <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="col-span-12 md:col-span-10 space-y-2">
                      <FormControl>
                      <Input className='cursor-pointer file:border-0 file:bg-transparent file:cursor-pointer file:font-medium file:text-primary-foreground hover:file:underline'
                          {...fieldProps}
                          type="file"
                          onChange={(event) =>
                            onChange(event.target.files && event.target.files[0])
                          } />
                      </FormControl>
                      <FormMessage />
                      <a href="/samples/role_template.csv" className="flex gap-2 pt-4 text-sm hover:underline">
                        <Download size={16} /> Import Template
                      </a>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit">
                  <Upload size={20} />
                  Import
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </div>
      </div>

      <AlertDialog open={isLoading} onOpenChange={setIsLoading}>
        <AlertDialogContent>
          <AlertDialogHeader className='flex w-full items-center text-center'>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Loader2 size={16} className="animate-spin" /> Please wait ...
            </AlertDialogTitle>
            <AlertDialogDescription>
              Exporting roles may take a while.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

export default RoleImport