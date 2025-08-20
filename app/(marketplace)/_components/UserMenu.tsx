"use client"

import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    User,
    Settings,
    LogOut,
    Shield,
    GraduationCap,
    BookOpen,
    ChevronDown
} from "lucide-react"
import Link from "next/link"

interface UserMenuProps {
    user: {
        _id: string
        firstName: string
        lastName?: string
        email?: string
        image?: string
        role?: "admin" | "tutor" | "student"
    }
}

export function UserMenu({ user }: UserMenuProps) {
    const { signOut } = useAuthActions()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            await signOut()
        } catch (error) {
            console.error("Sign out error:", error)
        } finally {
            setIsSigningOut(false)
        }
    }

    const getRoleBadge = () => {
        switch (user.role) {
            case "admin":
                return <Badge variant="destructive" className="text-xs"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
            case "tutor":
                return <Badge variant="secondary" className="text-xs"><GraduationCap className="h-3 w-3 mr-1" />Tutor</Badge>
            case "student":
                return <Badge variant="outline" className="text-xs"><BookOpen className="h-3 w-3 mr-1" />Student</Badge>
            default:
                return null
        }
    }

    const getInitials = () => {
        return `${user.firstName.charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase()
    }

    return (
        <div className="flex items-center gap-3">
            {getRoleBadge()}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image} alt={user.firstName} />
                            <AvatarFallback className="text-sm">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-sm font-medium">
                                {user.firstName} {user.lastName || ''}
                            </span>
                            {user.email && (
                                <span className="text-xs text-gray-500 truncate max-w-32">
                                    {user.email}
                                </span>
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">
                                {user.firstName} {user.lastName || ''}
                            </p>
                            {user.email && (
                                <p className="text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                            )}
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>

                    {user.role === "admin" && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                                    <Shield className="h-4 w-4" />
                                    <span>Admin Panel</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}

                    {user.role === "tutor" && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/tutor/dashboard" className="flex items-center gap-2 cursor-pointer">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>Tutor Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
