import { NextRequest, NextResponse } from "next/server";
import {
    fetchJudgingNominations,
    findJudgeSelectionRecord,
    JUDGING_CATEGORY_SELECTION_FIELDS,
    saveJudgeSelectionRecord,
} from "@/lib/airtable";
import type { JudgingCategory, Nominee } from "@/lib/airtable";

const MAX_SELECTIONS_PER_CATEGORY = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JUDGING_CATEGORIES = Object.keys(JUDGING_CATEGORY_SELECTION_FIELDS) as JudgingCategory[];

function emptySelections(): Record<JudgingCategory, string[]> {
    return JUDGING_CATEGORIES.reduce(
        (acc, category) => {
            acc[category] = [];
            return acc;
        },
        {} as Record<JudgingCategory, string[]>
    );
}

function normalizeEmail(value: unknown): string {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value: string): boolean {
    return EMAIL_PATTERN.test(value);
}

export async function GET(request: NextRequest) {
    const email = normalizeEmail(request.nextUrl.searchParams.get("email"));

    if (!email || !isValidEmail(email)) {
        return NextResponse.json({ error: "A valid judge email is required." }, { status: 400 });
    }

    try {
        const judge = await findJudgeSelectionRecord(email);

        if (!judge) {
            return NextResponse.json(
                { error: "This email is not registered for the judging panel." },
                { status: 403 }
            );
        }

        return NextResponse.json({ judge });
    } catch (error) {
        console.error("[judging-panel] Failed to load judge selections:", error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unable to load judge selections." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const email = normalizeEmail(body?.email);

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ error: "A valid judge email is required." }, { status: 400 });
        }

        const rawSelections = body?.selections ?? {};
        const nominees = await fetchJudgingNominations();
        const nomineesById = new Map(nominees.map((nominee) => [nominee.id, nominee]));
        const normalizedSelections = emptySelections();

        for (const category of JUDGING_CATEGORIES) {
            const rawCategorySelections = rawSelections[category];
            const nomineeIds = Array.isArray(rawCategorySelections)
                ? rawCategorySelections.filter((id): id is string => typeof id === "string")
                : [];
            const uniqueNomineeIds = Array.from(new Set(nomineeIds));
            const categoryNominees = uniqueNomineeIds
                .map((id) => nomineesById.get(id))
                .filter((nominee): nominee is Nominee => nominee?.category === category)
                .sort((a, b) => {
                    return (b.votes || 0) - (a.votes || 0) || a.name.localeCompare(b.name);
                });

            normalizedSelections[category] = categoryNominees
                .slice(0, MAX_SELECTIONS_PER_CATEGORY)
                .map((nominee) => nominee.id);
        }

        const judge = await saveJudgeSelectionRecord(email, normalizedSelections);

        return NextResponse.json({ judge });
    } catch (error) {
        console.error("[judging-panel] Failed to save judge selections:", error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unable to save judge selections." },
            { status: 500 }
        );
    }
}
