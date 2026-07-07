import type * as React from "react"

import {cn} from "~/lib/utils"

const Input = ({className, type, ...props}: React.ComponentProps<"input">) => {
    return (
        <input
            className={cn(
                "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-11 w-full rounded-md border px-3 py-2 text-base font-normal shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className,
            )}
            type={type}
            {...props}
        />
    )
}

export {Input}
