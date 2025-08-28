import React from "react";
import { Button } from "../ui/button";
import { ArrowDownAZ, ArrowDownZA } from "lucide-react";
import { cn } from "@client/lib/utils";

interface Props {
  column: string;
  label: string;
  sort: string;
  order: string;
  sortBy: (column: string) => void;
}

const SortButton = ({
  className,
  column,
  label,
  sort,
  order,
  sortBy,
  ...restProps
}: React.ComponentProps<"button"> & Props) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("flex items-center gap-1 w-full", className)}
      onClick={() => sortBy(column)}
      {...restProps}
    >
      <div className="grow text-left">{label}</div>
      {sort === column && (
        <>
          {order === "asc" ? (
            <div>
              <ArrowDownAZ size={18} className="text-foreground/70" />
            </div>
          ) : (
            <div>
              <ArrowDownZA size={18} className="text-foreground/70" />
            </div>
          )}
        </>
      )}
    </Button>
  );
};

export default SortButton;
