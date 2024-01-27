export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/NextThemeProvider";
import { twMerge } from "tailwind-merge";
import AppStateProvider from "@/lib/providers/SateProvider";
import db from "@/lib/supabase/db";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseUserProvider } from "@/lib/providers/SupabaseUserProvider";
import { SocketProvider } from "@/lib/providers/SocketProvider";

const inter = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cypress - Notion",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // console.log(db);

  return (
    <html lang="en">
      <body className={twMerge("bg-background", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppStateProvider>
            <SupabaseUserProvider>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
