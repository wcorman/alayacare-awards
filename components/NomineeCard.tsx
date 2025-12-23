"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ThumbsUp, Check, Award } from 'lucide-react';
import { Nominee } from '@/lib/airtable';

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
    const THEME_COLORS = {
        deepBlue: '#08193e',
        logoOrange: '#f37021',
        gold: '#ffaa05',
    };

    // Get category color, default to blue if not found
    const categoryColor = CATEGORY_COLORS[nominee.category || ''] || '#113cca';

    const [imageUrl, setImageUrl] = useState(nominee.image);
    const retryAttempted = useRef(false);

    const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        
        // If it's an Airtable URL that failed, try to fetch fresh URL
        if (imageUrl && imageUrl.includes('airtableusercontent') && !retryAttempted.current) {
            retryAttempted.current = true;
            
            try {
                // Fetch fresh nominee data from API
                const res = await fetch('/api/nominees');
                if (res.ok) {
                    const nominees = await res.json();
                    const freshNominee = nominees.find((n: Nominee) => n.id === nominee.id);
                    
                    if (freshNominee?.image && freshNominee.image !== imageUrl) {
                        // Use fresh URL
                        setImageUrl(freshNominee.image);
                        target.src = freshNominee.image;
                        return;
                    }
                }
            } catch (err) {
                console.error('Failed to fetch fresh image URL:', err);
            }
        }
        
        // Fallback to placeholder
        target.onerror = null;
        target.src = "https://placehold.co/400x400/dadadf/08193e?text=Photo+Missing";
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full group">
            <Link href={`/nominees/${nominee.id}`} className="flex-1 flex flex-col cursor-pointer">
                <div className="relative aspect-square overflow-hidden bg-gray-200">
                    <img
                        src={imageUrl || "https://placehold.co/400x400/dadadf/08193e?text=No+Photo"}
                        alt={nominee.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError}
                    />
                    <div className="absolute top-3 left-3">
                        <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {nominee.category}
                        </span>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold group-hover:text-[#f37021] transition-colors" style={{ color: THEME_COLORS.deepBlue }}>{nominee.name}</h3>
                    </div>

                    <p className="text-gray-600 text-xs mb-4 flex-1 line-clamp-3">
                        "{nominee.description}"
                    </p>
                </div>
            </Link>

            <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100">
                <Link 
                    href={`/nominees/${nominee.id}`}
                    className="flex items-center gap-1.5 text-gray-500 font-medium hover:text-[#08193e] transition-colors"
                >
                    <Award size={16} className="text-[#ffaa05]" />
                    <span className="text-xs">{nominee.votes} Votes</span>
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
                            : 'bg-gray-100 text-gray-600 hover:bg-[#f37021] hover:text-white'
                        }`}
                >
                    {hasVoted ? (
                        <>Voted <Check size={14} /></>
                    ) : (
                        <>Vote <ThumbsUp size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
