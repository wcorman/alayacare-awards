import { NextRequest, NextResponse } from 'next/server';
import { findConfirmationByToken, sendVoteRequestWebhook, fetchNominations, confirmVoteInAirtable } from '@/lib/airtable';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

    if (!token) {
        return NextResponse.redirect(`${baseUrl}/?error=missing_token`);
    }

    try {
        // 1. Find the confirmation record by token
        const confirmationRecord = await findConfirmationByToken(token);

        if (!confirmationRecord) {
            return NextResponse.redirect(`${baseUrl}/?error=invalid_token`);
        }

        // 2. Extract data from confirmation record
        const { "Voter Email": email, "Voted For": votedForIds } = confirmationRecord.fields;
        const nomineeId = votedForIds ? votedForIds[0] : null;

        if (!nomineeId || !email) {
            return NextResponse.redirect(`${baseUrl}/?error=missing_data`);
        }

        if (confirmationRecord.fields["Vote Confirmed"]) {
            return NextResponse.redirect(`${baseUrl}/?vote=confirmed`);
        }

        // 3. Fetch nominee data
        const nominees = await fetchNominations();
        const nominee = nominees.find(n => n.id === nomineeId);

        if (!nominee) {
            return NextResponse.redirect(`${baseUrl}/?error=nominee_not_found`);
        }

        // 4. Confirm the vote (updates Vote Confirmed = true and Confirmed At timestamp)
        const voteWasConfirmed = await confirmVoteInAirtable(confirmationRecord);

        if (!voteWasConfirmed) {
            return NextResponse.redirect(`${baseUrl}/?vote=confirmed`);
        }

        // 5. Send webhook
        await sendVoteRequestWebhook(email, {
            id: nominee.id,
            name: nominee.name,
            category: nominee.category,
            description: nominee.description,
            image: nominee.image,
            votes: nominee.votes
        });

        // 6. Redirect to app with success parameters
        const redirectUrl = new URL(baseUrl);
        redirectUrl.searchParams.set('vote', 'confirmed');
        redirectUrl.searchParams.set('nominee', nominee.name);
        redirectUrl.searchParams.set('category', nominee.category);

        return NextResponse.redirect(redirectUrl.toString());

    } catch (error) {
        console.error("Webhook Trigger Error:", error);
        return NextResponse.redirect(`${baseUrl}/?error=server_error`);
    }
}
