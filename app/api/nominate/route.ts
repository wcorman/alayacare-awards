import { NextRequest, NextResponse } from 'next/server';
import { checkIfNomineeExists, submitNomination, addContactToAirtable } from '@/lib/airtable';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            nominatorEmail,
            nomineeFirstName,
            nomineeLastName,
            nomineeEmail,
            description,
            category,
            imageUrl,
            jobTitle,
            organization,
            nominatorFirstName,
            nominatorLastName,
            nominatorOrganization,
            nominatorJobTitle,
            isHomeCare,
            language
        } = body;

        if (!nomineeFirstName || !nomineeLastName || !nomineeEmail || !description || !category) {
            return NextResponse.json({ ok: false, reason: "missing_fields" }, { status: 400 });
        }

        // Check for duplicates
        const exists = await checkIfNomineeExists(nomineeEmail);
        if (exists) {
            return NextResponse.json({ ok: false, reason: "duplicate_nominee" });
        }

        // Submit to Airtable (language from i18n: "English" or "French")
        const nominationId = await submitNomination({
            nominatorEmail: nominatorEmail || nomineeEmail, // If self-nomination, use nominee email
            nomineeFirstName,
            nomineeLastName,
            nomineeEmail,
            description,
            category,
            imageUrl,
            jobTitle: jobTitle || '',
            organization: organization || '',
            nominatorName: [nominatorFirstName, nominatorLastName].filter(Boolean).join(' ').trim() || '',
            nominatorOrganization: nominatorOrganization || '',
            nominatorJobTitle: nominatorJobTitle || '',
            language: language || 'English'
        });

        // Add nominator to Contacts table if they checked the home care industry option
        if (isHomeCare && nominatorEmail && (nominatorFirstName || nominatorLastName || nominatorOrganization || nominatorJobTitle)) {
            try {
                await addContactToAirtable({
                    email: nominatorEmail,
                    firstName: nominatorFirstName || '',
                    lastName: nominatorLastName || '',
                    organization: nominatorOrganization || '',
                    jobTitle: nominatorJobTitle || '',
                    nominationId: nominationId || undefined,
                    language: language || 'English'
                });
            } catch (error) {
                // Log error but don't fail the nomination if contact addition fails
                console.error("Failed to add nominator to Contacts:", error);
                if (error instanceof Error) {
                    console.error("Error message:", error.message);
                    console.error("Error stack:", error.stack);
                }
            }
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Nomination Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Full error details:", {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ 
            ok: false, 
            reason: "server_error",
            error: errorMessage 
        }, { status: 500 });
    }
}
