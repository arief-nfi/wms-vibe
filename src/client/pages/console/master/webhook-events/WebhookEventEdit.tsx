import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { webhookEventApi } from "@client/lib/api/webhookEventApi";
import {
  WebhookEvent,
  WebhookEventFormData,
} from "@client/schemas/webhookEventSchema";
import WebhookEventForm from "@client/components/forms/WebhookEventForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client/components/ui/card";
import { Button } from "@client/components/ui/button";
import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";
import { useAuth } from "@client/provider/AuthProvider";
import { toast } from "sonner";

export default function WebhookEventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const [webhookEvent, setWebhookEvent] = useState<WebhookEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Webhook Events",
        href: "/console/master/webhook-events",
      },
      {
        label: webhookEvent?.name || "Event",
        href: `/console/master/webhook-events/${id}`,
      },
      {
        label: "Edit",
      },
    ]),
  );

  const loadWebhookEvent = async () => {
    try {
      setLoading(true);
      const response = await webhookEventApi.getEvent(id!);
      // Extract the data from the response if it's wrapped
      const event = response?.data || response;
      setWebhookEvent(event);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load webhook event",
      );
      navigate("/console/master/webhook-events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && isAuthorized(["SYSADMIN"], ["webhook.event.edit"])) {
      loadWebhookEvent();
    } else if (!isAuthorized(["SYSADMIN"], ["webhook.event.edit"])) {
      navigate("/console/master/webhook-events");
    }
  }, [id, isAuthorized]);

  const handleSubmit = async (data: WebhookEventFormData) => {
    try {
      setIsSubmitting(true);
      await webhookEventApi.updateEvent(id!, data);
      toast.success("Webhook event updated successfully");
      navigate(`/console/master/webhook-events/${id}`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update webhook event",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/console/master/webhook-events/${id}`);
  };

  if (loading) {
    return (
      <div className="mx-2 space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <p>Loading webhook event...</p>
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
            <p>Webhook event not found.</p>
            <Button
              onClick={() => navigate("/console/master/webhook-events")}
              className="mt-4"
            >
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
      <div>
        <div>
          <h1 className="text-3xl font-bold">Edit Webhook Event</h1>
          <p className="text-gray-600 mt-2">Update the webhook event details</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Modify the webhook event name and description. Changes will affect
            all future webhook notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookEventForm
            initialData={{
              name: webhookEvent.name,
              description: webhookEvent.description,
              isActive: webhookEvent.isActive,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            isEdit={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
