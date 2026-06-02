"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Heart, Award, Briefcase, Sparkles, Vote, Calendar, Users, Tag, ChevronDown, Check, Gavel } from 'lucide-react';
import NomineeCard from './NomineeCard';
import VoteModal from './VoteModal';
import { Nominee } from '@/lib/airtable';
import { useLocale, useTranslations } from 'next-intl';

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
    const locale = useLocale();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
    const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false);
    const organizationMenuRef = useRef<HTMLDivElement>(null);
    const [votedNomineeIds, setVotedNomineeIds] = useState<string[]>([]);
    // Vote Modal State
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
    const [isCheckingVote, setIsCheckingVote] = useState(false);
    const [voteError, setVoteError] = useState<string | null>(null);
    const [voteCompleted, setVoteCompleted] = useState(false);

    useEffect(() => {
        if (!isOrganizationMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                organizationMenuRef.current &&
                !organizationMenuRef.current.contains(event.target as Node)
            ) {
                setIsOrganizationMenuOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOrganizationMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOrganizationMenuOpen]);

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

    const organizations = useMemo(() => {
        const uniqueOrganizations = Array.from(
            new Set(
                nominees
                    .map((nominee) => nominee.organization?.trim())
                    .filter((organization): organization is string => Boolean(organization))
            )
        );

        return uniqueOrganizations.sort((a, b) => a.localeCompare(b, locale));
    }, [locale, nominees]);

    const totalVoteCount = useMemo(
        () => nominees.reduce((sum, n) => sum + (n.votes ?? 0), 0),
        [nominees]
    );

    // Filter Nominees
    const filteredNominees = nominees.filter(nominee => {
        // Category filter
        if (selectedCategory && nominee.category !== selectedCategory) {
            return false;
        }

        // Organization filter
        if (selectedOrganization && nominee.organization !== selectedOrganization) {
            return false;
        }

        // Search filter
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
            (nominee.name && nominee.name.toLowerCase().includes(lowerSearch)) ||
            (nominee.description && nominee.description.toLowerCase().includes(lowerSearch)) ||
            (nominee.category && nominee.category.toLowerCase().includes(lowerSearch)) ||
            (nominee.organization && nominee.organization.toLowerCase().includes(lowerSearch))
        );
    });

    const showVotingGrid = isVotingOpen;
    const hasActiveFilters = Boolean(selectedCategory || selectedOrganization);

    if (!showVotingGrid) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-4xl px-6 py-20 lg:px-12">
                <div className="relative w-full overflow-hidden rounded-3xl bg-[#08193e] p-10 text-center text-white shadow-lg md:p-14">
                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#1D5EED]/25 blur-3xl" />
                    <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#f37021]/20 blur-3xl" />
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15">
                            <Gavel size={14} />
                            {t('prelaunch.badge')}
                        </span>
                        <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
                            {t('prelaunch.title')}
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
                            {t('prelaunch.description')}
                        </p>
                        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                            {t('prelaunch.body')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <section className="relative overflow-hidden rounded-3xl bg-[#08193e] text-white mb-10 shadow-lg">
                <div className="animate-spotlight-primary absolute -top-44 -right-36 h-[32rem] w-[32rem] rounded-full bg-[#1D5EED]/30 blur-3xl" />
                <div className="animate-spotlight-secondary absolute -bottom-48 -left-32 h-[34rem] w-[34rem] rounded-full bg-[#f37021]/22 blur-3xl" />
                <div className="animate-spotlight-center absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-[#5FEAE6]/10 blur-3xl" />
                <div className="relative z-10 grid gap-8 p-8 md:p-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15">
                            <Vote size={14} />
                            {t('hero.eyebrow')}
                        </span>
                        <h1 className="mt-5 max-w-[42rem] text-[1.75rem] font-bold leading-tight md:text-[2.5rem]">
                            {t('hero.title')}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                            {t('hero.description')}
                        </p>
                        <p className="mt-5 inline-flex rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white/90 ring-1 ring-white/15">
                            {t('hero.instruction')}
                        </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-1">
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5 text-[#08193e] shadow-sm">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('hero.deadlineLabel')}</p>
                                <p className="mt-0.5 text-base font-bold leading-tight md:text-lg">{t('hero.deadlineValue')}</p>
                            </div>
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D5EED]/10 text-[#1D5EED]">
                                <Calendar size={18} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15">
                            <div className="min-w-0">
                                <p className="text-2xl font-bold tabular-nums leading-none md:text-3xl">{nominees.length}</p>
                                <p className="mt-1 text-xs leading-snug text-white/75 md:text-sm">{t('hero.nomineeStat')}</p>
                            </div>
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15">
                            <div className="min-w-0">
                                <p className="text-2xl font-bold tabular-nums leading-none md:text-3xl">{categories.length}</p>
                                <p className="mt-1 text-xs leading-snug text-white/75 md:text-sm">{t('hero.categoryStat')}</p>
                            </div>
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                                <Tag size={18} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15">
                            <div className="min-w-0">
                                <p className="text-2xl font-bold tabular-nums leading-none md:text-3xl">
                                    {totalVoteCount.toLocaleString(locale)}
                                </p>
                                <p className="mt-1 text-xs leading-snug text-white/75 md:text-sm">{t('hero.totalVotesStat')}</p>
                            </div>
                            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                                <Vote size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search */}
            <div className="mb-8">
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#1D5EED] w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>

                    {organizations.length > 0 && (
                        <div ref={organizationMenuRef} className="relative w-full md:w-80">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between gap-3 rounded-full border border-gray-300 bg-white py-2 pl-4 pr-4 text-left text-gray-700 transition-colors hover:border-[#1D5EED]/60 focus:outline-none focus:border-[#1D5EED]"
                                onClick={() => setIsOrganizationMenuOpen((open) => !open)}
                                aria-haspopup="listbox"
                                aria-expanded={isOrganizationMenuOpen}
                                aria-label={t('filterByOrganization')}
                            >
                                <span className="truncate">
                                    {selectedOrganization ?? t('allOrganizations')}
                                </span>
                                <ChevronDown
                                    className={`shrink-0 text-gray-500 transition-transform ${isOrganizationMenuOpen ? 'rotate-180' : ''}`}
                                    size={18}
                                    aria-hidden
                                />
                            </button>

                            {isOrganizationMenuOpen && (
                                <ul
                                    role="listbox"
                                    aria-label={t('filterByOrganization')}
                                    className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
                                >
                                    <li role="presentation">
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={selectedOrganization === null}
                                            onClick={() => {
                                                setSelectedOrganization(null);
                                                setIsOrganizationMenuOpen(false);
                                            }}
                                            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                                                selectedOrganization === null
                                                    ? 'bg-[#1D5EED]/10 font-medium text-[#1D5EED]'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {selectedOrganization === null && (
                                                <Check size={16} className="shrink-0" aria-hidden />
                                            )}
                                            <span className={selectedOrganization === null ? '' : 'pl-6'}>
                                                {t('allOrganizations')}
                                            </span>
                                        </button>
                                    </li>
                                    {organizations.map((organization) => (
                                        <li key={organization} role="presentation">
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={selectedOrganization === organization}
                                                onClick={() => {
                                                    setSelectedOrganization(organization);
                                                    setIsOrganizationMenuOpen(false);
                                                }}
                                                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                                                    selectedOrganization === organization
                                                        ? 'bg-[#1D5EED]/10 font-medium text-[#1D5EED]'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {selectedOrganization === organization && (
                                                    <Check size={16} className="shrink-0" aria-hidden />
                                                )}
                                                <span
                                                    className={
                                                        selectedOrganization === organization ? 'truncate' : 'truncate pl-6'
                                                    }
                                                >
                                                    {organization}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
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
                            <Tag size={16} />
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
                </div>
            )}

            {hasActiveFilters && (
                <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span>{t('showingResults', {
                        count: filteredNominees.length,
                        nominee: filteredNominees.length === 1 ? t('nominee') : t('nominees')
                    })}</span>
                    {selectedCategory && (() => {
                        const categoryInfo = CATEGORY_CONFIG[selectedCategory] || { color: '#6b7280' };
                        // Convert hex to rgba with 15% opacity.
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
                            <span
                                className="rounded-full px-3 py-1 font-semibold"
                                style={{
                                    backgroundColor: hexToRgba(categoryInfo.color, 0.15),
                                    color: categoryInfo.color
                                }}
                            >
                                {translatedCategory}
                            </span>
                        );
                    })()}
                    {selectedOrganization && (
                        <span className="rounded-full bg-[#1D5EED]/10 px-3 py-1 font-semibold text-[#1D5EED]">
                            {selectedOrganization}
                        </span>
                    )}
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
