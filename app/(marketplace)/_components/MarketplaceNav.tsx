import { preloadQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { MarketplaceNavClient } from "./MarketplaceNavClient"

export async function MarketplaceNav() {
    const preloadedUser = await preloadQuery(api.auth.getMe, {}, {
        token: await convexAuthNextjsToken()
    })

    return <MarketplaceNavClient preloadedUser={preloadedUser} />
}
