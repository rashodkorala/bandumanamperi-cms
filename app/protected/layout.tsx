import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider
            defaultOpen={true}
            style={
                {
                    "--sidebar-width": "18rem",
                    "--sidebar-width-icon": "3rem",
                    "--header-height": "3.5rem",
                } as React.CSSProperties
            }
            className="bg-[#1a1a1a] text-white"
        >
            <AppSidebar variant="inset" collapsible="offcanvas" className="border-none" />
            <SidebarInset>
                <main className="@container/main flex flex-1 flex-col bg-background rounded-2xl">
                    <SiteHeader />
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}           