import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import { IntegrationInboundForm } from '@client/components/forms/IntegrationInboundForm';
import { integrationInboundApi } from '@client/lib/api/integrationInboundApi';
import { IntegrationInbound, IntegrationInboundFormData } from '@client/schemas/integrationInboundSchema';
import { useAuth } from '@client/provider/AuthProvider';
import { toast } from 'sonner';

const IntegrationInboundEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthorized } = useAuth();
  const [integrationInbound, setIntegrationInbound] = useState<IntegrationInbound | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Integration Inbound",
        onClick: () => navigate("/console/int/integration-inbound"),
      },
      {
        label: integrationInbound ? `Edit ${integrationInbound.partnerName || 'API Key'}` : "Edit API Key",
      },
    ])
  );

  useEffect(() => {
    const loadIntegrationInbound = async () => {
      if (!id) {
        toast.error('Integration inbound ID is required');
        navigate('/console/int/integration-inbound');
        return;
      }

      try {
        setLoading(true);
        const response = await integrationInboundApi.getIntegrationInbound(id);
        setIntegrationInbound(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load integration inbound API key');
        navigate('/console/int/integration-inbound');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized(["SYSADMIN"], ['master.integrationInbound.edit'])) {
      loadIntegrationInbound();
    }
  }, [id, navigate, isAuthorized]);

  const handleSubmit = async (data: IntegrationInboundFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await integrationInboundApi.updateIntegrationInbound(id, data);
      toast.success('Integration inbound API key updated successfully');
      navigate('/console/int/integration-inbound');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update integration inbound API key');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/console/int/integration-inbound');
  };

  if (!isAuthorized(["SYSADMIN"], ['master.integrationInbound.edit'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to edit integration inbound API keys.</p>
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
      
      <div>
        <h1 className="text-2xl font-bold">Edit Integration Inbound API Key</h1>
        <p className="text-gray-600">Update the integration inbound API key information</p>
      </div>

      <IntegrationInboundForm 
        integrationInbound={integrationInbound}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default IntegrationInboundEdit;