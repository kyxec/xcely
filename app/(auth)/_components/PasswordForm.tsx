
"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthErrorAlert } from "./AuthErrorAlert";
import { useAsyncAction } from "@/lib/use-async-action";

interface PasswordFormProps {
    flow: "signIn" | "signUp";
}

export function PasswordForm({ flow }: PasswordFormProps) {
    const { signIn } = useAuthActions();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { execute: handleSubmit, loading: isSubmitting } = useAsyncAction({
        onSuccess: () => {
            router.push("/");
        },
        onError: (error) => {
            if (error.message.includes("InvalidAccountId")) {
                setError("Invalid email account");
            } else if (error.message.includes("InvalidSecret")) {
                setError("Invalid password");
            } else {
                setError(error.message);
            }
        }
    });

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        const formData = new FormData(e.currentTarget);
        formData.set("flow", flow);

        // Get the password and confirm password values
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        // Check if passwords match for sign-up flow
        if (flow === "signUp" && password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        await handleSubmit(async () => {
            await signIn("password", formData);
        });
    };

    return (
        <>
            {error && <AuthErrorAlert message={error} />}
            <form onSubmit={onSubmit}>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="grid gap-3">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {flow === "signIn" && (
                                <a
                                    href="#"
                                    className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            )}
                        </div>
                        <Input id="password" type="password" name="password" required />
                    </div>
                    {flow === "signUp" && (
                        <div className="grid gap-3">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                required
                            />
                        </div>
                    )}
                    <LoadingButton
                        type="submit"
                        className="w-full"
                        loading={isSubmitting}
                        loadingText={flow === "signIn" ? "Signing in..." : "Creating account..."}
                    >
                        {flow === "signIn" ? "Login" : "Sign Up"}
                    </LoadingButton>
                </div>
            </form>
        </>
    );
}