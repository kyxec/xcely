"use client"

import { useAuthActions } from "@convex-dev/auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon"
import { Button } from "@/components/ui/button";

export function OAuthProviders() {
    const { signIn } = useAuthActions();

    return (
        <>
            <Button
                className="w-full"
                variant="outline"
                type="button"
                onClick={() => void signIn("google")}
            >

                <GoogleIcon />
                Login with Google
            </Button>
        </>
    );
}