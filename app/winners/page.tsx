import React from "react";
import { fetchWinners } from "@/lib/airtable";
import ResultsPodiumClient from "@/components/ResultsPodiumClient";

export const dynamic = "force-dynamic";

export default async function WinnersPage() {
  const winners = await fetchWinners();

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      <ResultsPodiumClient nominees={winners} />
    </main>
  );
}
