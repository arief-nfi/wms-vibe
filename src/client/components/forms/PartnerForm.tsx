import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Label } from '@client/components/ui/label';
// Textarea component - using Input for now since Textarea doesn't exist in UI
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@client/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { Partner, PartnerFormData, partnerFormSchema } from '@client/schemas/partnerSchema';

interface PartnerFormProps {
  partner?: Partner;
  onSubmit: (data: PartnerFormData) => Promise<void>;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export const PartnerForm: React.FC<PartnerFormProps> = ({
  partner,
  onSubmit,
  onCancel,
  isReadOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      code: partner?.code || '',
      name: partner?.name || '',
      picName: partner?.picName || '',
      picEmail: partner?.picEmail || '',
      description: partner?.description || '',
      status: (partner?.status || 'active') as 'active' | 'inactive',
    }
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const statusValue = watch('status');

  const handleFormSubmit = async (data: PartnerFormData) => {
    if (isReadOnly) return;
    
    try {
      setIsLoading(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling could be enhanced with toast notifications
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isReadOnly 
            ? 'Partner Details' 
            : partner 
              ? 'Edit Partner' 
              : 'Add New Partner'
          }
        </CardTitle>
        <CardDescription>
          {isReadOnly 
            ? 'View partner information' 
            : partner 
              ? 'Update partner information' 
              : 'Create a new partner record'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Partner Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="Enter partner code"
                disabled={isReadOnly}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter partner name"
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="picName">PIC Name</Label>
              <Input
                id="picName"
                {...register('picName')}
                placeholder="Enter PIC name"
                disabled={isReadOnly}
                className={errors.picName ? 'border-red-500' : ''}
              />
              {errors.picName && (
                <p className="text-sm text-red-500">{errors.picName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="picEmail">PIC Email</Label>
              <Input
                id="picEmail"
                type="email"
                {...register('picEmail')}
                placeholder="Enter PIC email"
                disabled={isReadOnly}
                className={errors.picEmail ? 'border-red-500' : ''}
              />
              {errors.picEmail && (
                <p className="text-sm text-red-500">{errors.picEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Enter partner description (optional)"
              disabled={isReadOnly}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : partner ? 'Update Partner' : 'Create Partner'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};