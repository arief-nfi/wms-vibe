import { cn } from '@client/lib/utils'
import React from 'react'

const InputGroup = ({
  className,
  children,
  ...restProps
 }: React.ComponentProps<"div">) => {
  return (
    <div className={cn('group', className)} {...restProps}>
      <div className={cn('bg-background dark:bg-input/30 relative flex items-center shadow-xs h-9 w-full min-w-0 p-2',
                    'rounded-md border border-input ring-offset-background transition-[color,box-shadow] outline-none', 
                    'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50', 
                    'group-has-[input[aria-invalid="true"]]:ring-destructive/20 group-has-[input[aria-invalid="true"]]:ring-destructive/40 group-has-[input[aria-invalid="true"]]:border-destructive' 
          )}>
        {children}
      </div>
    </div>
  )
}

export default InputGroup