import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client/components/ui/card";
import { Badge } from "@client/components/ui/badge";
import { Separator } from "@client/components/ui/separator";
import { Edit, ArrowLeft, ExternalLink } from "lucide-react";
import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";
import { webhookApi } from "@client/lib/api/webhookApi";
import { Webhook } from "@client/schemas/webhookSchema";
import { useAuth } from "@client/provider/AuthProvider";
import { toast } from "sonner";

const WebhookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthorized } = useAuth();
  const [loading, setLoading] = useState(true);
  const [webhook, setWebhook] = useState<Webhook | null>(null);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Integration Outbound - Webhooks",
        href: "/console/master/integration-outbound/webhook",
      },
      {
        label: webhook ? webhook.eventType : "Webhook Details",
      },
    ]),
  );

  useEffect(() => {
    const loadWebhook = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await webhookApi.getById(id);
        setWebhook(response.data);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load webhook details",
        );
        navigate("/console/master/integration-outbound/webhook");
      } finally {
        setLoading(false);
      }
    };

    loadWebhook();
  }, [id, navigate]);

  if (!isAuthorized(["SYSADMIN"], ["master.webhook.view"])) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">
          You don't have permission to view webhook details.
        </p>
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

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook Details</h1>
          <p className="text-muted-foreground">
            View webhook configuration and event monitoring details
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate("/console/master/integration-outbound/webhook")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          {isAuthorized(["SYSADMIN"], ["master.webhook.edit"]) && (
            <Button
              onClick={() =>
                navigate(
                  `/console/master/integration-outbound/webhook/edit/${webhook.id}`,
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Webhook
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core webhook configuration details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Webhook ID
              </label>
              <p className="text-sm font-mono bg-input/20 p-2 rounded border">
                {webhook.id}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Event Type
              </label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {webhook.eventType}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={webhook.isActive ? "default" : "secondary"}>
                  {webhook.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Partner Information</CardTitle>
            <CardDescription>Associated partner details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Partner Name
              </label>
              <p className="text-sm">
                {webhook.partnerName || "Unknown Partner"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Partner Code
              </label>
              <p className="text-sm font-mono">
                {webhook.partnerCode || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Partner ID
              </label>
              <p className="text-sm font-mono bg-input/20 p-2 rounded border">
                {webhook.partnerId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Endpoint */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Webhook Endpoint</CardTitle>
            <CardDescription>
              URL where events will be delivered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-input/20 rounded border">
              <code className="text-sm break-all">{webhook.url}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(webhook.url, "_blank")}
                title="Open URL in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
            <CardDescription>
              Webhook creation and modification history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="text-sm">
                  {new Date(webhook.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-sm">
                  {new Date(webhook.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>
              Details about the monitored event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Event Type: {webhook.eventType}
                </h4>
                <p className="text-sm text-gray-600">
                  {getEventDescription(webhook.eventType)}
                </p>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">
                  Webhook Payload Structure
                </h4>
                <div className="bg-input/20 p-3 rounded border">
                  <pre className="text-xs text-gray-700">
                    {`{
  "eventType": "${webhook.eventType}",
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "tenant-uuid",
  "data": {
    // Event-specific data will be included here
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get event descriptions
function getEventDescription(eventType: string): string {
  const descriptions: Record<string, string> = {
    "user.created": "Triggered when a new user is created in the system",
    "user.updated": "Triggered when user information is modified",
    "user.deleted": "Triggered when a user is removed from the system",
    "partner.created": "Triggered when a new partner is registered",
    "partner.updated": "Triggered when partner information is modified",
    "partner.deleted": "Triggered when a partner is removed",
    "integration.key.created":
      "Triggered when a new API integration key is generated",
    "integration.key.updated": "Triggered when an API key is modified",
    "integration.key.deleted": "Triggered when an API key is revoked",
  };

  return (
    descriptions[eventType] || "Custom event type for specialized notifications"
  );
}

export default WebhookDetail;
