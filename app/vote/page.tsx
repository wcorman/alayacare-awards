import React from 'react';
import { fetchNominations } from '@/lib/airtable';
import VotePageClient from '@/components/VotePageClient';

// Force dynamic rendering so we always get the latest nominees
export const dynamic = 'force-dynamic';

export default async function VotePage() {
    const nominees = await fetchNominations();
    const isVotingOpen = true;

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
            <VotePageClient nominees={nominees} isVotingOpen={isVotingOpen} />
        </main>
    );
}
