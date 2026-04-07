import { NextRequest, NextResponse } from "next/server";
import { updateNomineeProfileEditorData } from "@/lib/airtable";

function isValidPublicUrl(value: string) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const id = typeof body?.id === "string" ? body.id.trim() : "";
        const linkedInProfile = typeof body?.linkedInProfile === "string" ? body.linkedInProfile.trim() : "";
        const companyWebsite = typeof body?.companyWebsite === "string" ? body.companyWebsite.trim() : "";
        const rawProfilePhotoUrl = typeof body?.profilePhotoUrl === "string" ? body.profilePhotoUrl.trim() : "";
        const profilePhotoUrl = rawProfilePhotoUrl || null;

        if (!id) {
            return NextResponse.json({ error: "A nomination record id is required." }, { status: 400 });
        }

        if (linkedInProfile && !isValidPublicUrl(linkedInProfile)) {
            return NextResponse.json({ error: "LinkedIn Profile must be a valid URL." }, { status: 400 });
        }

        if (companyWebsite && !isValidPublicUrl(companyWebsite)) {
            return NextResponse.json({ error: "Company Website must be a valid URL." }, { status: 400 });
        }

        if (profilePhotoUrl && !isValidPublicUrl(profilePhotoUrl)) {
            return NextResponse.json({ error: "Profile Photo must be a valid URL." }, { status: 400 });
        }

        const profile = await updateNomineeProfileEditorData(id, {
            linkedInProfile,
            companyWebsite,
            profilePhotoUrl,
        });

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("[profile] Failed to update nominee profile:", error);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unable to update nominee profile." },
            { status: 500 }
        );
    }
}
