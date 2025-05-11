import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container">{children}</main>
      <Footer />
    </div>
  );
}
