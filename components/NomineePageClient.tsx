"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';
import VoteModal from './VoteModal';
import { Nominee } from '@/lib/airtable';
import { useTranslations } from 'next-intl';

interface NomineePageClientProps {
    nominee: Nominee;
}

export default function NomineePageClient({ nominee }: NomineePageClientProps) {
    const t = useTranslations('NomineePage');
    const tVotePage = useTranslations('VotePage');
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [isCheckingVote, setIsCheckingVote] = useState(false);
    const [voteError, setVoteError] = useState<string | null>(null);
    const [voteCompleted, setVoteCompleted] = useState(false);

    const handleInitiateVote = () => {
        setVoteError(null);
        setVoteCompleted(false);
        setIsVoteModalOpen(true);
    };

    const handleCloseVoteModal = () => {
        setIsVoteModalOpen(false);
        setVoteError(null);
        setVoteCompleted(false);
    };

    const handleConfirmVote = async (email: string, isHomeCare?: boolean, name?: string, organization?: string, jobTitle?: string) => {
        setIsCheckingVote(true);
        setVoteError(null);

        try {
            const res = await fetch('/api/vote/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    voterEmail: email, 
                    nomineeId: nominee.id,
                    isHomeCare: isHomeCare || false,
                    name: name || '',
                    organization: organization || '',
                    jobTitle: jobTitle || ''
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setVoteCompleted(true);
            } else {
                if (data.reason === 'already_voted') {
                    setVoteError(tVotePage('errors.alreadyVoted'));
                } else {
                    setVoteError(tVotePage('errors.generic'));
                }
            }
        } catch (err) {
            console.error(err);
            setVoteError(tVotePage('errors.network'));
        } finally {
            setIsCheckingVote(false);
        }
    };

    return (
        <>
            {/* Call to Action */}
            <div className="pt-8 border-t border-gray-200">
                <button
                    onClick={handleInitiateVote}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <ThumbsUp size={20} />
                    {t('voteFor', { name: nominee.name.split(' ')[0] })}
                </button>
            </div>

            <VoteModal
                isOpen={isVoteModalOpen}
                onClose={handleCloseVoteModal}
                nomineeName={nominee.name}
                onSubmit={handleConfirmVote}
                isChecking={isCheckingVote}
                errorMsg={voteError}
                voteCompleted={voteCompleted}
            />
        </>
    );
}

