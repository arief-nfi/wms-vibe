import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { webhookEventApi } from '@client/lib/api/webhookEventApi';
import { WebhookEvent } from '@client/schemas/webhookEventSchema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { Button } from '@client/components/ui/button';
import { Badge } from '@client/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import { useAuth } from '@client/provider/AuthProvider';
import { toast } from 'sonner';

export default function WebhookEventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const [webhookEvent, setWebhookEvent] = useState<WebhookEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Webhook Events",
        href: "/console/master/webhook-events",
      },
      {
        label: webhookEvent?.name || "Event Details",
      },
    ])
  );

  const loadWebhookEvent = async () => {
    try {
      setLoading(true);
      const response = await webhookEventApi.getEvent(id!);
      // Extract the data from the response if it's wrapped
      const event = response?.data || response;
      setWebhookEvent(event);
    } catch (error: any) {
      console.error('Failed to load webhook event:', error);
      toast.error(error?.response?.data?.message || 'Failed to load webhook event');
      navigate('/console/master/webhook-events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAuthorized(["SYSADMIN"], ['webhook.event.view'])) {
      loadWebhookEvent();
    } else if (!isAuthorized(["SYSADMIN"], ['webhook.event.view'])) {
      navigate('/console/master/webhook-events');
    }
  }, [id, isAuthorized]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this webhook event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await webhookEventApi.deleteEvent(id!);
      toast.success('Webhook event deleted successfully');
      navigate('/console/master/webhook-events');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete webhook event');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-2 space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <p>Loading webhook event details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!webhookEvent) {
    return (
      <div className="mx-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load webhook event details. Please try again.</p>
            <Button onClick={() => navigate('/console/master/webhook-events')} className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div>
            <h1 className="text-3xl font-bold">{webhookEvent.name}</h1>
            <p className="text-gray-600 mt-2">Webhook event details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAuthorized(["SYSADMIN"], ['webhook.event.edit']) && (
            <Button onClick={() => navigate(`/console/master/webhook-events/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isAuthorized(["SYSADMIN"], ['webhook.event.delete']) && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Event Name</label>
              <p className="text-lg font-medium">{webhookEvent.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-sm">{webhookEvent.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={webhookEvent.isActive ? "default" : "secondary"}>
                  {webhookEvent.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="text-sm">{new Date(webhookEvent.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-sm">{new Date(webhookEvent.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Event ID</label>
              <p className="text-sm font-mono">{webhookEvent.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Information</CardTitle>
          <CardDescription>
            This event type can be used when creating webhooks for partners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Event Name:</strong> {webhookEvent.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {webhookEvent.description}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Partners can subscribe to this event type to receive notifications when this event occurs in the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}