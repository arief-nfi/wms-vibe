import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@client/components/ui/breadcrumb";
import { Fragment, ReactNode, useState } from "react";
import { cn } from "@client/lib/utils";

export interface BreadcrumbItem {
  id?: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  loading?: boolean;
  maxItems?: number;
  showMobileItems?: boolean;
  separator?: ReactNode;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const Breadcrumbs = ({ 
  items, 
  loading = false,
  maxItems,
  showMobileItems = false,
  separator,
  className,
  onItemClick
}: BreadcrumbProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Handle max items with ellipsis
  const displayItems = maxItems && items.length > maxItems 
    ? [
        ...items.slice(0, 1),
        { label: "...", disabled: true },
        ...items.slice(-(maxItems - 2))
      ]
    : items;

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.disabled || loading) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  if (loading) {
    return (
      <Breadcrumb className={className}>
        <BreadcrumbList>
          <BreadcrumbItem className={cn("animate-pulse", !showMobileItems && "hidden md:block")}>
            <div className="flex items-center justify-center text-xs h-5 w-18 bg-gray-200 rounded">Loading</div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {displayItems.map((item, index) => (
          <Fragment key={item.id || index}>
            <BreadcrumbItem className={cn(
              !showMobileItems && "hidden md:block",
              item.className
            )}>
              {item.href && !item.disabled ? (
                <BreadcrumbLink 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    if (item.onClick || onItemClick) {
                      e.preventDefault();
                      handleItemClick(item, index);
                    }
                  }}
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage
                  className={cn(
                    "flex items-center gap-1",
                    item.disabled && "opacity-50",
                    (item.onClick || onItemClick) && !item.disabled && "cursor-pointer hover:text-foreground/80"
                  )}
                  onClick={() => handleItemClick(item, index)}
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < displayItems.length - 1 && (
              separator ? (
                <span className={cn(!showMobileItems && "hidden md:block")}>
                  {separator}
                </span>
              ) : (
                <BreadcrumbSeparator className={cn(!showMobileItems && "hidden md:block")} />
              )
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// Utility functions for common breadcrumb patterns
export const createBreadcrumbItem = (
  label: string,
  href?: string,
  options?: Partial<BreadcrumbItem>
): BreadcrumbItem => ({
  label,
  href,
  ...options
});

export const createBreadcrumbItems = (
  items: Array<{ label: string; href?: string } & Partial<BreadcrumbItem>>
): BreadcrumbItem[] => {
  return items.map((item, index) => ({
    id: item.id || `breadcrumb-${index}`,
    ...item
  }));
};

// Hook for managing breadcrumb state
export const useBreadcrumbs = (initialItems: BreadcrumbItem[] = []) => {
  const [items, setItems] = useState<BreadcrumbItem[]>(initialItems);

  const addItem = (item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<BreadcrumbItem>) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const replaceItems = (newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  };

  const clearItems = () => {
    setItems([]);
  };

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    replaceItems,
    clearItems
  };
};

export default Breadcrumbs

// Backward compatibility
export type Item = BreadcrumbItem;