import React from 'react';
import Link from 'next/link';
import { Clock3, Vote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NominatePage() {
    const t = await getTranslations('NominationClosedPage');

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
            <section
                className="relative overflow-hidden px-6 py-20 text-white lg:px-12"
                style={{ background: 'linear-gradient(135deg, #08193e 0%, #113cca 100%)' }}
            >
                <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-bl-full bg-white opacity-5" />
                <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-tr-full bg-[#f37021] opacity-10" />

                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/90">
                        <Clock3 size={16} />
                        {t('eyebrow')}
                    </div>
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">{t('title')}</h1>
                    <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85 md:text-xl">
                        {t('description')}
                    </p>

                    <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/vote"
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1D5EED] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0f46c7]"
                        >
                            <Vote size={18} />
                            {t('primaryCta')}
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/15"
                        >
                            {t('secondaryCta')}
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
