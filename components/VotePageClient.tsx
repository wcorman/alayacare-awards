"use client";

import React, { useState } from 'react';
import { Search, Loader2, UserPlus } from 'lucide-react';
import NomineeCard from './NomineeCard';
import VoteModal from './VoteModal';
import { Nominee } from '@/lib/airtable';

interface VotePageClientProps {
    nominees: Nominee[];
}

export default function VotePageClient({ nominees }: VotePageClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleConfirmVote = async (email: string) => {
        setIsCheckingVote(true);
        setVoteError(null);

        if (!selectedNomineeId) return;

        try {
            const res = await fetch('/api/vote/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voterEmail: email, nomineeId: selectedNomineeId }),
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

    // Filter Nominees
    const filteredNominees = nominees.filter(nominee => {
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
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-[#08193e]">Vote for Excellence</h2>
                    <p className="text-gray-600 mt-2">Support your colleagues by voting for their outstanding contributions.</p>
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
