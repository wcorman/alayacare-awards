import { NextRequest, NextResponse } from 'next/server';
import { findVotingRecord } from '@/lib/airtable';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ votedNomineeIds: [] });
    }

    try {
        const record = await findVotingRecord(email.trim().toLowerCase());
        const votedNomineeIds = record ? (record.fields["Voted Nominees"] || []) : [];
        return NextResponse.json({ votedNomineeIds });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
    }
}
