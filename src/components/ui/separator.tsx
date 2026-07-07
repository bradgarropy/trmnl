import type * as React from "react"

import {cn} from "~/lib/utils"

const Separator = ({className, ...props}: React.ComponentProps<"div">) => {
    return (
        <div
            className={cn("bg-border h-px w-full", className)}
            role="separator"
            {...props}
        />
    )
}

export {Separator}
