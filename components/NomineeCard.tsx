"use client";

import React from 'react';
import { ThumbsUp, Check, Award } from 'lucide-react';
import { Nominee } from '@/lib/airtable';

interface NomineeCardProps {
    nominee: Nominee;
    hasVoted: boolean;
    onVote: (id: string) => void;
}

export default function NomineeCard({ nominee, hasVoted, onVote }: NomineeCardProps) {
    const THEME_COLORS = {
        deepBlue: '#08193e',
        logoOrange: '#f37021',
        gold: '#ffaa05',
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
            <div className="relative aspect-square overflow-hidden bg-gray-200">
                <img
                    src={nominee.image || "https://placehold.co/400x400/dadadf/08193e?text=No+Photo"}
                    alt={nominee.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "https://placehold.co/400x400/dadadf/08193e?text=Photo+Missing";
                    }}
                />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-blue-600">
                        {nominee.category}
                    </span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold" style={{ color: THEME_COLORS.deepBlue }}>{nominee.name}</h3>
                </div>

                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                    "{nominee.description}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Award size={18} className="text-[#ffaa05]" />
                        <span>{nominee.votes} Votes</span>
                    </div>

                    <button
                        onClick={() => onVote(nominee.id)}
                        disabled={hasVoted}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${hasVoted
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-gray-100 text-gray-600 hover:bg-[#f37021] hover:text-white'
                            }`}
                    >
                        {hasVoted ? (
                            <>Voted <Check size={16} /></>
                        ) : (
                            <>Vote <ThumbsUp size={16} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
