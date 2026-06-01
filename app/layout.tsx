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
    images: ["/momentum-awards-og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Home-Based Care Momentum Awards",
    description: "Recognize the outstanding individuals who are elevating home-based care every day.",
    images: ["/momentum-awards-og.png"],
  },
};

import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S4N9M8JZMB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S4N9M8JZMB');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow min-h-0">{children}</main>
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
