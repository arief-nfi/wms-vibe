import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@client/components/ui/card';
import { Badge } from '@client/components/ui/badge';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import Breadcrumbs, { createBreadcrumbItems, useBreadcrumbs } from '@client/components/console/Breadcrumbs';
import { webhookEventApi } from '@client/lib/api/webhookEventApi';
import { WebhookEvent } from '@client/schemas/webhookEventSchema';
import { useAuth } from '@client/provider/AuthProvider';
import { toast } from 'sonner';

const WebhookEventList = () => {
  const navigate = useNavigate();
  const { isAuthorized } = useAuth();
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Pagination and filtering state
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 0
  });
  
  const [filters, setFilters] = useState<{
    page?: number;
    perPage?: number;
    isActive?: boolean;
    name?: string;
  }>({
    page: 1,
    perPage: 10,
    isActive: undefined
  });

  const [searchTerm, setSearchTerm] = useState('');

  const { items: breadcrumbs } = useBreadcrumbs(
    createBreadcrumbItems([
      {
        label: "Webhook Events",
      },
    ])
  );

  const loadWebhookEvents = async () => {
    try {
      setLoading(true);
      const response = await webhookEventApi.getEvents(filters);
      setWebhookEvents(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load webhook events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized(["SYSADMIN"], ['webhook.event.view'])) {
      loadWebhookEvents();
    }
  }, [filters, isAuthorized]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleActiveFilter = (isActive: boolean | undefined) => {
    setFilters(prev => ({ 
      ...prev, 
      isActive: isActive, 
      page: 1 
    }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ 
      ...prev, 
      name: searchTerm || undefined, 
      page: 1 
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this webhook event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(id);
      await webhookEventApi.deleteEvent(id);
      toast.success('Webhook event deleted successfully');
      loadWebhookEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete webhook event');
    } finally {
      setDeleting(null);
    }
  };

  if (!isAuthorized(["SYSADMIN"], ['webhook.event.view'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view webhook events.</p>
      </div>
    );
  }

  return (
    <div className="mx-2 space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhook Events</h1>
          <p className="text-gray-600 mt-2">
            Manage webhook event types that can trigger notifications to partners
          </p>
        </div>
        {isAuthorized(["SYSADMIN"], ['webhook.event.create']) && (
          <Button onClick={() => navigate('/console/master/webhook-events/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event Type
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by event name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
            <div className="flex gap-2">
              <Button
                variant={filters.isActive === undefined ? "default" : "outline"}
                onClick={() => handleActiveFilter(undefined)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filters.isActive === true ? "default" : "outline"}
                onClick={() => handleActiveFilter(true)}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filters.isActive === false ? "default" : "outline"}
                onClick={() => handleActiveFilter(false)}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Event Types</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${webhookEvents?.length || 0} event types found`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading webhook events...</p>
            </div>
          ) : webhookEvents?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {filters.isActive === false 
                  ? "No inactive webhook events found." 
                  : filters.isActive === true 
                  ? "No active webhook events found."
                  : "No webhook events found."
                }
              </p>
              {isAuthorized(["SYSADMIN"], ['webhook.event.create']) && (
                <Button 
                  onClick={() => navigate('/console/master/webhook-events/add')} 
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Event Type
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookEvents?.map((event: WebhookEvent) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell className="max-w-md truncate">{event.description}</TableCell>
                    <TableCell>
                      <Badge variant={event.isActive ? "default" : "secondary"}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(event.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/console/master/webhook-events/${event.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAuthorized(["SYSADMIN"], ['webhook.event.edit']) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/console/master/webhook-events/${event.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {isAuthorized(["SYSADMIN"], ['webhook.event.delete']) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(event.id)}
                            disabled={deleting === event.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} to{' '}
            {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookEventList;