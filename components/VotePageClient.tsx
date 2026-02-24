"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, Heart, Award, Briefcase, Sparkles, Grid3x3, Vote, UserPlus } from 'lucide-react';
import Link from 'next/link';
import NomineeCard from './NomineeCard';
import VoteModal from './VoteModal';
import { Nominee } from '@/lib/airtable';
import { useTranslations } from 'next-intl';

// Category definitions matching the ones used in NominationForm and Home page
const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
    "Frontline Care": { icon: Heart, color: '#f37021' },
    "Operational Excellence": { icon: Award, color: '#113cca' },
    "Executive Leadership": { icon: Briefcase, color: '#ffaa05' },
    "Impact and Innovation": { icon: Sparkles, color: '#08193e' },
};

interface VotePageClientProps {
    nominees: Nominee[];
    isVotingOpen: boolean;
}

export default function VotePageClient({ nominees, isVotingOpen }: VotePageClientProps) {
    const t = useTranslations('VotePage');
    const tHome = useTranslations('Home');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [votedNomineeIds, setVotedNomineeIds] = useState<string[]>([]);
    const [adminAccessInput, setAdminAccessInput] = useState('');

    // Vote Modal State
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
    const [isCheckingVote, setIsCheckingVote] = useState(false);
    const [voteError, setVoteError] = useState<string | null>(null);
    const [voteCompleted, setVoteCompleted] = useState(false);

    const checkStatus = async (email: string) => {
        try {
            const res = await fetch(`/api/vote/status?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setVotedNomineeIds(data.votedNomineeIds || []);
            }
        } catch (err) {
            console.error("Failed to check status", err);
        }
    };

    const handleInitiateVote = (id: string) => {
        setSelectedNomineeId(id);
        setVoteError(null);
        setVoteCompleted(false);
        setIsVoteModalOpen(true);
    };

    const handleCloseVoteModal = () => {
        setIsVoteModalOpen(false);
        setSelectedNomineeId(null);
        setVoteError(null);
        setVoteCompleted(false);
    };

    const handleConfirmVote = async (email: string, isHomeCare?: boolean, name?: string, organization?: string, jobTitle?: string) => {
        setIsCheckingVote(true);
        setVoteError(null);

        if (!selectedNomineeId) return;

        try {
            const res = await fetch('/api/vote/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    voterEmail: email, 
                    nomineeId: selectedNomineeId,
                    isHomeCare: isHomeCare || false,
                    name: name || '',
                    organization: organization || '',
                    jobTitle: jobTitle || ''
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setVoteCompleted(true);
                checkStatus(email);
            } else {
                if (data.reason === 'already_voted') {
                    setVoteError(t('errors.alreadyVoted'));
                    checkStatus(email);
                } else {
                    setVoteError(t('errors.generic'));
                }
            }
        } catch (err) {
            console.error(err);
            setVoteError(t('errors.network'));
        } finally {
            setIsCheckingVote(false);
        }
    };

    const selectedNominee = nominees.find(n => n.id === selectedNomineeId);

    // Extract unique categories
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(nominees.map(n => n.category).filter(Boolean)));
        return uniqueCategories.sort();
    }, [nominees]);

    // Filter Nominees
    const filteredNominees = nominees.filter(nominee => {
        // Category filter
        if (selectedCategory && nominee.category !== selectedCategory) {
            return false;
        }

        // Search filter
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
            (nominee.name && nominee.name.toLowerCase().includes(lowerSearch)) ||
            (nominee.description && nominee.description.toLowerCase().includes(lowerSearch)) ||
            (nominee.category && nominee.category.toLowerCase().includes(lowerSearch))
        );
    });

    const hasAdminAccess = adminAccessInput.trim().toLowerCase() === 'marketingsquad';
    const showVotingGrid = isVotingOpen || hasAdminAccess;

    if (!showVotingGrid) {
        return (
            <div className="max-w-3xl mx-auto px-6 lg:px-12 py-20 min-h-[60vh] flex flex-col">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1D5EED]/10 text-[#1D5EED]">
                        <Vote size={22} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#08193e]">Voting opens May 1st</h2>
                    <p className="text-gray-600 mt-3">
                        Nominate someone in the meantime and come back once voting is live.
                    </p>
                    <Link
                        href="/nominate"
                        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1D5EED] text-white font-semibold hover:bg-[#113cca] transition-colors"
                    >
                        <UserPlus size={18} />
                        Nominate a Changemaker
                    </Link>
                </div>

                <div className="mt-auto pt-8">
                    <div className="max-w-xs mx-auto">
                        <input
                            type="text"
                            value={adminAccessInput}
                            onChange={(e) => setAdminAccessInput(e.target.value)}
                            placeholder="admin access"
                            className="w-full text-xs px-3 py-2 rounded-md border border-gray-200 text-gray-500 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                            aria-label="Admin access"
                            autoComplete="off"
                            spellCheck={false}
                            data-lpignore="true"
                            data-1p-ignore="true"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#08193e]">{t('title')}</h2>
                    <p className="text-gray-600 mt-2">{t('subtitle')}</p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#1D5EED] w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700 mr-2">{t('filterByCategory')}</span>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                selectedCategory === null
                                    ? 'bg-[#08193e] text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#1D5EED] hover:text-[#1D5EED]'
                            }`}
                        >
                            <Grid3x3 size={16} />
                            {t('allCategories')}
                        </button>
                        {categories.map((category) => {
                            const categoryInfo = CATEGORY_CONFIG[category] || { icon: Award, color: '#6b7280' };
                            const IconComponent = categoryInfo.icon;
                            // Try to get translated category name, fallback to original
                            const translatedCategory = category === "Frontline Care" ? tHome('categories.frontline.name') :
                                                      category === "Operational Excellence" ? tHome('categories.operational.name') :
                                                      category === "Executive Leadership" ? tHome('categories.executive.name') :
                                                      category === "Impact and Innovation" ? tHome('categories.impact.name') :
                                                      category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                        selectedCategory === category
                                            ? 'text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#1D5EED] hover:text-[#1D5EED]'
                                    }`}
                                    style={selectedCategory === category ? { backgroundColor: categoryInfo.color } : {}}
                                >
                                    <IconComponent size={16} />
                                    {translatedCategory}
                                    {selectedCategory === category && (
                                        <X size={14} className="ml-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {selectedCategory && (() => {
                        const categoryInfo = CATEGORY_CONFIG[selectedCategory] || { color: '#6b7280' };
                        // Convert hex to rgba with 15% opacity
                        const hexToRgba = (hex: string, alpha: number) => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        };
                        const translatedCategory = selectedCategory === "Frontline Care" ? tHome('categories.frontline.name') :
                                                   selectedCategory === "Operational Excellence" ? tHome('categories.operational.name') :
                                                   selectedCategory === "Executive Leadership" ? tHome('categories.executive.name') :
                                                   selectedCategory === "Impact and Innovation" ? tHome('categories.impact.name') :
                                                   selectedCategory;
                        return (
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                                <span>{t('showingResults', { 
                                    count: filteredNominees.length, 
                                    nominee: filteredNominees.length === 1 ? t('nominee') : t('nominees')
                                })}</span>
                                <span 
                                    className="px-3 py-1 rounded-full font-semibold"
                                    style={{ 
                                        backgroundColor: hexToRgba(categoryInfo.color, 0.15),
                                        color: categoryInfo.color
                                    }}
                                >
                                    {translatedCategory}
                                </span>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Grid */}
            {filteredNominees.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700">{t('noResults.title')}</h3>
                    <p className="text-gray-500 mt-2">{t('noResults.subtitle')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredNominees.map((nominee) => (
                        <NomineeCard
                            key={nominee.id}
                            nominee={nominee}
                            hasVoted={votedNomineeIds.includes(nominee.id)}
                            onVote={handleInitiateVote}
                        />
                    ))}
                </div>
            )}

            {selectedNominee && (
                <VoteModal
                    isOpen={isVoteModalOpen}
                    onClose={handleCloseVoteModal}
                    nomineeName={selectedNominee.name}
                    onSubmit={handleConfirmVote}
                    isChecking={isCheckingVote}
                    errorMsg={voteError}
                    voteCompleted={voteCompleted}
                />
            )}
        </div>
    );
}
