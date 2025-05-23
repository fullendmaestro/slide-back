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
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../profile/user-avatar";

export default function GalleryPageLayout() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="border-r border-sidebar-border"
      >
        <SidebarHeader className="p-4 items-center flex flex-row gap-2">
          {/* Sidebar close trigger on the left */}
          <SidebarTrigger>
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </SidebarTrigger>
          <Link href="/">
            <h2 className="text-xl font-semibold text-sidebar-foreground">
              Slide Back
            </h2>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <AlbumSidebar />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
          >
            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage
                        src={session.user.image || ""}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0) ||
                          session.user.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="group-data-[collapsible=icon]:hidden ml-2 truncate max-w-[120px]">
                      {session?.user?.name || "User"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
