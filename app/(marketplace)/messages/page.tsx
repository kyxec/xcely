import { preloadQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import MessagesPageClient from "@/app/(marketplace)/messages/_components/MessagesPageClient"

export default async function MessagesPage() {
    // Preload user data instead of fetching directly
    const preloadedUser = await preloadQuery(
        api.auth.getMe,
        {},
        {
            token: await convexAuthNextjsToken(),
        },
    )

    // Preload conversations for the user
    const preloadedConversations = await preloadQuery(
        api.messages.getMyConversations,
        {},
        {
            token: await convexAuthNextjsToken(),
        },
    )

    return (
        <MessagesPageClient
            preloadedUser={preloadedUser}
            preloadedConversations={preloadedConversations}
        />
    )
}
