import { useIsMobile } from "@client/hooks/use-mobile";
import React, { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { cn } from "@client/lib/utils";

interface Props {
  count: number;
  perPage: number;
  page?: number;
  previousText?: string;
  nextText?: string;
  showPageInfo?: boolean;
  gotoPage?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
}

const DataPagination = ({
  className,
  count = 0,
  perPage = 10,
  page = 1,
  previousText = "Previous",
  nextText = "Next",
  showPageInfo = true,
  gotoPage,
  siblingCount: propSiblingCount,
  boundaryCount = 1,
  ...restProps
}: React.ComponentProps<"div"> & Props) => {
  const isMobile = useIsMobile();
  const siblingCount = propSiblingCount ?? (isMobile ? 0 : 1);

  // Calculate total pages
  const totalPages = Math.ceil(count / perPage);

  // Generate page numbers array with ellipsis logic
  const paginationRange = useMemo(() => {
    if (totalPages <= 0) return [];

    const totalPageNumbers = siblingCount + 5; // 2 boundaries + 2 siblings + current page

    // Case 1: If total pages is less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but rights dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return [];
  }, [totalPages, page, siblingCount, boundaryCount]);

  if (count <= 0) {
    return <div className="text-sm text-muted-foreground">No records found</div>;
  }

  // Don't render if no items or only one page
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      gotoPage?.(newPage);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePageChange(page - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePageChange(page + 1);
  };

  const handlePageClick = (pageNumber: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    handlePageChange(pageNumber);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center md:justify-end",
        className
      )}
      {...restProps}
    >
      {!isMobile && showPageInfo && (
        <div className="text-sm text-muted-foreground invisible lg:visible">
          Showing {(page - 1) * perPage + 1} to{" "}
          {Math.min(page * perPage, count)} of {count}{" "}
          {count === 1 ? "record" : "records"}
        </div>
      )}
      <div className="flex ml-0 md:ml-auto items-center">
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={handlePrevious}
                className={cn(page <= 1 && "pointer-events-none opacity-50")}
                aria-disabled={page <= 1}
              >
                <span className="hidden sm:block">{previousText}</span>
              </PaginationPrevious>
            </PaginationItem>

            {/* Page Numbers */}
            {paginationRange.map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={handlePageClick(pageNumber as number)}
                    isActive={pageNumber === page}
                    aria-current={pageNumber === page ? "page" : undefined}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={handleNext}
                className={cn(
                  page >= totalPages && "pointer-events-none opacity-50"
                )}
                aria-disabled={page >= totalPages}
              >
                <span className="hidden sm:block">{nextText}</span>
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default DataPagination;
