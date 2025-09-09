import ConfirmDialog from '@client/components/console/ConfirmDialog';
import DataPagination from '@client/components/console/DataPagination';
import InputGroup from '@client/components/console/InputGroup';
import SortButton from '@client/components/console/SortButton';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@client/components/ui/table';
import { Badge } from '@client/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@client/components/ui/tooltip";
import { useErrorHandler } from '@client/hooks/useErrorHandler';
import { partnerApi } from '@client/lib/api/partnerApi';
import { Partner } from '@client/schemas/partnerSchema';
import { Pencil, Plus, Search, X, Eye, Trash2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

const PartnerPage = () => {
  const { throwError } = useErrorHandler();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);

  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [count, setCount] = React.useState(0);
  const [filter, setFilter] = React.useState(params.get('filter') || '');
  const [sort, setSort] = React.useState<string>(params.get('sort') || 'code');
  const [order, setOrder] = React.useState<string>(params.get('order') || 'asc');
  const [page, setPage] = React.useState(Number(params.get('page')) || 1);
  const [perPage, setPerPage] = React.useState(Number(params.get('perPage')) || 10);

  const [loading, setLoading] = React.useState(true);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = React.useState<string | null>(null);

  function gotoPage(p: number) {
    if (p < 1 || (count !== 0 && p > Math.ceil(count / perPage))) return;
    const params = new URLSearchParams(window.location.search);
    setPage(p);
    params.set('page', p.toString());
    params.set('perPage', perPage.toString());
    params.set('sort', sort);
    params.set('order', order);
    params.set('filter', filter);
    navigate(`${window.location.pathname}?${params.toString()}`);
    setLoading(true);
  }

  function sortBy(column: string) {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
    const params = new URLSearchParams(window.location.search);
    params.set('sort', column);
    params.set('order', sort === column ? (order === 'asc' ? 'desc' : 'asc') : 'asc');
    navigate(`${window.location.pathname}?${params.toString()}`);
    setLoading(true);
  }

  function applyFilter() {
    const params = new URLSearchParams(window.location.search);
    params.set('filter', filter);
    params.set('page', '1');
    setPage(1);
    navigate(`${window.location.pathname}?${params.toString()}`);
    setLoading(true);
  }

  function clearFilter() {
    setFilter('');
    const params = new URLSearchParams(window.location.search);
    params.delete('filter');
    params.set('page', '1');
    setPage(1);
    navigate(`${window.location.pathname}?${params.toString()}`);
    setLoading(true);
  }

  async function deletePartner(id: string) {
    try {
      await partnerApi.deletePartner(id);
      toast.success('Partner deleted successfully');
      setLoading(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete partner');
    }
  }

  useEffect(() => {
    if (!loading) return;

    const fetchPartners = async () => {
      try {
        const response = await partnerApi.getPartners({
          page,
          perPage,
          sort: sort as any,
          order: order as any,
          filter: filter || undefined,
        });
        setPartners(response.data);
        setCount(response.pagination.total);
      } catch (error: any) {
        throwError(error.response?.data?.message || 'Failed to fetch partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [loading, page, perPage, sort, order, filter, throwError]);

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  );

  return (
    <div className="mx-2 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Master Partners</h1>
          <p className="text-gray-600">Manage your business partners</p>
        </div>
        <Link to="/console/master/partner/add">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Partner
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <InputGroup className="flex-1">
          <Input
            placeholder="Search partners..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilter();
              }
            }}
          />
          <Button onClick={applyFilter} size="sm">
            <Search size={16} />
          </Button>
          {filter && (
            <Button onClick={clearFilter} size="sm" variant="outline">
              <X size={16} />
            </Button>
          )}
        </InputGroup>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  label="Code"
                  column="code"
                  sort={sort}
                  order={order}
                  sortBy={sortBy}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Name"
                  column="name"
                  sort={sort}
                  order={order}
                  sortBy={sortBy}
                />
              </TableHead>
              <TableHead>PIC Name</TableHead>
              <TableHead>PIC Email</TableHead>
              <TableHead>
                <SortButton
                  label="Status"
                  column="status"
                  sort={sort}
                  order={order}
                  sortBy={sortBy}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Created"
                  column="createdAt"
                  sort={sort}
                  order={order}
                  sortBy={sortBy}
                />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : partners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No partners found
                </TableCell>
              </TableRow>
            ) : (
              partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.code}</TableCell>
                  <TableCell>{partner.name}</TableCell>
                  <TableCell>{partner.picName}</TableCell>
                  <TableCell>{partner.picEmail}</TableCell>
                  <TableCell>
                    <StatusBadge status={partner.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/console/master/partner/${partner.id}`)}
                          >
                            <Eye size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/console/master/partner/${partner.id}/edit`)}
                          >
                            <Pencil size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPartnerId(partner.id);
                              setConfirmDelete(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataPagination
        page={page}
        perPage={perPage}
        count={count}
        gotoPage={gotoPage}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete Partner"
        description="Are you sure you want to delete this partner? This action cannot be undone."
        onConfirm={() => {
          if (selectedPartnerId) {
            deletePartner(selectedPartnerId);
            setConfirmDelete(false);
            setSelectedPartnerId(null);
          }
        }}
      />
    </div>
  );
};

export default PartnerPage;