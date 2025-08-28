import * as React from "react"

import { cn } from "@client/lib/utils"

function Required({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-red-500",
        className
      )}
      {...props}>
      &nbsp;*
    </span>
  )
}

export { Required }
