import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs
} from "@client/components/console/Breadcrumbs";
import { PartnerForm } from "@client/components/forms/PartnerForm";
import { useAuth } from "@client/provider/AuthProvider";
import { partnerApi } from "@client/lib/api/partnerApi";
import { Partner, PartnerFormData } from "@client/schemas/partnerSchema";
import { toast } from "sonner";

const PartnerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  // Using the enhanced breadcrumbs with React state
  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Partners",
        onClick: () => navigate("/console/master/partner"),
      },
      {
        label: partner?.name || "Loading...",
        onClick: () => navigate(`/console/master/partner/${id}`),
      },
      {
        label: "Edit",
      },
    ])
  );

  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) return;
      
      try {
        const response = await partnerApi.getPartner(id);
        setPartner(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch partner');
        navigate('/console/master/partner');
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id, navigate]);

  const handleSubmit = async (data: PartnerFormData) => {
    if (!id) return;
    
    try {
      await partnerApi.updatePartner(id, data);
      toast.success('Partner updated successfully');
      navigate('/console/master/partner');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update partner');
      throw error; // Re-throw to let form handle loading state
    }
  };

  const handleCancel = () => {
    navigate('/console/master/partner');
  };

  if (loading) {
    return (
      <div className="mx-2 space-y-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="mx-2 space-y-6">
        <div className="text-center py-8">Partner not found</div>
      </div>
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div>
        <h1 className="text-2xl font-bold">Edit Partner</h1>
        <p className="text-gray-600">Update partner information</p>
      </div>

      <PartnerForm 
        partner={partner}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default PartnerEdit;