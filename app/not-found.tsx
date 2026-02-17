import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Home } from 'lucide-react';

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      {/* Hero Section */}
      <section
        className="relative text-white py-24 px-6 lg:px-12 overflow-hidden"
        style={{ background: `linear-gradient(135deg, #08193e 0%, #113cca 100%)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="text-8xl md:text-9xl font-bold mb-6 text-white/20">404</div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-all duration-200 shadow-sm"
          >
            <Home size={20} />
            {t('backToHome')}
          </Link>
        </div>
      </section>
    </main>
  );
}
