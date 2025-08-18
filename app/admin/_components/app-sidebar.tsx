import * as React from "react"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { LocationSwitcher } from "./location-switcher"
import { api } from "@/convex/_generated/api"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { preloadQuery } from "convex/nextjs"

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const preloadedUser = await preloadQuery(
        api.auth.getMe,
        {},
        { token: await convexAuthNextjsToken() },
    );

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <LocationSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
                <NavProjects />
            </SidebarContent>
            <SidebarFooter>
                <NavUser preloadedUser={preloadedUser} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
