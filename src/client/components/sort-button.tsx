import React from "react";
import { Button } from "./ui/button";
import { ArrowDownAZ, ArrowDownZA } from "lucide-react";

interface SortButtonProps {
  column: string;
  label: string;
  sort: string;
  order: string;
  sortBy: (column: string) => void;
  [key: string]: any; // for rest props
}

const SortButton: React.FC<SortButtonProps> = ({
  column = "",
  label = "",
  sort = "",
  order = "asc",
  sortBy = () => {},
  ...rest
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 w-full"
      onClick={() => sortBy(column)}
      {...rest}
    >
      <div className="grow text-left">{label}</div>
      {sort === column && (
        order === "asc" ? (
          <div><ArrowDownAZ size={18} className="text-foreground/70" /></div>
        ) : (
          <div><ArrowDownZA size={18} className="text-foreground/70" /></div>
        )
      )}
    </Button>
  );
};

export default SortButton;