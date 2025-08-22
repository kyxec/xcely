"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { MessageSquare } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { Badge } from "@/components/ui/badge"

export function MessagesTabLink() {
    const unreadCount = useQuery(api.messages.getTotalUnreadCount)

    return (
        <Link href="/messages" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
            {unreadCount !== undefined && unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full px-1"
                >
                    {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
            )}
        </Link>
    )
}
