"use client"

import { useEffect } from "react"
import { usePreloadedQuery, useMutation, type Preloaded } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import type { api as ApiType } from "@/convex/_generated/api"
import { MessagesView } from "./MessagesView"
import { usePresence } from "@/hooks/use-presence"

type MessagesPageClientProps = {
    preloadedUser: Preloaded<typeof ApiType.auth.getMe>
    preloadedConversations: Preloaded<typeof ApiType.messages.getMyConversations>
}

export default function MessagesPageClient({ preloadedUser, preloadedConversations }: MessagesPageClientProps) {
    const user = usePreloadedQuery(preloadedUser)
    const router = useRouter()
    const setOffline = useMutation(api.presence.setOffline)

    // Set global presence for messages page
    const { updateMyPresence } = usePresence("global-messages")

    // Handle auth redirects
    useEffect(() => {
        if (!user) {
            router.push("/login")
            return
        }

        if (user.role !== "student" && user.role !== "tutor") {
            router.push("/")
            return
        }
    }, [user, router])

    // Mark user as online when they're on the messages page
    useEffect(() => {
        if (!user) return

        updateMyPresence({
            status: "online",
            inMessagesPage: true,
            lastSeen: Date.now()
        })

        // Enhanced cleanup when leaving the page
        return () => {
            // Use the dedicated setOffline mutation for immediate offline status
            setOffline({ room: "global-messages" }).catch((error) => {
                console.error("Failed to set offline on page leave:", error)
            })
        }
    }, [user, updateMyPresence, setOffline])

    // Show loading while redirecting
    if (!user || (user.role !== "student" && user.role !== "tutor")) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
                        <p className="text-gray-600 leading-relaxed">
                            {user.role === "student"
                                ? "Connect with your tutors and manage your learning sessions."
                                : "Communicate with your students and coordinate tutoring sessions."}
                        </p>
                    </div>

                    <MessagesView preloadedConversations={preloadedConversations} userRole={user.role} />
                </div>
            </div>
        </div>
    )
}
