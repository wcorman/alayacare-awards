import React from 'react';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms & Conditions | The Home-Based Care Momentum Awards",
  description: "Terms and conditions for The Home-Based Care Momentum Awards.",
};

export default async function TermsPage() {
  const t = await getTranslations('Terms');

  const Section = ({
    sectionKey,
    paragraphs,
  }: {
    sectionKey: 'participation' | 'eligibility' | 'nominations' | 'selection' | 'useOfContent' | 'publicity' | 'privacy' | 'disqualification' | 'changes' | 'releaseAndLimitation' | 'governingLaw';
    paragraphs: ('p1' | 'p2' | 'p3' | 'p4')[];
  }) => (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-[#08193e]">{t(`${sectionKey}.title`)}</h2>
      <div className="h-1 w-20 rounded bg-[#1D5EED] mb-4"></div>
      <div className="space-y-4 text-gray-700">
        {paragraphs.map((p) => (
          <p key={p}>{t(`${sectionKey}.${p}`)}</p>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      {/* Hero Section */}
      <section
        className="relative text-white py-16 px-6 lg:px-12 overflow-hidden"
        style={{ background: `linear-gradient(135deg, #08193e 0%, #113cca 100%)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t('hero.title')}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <Section sectionKey="participation" paragraphs={['p1']} />
          <Section sectionKey="eligibility" paragraphs={['p1', 'p2']} />
          <Section sectionKey="nominations" paragraphs={['p1', 'p2', 'p3']} />
          <Section sectionKey="selection" paragraphs={['p1', 'p2', 'p3', 'p4']} />
          <Section sectionKey="useOfContent" paragraphs={['p1']} />
          <Section sectionKey="publicity" paragraphs={['p1', 'p2']} />
          <Section sectionKey="privacy" paragraphs={['p1', 'p2', 'p3']} />
          <Section sectionKey="disqualification" paragraphs={['p1']} />
          <Section sectionKey="changes" paragraphs={['p1', 'p2']} />
          <Section sectionKey="releaseAndLimitation" paragraphs={['p1']} />
          <Section sectionKey="governingLaw" paragraphs={['p1']} />
        </div>
      </section>
    </main>
  );
}
