import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import WebhookForm from '@client/components/forms/WebhookForm';
import { webhookApi } from '@client/lib/api/webhookApi';
import { partnerApi } from '@client/lib/api/partnerApi';
import { WebhookFormData, Webhook } from '@client/schemas/webhookSchema';
import { Partner } from '@client/schemas/partnerSchema';
import { useAuth } from '@client/provider/AuthProvider';
import { toast } from 'sonner';

const WebhookEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthorized } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(true);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Integration Outbound - Webhooks",
        href: "/console/master/integration-outbound/webhook",
      },
      {
        label: webhook ? `Edit ${webhook.eventType}` : "Edit Webhook",
      },
    ])
  );

  // Load webhook details and partners
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/console/master/integration-outbound/webhook');
        return;
      }

      try {
        setLoading(true);
        
        // Load webhook details and partners in parallel
        const [webhookResponse, partnersResponse] = await Promise.all([
          webhookApi.getById(id),
          partnerApi.getPartners({ page: 1, perPage: 100 })
        ]);
        
        setWebhook(webhookResponse.data);
        setPartners(partnersResponse.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load webhook details');
        navigate('/console/master/integration-outbound/webhook');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const handleSubmit = async (data: WebhookFormData) => {
    if (!id || !webhook) return;

    try {
      setIsLoading(true);
      await webhookApi.update(id, { ...data, id });
      toast.success('Webhook updated successfully');
      navigate('/console/master/integration-outbound/webhook');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update webhook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/console/master/integration-outbound/webhook');
  };

  if (!isAuthorized(["SYSADMIN"], ['master.webhook.edit'])) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">You don't have permission to edit webhooks.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading webhook details...</p>
      </div>
    );
  }

  if (!webhook) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Webhook not found.</p>
      </div>
    );
  }

  const initialData: Partial<WebhookFormData> = {
    partnerId: webhook.partnerId,
    eventType: webhook.eventType,
    url: webhook.url,
    isActive: webhook.isActive,
  };

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Webhook</h1>
        <p className="text-muted-foreground">
          Update webhook endpoint configuration and event monitoring settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Modify the webhook endpoint details and event type settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookForm
            initialData={initialData}
            partners={partners}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookEdit;