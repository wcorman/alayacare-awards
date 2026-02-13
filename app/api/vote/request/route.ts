import { NextRequest, NextResponse } from 'next/server';
import { findVotingRecord, createConfirmationRecord, addContactToAirtable } from '@/lib/airtable';


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { voterEmail, nomineeId, isHomeCare, name, organization, jobTitle } = body;

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

        // Add voter to Contacts table if they checked the home care industry option
        if (isHomeCare && email && (name || organization || jobTitle)) {
            try {
                const fullName = (name || '').trim();
                const spaceIdx = fullName.indexOf(' ');
                const firstName = spaceIdx >= 0 ? fullName.slice(0, spaceIdx) : fullName;
                const lastName = spaceIdx >= 0 ? fullName.slice(spaceIdx + 1) : '';
                await addContactToAirtable({
                    email: email,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    organization: organization || undefined,
                    jobTitle: jobTitle || undefined
                    // Note: Not linking nominations field
                });
            } catch (error) {
                // Log error but don't fail the vote request if contact addition fails
                console.error("Failed to add voter to Contacts:", error);
            }
        }

        // 4. Email is sent via Airtable Automation triggered by the record creation above.

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Vote Request Error:", error);
        return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
    }
}
