"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, Heart, Award, Briefcase, Sparkles, Grid3x3 } from 'lucide-react';
import NomineeCard from './NomineeCard';
import VoteModal from './VoteModal';
import { Nominee } from '@/lib/airtable';

// Category definitions matching the ones used in NominationForm and Home page
const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
    "Frontline Care": { icon: Heart, color: '#f37021' },
    "Operational Excellence": { icon: Award, color: '#113cca' },
    "Executive Leadership": { icon: Briefcase, color: '#ffaa05' },
    "Impact and Innovation": { icon: Sparkles, color: '#08193e' },
};

interface VotePageClientProps {
    nominees: Nominee[];
}

export default function VotePageClient({ nominees }: VotePageClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [votedNomineeIds, setVotedNomineeIds] = useState<string[]>([]);

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

    const handleConfirmVote = async (email: string, isHomeCare?: boolean, name?: string, company?: string, jobTitle?: string) => {
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
                    company: company || '',
                    jobTitle: jobTitle || ''
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setVoteCompleted(true);
                checkStatus(email);
            } else {
                if (data.reason === 'already_voted') {
                    setVoteError("You've already voted for this nominee.");
                    checkStatus(email);
                } else {
                    setVoteError("An error occurred. Please try again.");
                }
            }
        } catch (err) {
            console.error(err);
            setVoteError("Network error. Please try again.");
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

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#08193e]">Vote for Excellence</h2>
                    <p className="text-gray-600 mt-2">Recognize outstanding individuals transforming home-based care by casting your vote.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search nominees..."
                        className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#f37021] w-full"
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
                        <span className="text-sm font-semibold text-gray-700 mr-2">Filter by Category:</span>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                selectedCategory === null
                                    ? 'bg-[#08193e] text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#f37021] hover:text-[#f37021]'
                            }`}
                        >
                            <Grid3x3 size={16} />
                            All Categories
                        </button>
                        {categories.map((category) => {
                            const categoryInfo = CATEGORY_CONFIG[category] || { icon: Award, color: '#6b7280' };
                            const IconComponent = categoryInfo.icon;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                        selectedCategory === category
                                            ? 'text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#f37021] hover:text-[#f37021]'
                                    }`}
                                    style={selectedCategory === category ? { backgroundColor: categoryInfo.color } : {}}
                                >
                                    <IconComponent size={16} />
                                    {category}
                                    {selectedCategory === category && (
                                        <X size={14} className="ml-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {selectedCategory && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                            <span>Showing {filteredNominees.length} {filteredNominees.length === 1 ? 'nominee' : 'nominees'} in</span>
                            <span className="px-3 py-1 rounded-full bg-[#f37021]/10 text-[#f37021] font-semibold">
                                {selectedCategory}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Grid */}
            {filteredNominees.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700">No matching nominees found.</h3>
                    <p className="text-gray-500 mt-2">Try a different name or search term.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
