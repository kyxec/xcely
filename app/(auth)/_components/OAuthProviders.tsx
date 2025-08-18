"use client"

import { useAuthActions } from "@convex-dev/auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon"
import { Button } from "@/components/ui/button";
import { LoadingWrapper } from "@/components/ui/loading-wrapper";
import { useAsyncAction } from "@/lib/use-async-action";

export function OAuthProviders() {
    const { signIn } = useAuthActions();

    const { execute: handleGoogleSignIn, loading: isGoogleLoading } = useAsyncAction();

    return (
        <>
            <LoadingWrapper
                loading={isGoogleLoading}
                loadingText="Signing in with Google..."
                icon={<GoogleIcon />}
            >
                <Button
                    className="w-full"
                    variant="outline"
                    type="button"
                    onClick={() => handleGoogleSignIn(async () => {
                        await signIn("google");
                    })}
                >
                    Login with Google
                </Button>
            </LoadingWrapper>
        </>
    );
}