import { NextRequest, NextResponse } from 'next/server';
import { checkIfNomineeExists, submitNomination, addContactToAirtable } from '@/lib/airtable';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            nominatorEmail,
            nomineeName,
            nomineeEmail,
            description,
            category,
            imageUrl,
            jobTitle,
            organization,
            nominatorName,
            nominatorOrganization,
            nominatorJobTitle,
            isHomeCare
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
        const nominationId = await submitNomination({
            nominatorEmail: nominatorEmail || nomineeEmail, // If self-nomination, use nominee email
            nomineeName,
            nomineeEmail,
            description,
            category,
            imageUrl,
            jobTitle: jobTitle || '',
            organization: organization || '',
            nominatorName: nominatorName || '',
            nominatorOrganization: nominatorOrganization || '',
            nominatorJobTitle: nominatorJobTitle || ''
        });

        // Add nominator to Contacts table if they checked the home care industry option
        if (isHomeCare && nominatorEmail && (nominatorName || nominatorOrganization || nominatorJobTitle)) {
            try {
                await addContactToAirtable({
                    email: nominatorEmail,
                    name: nominatorName || '',
                    organization: nominatorOrganization || '',
                    jobTitle: nominatorJobTitle || '',
                    nominationId: nominationId || undefined
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
