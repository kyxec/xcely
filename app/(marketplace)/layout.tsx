import { MarketplaceNav } from "./_components/MarketplaceNav"
import { MarketplaceFooter } from "./_components/MarketplaceFooter"

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNav />
            <main className="flex-1">
                {children}
            </main>
            <MarketplaceFooter />
        </div>
    )
}
