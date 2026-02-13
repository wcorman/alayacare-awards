
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { UserPlus, Heart, Trophy, Megaphone, Calendar, Users, Gavel, Award } from 'lucide-react';

// Force dynamic rendering so we always get the latest nominees
export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { id: 'frontline', nameKey: 'categories.frontline.name', descriptionKey: 'categories.frontline.description', iconPath: '/frontline-care.png', color: '#f37021' },
  { id: 'operational', nameKey: 'categories.operational.name', descriptionKey: 'categories.operational.description', iconPath: '/operational-excellence.png', color: '#113cca' },
  { id: 'executive', nameKey: 'categories.executive.name', descriptionKey: 'categories.executive.description', iconPath: '/executive-leadership.png', color: '#ffaa05' },
  { id: 'impact', nameKey: 'categories.impact.name', descriptionKey: 'categories.impact.description', iconPath: '/Impact-and-innovation.png', color: '#08193e' },
];

export default async function Home() {
  const t = await getTranslations('Home');
  const locale = await getLocale();
  const heroLogo = locale === 'fr' ? '/momentum-logo-white-fr.svg' : '/momentum-logo-white.svg';
  const footerLogo = locale === 'fr' ? '/momentum-logo-blue-fr.svg' : '/momentum-logo-blue.svg';
  const missionItems = t.raw('mission.items') as string[];
  const missionIcons = [Trophy, Heart, UserPlus, Megaphone];
  const timelineItems = t.raw('timeline.items') as Array<{ title: string; date: string; description: string }>;
  const timelineIcons = [Calendar, Users, Gavel, Award];

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      {/* Hero Section */}
      <section className="relative text-white py-[100px] px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-poster.webp"
          aria-hidden="true"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#15265d] to-[#112e90] opacity-60 z-10"></div>
        <div className="relative z-20 max-w-[970px] mx-auto">
          <div className="mb-6 flex justify-center">
            <Image
              src={heroLogo}
              alt="AlayaCare"
              width={320}
              height={60}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t.rich('hero.title', {
              people: (chunks) => <span style={{ color: '#5FEAE6' }}>{chunks}</span>,
            })}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-[730px] mx-auto font-light">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/nominate"
              className="px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              <UserPlus size={20} /> {t('hero.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#08193e]">{t('categories.title')}</h2>
            <div className="h-1 w-20 mx-auto rounded bg-[#1D5EED]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="p-6 text-center group border-t-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all" style={{ borderColor: cat.color }}>
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Image
                    src={cat.iconPath}
                    alt={t(cat.nameKey)}
                    width={54}
                    height={54}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#08193e]">{t(cat.nameKey)}</h3>
                <p className="text-gray-600 text-sm">{t(cat.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebrating Excellence Section */}
      <section id="why-participate" className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1 max-w-xl">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#1D5EED] mb-6 inline-block">
                {t('mission.eyebrow')}
              </span>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-[#08193e] mb-6 leading-tight">
                {t('mission.title')}
              </h2>
              
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                {t('mission.description')}
              </p>
            </div>

            {/* Right Content: Mission Items */}
            <div className="flex-1 w-full max-w-xl">
              <div className="space-y-4">
                {missionItems.map((item, i) => {
                  const Icon = missionIcons[i];
                  const [lead, ...restParts] = item.split(':');
                  const rest = restParts.join(':').trim();

                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1D5EED] flex items-center justify-center">
                        {Icon ? <Icon size={20} className="text-white" strokeWidth={2.5} /> : null}
                      </div>
                      <span className="text-base text-[#08193e]">
                        <strong className="block font-semibold">
                          {lead}
                        </strong>
                        {rest ? <span className="block mt-1">{rest}</span> : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Dates and Milestones Section */}
      <section id="key-dates" className="py-24 px-6 lg:px-12 bg-[#f6f8ff]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#1D5EED] mb-6 inline-block">
              {t('timeline.eyebrow')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#08193e] mb-4 max-w-3xl mx-auto">
              {t('timeline.title')}
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#1D5EED] via-[#113CCA] to-transparent sm:left-1/2"></div>
            <div className="space-y-10">
              {timelineItems.map((item, index) => (
                <div key={`${item.title}-${index}`} className="relative">
                  <span className={`absolute left-4 top-6 h-4 w-4 -translate-x-1/2 rounded-full bg-[#1D5EED] ring-4 ring-white shadow-md sm:left-1/2 ${index === 0 ? 'animate-gentle-pulse' : ''}`}></span>
                  <div
                    className={`pl-12 sm:pl-0 sm:w-1/2 ${
                      index % 2 === 0 ? 'sm:pr-12' : 'sm:pl-12 sm:ml-auto'
                    }`}
                  >
                    <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D5EED]/10 text-[#1D5EED]">
                          {React.createElement(timelineIcons[index] ?? Calendar, { size: 20, strokeWidth: 2.2 })}
                        </span>
                        <div className="text-xs font-semibold uppercase tracking-wide text-[#1D5EED]">
                          {item.date}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#08193e] mt-2">{item.title}</h3>
                      <p className="text-gray-600 mt-3 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* About the awards */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-[#08193e]">{t('aboutAwards.title')}</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {t('aboutAwards.intro1')}
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-12">
            {t('aboutAwards.intro2')}
          </p>
          <h3 className="text-xl font-bold mb-4 text-[#08193e] flex flex-wrap items-center gap-2">
            {t('aboutAwards.poweredByPrefix')}
            <Image
              src="/AlayaCare-logo.svg"
              alt="AlayaCare"
              width={96}
              height={30}
              className="inline-block object-contain mb-[6px]"
            />
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t.rich('aboutAwards.poweredBy1', {
              link: (chunks) => (
                <a
                  href="https://alayacare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1D5EED] hover:underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t('aboutAwards.poweredBy2')}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t('aboutAwards.poweredBy3')}
          </p>
        </div>
      </section>

      {/* Footer Logo Section */}
      <section className="pt-3 pb-[70px] px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Image
            src={footerLogo}
            alt="AlayaCare"
            width={320}
            height={60}
            className="object-contain"
          />
        </div>
      </section>
    </main>
  );
}
