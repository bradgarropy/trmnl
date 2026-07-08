import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"
import type * as React from "react"

import {cn} from "~/lib/utils"

const buttonVariants = cva(
    "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "px-4 py-2",
                sm: "min-h-9 px-3",
                lg: "min-h-12 px-6",
                icon: "size-11",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

type ButtonProps = React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }

const Button = ({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: ButtonProps) => {
    const Component = asChild ? Slot : "button"

    return (
        <Component
            className={cn(buttonVariants({variant, size, className}))}
            {...props}
        />
    )
}

export {Button, buttonVariants}
