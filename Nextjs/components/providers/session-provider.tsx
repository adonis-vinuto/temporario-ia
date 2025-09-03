"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/query-provider";
import { ModuleProvider } from "@/lib/context/ModuleContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system">
        <QueryProvider>
          <ModuleProvider>{children}</ModuleProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
