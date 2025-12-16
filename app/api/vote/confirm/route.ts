import { NextRequest, NextResponse } from 'next/server';
import { findConfirmationByToken, confirmVoteInAirtable } from '@/lib/airtable';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

    if (!token) {
        return NextResponse.redirect(`${baseUrl}/vote?vote=invalid`);
    }

    try {
        const confirmationRecord = await findConfirmationByToken(token);

        if (!confirmationRecord) {
            return NextResponse.redirect(`${baseUrl}/vote?vote=invalid`);
        }

        if (confirmationRecord.fields["Vote Confirmed"]) {
            // Already confirmed
            return NextResponse.redirect(`${baseUrl}/vote?vote=confirmed&token=${token}`);
        }

        // Perform confirmation logic
        await confirmVoteInAirtable(confirmationRecord);

        return NextResponse.redirect(`${baseUrl}/vote?vote=confirmed&token=${token}`);

    } catch (error) {
        console.error("Confirmation Error:", error);
        return NextResponse.redirect(`${baseUrl}/vote?vote=error`);
    }
}
