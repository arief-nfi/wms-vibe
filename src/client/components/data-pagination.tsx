import React from "react";
import type { HTMLAttributes } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@client/components/ui/pagination";

export type Props = HTMLAttributes<HTMLDivElement> & {
  page: number;
  perPage: number;
  count: number;
  onPageChange: (page: number) => void;
};

const DataPagination: React.FC<Props> = ({ page, perPage, count, onPageChange, ...rest }) => {
  const totalPages = Math.max(1, Math.ceil(count / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (count === 0) return null;

  return (
    <div className={`flex items-center justify-center md:justify-end`} {...rest}>
      <div className="text-sm invisible lg:visible">
        Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, count)} of {count} record.
      </div>

      <div className="flex ml-0 md:ml-auto items-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (page > 1) onPageChange(page - 1);
                }}
                disabled={page === 1}
              />
            </PaginationItem>
            {pages.length > 6 && page > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {pages
              .filter(p => {
                if (pages.length <= 6) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - page) <= 2) return true;
                return false;
              })
              .map(p => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === page}
                    onClick={e => {
                      e.preventDefault();
                      onPageChange(p);
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
            {pages.length > 6 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (page < totalPages) onPageChange(page + 1);
                }}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default DataPagination;