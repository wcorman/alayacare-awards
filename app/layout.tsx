import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlayaCare Awards",
  description: "Recognize the unsung heroes of home care.",
};

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ConfirmPopup from "@/components/ConfirmPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Navbar />
        {children}
        <Suspense fallback={null}>
          <ConfirmPopup />
        </Suspense>
      </body>
    </html>
  );
}
