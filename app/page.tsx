
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { UserPlus, Heart, Trophy } from 'lucide-react';

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
  const missionItems = t.raw('mission.items') as string[];
  const missionIcons = [Trophy, Heart, UserPlus];

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      {/* Hero Section */}
      <section className="relative text-white py-20 px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#08193e] to-[#113cca] opacity-60 z-10"></div>
        <div className="relative z-20 max-w-4xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#1D5EED] mb-6 inline-block">
            {t('hero.badge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t.rich('hero.title', {
              people: (chunks) => <span style={{ color: '#1D5EED' }}>{chunks}</span>,
            })}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
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
      <section className="py-24 px-6 lg:px-12 bg-white">
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
              
              <div className="space-y-4">
                {missionItems.map((item, i) => {
                  const Icon = missionIcons[i];

                  return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1D5EED] flex items-center justify-center">
                      {Icon ? <Icon size={20} className="text-white" strokeWidth={2.5} /> : null}
                    </div>
                    <span className="text-base font-semibold text-[#08193e]">
                      {item}
                    </span>
                  </div>
                )})}
              </div>
            </div>

            {/* Right Visual */}
            <div className="flex-1 w-full max-w-xl">
              <div className="grid grid-cols-2 gap-5">
                {/* Card 1 */}
                <div className="bg-gradient-to-br from-[#08193e] to-[#113cca] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center text-white h-full justify-center space-y-4">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/caregiver.png"
                        alt={t('audiences.caregivers')}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-lg">{t('audiences.caregivers')}</h3>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-gradient-to-br from-[#1D5EED] to-[#113CCA] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center text-white h-full justify-center space-y-4">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/scheduler.png"
                        alt={t('audiences.schedulers')}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-lg">{t('audiences.schedulers')}</h3>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-gradient-to-br from-[#113CCA] to-[#08193E] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center text-white h-full justify-center space-y-4">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/it-person.png"
                        alt={t('audiences.it')}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-lg">{t('audiences.it')}</h3>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-gradient-to-br from-[#1D5EED] to-[#08193E] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center text-white h-full justify-center space-y-4">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/manager.png"
                        alt={t('audiences.managers')}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-bold text-lg">{t('audiences.managers')}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
