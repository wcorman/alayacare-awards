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
import Footer from "@/components/Footer";
import ConfirmPopup from "@/components/ConfirmPopup";
import VoteConfirmationPopup from "@/components/VoteConfirmationPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <Suspense fallback={null}>
          <ConfirmPopup />
          <VoteConfirmationPopup />
        </Suspense>
      </body>
    </html>
  );
}
