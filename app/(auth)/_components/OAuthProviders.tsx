"use client"

import { useAuthActions } from "@convex-dev/auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon"
import { LoadingButton } from "@/components/ui/loading-button";
import { useAsyncAction } from "@/lib/use-async-action";

export function OAuthProviders() {
    const { signIn } = useAuthActions();

    const { execute: handleGoogleSignIn, loading: isGoogleLoading } = useAsyncAction();

    return (
        <>
            <LoadingButton
                className="w-full"
                variant="outline"
                type="button"
                loading={isGoogleLoading}
                loadingText="Signing in with Google..."
                icon={<GoogleIcon />}
                onClick={() => handleGoogleSignIn(async () => {
                    await signIn("google");
                })}
            >
                Login with Google
            </LoadingButton>
        </>
    );
}