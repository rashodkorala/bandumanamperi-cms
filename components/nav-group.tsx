"use client"

import Link from "next/link"
import { type Icon } from "@tabler/icons-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Badge } from "@/components/ui/badge"

export function NavGroup({
    title,
    items,
    showLabel = true,
}: {
    title?: string
    items: {
        title: string
        url: string
        icon?: Icon
        comingSoon?: boolean
    }[]
    showLabel?: boolean
}) {
    return (
        <SidebarGroup className="py-0">
            {showLabel && title && (
                <SidebarGroupLabel className="px-2 mb-1 text-xs text-sidebar-foreground/70">
                    {title}
                </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild={!item.comingSoon}
                                tooltip={item.title}
                                disabled={item.comingSoon}
                                className={item.comingSoon ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                {item.comingSoon ? (
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs shrink-0">Soon</Badge>
                                    </div>
                                ) : (
                                    <Link href={item.url} className="flex items-center gap-3">
                                        {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                        <span className="truncate">{item.title}</span>
                                    </Link>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

