import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Label } from '@client/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@client/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { IntegrationInbound, IntegrationInboundFormData, integrationInboundFormSchema } from '@client/schemas/integrationInboundSchema';
import { partnerApi } from '@client/lib/api/partnerApi';
import { Partner } from '@client/schemas/partnerSchema';

interface IntegrationInboundFormProps {
  integrationInbound?: IntegrationInbound;
  onSubmit: (data: IntegrationInboundFormData) => Promise<void>;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export const IntegrationInboundForm: React.FC<IntegrationInboundFormProps> = ({
  integrationInbound,
  onSubmit,
  onCancel,
  isReadOnly = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  
  const form = useForm<IntegrationInboundFormData>({
    resolver: zodResolver(integrationInboundFormSchema),
    defaultValues: {
      partnerId: integrationInbound?.partnerId || '',
      apiKey: integrationInbound?.apiKey || '',
      description: integrationInbound?.description || '',
      status: (integrationInbound?.status || 'active') as 'active' | 'inactive',
    }
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const statusValue = watch('status');
  const partnerIdValue = watch('partnerId');

  // Load partners for dropdown
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoadingPartners(true);
        const response = await partnerApi.getPartners({ page: 1, perPage: 100 });
        setPartners(response.data);
      } catch (error) {
        console.error('Failed to load partners:', error);
      } finally {
        setLoadingPartners(false);
      }
    };

    loadPartners();
  }, []);

  const handleFormSubmit = async (data: IntegrationInboundFormData) => {
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

  const generateApiKey = () => {
    // Generate a secure 64-character API key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('apiKey', result);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isReadOnly 
            ? 'Integration Inbound Details' 
            : integrationInbound 
              ? 'Edit Integration Inbound API Key' 
              : 'Add New Integration Inbound API Key'
          }
        </CardTitle>
        <CardDescription>
          {isReadOnly 
            ? 'View integration inbound API key information' 
            : integrationInbound 
              ? 'Update integration inbound API key information' 
              : 'Create a new integration inbound API key for partner access'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="partnerId">Partner</Label>
            <Select
              value={partnerIdValue}
              onValueChange={(value) => setValue('partnerId', value)}
              disabled={isReadOnly || loadingPartners}
            >
              <SelectTrigger className={errors.partnerId ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingPartners ? "Loading partners..." : "Select a partner"} />
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
              <p className="text-sm text-red-500">{errors.partnerId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">API Key</Label>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateApiKey}
                  disabled={isLoading}
                >
                  Generate Key
                </Button>
              )}
            </div>
            <Input
              id="apiKey"
              {...register('apiKey')}
              placeholder="Enter API key (32-128 characters)"
              disabled={isReadOnly}
              className={errors.apiKey ? 'border-red-500' : ''}
              type={isReadOnly ? "text" : "password"}
            />
            {errors.apiKey && (
              <p className="text-sm text-red-500">{errors.apiKey.message}</p>
            )}
            <p className="text-xs text-gray-500">
              API key must be 32-128 characters long and contain only letters, numbers, underscores, and hyphens.
            </p>
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
              placeholder="Enter description (optional)"
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
              <Button type="submit" disabled={isLoading || loadingPartners}>
                {isLoading ? 'Saving...' : integrationInbound ? 'Update API Key' : 'Create API Key'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};