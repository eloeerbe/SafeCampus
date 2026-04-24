import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { StoreInitializer } from "@/components/StoreInitializer";
import { DemoBanner } from "@/components/DemoBanner";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

// Req 17.2: Inter font via next/font/google
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SafeCampus — CSUF Campus Safety",
  description:
    "Campus safety and issue-reporting application for California State University, Fullerton",
};

// Req 17.5: Mobile-first responsive layout starting at 375px baseline
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-w-[375px]`}>
        <StoreInitializer>
          {/* Req 19.1: Demo banner at top of every page */}
          <DemoBanner />
          {/* SR-018: Nav bar only shows when authenticated */}
          <NavBar />
          {children}
        </StoreInitializer>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
