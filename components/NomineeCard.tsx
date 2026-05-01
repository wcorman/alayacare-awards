"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, Check, Award } from 'lucide-react';
import { Nominee } from '@/lib/airtable';
import { nomineeDetailPath } from '@/lib/nomineeLocaleLink';
import { useTranslations } from 'next-intl';

interface NomineeCardProps {
    nominee: Nominee;
    hasVoted: boolean;
    onVote: (id: string) => void;
}

// Category color mapping matching other components
const CATEGORY_COLORS: Record<string, string> = {
    "Frontline Care": '#f37021',
    "Operational Excellence": '#113cca',
    "Executive Leadership": '#ffaa05',
    "Impact and Innovation": '#08193e',
};

export default function NomineeCard({ nominee, hasVoted, onVote }: NomineeCardProps) {
    const t = useTranslations('NomineeCard');
    const THEME_COLORS = {
        deepBlue: '#08193e',
        logoOrange: '#f37021',
        gold: '#ffaa05',
    };

    // Get category color, default to blue if not found
    const categoryColor = CATEGORY_COLORS[nominee.category || ''] || '#113cca';

    const [imageUrl, setImageUrl] = useState(nominee.image || "/nominee-placeholder.webp");

    const detailHref = nomineeDetailPath(nominee);

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full group">
            <Link href={detailHref} className="flex-1 flex flex-col cursor-pointer">
                <div className="relative aspect-square overflow-hidden bg-gray-200">
                    <Image
                        src={imageUrl}
                        alt={nominee.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageUrl("/nominee-placeholder.webp")}
                    />
                    <div className="absolute top-3 left-3">
                        <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {nominee.category}
                        </span>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide text-white bg-black/40">
                            {t('viewNominee')}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex flex-col items-start mb-2">
                        <h3 className="text-lg font-bold group-hover:text-[#f37021] transition-colors" style={{ color: THEME_COLORS.deepBlue }}>{nominee.name}</h3>
                        {nominee.jobTitle && (
                            <p className="mt-1 text-xs font-medium text-gray-500 line-clamp-2">
                                {nominee.jobTitle}
                            </p>
                        )}
                    </div>

                    <p className="text-gray-600 text-xs mb-4 flex-1 line-clamp-3">
                        &ldquo;{nominee.description}&rdquo;
                    </p>
                </div>
            </Link>

            <div className="p-3 flex items-center justify-between border-t border-gray-100">
                <Link 
                    href={detailHref}
                    className="flex items-center gap-1.5 text-gray-500 font-medium hover:text-[#08193E] transition-colors"
                >
                    <Award size={16} className="text-[#08193E]" />
                    <span className="text-xs">{nominee.votes} {nominee.votes === 1 ? t('voteSingular') : t('votes')}</span>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onVote(nominee.id);
                    }}
                    disabled={hasVoted}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${hasVoted
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-gray-100 text-gray-600 hover:bg-[#1D5EED] hover:text-white cursor-pointer'
                        }`}
                >
                    {hasVoted ? (
                        <>{t('voted')} <Check size={14} /></>
                    ) : (
                        <>{t('vote')} <ThumbsUp size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
