"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
                destructive:
                    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                outline:
                    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

interface LoadingButtonProps
    extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
    /**
     * When true, renders children as a Slot component instead of a button
     * Useful for composition patterns where you need the button behavior
     * but want to render a different element
     */
    asChild?: boolean;

    /**
     * Controls the loading state of the button
     * When true, shows spinner and disables the button
     */
    loading?: boolean;

    /**
     * Optional text to display during loading state
     * If not provided, falls back to the button's children
     */
    loadingText?: string;

    /**
     * Optional icon to display when not in loading state
     * Hidden during loading to avoid conflicts with spinner
     */
    icon?: React.ReactNode;
}

/**
 * LoadingButton Component
 * 
 * A reusable button component with built-in loading state management.
 * Perfect for async operations like API calls, form submissions, and Convex mutations.
 * 
 * Features:
 * - Automatic spinner display during loading
 * - Disabled state during loading to prevent double-clicks
 * - Customizable loading text
 * - Icon support (hidden during loading)
 * - All standard button variants and sizes
 * - TypeScript support with proper prop typing
 * 
 * @example
 * // Basic usage
 * <LoadingButton loading={isLoading} onClick={handleClick}>
 *   Save Changes
 * </LoadingButton>
 * 
 * @example
 * // With custom loading text and icon
 * <LoadingButton 
 *   loading={isSubmitting}
 *   loadingText="Submitting..."
 *   icon={<SaveIcon />}
 *   onClick={handleSubmit}
 * >
 *   Submit Form
 * </LoadingButton>
 * 
 * @example
 * // Different variants
 * <LoadingButton variant="destructive" loading={isDeleting}>
 *   Delete Item
 * </LoadingButton>
 */
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            loadingText,
            icon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        {loadingText || children}
                    </>
                ) : (
                    <>
                        {icon && !loading && icon}
                        {children}
                    </>
                )}
            </Comp>
        );
    }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton, buttonVariants };
export type { LoadingButtonProps };
