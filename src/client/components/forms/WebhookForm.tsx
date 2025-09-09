import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '@client/components/ui/checkbox';
import { webhookSchema, WebhookFormData } from '../../schemas/webhookSchema';
import { Partner } from '../../schemas/partnerSchema';
import { webhookEventApi } from '../../lib/api/webhookEventApi';

interface WebhookFormProps {
  initialData?: Partial<WebhookFormData>;
  partners: Partner[];
  onSubmit: (data: WebhookFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export default function WebhookForm({
  initialData,
  partners,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: WebhookFormProps) {
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loadingEventTypes, setLoadingEventTypes] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      partnerId: '',
      eventType: '',
      url: '',
      isActive: true,
      ...initialData,
    },
  });

  const watchedIsActive = watch('isActive');

  // Load available event types
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        setLoadingEventTypes(true);
        const activeEventNames = await webhookEventApi.getActiveEventNames();
        setEventTypes(activeEventNames);
      } catch (error) {
        console.error('Failed to load event types:', error);
        // Fallback to some default types if API fails
        setEventTypes([
          'user.created',
          'user.updated', 
          'partner.created',
          'partner.updated',
          'integration.key.created'
        ]);
      } finally {
        setLoadingEventTypes(false);
      }
    };

    loadEventTypes();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        partnerId: initialData.partnerId || '',
        eventType: initialData.eventType || '',
        url: initialData.url || '',
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: WebhookFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Partner Selection */}
        <div className="space-y-2">
          <Label htmlFor="partnerId">Partner *</Label>
          <Select
            onValueChange={(value) => setValue('partnerId', value)}
            defaultValue={initialData?.partnerId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a partner" />
            </SelectTrigger>
            <SelectContent>
              {partners.map((partner) => (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.name} ({partner.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.partnerId && (
            <p className="text-sm text-red-600">{errors.partnerId.message}</p>
          )}
        </div>

        {/* Event Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type *</Label>
          <Select
            onValueChange={(value) => setValue('eventType', value)}
            defaultValue={initialData?.eventType}
            disabled={loadingEventTypes}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingEventTypes ? "Loading event types..." : "Select event type"} />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.length === 0 && !loadingEventTypes ? (
                <SelectItem value="" disabled>
                  No event types available
                </SelectItem>
              ) : (
                eventTypes.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.eventType && (
            <p className="text-sm text-red-600">{errors.eventType.message}</p>
          )}
          {eventTypes.length === 0 && !loadingEventTypes && (
            <p className="text-sm text-amber-600">
              No active webhook events found. Please create webhook events first.
            </p>
          )}
        </div>

        {/* Webhook URL */}
        <div className="space-y-2">
          <Label htmlFor="url">Webhook URL *</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://partner.example.com/webhooks/events"
            {...register('url')}
          />
          {errors.url && (
            <p className="text-sm text-red-600">{errors.url.message}</p>
          )}
          <p className="text-sm text-gray-500">
            The URL endpoint where webhook events will be sent via HTTP POST.
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
            Only active webhooks will receive event notifications.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Webhook' : 'Create Webhook'}
        </Button>
      </div>
    </form>
  );
}