import { ModuleProvider } from "@/lib/context/ModuleContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono, ABeeZee } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const abeeZee = ABeeZee({
  variable: "--font-abeezee",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "KomvosMind",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${abeeZee.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <QueryProvider>
            <ModuleProvider>{children}</ModuleProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
