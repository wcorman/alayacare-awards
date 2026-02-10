import React from 'react';
import { Heart, Award, Briefcase, Sparkles, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function EligibilityPage() {
  const t = await getTranslations('Eligibility');
  
  const categories = [
    {
      id: 'frontline',
      nameKey: 'categoryLevel.categories.frontline.name',
      descriptionKey: 'categoryLevel.categories.frontline.description',
      icon: Heart,
      color: '#f37021',
      requirements: [
        { type: 'text', key: 'categoryLevel.categories.frontline.requirements.impact' },
        { type: 'text', key: 'categoryLevel.categories.frontline.requirements.role' },
        { type: 'list', key: 'categoryLevel.categories.frontline.requirements.roles' },
        { type: 'text', key: 'categoryLevel.categories.frontline.requirements.provide' },
        { type: 'text', key: 'categoryLevel.categories.frontline.requirements.demonstrate' },
        { type: 'text', key: 'categoryLevel.meetOrganizationLevel' }
      ]
    },
    {
      id: 'operational',
      nameKey: 'categoryLevel.categories.operational.name',
      descriptionKey: 'categoryLevel.categories.operational.description',
      icon: Award,
      color: '#113cca',
      requirements: [
        { type: 'text', key: 'categoryLevel.categories.operational.requirements.champion' },
        { type: 'text', key: 'categoryLevel.categories.operational.requirements.role' },
        { type: 'list', key: 'categoryLevel.categories.operational.requirements.roles' },
        { type: 'text', key: 'categoryLevel.categories.operational.requirements.playRole' },
        { type: 'text', key: 'categoryLevel.categories.operational.requirements.demonstrate' },
        { type: 'list', key: 'categoryLevel.categories.operational.requirements.contributions' },
        { type: 'text', key: 'categoryLevel.meetOrganizationLevel' }
      ]
    },
    {
      id: 'executive',
      nameKey: 'categoryLevel.categories.executive.name',
      descriptionKey: 'categoryLevel.categories.executive.description',
      icon: Briefcase,
      color: '#ffaa05',
      requirements: [
        { type: 'text', key: 'categoryLevel.categories.executive.requirements.trackRecord' },
        { type: 'text', key: 'categoryLevel.categories.executive.requirements.role' },
        { type: 'list', key: 'categoryLevel.categories.executive.requirements.roles' },
        { type: 'text', key: 'categoryLevel.categories.executive.requirements.responsibility' },
        { type: 'text', key: 'categoryLevel.categories.executive.requirements.demonstrate' },
        { type: 'list', key: 'categoryLevel.categories.executive.requirements.demonstrations' },
        { type: 'text', key: 'categoryLevel.meetOrganizationLevel' }
      ]
    },
    {
      id: 'impact',
      nameKey: 'categoryLevel.categories.impact.name',
      descriptionKey: 'categoryLevel.categories.impact.description',
      icon: Sparkles,
      color: '#08193e',
      requirements: [
        { type: 'text', key: 'categoryLevel.categories.impact.requirements.embody' },
        { type: 'text', key: 'categoryLevel.categories.impact.requirements.role' },
        { type: 'text', key: 'categoryLevel.categories.impact.requirements.leading' },
        { type: 'list', key: 'categoryLevel.categories.impact.requirements.initiatives' },
        { type: 'text', key: 'categoryLevel.categories.impact.requirements.show' },
        { type: 'list', key: 'categoryLevel.categories.impact.requirements.impacts' },
        { type: 'text', key: 'categoryLevel.meetOrganizationLevel' }
      ]
    }
  ];

  const services = [
    'organizationLevel.services.homeCare',
    'organizationLevel.services.homeHealth',
    'organizationLevel.services.homeInfusion',
    'organizationLevel.services.hospice',
    'organizationLevel.services.communityCare',
    'organizationLevel.services.adjacentServices'
  ];

  const renderRequirement = (req: { type: string; key: string }, index: number) => {
    if (req.type === 'text') {
      return (
        <li key={index} className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#f37021] flex-shrink-0 mt-0.5" />
          <span className="text-gray-700">{t(req.key)}</span>
        </li>
      );
    } else if (req.type === 'list') {
      const items = t.raw(req.key) as string[];
      return (
        <li key={index} className="ml-8 mt-2">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </li>
      );
    }
    return null;
  };

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <p className="text-gray-200 italic mt-6 max-w-2xl mx-auto">
            {t('hero.note')}
          </p>
        </div>
      </section>

      {/* Organization-Level Eligibility */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-[#08193e]">{t('organizationLevel.title')}</h2>
            <div className="h-1 w-20 rounded bg-[#1D5EED] mb-6"></div>
            <p className="text-gray-700 mb-6">
              {t('organizationLevel.intro')}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 border-l-4" style={{ borderColor: '#f37021' }}>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#f37021] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  {t('organizationLevel.employment')}
                </span>
              </li>
              <li className="ml-8">
                <ul className="space-y-2">
                  {services.map((serviceKey, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#f37021] font-bold">•</span>
                      <span className="text-gray-700">{t(serviceKey)}</span>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#f37021] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  {t('organizationLevel.setting')}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border-l-4" style={{ borderColor: '#113cca' }}>
            <h3 className="font-bold text-lg mb-3 text-[#08193e]">{t('organizationLevel.additionalNotes.title')}</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>{t('organizationLevel.additionalNotes.nominations')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>{t('organizationLevel.additionalNotes.oneCategory')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>{t('organizationLevel.additionalNotes.multipleNominations')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>{t('organizationLevel.additionalNotes.discretion')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Category Eligibility */}
      <section className="py-16 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#08193e]">{t('categoryLevel.title')}</h2>
            <div className="h-1 w-20 mx-auto rounded bg-[#1D5EED]"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {t('categoryLevel.intro')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border-t-4"
                  style={{ borderColor: category.color }}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category.color}15`, color: category.color }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-[#08193e]">{t(category.nameKey)}</h3>
                        <p className="text-gray-600 mb-4">{t(category.descriptionKey)}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-lg mb-4 text-[#08193e]">{t('categoryLevel.nomineesShould')}</h4>
                      <ul className="space-y-3">
                        {category.requirements.map((req, idx) => renderRequirement(req, idx))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#08193e] to-[#113cca] rounded-lg p-8 text-white">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">{t('contact.title')}</h3>
            <p className="text-gray-200 mb-6">
              {t('contact.text')}{' '}
              <a
                href={`mailto:${t('contact.email')}`}
                className="text-[#f37021] hover:text-[#ff8c42] font-semibold underline transition-colors"
              >
                {t('contact.email')}
              </a>
              {' '}{t('contact.textAfter')}
            </p>
            <Link
              href="/nominate"
              className="inline-block px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-all duration-200 shadow-sm"
            >
              {t('contact.cta')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
