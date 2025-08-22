import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, BookOpen } from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { UserMenu } from "./UserMenu"
import { MessagesTabLink } from "./MessagesTabLink"

export async function MarketplaceNav() {
    const user = await fetchQuery(api.auth.getMe, {}, {
        token: await convexAuthNextjsToken()
    })

    return (
        <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">XcelTutors</span>
                        <Badge variant="secondary" className="text-xs">
                            Beta
                        </Badge>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                            <BookOpen className="h-4 w-4" />
                            <span>Find Tutors</span>
                        </Link>
                        {user && (user.role === "student" || user.role === "tutor") && (
                            <MessagesTabLink />
                        )}
                        {!user || user.role !== "tutor" ? (
                            <Link href="/become-tutor" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <Users className="h-4 w-4" />
                                <span>Become a Tutor</span>
                            </Link>
                        ) : null}
                        {user?.role === "admin" && (
                            <Link href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <span>Admin Panel</span>
                            </Link>
                        )}
                        {user?.role === "tutor" && (
                            <Link href="/tutor/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                <span>Dashboard</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <UserMenu user={user} />
                        ) : (
                            <>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/login">
                                        Sign In
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/become-tutor">
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
