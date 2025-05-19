"use client";

import { useState, useEffect } from "react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-card shadow-sm py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
        <p>
          &copy; {currentYear !== null ? currentYear : "..."} Slide Back. All
          rights reserved.
        </p>
        <p className="mt-1">Remember and cherish your memories.</p>
      </div>
    </footer>
  );
}
