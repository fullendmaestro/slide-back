"use client";
import Link from "next/link";
import { Film, GalleryHorizontal } from "lucide-react";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/profile/user-avatar";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 text-2xl font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Film className="h-8 w-8" />
            <span>Slide Back</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/files"
                className="flex items-center text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                <GalleryHorizontal className="h-4 w-4 mr-1 sm:mr-2" />
                My Files
              </Link>
              {session?.user ? (
                <UserAvatar />
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </nav>
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
}
