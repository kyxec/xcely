"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingWrapperProps {
    /**
     * Controls the loading state of the wrapped component
     * When true, shows spinner and disables interactions
     */
    loading?: boolean;

    /**
     * Optional text to display during loading state
     * If not provided, falls back to the wrapped component's children
     */
    loadingText?: string;

    /**
     * Optional icon to display when not in loading state
     * Hidden during loading to avoid conflicts with spinner
     */
    icon?: React.ReactNode;

    /**
     * Position of the spinner relative to content
     * @default "start"
     */
    spinnerPosition?: "start" | "end";

    /**
     * Custom spinner component
     * If not provided, uses default Loader2 with spin animation
     */
    spinner?: React.ReactNode;

    /**
     * Additional className for the spinner
     */
    spinnerClassName?: string;

    /**
     * Whether to hide the original content during loading
     * @default false
     */
    hideContentOnLoading?: boolean;

    /**
     * The component to wrap - will receive all props and be disabled during loading
     */
    children: React.ReactElement;

    /**
     * Additional props to pass to the wrapped component
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * LoadingWrapper Component
 * 
 * A generic wrapper component that adds loading state to any component.
 * Perfect for wrapping DropdownMenuItem, Button, or any other interactive component
 * with async operations.
 * 
 * Features:
 * - Works with any component that accepts disabled prop
 * - Automatic spinner display during loading
 * - Disabled state during loading to prevent interactions
 * - Customizable loading text and spinner position
 * - Custom spinner support
 * - Option to hide original content during loading
 * - TypeScript support with proper prop forwarding
 * 
 * @example
 * // Basic usage with DropdownMenuItem
 * <LoadingWrapper loading={isDeleting} loadingText="Deleting...">
 *   <DropdownMenuItem onClick={handleDelete}>
 *     Delete Item
 *   </DropdownMenuItem>
 * </LoadingWrapper>
 * 
 * @example
 * // With custom icon and spinner position
 * <LoadingWrapper 
 *   loading={isSaving}
 *   loadingText="Saving..."
 *   icon={<SaveIcon />}
 *   spinnerPosition="end"
 * >
 *   <Button onClick={handleSave}>Save</Button>
 * </LoadingWrapper>
 * 
 * @example
 * // Hide content during loading
 * <LoadingWrapper 
 *   loading={isProcessing}
 *   hideContentOnLoading
 *   loadingText="Processing..."
 * >
 *   <Card>Content that will be hidden</Card>
 * </LoadingWrapper>
 */
const LoadingWrapper = React.forwardRef<HTMLElement, LoadingWrapperProps>(
    (
        {
            loading = false,
            loadingText,
            icon,
            spinnerPosition = "start",
            spinner,
            spinnerClassName,
            hideContentOnLoading = false,
            children,
            ...props
        },
        ref
    ) => {
        // Default spinner component
        const defaultSpinner = (
            <Loader2 className={cn("size-4 animate-spin", spinnerClassName)} />
        );

        const spinnerElement = spinner || defaultSpinner;

        // Safely access children props with fallbacks
        const childProps = children.props || {};
        const originalChildren = childProps.children;
        const isChildDisabled = childProps.disabled;

        // Clone the child component and add loading-related props
        const wrappedChild = React.cloneElement(children, {
            ...props,
            ref,
            disabled: isChildDisabled || loading,
            "aria-busy": loading,
            children: loading ? (
                <div className="flex items-center gap-2">
                    {spinnerPosition === "start" && spinnerElement}
                    {!hideContentOnLoading && (
                        <span>{loadingText || originalChildren}</span>
                    )}
                    {hideContentOnLoading && loadingText && (
                        <span>{loadingText}</span>
                    )}
                    {spinnerPosition === "end" && spinnerElement}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    {icon && !loading && icon}
                    {originalChildren}
                </div>
            ),
        });

        return wrappedChild;
    }
);

LoadingWrapper.displayName = "LoadingWrapper";

export { LoadingWrapper };
export type { LoadingWrapperProps };
