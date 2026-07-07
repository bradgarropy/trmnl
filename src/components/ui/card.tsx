import type * as React from "react"

import {cn} from "~/lib/utils"

const Card = ({className, ...props}: React.ComponentProps<"div">) => {
    return (
        <div
            className={cn(
                "bg-card text-card-foreground rounded-lg border shadow-xs",
                className,
            )}
            {...props}
        />
    )
}

const CardHeader = ({className, ...props}: React.ComponentProps<"div">) => {
    return (
        <div
            className={cn("flex flex-col gap-1.5 p-4", className)}
            {...props}
        />
    )
}

const CardTitle = ({
    className,
    children,
    ...props
}: React.ComponentProps<"h3">) => {
    return (
        <h3
            className={cn("text-lg font-semibold leading-none", className)}
            {...props}
        >
            {children}
        </h3>
    )
}

const CardDescription = ({
    className,
    ...props
}: React.ComponentProps<"p">) => {
    return (
        <p className={cn("text-muted-foreground text-sm", className)} {...props} />
    )
}

const CardContent = ({className, ...props}: React.ComponentProps<"div">) => {
    return <div className={cn("p-4 pt-0", className)} {...props} />
}

export {Card, CardContent, CardDescription, CardHeader, CardTitle}
