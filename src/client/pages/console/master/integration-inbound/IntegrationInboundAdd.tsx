import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import { IntegrationInboundForm } from '@client/components/forms/IntegrationInboundForm';
import { integrationInboundApi } from '@client/lib/api/integrationInboundApi';
import { IntegrationInboundFormData } from '@client/schemas/integrationInboundSchema';
import { useAuth } from '@client/provider/AuthProvider';
import { toast } from 'sonner';

const IntegrationInboundAdd = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Integration Inbound",
        onClick: () => navigate("/console/master/integration-inbound"),
      },
      {
        label: "Add API Key",
      },
    ])
  );

  const handleSubmit = async (data: IntegrationInboundFormData) => {
    try {
      setIsLoading(true);
      await integrationInboundApi.createIntegrationInbound(data);
      toast.success('Integration inbound API key created successfully');
      navigate('/console/master/integration-inbound');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create integration inbound API key');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/console/master/integration-inbound');
  };

  if (!isAuthorized(["SYSADMIN"], ['master.integrationInbound.add'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to add integration inbound API keys.</p>
      </div>
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div>
        <h1 className="text-2xl font-bold">Add New Integration Inbound API Key</h1>
        <p className="text-gray-600">Create a new API key for partner integration access</p>
      </div>

      <IntegrationInboundForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default IntegrationInboundAdd;