import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@client/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search, Filter } from 'lucide-react';
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import { webhookApi } from '@client/lib/api/webhookApi';
import { webhookEventApi } from '@client/lib/api/webhookEventApi';
import { Webhook, WebhookQueryParams } from '@client/schemas/webhookSchema';
import { useAuth } from '@client/provider/AuthProvider';
import { toast } from 'sonner';

const WebhookList = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loadingEventTypes, setLoadingEventTypes] = useState(true);
  
  // Pagination and filtering state
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState<WebhookQueryParams>({
    page: 1,
    perPage: 10,
    eventType: undefined,
    isActive: undefined
  });

  const [searchTerm, setSearchTerm] = useState('');

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Integration Outbound - Webhooks",
      },
    ])
  );

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const response = await webhookApi.getAll(filters);
      setWebhooks(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      setLoadingEventTypes(true);
      const activeEventNames = await webhookEventApi.getActiveEventNames();
      setEventTypes(activeEventNames);
    } catch (error) {
      console.error('Failed to load event types:', error);
      // Fallback to some default types if API fails
      setEventTypes([
        'user.created',
        'user.updated', 
        'partner.created',
        'partner.updated',
        'integration.key.created'
      ]);
    } finally {
      setLoadingEventTypes(false);
    }
  };

  useEffect(() => {
    if (isAuthorized(["SYSADMIN"], ['master.webhook.view'])) {
      loadWebhooks();
    }
  }, [filters, isAuthorized]);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleEventTypeFilter = (eventType: string) => {
    setFilters(prev => ({ 
      ...prev, 
      eventType: eventType === 'all' ? undefined : eventType, 
      page: 1 
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      isActive: status === 'all' ? undefined : status === 'active', 
      page: 1 
    }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      setDeleting(id);
      await webhookApi.delete(id);
      toast.success('Webhook deleted successfully');
      loadWebhooks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete webhook');
    } finally {
      setDeleting(null);
    }
  };

  if (!isAuthorized(["SYSADMIN"], ['master.webhook.view'])) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">You don't have permission to view webhooks.</p>
      </div>
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integration Outbound - Webhooks</h1>
          <p className="text-muted-foreground">
            Manage webhook endpoints for outbound event notifications to partners
          </p>
        </div>
        {isAuthorized(["SYSADMIN"], ['master.webhook.create']) && (
          <Button onClick={() => navigate('/console/int/integration-outbound/webhook/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Management</CardTitle>
          <CardDescription>
            Configure webhook endpoints to receive real-time event notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search webhooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select onValueChange={handleEventTypeFilter} disabled={loadingEventTypes}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={loadingEventTypes ? "Loading..." : "Filter by event type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                {eventTypes.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Webhook URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      Loading webhooks...
                    </TableCell>
                  </TableRow>
                ) : webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No webhooks found. Create your first webhook to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{webhook.partnerName || 'Unknown Partner'}</div>
                          <div className="text-sm text-muted-foreground">{webhook.partnerCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{webhook.eventType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={webhook.url}>
                          {webhook.url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={webhook.isActive ? "default" : "secondary"}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(webhook.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/console/int/integration-outbound/webhook/${webhook.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAuthorized(["SYSADMIN"], ['master.webhook.edit']) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/console/int/integration-outbound/webhook/edit/${webhook.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {isAuthorized(["SYSADMIN"], ['master.webhook.delete']) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(webhook.id)}
                              disabled={deleting === webhook.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
                {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
                {pagination.total} webhooks
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookList;