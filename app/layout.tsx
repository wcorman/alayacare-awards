import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Home-Based Care Momentum Awards",
  description: "Recognize the outstanding individuals who are elevating home-based care every day.",
  openGraph: {
    title: "The Home-Based Care Momentum Awards",
    description: "Recognize the outstanding individuals who are elevating home-based care every day.",
    images: ["/awards-og-image.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Home-Based Care Momentum Awards",
    description: "Recognize the outstanding individuals who are elevating home-based care every day.",
    images: ["/awards-og-image.webp"],
  },
};

import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConfirmPopup from "@/components/ConfirmPopup";
import VoteConfirmationPopup from "@/components/VoteConfirmationPopup";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Suspense fallback={null}>
            <ConfirmPopup />
            <VoteConfirmationPopup />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
