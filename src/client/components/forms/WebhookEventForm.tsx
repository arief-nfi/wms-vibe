import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
// Using Input for description since Textarea doesn't exist in UI components
import { Checkbox } from '../ui/checkbox';
import { webhookEventSchema, WebhookEventFormData } from '@client/schemas/webhookEventSchema';

interface WebhookEventFormProps {
  initialData?: {
    name?: string;
    description?: string;
    isActive?: boolean;
  };
  onSubmit: (data: WebhookEventFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function WebhookEventForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: WebhookEventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WebhookEventFormData>({
    resolver: zodResolver(webhookEventSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        description: initialData.description || '',
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: WebhookEventFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Event Name *</Label>
          <Input
            id="name"
            placeholder="e.g., user.created, order.updated"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
          <p className="text-sm text-gray-500">
            Use dot notation format: resource.action (e.g., user.created, partner.updated)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="Describe when this event is triggered..."
            {...register('description')}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
          <p className="text-sm text-gray-500">
            Provide a clear description of when this event occurs
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={watchedIsActive}
            onCheckedChange={(checked) => setValue('isActive', !!checked)}
          />
          <Label htmlFor="isActive">Active</Label>
          <p className="text-sm text-gray-500">
            Only active events can be selected when creating webhooks
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Event' : 'Create Event')}
        </Button>
      </div>
    </form>
  );
}