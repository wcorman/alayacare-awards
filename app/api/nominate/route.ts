import { NextRequest, NextResponse } from 'next/server';
import { checkIfNomineeExists, submitNomination } from '@/lib/airtable';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            nominatorEmail,
            nomineeName,
            nomineeEmail,
            description,
            category,
            imageUrl
        } = body;

        if (!nomineeName || !nomineeEmail || !description || !category) {
            return NextResponse.json({ ok: false, reason: "missing_fields" }, { status: 400 });
        }

        // Check for duplicates
        const exists = await checkIfNomineeExists(nomineeEmail);
        if (exists) {
            return NextResponse.json({ ok: false, reason: "duplicate_nominee" });
        }

        // Submit to Airtable
        await submitNomination({
            nominatorEmail: nominatorEmail || nomineeEmail, // If self-nomination, use nominee email
            nomineeName,
            nomineeEmail,
            description,
            category,
            imageUrl
        });

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Nomination Error:", error);
        return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
    }
}
