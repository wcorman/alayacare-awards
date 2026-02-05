import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, Heart, Briefcase, Sparkles } from 'lucide-react';
import { fetchNomineeById } from '@/lib/airtable';
import NomineeImage from '@/components/NomineeImage';
import NomineePageClient from '@/components/NomineePageClient';

// Force dynamic rendering so we always get the latest nominee data
export const dynamic = 'force-dynamic';

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
    "Frontline Care": { icon: Heart, color: '#f37021' },
    "Operational Excellence": { icon: Award, color: '#113cca' },
    "Executive Leadership": { icon: Briefcase, color: '#ffaa05' },
    "Impact and Innovation": { icon: Sparkles, color: '#08193e' },
};

interface NomineePageProps {
    params: Promise<{ id: string }>;
}

export default async function NomineePage({ params }: NomineePageProps) {
    const { id } = await params;
    const nominee = await fetchNomineeById(id);

    if (!nominee) {
        notFound();
    }

    const categoryInfo = CATEGORY_CONFIG[nominee.category] || { icon: Award, color: '#6b7280' };
    const IconComponent = categoryInfo.icon;

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
            {/* Hero Section */}
            <section
                className="relative text-white py-16 px-6 lg:px-12 overflow-hidden"
                style={{ background: `linear-gradient(135deg, #08193e 0%, #113cca 100%)` }}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <Link
                        href="/vote"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to All Nominees</span>
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                {nominee.name}
                            </h1>
                            {(nominee.organization || nominee.jobTitle) && (
                                <p className="text-xl md:text-2xl text-white/90 mt-2">
                                    {[nominee.organization, nominee.jobTitle].filter(Boolean).join(' - ')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 px-6 lg:px-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* Mobile Layout: Image Section (Full Width) */}
                        <div className="relative aspect-[16/9] md:hidden overflow-hidden">
                            <NomineeImage
                                src={nominee.image}
                                alt={nominee.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </div>

                        {/* Content Container */}
                        <div className="p-8 md:p-12">
                            {/* Desktop Layout: Flex container with photo on left, story on right */}
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Column: Profile Photo + Stats Cards (Desktop only) */}
                                <div className="flex-shrink-0 flex flex-col gap-6">
                                    {/* Profile Photo (Desktop) */}
                                    <div className="hidden md:block relative w-full max-w-[300px] aspect-square overflow-hidden rounded-xl">
                                        <NomineeImage
                                            src={nominee.image}
                                            alt={nominee.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Stats Cards (Desktop: under photo) */}
                                    <div className="hidden md:grid grid-cols-1 gap-4">
                                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#08193e] to-[#113cca] text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Award size={24} />
                                                <span className="text-sm font-semibold uppercase tracking-wide opacity-80">Votes</span>
                                            </div>
                                            <p className="text-3xl font-bold">{nominee.votes}</p>
                                        </div>
                                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1D5EED] to-[#113CCA] text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <IconComponent size={24} />
                                                <span className="text-sm font-semibold uppercase tracking-wide opacity-80">Category</span>
                                            </div>
                                            <p className="text-lg font-bold">{nominee.category}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Nomination Story */}
                                <div className="flex-1">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-[#08193e] mb-4 flex items-center gap-3">
                                            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: categoryInfo.color }}></div>
                                            Nomination Story
                                        </h2>
                                        <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            "{nominee.description}"
                                        </p>
                                    </div>

                                    {/* Stats Cards (Mobile: under story) */}
                                    <div className="grid grid-cols-1 md:hidden gap-4 mb-8">
                                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#08193e] to-[#113cca] text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Award size={24} />
                                                <span className="text-sm font-semibold uppercase tracking-wide opacity-80">Votes</span>
                                            </div>
                                            <p className="text-3xl font-bold">{nominee.votes}</p>
                                        </div>
                                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#1D5EED] to-[#113CCA] text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <IconComponent size={24} />
                                                <span className="text-sm font-semibold uppercase tracking-wide opacity-80">Category</span>
                                            </div>
                                            <p className="text-lg font-bold">{nominee.category}</p>
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <NomineePageClient nominee={nominee} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/vote"
                            className="px-6 py-3 rounded-lg font-medium text-[#08193e] bg-white border-2 border-gray-300 hover:border-[#1D5EED] hover:text-[#1D5EED] transition-all duration-200 text-center"
                        >
                            View All Nominees
                        </Link>
                        <Link
                            href="/nominate"
                            className="px-6 py-3 rounded-lg font-medium text-[#08193e] bg-white border-2 border-gray-300 hover:border-[#1D5EED] hover:text-[#1D5EED] transition-all duration-200 text-center"
                        >
                            Nominate Someone
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

