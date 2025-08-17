"use client";

import { useTransition } from "react";

interface UseAsyncActionOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Custom hook for handling async actions with automatic loading states.
 * Perfect for Convex actions and mutations.
 * 
 * @param options Configuration options for success/error handling
 * @returns Object with execute function and loading state
 */
export function useAsyncAction(options: UseAsyncActionOptions = {}) {
    const [isPending, startTransition] = useTransition();

    const execute = async (action: () => Promise<void> | void) => {
        startTransition(async () => {
            try {
                await action();
                options.onSuccess?.();
            } catch (error) {
                const errorInstance = error instanceof Error ? error : new Error(String(error));
                options.onError?.(errorInstance);
            }
        });
    };

    return {
        execute,
        loading: isPending
    };
}
