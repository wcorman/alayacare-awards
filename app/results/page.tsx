import React from "react";
import { fetchNominations } from "@/lib/airtable";
import ResultsPodiumClient from "@/components/ResultsPodiumClient";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const nominees = await fetchNominations();

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      <ResultsPodiumClient nominees={nominees} />
    </main>
  );
}
