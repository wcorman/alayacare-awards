import { NextRequest, NextResponse } from 'next/server';
import { findVotingRecord, createConfirmationRecord } from '@/lib/airtable';


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { voterEmail, nomineeId } = body;

        if (!voterEmail || !nomineeId) {
            return NextResponse.json({ ok: false, reason: "missing_fields" }, { status: 400 });
        }

        const email = voterEmail.trim().toLowerCase();

        // 1. Check if already voted for this nominee
        const existingRecord = await findVotingRecord(email);
        if (existingRecord) {
            const votedNominees = existingRecord.fields["Voted Nominees"] || [];
            if (votedNominees.includes(nomineeId)) {
                return NextResponse.json({ ok: false, reason: "already_voted" });
            }
        }

        // 2. Generate Token & Create Confirmation Record
        const token = crypto.randomUUID();
        await createConfirmationRecord(email, nomineeId, token);

        // 3. Email is sent via Airtable Automation triggered by the record creation above.

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Vote Request Error:", error);
        return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
    }
}
