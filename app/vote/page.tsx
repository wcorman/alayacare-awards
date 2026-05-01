import React from 'react';
import { fetchNominations } from '@/lib/airtable';
import VotePageClient from '@/components/VotePageClient';

// Keep nominee data fresh without making every page view wait on Airtable.
export const revalidate = 60;

export default async function VotePage() {
    const nominees = await fetchNominations();
    const isVotingOpen = true;

    return (
        <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
            <VotePageClient nominees={nominees} isVotingOpen={isVotingOpen} />
        </main>
    );
}
