"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ClipboardList, Loader2, RotateCcw, Save, Search, Users } from "lucide-react";
import type { Nominee } from "@/lib/airtable";
import NomineeImage from "@/components/NomineeImage";

type JudgingCategory =
    | "Executive Leadership"
    | "Frontline Care"
    | "Impact and Innovation"
    | "Operational Excellence";

type SelectionsByCategory = Record<JudgingCategory, string[]>;
type SortMode = "votes" | "alpha";
type SaveState = "idle" | "saving" | "saved" | "error";

const MAX_SELECTIONS_PER_CATEGORY = 10;

const CATEGORIES: JudgingCategory[] = [
    "Executive Leadership",
    "Frontline Care",
    "Impact and Innovation",
    "Operational Excellence",
];

const CATEGORY_META: Record<JudgingCategory, { shortLabel: string; accent: string; soft: string; dot: string }> = {
    "Executive Leadership": {
        shortLabel: "Executive",
        accent: "#ffaa05",
        soft: "rgba(255,170,5,.13)",
        dot: "bg-[#ffaa05]",
    },
    "Frontline Care": {
        shortLabel: "Frontline",
        accent: "#f37021",
        soft: "rgba(243,112,33,.13)",
        dot: "bg-[#f37021]",
    },
    "Impact and Innovation": {
        shortLabel: "Innovation",
        accent: "#5FEAE6",
        soft: "rgba(95,234,230,.12)",
        dot: "bg-[#5FEAE6]",
    },
    "Operational Excellence": {
        shortLabel: "Ops Excellence",
        accent: "#1D5EED",
        soft: "rgba(29,94,237,.14)",
        dot: "bg-[#1D5EED]",
    },
};

function createEmptySelections(): SelectionsByCategory {
    return CATEGORIES.reduce((acc, category) => {
        acc[category] = [];
        return acc;
    }, {} as SelectionsByCategory);
}

function normalizeSelections(rawSelections: unknown): SelectionsByCategory {
    const selections = createEmptySelections();

    if (!rawSelections || typeof rawSelections !== "object") {
        return selections;
    }

    CATEGORIES.forEach((category) => {
        const rawCategorySelections = (rawSelections as Record<string, unknown>)[category];
        selections[category] = Array.isArray(rawCategorySelections)
            ? rawCategorySelections.filter((id): id is string => typeof id === "string")
            : [];
    });

    return selections;
}

