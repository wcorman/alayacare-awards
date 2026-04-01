"use client";

import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

export default function NominationAcceptanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      <section
        className="relative text-white py-[calc(4rem+2px)] px-[calc(1.5rem+2px)] lg:px-[calc(3rem+2px)] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #08193e 0%, #113cca 100%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Something went wrong
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            We couldn&apos;t load this page. This may be a temporary issue. Please try again or return to the homepage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <RefreshCw size={20} />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-colors"
            >
              <Home size={20} />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
