"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OAuthProviders } from "./OAuthProviders";
import { PasswordForm } from "./PasswordForm";
import Link from "next/link";

interface AuthPageProps {
    flow: "signIn" | "signUp",
}

export default function AuthPage({
    flow,
}: AuthPageProps & React.ComponentProps<"div">) {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        {flow === "signIn" ? "Welcome back" : "Create an account"}
                    </CardTitle>
                    <CardDescription>
                        {flow === "signIn"
                            ? "Login with"
                            : "Sign up with your email and password"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="flex flex-col gap-4">
                            <OAuthProviders />
                        </div>
                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                            <span className="bg-card text-muted-foreground relative z-10 px-2">
                                Or continue with
                            </span>
                        </div>
                        <PasswordForm flow={flow} />
                        <div className="text-center text-sm">
                            {flow === "signIn" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <Link
                                        href="/register"
                                        className="underline underline-offset-4"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <Link
                                        href="/login"
                                        className="underline underline-offset-4"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}