function selectionSignature(selections: SelectionsByCategory): string {
    return CATEGORIES.map((category) => `${category}:${selections[category].join(",")}`).join("|");
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface JudgingPanelClientProps {
    nominees: Nominee[];
}

export default function JudgingPanelClient({ nominees }: JudgingPanelClientProps) {
    const [emailInput, setEmailInput] = useState("");
    const [judgeEmail, setJudgeEmail] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [signInError, setSignInError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<JudgingCategory>("Executive Leadership");
    const [activeNomineeId, setActiveNomineeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortMode, setSortMode] = useState<SortMode>("votes");
    const [selections, setSelections] = useState<SelectionsByCategory>(() => createEmptySelections());
    const [savedSelections, setSavedSelections] = useState<SelectionsByCategory>(() => createEmptySelections());
    const [saveState, setSaveState] = useState<SaveState>("idle");
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);

    const nomineesById = useMemo(() => new Map(nominees.map((nominee) => [nominee.id, nominee])), [nominees]);

    const categoryNominees = useMemo(
        () => nominees.filter((nominee) => nominee.category === activeCategory),
        [activeCategory, nominees]
    );

    const filteredNominees = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        const list = categoryNominees.filter((nominee) => {
            if (!normalizedSearchTerm) return true;

            return [nominee.name, nominee.jobTitle, nominee.organization, nominee.description]
                .filter(Boolean)
                .some((value) => value?.toLowerCase().includes(normalizedSearchTerm));
        });

        return [...list].sort((a, b) => {
            if (sortMode === "alpha") {
                return a.name.localeCompare(b.name);
            }

            return (b.votes || 0) - (a.votes || 0) || a.name.localeCompare(b.name);
        });
    }, [categoryNominees, searchTerm, sortMode]);

    const activeNominee = activeNomineeId ? nomineesById.get(activeNomineeId) ?? null : null;
    const selectedIds = new Set(CATEGORIES.flatMap((category) => selections[category]));
    const selectedCount = selectedIds.size;
    const totalSelectionSlots = CATEGORIES.length * MAX_SELECTIONS_PER_CATEGORY;
    const progressPercent = Math.round((selectedCount / totalSelectionSlots) * 1000) / 10;
    const isDirty = selectionSignature(selections) !== selectionSignature(savedSelections);
    const selectedInActiveCategory = selections[activeCategory].length;

    useEffect(() => {
        const signedInClassName = "judging-panel-signed-in";

        if (judgeEmail) {
            document.body.classList.add(signedInClassName);
        } else {
            document.body.classList.remove(signedInClassName);
        }

        return () => {
            document.body.classList.remove(signedInClassName);
        };
    }, [judgeEmail]);

    const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const email = emailInput.trim().toLowerCase();
        setSignInError(null);

        if (!isValidEmail(email)) {
            setSignInError("Enter a valid email address to continue.");
            return;
        }

        setIsSigningIn(true);

        try {
            const response = await fetch(`/api/judging-panel?email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Unable to sign in.");
            }

            const loadedSelections = normalizeSelections(data?.judge?.selections);
            setJudgeEmail(email);
            setSelections(loadedSelections);
            setSavedSelections(loadedSelections);
            setActiveCategory("Executive Leadership");
            setActiveNomineeId(null);
            setShowSummary(false);
            setSaveState("idle");
            setSaveError(null);
        } catch (error) {
            setSignInError(error instanceof Error ? error.message : "Unable to sign in.");
        } finally {
            setIsSigningIn(false);
        }
    };

    const handleSave = async () => {
        setSaveState("saving");
        setSaveError(null);

        try {
            const response = await fetch("/api/judging-panel", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: judgeEmail, selections }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || "Unable to save selections.");
            }

            const persistedSelections = normalizeSelections(data?.judge?.selections);
            setSelections(persistedSelections);
            setSavedSelections(persistedSelections);
            setSaveState("saved");
        } catch (error) {
            setSaveState("error");
            setSaveError(error instanceof Error ? error.message : "Unable to save selections.");
        }
    };

    const handleCategoryChange = (category: JudgingCategory) => {
        setActiveCategory(category);
        setActiveNomineeId(null);
        setSearchTerm("");
        setShowSummary(false);
    };

    const toggleSelection = (nominee: Nominee) => {
        if (!CATEGORIES.includes(nominee.category as JudgingCategory)) return;

        const category = nominee.category as JudgingCategory;
        const isSelected = selections[category].includes(nominee.id);

        if (!isSelected && selections[category].length >= MAX_SELECTIONS_PER_CATEGORY) {
            return;
        }

        setSelections((current) => ({
            ...current,
            [category]: isSelected
                ? current[category].filter((id) => id !== nominee.id)
                : [...current[category], nominee.id],
        }));
        setSaveState("idle");
    };

    const handleReset = () => {
        setSelections(createEmptySelections());
        setSaveState("idle");
        setSaveError(null);
    };

    const moveActiveNominee = useCallback((direction: "previous" | "next") => {
        if (!filteredNominees.length) return;

        if (!activeNomineeId) {
            const fallbackNominee = direction === "previous"
                ? filteredNominees[filteredNominees.length - 1]
                : filteredNominees[0];

            if (fallbackNominee) {
                setActiveNomineeId(fallbackNominee.id);
            }
            return;
        }

        const currentIndex = filteredNominees.findIndex((nominee) => nominee.id === activeNomineeId);
        const nextIndex = direction === "previous" ? currentIndex - 1 : currentIndex + 1;
        const nextNominee = filteredNominees[nextIndex];

        if (nextNominee) {
            setActiveNomineeId(nextNominee.id);
        }
    }, [activeNomineeId, filteredNominees]);

    useEffect(() => {
        if (!judgeEmail || showSummary) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const tagName = target?.tagName?.toLowerCase();
            const isTypingTarget =
                tagName === "input" ||
                tagName === "textarea" ||
                tagName === "select" ||
                Boolean(target?.isContentEditable);

            if (isTypingTarget) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveActiveNominee("previous");
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                moveActiveNominee("next");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [judgeEmail, moveActiveNominee, showSummary]);

    if (!judgeEmail) {
        return (
            <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-6 py-8">
                <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-[#1D5EED]/30 blur-3xl" />
                <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[#f37021]/25 blur-3xl" />
                <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center">
                    <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[.06] p-8 shadow-2xl backdrop-blur">
                        <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f37021] text-white shadow-lg">
                            <ClipboardList size={26} />
                        </div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#5FEAE6]">
                            Home-Based Care Momentum Awards
                        </p>
                        <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                            Judging Panel
                        </h1>
                        <p className="mt-4 text-sm leading-6 text-white/70 md:text-base">
                            Sign in with your judge email to load your current nominee selections and continue reviewing nominations.
                        </p>

                        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
                            <label htmlFor="judge-email" className="block text-sm font-semibold text-white">
                                Judge email
                            </label>
                            <input
                                id="judge-email"
                                type="email"
                                value={emailInput}
                                onChange={(event) => setEmailInput(event.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-white/15 bg-white px-4 py-3 text-[#08193e] outline-none transition focus:border-[#f37021] focus:ring-4 focus:ring-[#f37021]/20"
                                autoComplete="email"
                            />
                            {signInError && (
                                <p className="rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                    {signInError}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={isSigningIn}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f37021] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ff8a3d] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSigningIn ? <Loader2 className="animate-spin" size={18} /> : null}
                                Sign in
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col bg-[#08193e]">
            <header className="border-b border-white/10 bg-[#0b1f4a] px-4 py-4 md:px-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                        <Image
                            src="/AlayaCare-logo.svg"
                            alt="AlayaCare"
                            width={132}
                            height={32}
                            className="h-8 w-auto brightness-0 invert"
                        />
                        <div className="h-8 w-px bg-white/15" />
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                                Home-Based Care Momentum Awards
                            </h1>
                            <p className="mt-1 text-xs text-white/55">Judging Panel · 2026 · {judgeEmail}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {CATEGORIES.map((category) => {
                            const selectedCategoryCount = selections[category].length;
                            const isComplete = selectedCategoryCount >= MAX_SELECTIONS_PER_CATEGORY;
                            const isActive = category === activeCategory && !showSummary;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleCategoryChange(category)}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                        isActive
                                            ? "border-[#f37021] bg-white text-[#08193e]"
                                            : "border-white/10 bg-white/[.06] text-white/75 hover:bg-white/[.1]"
                                    }`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${CATEGORY_META[category].dot}`} />
                                    {CATEGORY_META[category].shortLabel}
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                                            isComplete ? "bg-green-500 text-white" : "bg-white/10 text-current"
                                        }`}
                                    >
                                        {selectedCategoryCount}/{MAX_SELECTIONS_PER_CATEGORY}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowSummary(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.06] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[.1]"
                        >
                            <ClipboardList size={15} />
                            Summary
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.06] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[.1]"
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saveState === "saving" || !isDirty}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#f37021] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#ff8a3d] disabled:cursor-not-allowed disabled:opacity-55"
                        >
                            {saveState === "saving" ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                            {saveState === "saved" && !isDirty ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex items-center gap-4 border-b border-white/10 bg-[#0e2350] px-4 py-2 md:px-7">
                <span className="text-xs text-white/55">
                    {progressPercent}% complete
                </span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1D5EED] to-[#f37021] transition-all"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-[#f37021]">
                    {selectedCount} / {totalSelectionSlots} selected
                </span>
            </div>

            {saveError && (
                <div className="border-b border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 md:px-7">
                    {saveError}
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden">
                {showSummary ? (
                    <div className="h-full overflow-y-auto">
                        <SummaryPanel
                            nomineesById={nomineesById}
                            selections={selections}
                            onBack={() => setShowSummary(false)}
                            onRemove={(nominee) => toggleSelection(nominee)}
                        />
                    </div>
                ) : (
                    <div className="grid h-full min-h-0 lg:grid-cols-[22rem_minmax(0,1fr)]">
                        <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#0e2350]">
                            <div className="border-b border-white/10 bg-[#0e2350] p-4">
                                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                                    {activeCategory}
                                </h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={16} />
                                    <input
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search by name, company..."
                                        className="w-full rounded-lg border border-white/10 bg-[#08193e] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f37021]"
                                    />
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSortMode("votes")}
                                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                                            sortMode === "votes"
                                                ? "border-[#f37021] bg-[#f37021]/15 text-white"
                                                : "border-white/10 bg-white/[.04] text-white/55 hover:bg-white/[.08]"
                                        }`}
                                    >
                                        Most Votes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSortMode("alpha")}
                                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                                            sortMode === "alpha"
                                                ? "border-[#f37021] bg-[#f37021]/15 text-white"
                                                : "border-white/10 bg-white/[.04] text-white/55 hover:bg-white/[.08]"
                                        }`}
                                    >
                                        A-Z
                                    </button>
                                </div>

                                {selectedInActiveCategory > 0 && (
                                    <div className="mt-4 flex items-center justify-between border-t border-[#f37021]/20 bg-[#f37021]/10 px-4 py-2 text-xs font-semibold text-[#f37021]">
                                        <span>{selectedInActiveCategory} of {MAX_SELECTIONS_PER_CATEGORY} selected</span>
                                        <span className="text-white/40">
                                            {MAX_SELECTIONS_PER_CATEGORY - selectedInActiveCategory} spots left
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto">
                                {filteredNominees.map((nominee) => {
                                    const isSelected = selections[activeCategory].includes(nominee.id);
                                    const isActive = nominee.id === activeNomineeId;

                                    return (
                                        <button
                                            key={nominee.id}
                                            type="button"
                                            onClick={() => setActiveNomineeId(nominee.id)}
                                            className={`w-full border-b px-4 py-3 text-left transition ${
                                                isActive
                                                    ? "border-l-4 border-l-[#f37021] border-b-white/10 bg-white/[.08]"
                                                    : isSelected
                                                        ? "border-l-4 border-l-[#f37021] border-b-white/10 bg-[#f37021]/10"
                                                        : "border-l-4 border-l-transparent border-b-white/10 hover:bg-white/[.05]"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-white">{nominee.name}</p>
                                                    <p className="mt-1 truncate text-xs text-white/45">
                                                        {nominee.jobTitle || "Nominee"} · {nominee.organization || "Organization not listed"}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                                                        isSelected
                                                            ? "border-[#f37021] bg-[#f37021] text-white"
                                                            : "border-white/15 text-transparent"
                                                    }`}
                                                >
                                                    <Check size={12} />
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs font-semibold text-white/45">
                                                {nominee.votes ? `${nominee.votes} public votes` : "No public votes"}
                                            </p>
                                        </button>
                                    );
                                })}

                                {filteredNominees.length === 0 && (
                                    <div className="px-4 py-10 text-center text-sm text-white/45">
                                        No nominees found in this category.
                                    </div>
                                )}
                            </div>
                        </aside>

                        <NomineeDetailPanel
                            activeNominee={activeNominee}
                            filteredNominees={filteredNominees}
                            selections={selections}
                            onToggleSelection={toggleSelection}
                            onMove={moveActiveNominee}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function NomineeDetailPanel({
    activeNominee,
    filteredNominees,
    selections,
    onToggleSelection,
    onMove,
}: {
    activeNominee: Nominee | null;
    filteredNominees: Nominee[];
    selections: SelectionsByCategory;
    onToggleSelection: (nominee: Nominee) => void;
    onMove: (direction: "previous" | "next") => void;
}) {
    if (!activeNominee || !CATEGORIES.includes(activeNominee.category as JudgingCategory)) {
        return (
            <section className="flex h-full min-h-0 items-center justify-center bg-[#08193e] p-6 md:p-9">
                <div className="text-center text-white/45">
                    <Users size={54} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm text-white/70">Select a nominee to review their details</p>
                    <p className="mt-2 text-xs">Select up to {MAX_SELECTIONS_PER_CATEGORY} per category</p>
                </div>
            </section>
        );
    }

    const category = activeNominee.category as JudgingCategory;
    const isSelected = selections[category].includes(activeNominee.id);
    const isAtLimit = selections[category].length >= MAX_SELECTIONS_PER_CATEGORY && !isSelected;
    const activeIndex = filteredNominees.findIndex((nominee) => nominee.id === activeNominee.id);
    const meta = CATEGORY_META[category];

    return (
        <section className="h-full min-h-0 overflow-y-auto bg-[#08193e] p-6 md:p-9">
            <div className="mx-auto max-w-5xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => onMove("previous")}
                            disabled={activeIndex <= 0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[.04] text-white/70 transition hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onMove("next")}
                            disabled={activeIndex < 0 || activeIndex >= filteredNominees.length - 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[.04] text-white/70 transition hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-35"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                    <span className="text-xs text-white/40">
                        {activeIndex + 1} of {filteredNominees.length}
                    </span>
                </div>

                {isAtLimit && (
                    <div className="mb-5 rounded-xl border border-[#f37021]/35 bg-[#f37021]/10 px-4 py-3 text-sm text-[#ffb287]">
                        Category full ({MAX_SELECTIONS_PER_CATEGORY}/{MAX_SELECTIONS_PER_CATEGORY}). Deselect a nominee first.
                    </div>
                )}

                <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[.04] p-6 shadow-2xl md:flex-row md:items-start">
                    <div
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[.06]"
                        style={{ boxShadow: `0 0 0 2px ${meta.soft}` }}
                    >
                        <NomineeImage
                            src={activeNominee.image}
                            alt={activeNominee.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-3xl font-bold leading-tight text-white">{activeNominee.name}</h2>
                        <p className="mt-2 text-sm text-white/60">
                            <strong className="font-semibold text-white/90">{activeNominee.jobTitle || "Nominee"}</strong>
                            {" · "}
                            {activeNominee.organization || "Organization not listed"}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span
                                className="rounded-full px-3 py-1 text-xs font-semibold"
                                style={{ background: meta.soft, color: meta.accent }}
                            >
                                {category}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-1 text-xs font-semibold text-white/55">
                                {activeNominee.votes ? `${activeNominee.votes} public votes` : "No public votes"}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onToggleSelection(activeNominee)}
                        disabled={isAtLimit}
                        className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            isSelected
                                ? "border-[#f37021] bg-[#f37021] text-white hover:bg-[#ff8a3d]"
                                : "border-[#f37021] text-[#f37021] hover:bg-[#f37021]/10"
                        }`}
                    >
                        {isSelected ? "Selected" : "+ Select"}
                    </button>
                </div>

                <div className="mt-7 pb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                        Nomination Statement
                    </p>
                    <div className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#0e2350] p-6 text-sm leading-7 text-white/68">
                        {activeNominee.description}
                    </div>
                </div>
            </div>
        </section>
    );
}

function SummaryPanel({
    nomineesById,
    selections,
    onBack,
    onRemove,
}: {
    nomineesById: Map<string, Nominee>;
    selections: SelectionsByCategory;
    onBack: () => void;
    onRemove: (nominee: Nominee) => void;
}) {
    const totalSelected = CATEGORIES.reduce((total, category) => total + selections[category].length, 0);

    return (
        <section className="mx-auto max-w-5xl px-4 py-8 md:px-7">
            <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[.05] p-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5FEAE6]">Selection Summary</p>
                    <h2 className="mt-2 text-3xl font-bold text-white">{totalSelected} nominees selected</h2>
                    <p className="mt-2 text-sm text-white/55">Home-Based Care Momentum Awards 2026</p>
                </div>
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[.06] px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[.1]"
                >
                    Back to Nominees
                </button>
            </div>

            <div className="space-y-4">
                {CATEGORIES.map((category) => {
                    const picks = selections[category]
                        .map((id) => nomineesById.get(id))
                        .filter((nominee): nominee is Nominee => Boolean(nominee));
                    const meta = CATEGORY_META[category];

                    return (
                        <div key={category} className="rounded-2xl border border-white/10 bg-[#0e2350] p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                                <h3 className="text-lg font-bold text-white">{category}</h3>
                                <span className="ml-auto text-sm text-white/45">
                                    {picks.length}/{MAX_SELECTIONS_PER_CATEGORY}
                                </span>
                            </div>

                            {picks.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/40">
                                    No nominees selected in this category yet.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {picks.map((nominee, index) => (
                                        <div
                                            key={nominee.id}
                                            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 md:flex-row md:items-center"
                                        >
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/70">
                                                {index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-white">{nominee.name}</p>
                                                <p className="mt-1 truncate text-xs text-white/45">
                                                    {nominee.jobTitle || "Nominee"} · {nominee.organization || "Organization not listed"}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold text-white/45">
                                                {nominee.votes ? `${nominee.votes} votes` : "No votes"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onRemove(nominee)}
                                                className="rounded-lg border border-[#f37021]/30 bg-[#f37021]/10 px-3 py-1.5 text-xs font-semibold text-[#f37021] transition hover:bg-[#f37021]/15"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
