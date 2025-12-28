import { redirect } from "next/navigation"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ProtectedErrorBoundary } from "@/components/protected-error-boundary"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    return (
        <ProtectedErrorBoundary>
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
                <AppSidebar variant="inset" collapsible="offcanvas" className="border-none rounded-xl shadow-sm "  />
                <SidebarInset>
                    <main className="@container/main flex flex-1 flex-col bg-background rounded-xl">
                        <SiteHeader />
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedErrorBoundary>
    )
}           