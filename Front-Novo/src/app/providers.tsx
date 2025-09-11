// src\app\providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"
import { Toaster } from "sonner"
import { ConfigProvider } from "@/lib/providers/config-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </QueryClientProvider>
    </SessionProvider>
  )
}
