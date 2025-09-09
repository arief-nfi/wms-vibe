import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@client/components/ui/card";
import { Badge } from "@client/components/ui/badge";

import Breadcrumbs, {
  createBreadcrumbItems,
  useBreadcrumbs
} from "@client/components/console/Breadcrumbs";
import { PartnerForm } from "@client/components/forms/PartnerForm";
import { partnerApi } from "@client/lib/api/partnerApi";
import { Partner } from "@client/schemas/partnerSchema";
import { Pencil, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PartnerView = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  );

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{partner.name}</h1>
          <p className="text-gray-600">Partner Details</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/console/master/partner')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to List
          </Button>
          <Button 
            onClick={() => navigate(`/console/master/partner/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Pencil size={16} />
            Edit Partner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PartnerForm partner={partner} onSubmit={async () => {}} isReadOnly />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="mt-1">
                  <StatusBadge status={partner.status} />
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Created Date</div>
                <div className="mt-1">{new Date(partner.createdAt).toLocaleDateString()}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Last Updated</div>
                <div className="mt-1">{new Date(partner.updatedAt).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>

          {partner.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{partner.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerView;