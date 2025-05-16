"use client";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import AlbumSidebar from "@/components/gallery/AlbumSidebar";
import GalleryContent from "@/components/gallery/GalleryContent";
import { Button } from "../ui/button";
import { Settings, UserCircle } from "lucide-react";
import Link from "next/link";

export default function GalleryPageLayout() {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-r border-sidebar-border"
      >
        <SidebarHeader className="p-4 items-center flex justify-between">
          <Link href="/">
            <h2 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Slide Back
            </h2>
          </Link>
          {/* <SidebarTrigger className="group-data-[collapsible=icon]:hidden" /> */}
        </SidebarHeader>
        <SidebarContent className="p-0">
          <AlbumSidebar />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
          >
            <UserCircle className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden ml-2">
              Profile
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
          >
            <Settings className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden ml-2">
              Settings
            </span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-1 flex-col bg-background">
        {/* Added flex-1 */}
        <header className="p-4 border-b border-border flex items-center justify-start md:hidden">
          <SidebarTrigger />
          <h2 className="text-xl font-semibold ml-4">My Files</h2>
        </header>
        {/* Ensure this div allows GalleryContent to take full height and manage its own scroll */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <GalleryContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
