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
import { Edit, ArrowLeft, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs,
} from "@client/components/console/Breadcrumbs";
import { integrationInboundApi } from "@client/lib/api/integrationInboundApi";
import { IntegrationInbound } from "@client/schemas/integrationInboundSchema";
import { useAuth } from "@client/provider/AuthProvider";
import { toast } from "sonner";

const IntegrationInboundDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthorized } = useAuth();
  const [integrationInbound, setIntegrationInbound] =
    useState<IntegrationInbound | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showPlainText, setShowPlainText] = useState(false);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Integration Inbound",
        onClick: () => navigate("/console/master/integration-inbound"),
      },
      {
        label: integrationInbound
          ? `${integrationInbound.partnerName || "API Key"} Details`
          : "API Key Details",
      },
    ]),
  );

  useEffect(() => {
    const loadIntegrationInbound = async () => {
      if (!id) {
        toast.error("Integration inbound ID is required");
        navigate("/console/master/integration-inbound");
        return;
      }

      try {
        setLoading(true);
        const response = await integrationInboundApi.getIntegrationInbound(id);
        setIntegrationInbound(response.data);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load integration inbound API key",
        );
        navigate("/console/master/integration-inbound");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized(["SYSADMIN"], ["master.integrationInbound.view"])) {
      loadIntegrationInbound();
    }
  }, [id, navigate, isAuthorized]);

  const handleDelete = async () => {
    if (!id || !integrationInbound) return;

    if (
      !window.confirm(
        `Are you sure you want to delete the API key for ${integrationInbound.partnerName}?`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await integrationInboundApi.deleteIntegrationInbound(id);
      toast.success("Integration inbound API key deleted successfully");
      navigate("/console/master/integration-inbound");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete integration inbound API key",
      );
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Inactive
      </Badge>
    );
  };

  const maskApiKey = (apiKey: string, showFull: boolean = false) => {
    if (showFull) return apiKey;
    if (apiKey.length <= 8) return apiKey;
    return `${apiKey.substring(0, 4)}${"*".repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`;
  };

  const handleCopyApiKey = async () => {
    if (!integrationInbound) return;

    try {
      await navigator.clipboard.writeText(integrationInbound.apiKey);
      toast.success("API key copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy API key to clipboard");
    }
  };

  const togglePlainText = () => {
    setShowPlainText(!showPlainText);
  };

  if (!isAuthorized(["SYSADMIN"], ["master.integrationInbound.view"])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          You don't have permission to view integration inbound API keys.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading integration inbound API key...</p>
      </div>
    );
  }

  if (!integrationInbound) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Integration inbound API key not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            Integration Inbound API Key Details
          </h1>
          <p className="text-gray-600">
            View integration inbound API key information
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate("/console/master/integration-inbound")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          {isAuthorized(["SYSADMIN"], ["master.integrationInbound.edit"]) && (
            <Button
              onClick={() =>
                navigate(`/console/master/integration-inbound/${id}/edit`)
              }
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {isAuthorized(["SYSADMIN"], ["master.integrationInbound.delete"]) && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Partner Information</CardTitle>
            <CardDescription>
              Partner associated with this API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Partner Name
              </label>
              <p className="text-base">
                {integrationInbound.partnerName || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Partner Code
              </label>
              <p className="text-base font-mono">
                {integrationInbound.partnerCode || "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Key Information</CardTitle>
            <CardDescription>
              Integration inbound API key details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-500">
                  API Key
                </label>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={togglePlainText}>
                    {showPlainText ? (
                      <EyeOff className="w-4 h-4 mr-1" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    {showPlainText ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyApiKey}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-base font-mono break-all bg-input/20 p-3 rounded border">
                {maskApiKey(integrationInbound.apiKey, showPlainText)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                {getStatusBadge(integrationInbound.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Description and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Description
              </label>
              <p className="text-base">
                {integrationInbound.description || "No description provided"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="text-base">
                  {new Date(integrationInbound.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-base">
                  {new Date(integrationInbound.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationInboundDetail;
