import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex flex-col h-[100dvh] w-[100dvw] bg-background text-foreground">
      <Header />
      <main className="flex-grow overflow-y-scroll">{children}</main>
      <Footer />
    </div>
  );
}
