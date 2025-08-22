import { fetchQuery, preloadQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { redirect } from "next/navigation"
import { MessagesView } from "./_components/MessagesView"

export default async function MessagesPage() {
    const user = await fetchQuery(
        api.auth.getMe,
        {},
        {
            token: await convexAuthNextjsToken(),
        },
    )

    if (!user) {
        redirect("/login")
    }

    if (user.role !== "student" && user.role !== "tutor") {
        redirect("/")
    }

    // Preload conversations for the user
    const preloadedConversations = await preloadQuery(
        api.messages.getMyConversations,
        {},
        {
            token: await convexAuthNextjsToken(),
        },
    )

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
