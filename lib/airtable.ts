const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;

if (!BASE_ID || !TOKEN) {
    throw new Error("Missing Airtable environment variables");
}

const HEADERS = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
};

export const NOMINATIONS_REVALIDATE_SECONDS = 60;

const NOMINATION_LANGUAGE_FIELD = "English or French";

/** Maps Airtable single select to next-intl locale; null if unset or unknown. */
export function getNominationLanguagePreference(
    fields: Record<string, unknown>
): "en" | "fr" | null {
    const raw = fields[NOMINATION_LANGUAGE_FIELD];
    if (raw === "French") return "fr";
    if (raw === "English") return "en";
    return null;
}

function getNomineeName(fields: Record<string, unknown>): string {
    const firstName = fields["First Name"];
    const lastName = fields["Last Name"];

    if (typeof firstName === "string" && typeof lastName === "string") {
        const combined = `${firstName} ${lastName}`.trim();
        if (combined) {
            return combined;
        }
    }

    const nameField = fields["Name"];
    if (typeof nameField === "string" && nameField.trim()) {
        return nameField.trim();
    }

    return "Unknown Name";
}

function getAttachmentUrl(value: unknown): string | null {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value) && value.length > 0) {
        const firstAttachment = value[0];

        if (
            typeof firstAttachment === "object" &&
            firstAttachment !== null &&
            "url" in firstAttachment &&
            typeof firstAttachment.url === "string"
        ) {
            return firstAttachment.url;
        }
    }

    return null;
}

export interface Nominee {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    category: string;
    votes: number;
    image: string | null;
    description: string;
    organization: string | null;
    jobTitle: string | null;
    /** From Airtable "English or French"; drives automatic locale on nominee pages. */
    languagePreference: "en" | "fr" | null;
}

export const JUDGING_CATEGORY_SELECTION_FIELDS = {
    "Frontline Care": "Frontline Care Selection",
    "Operational Excellence": "Operational Excellence Selection",
    "Executive Leadership": "Executive Leadership Selection",
    "Impact and Innovation": "Impact and Innovation Selection",
} as const;

export type JudgingCategory = keyof typeof JUDGING_CATEGORY_SELECTION_FIELDS;

export interface JudgeSelectionRecord {
    id: string | null;
    email: string;
    selections: Record<JudgingCategory, string[]>;
}

interface AirtableRecord {
    id: string;
    fields: Record<string, unknown>;
}

const JUDGING_PANEL_TABLE_NAME = "Judging Panel";
const JUDGING_PANEL_EMAIL_FIELD = process.env.AIRTABLE_JUDGING_PANEL_EMAIL_FIELD || "Email";

function escapeAirtableFormulaString(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function emptyJudgeSelections(): Record<JudgingCategory, string[]> {
    return Object.keys(JUDGING_CATEGORY_SELECTION_FIELDS).reduce(
        (acc, category) => {
            acc[category as JudgingCategory] = [];
            return acc;
        },
        {} as Record<JudgingCategory, string[]>
    );
}

function getStringField(fields: Record<string, unknown>, fieldName: string): string | null {
    const value = fields[fieldName];
    return typeof value === "string" && value.trim() ? value : null;
}

function mapNominationRecord(record: AirtableRecord): Nominee {
    const firstName = getStringField(record.fields, "First Name");
    const lastName = getStringField(record.fields, "Last Name");
    const name = getNomineeName(record.fields);
    const votes = record.fields["Votes"];

    return {
        id: record.id,
        name,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        category: getStringField(record.fields, "Category") || "Uncategorized",
        votes: typeof votes === "number" ? votes : 0,
        image: getAttachmentUrl(record.fields["Profile Photo"]),
        description: getStringField(record.fields, "Nomination Reason") || "No description provided.",
        organization: getStringField(record.fields, "Company Name"),
        jobTitle: getStringField(record.fields, "Job Title"),
        languagePreference: getNominationLanguagePreference(record.fields),
    };
}

export async function fetchNominations(): Promise<Nominee[]> {
    const TABLE_NAME = "Nominations";
    const sortQuery = "sort[0][field]=Votes&sort[0][direction]=desc";
    const filterFormula = encodeURIComponent("{Status}='Live'");

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?${sortQuery}&filterByFormula=${filterFormula}`;

    const res = await fetch(url, {
        headers: HEADERS,
        next: { revalidate: NOMINATIONS_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch nominees: ${res.statusText}`);
    }

    const data = await res.json();

    return data.records.map(mapNominationRecord);
}

export async function fetchJudgingNominations(): Promise<Nominee[]> {
    const TABLE_NAME = "Nominations";
    const sortQuery = "sort[0][field]=Votes&sort[0][direction]=desc";
    const records: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
        const offsetQuery = offset ? `&offset=${encodeURIComponent(offset)}` : "";
        const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?${sortQuery}${offsetQuery}`;

        const res = await fetch(url, {
            headers: HEADERS,
            next: { revalidate: NOMINATIONS_REVALIDATE_SECONDS },
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch judging nominees: ${res.statusText}`);
        }

        const data = await res.json() as { records?: AirtableRecord[]; offset?: string };
        records.push(...(data.records || []));
        offset = data.offset;
    } while (offset);

    return records.map(mapNominationRecord);
}

export async function findJudgeSelectionRecord(email: string): Promise<JudgeSelectionRecord | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const filterFormula = encodeURIComponent(
        `LOWER({${JUDGING_PANEL_EMAIL_FIELD}})=LOWER('${escapeAirtableFormulaString(normalizedEmail)}')`
    );
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(JUDGING_PANEL_TABLE_NAME)}?filterByFormula=${filterFormula}`;

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });

    if (!res.ok) {
        throw new Error(`Failed to find judge selection record: ${res.statusText}`);
    }

    const data = await res.json();
    const record = data.records?.[0];

    if (!record) {
        return null;
    }

    const selections = emptyJudgeSelections();

    Object.entries(JUDGING_CATEGORY_SELECTION_FIELDS).forEach(([category, fieldName]) => {
        const rawSelection = record.fields?.[fieldName];
        selections[category as JudgingCategory] = Array.isArray(rawSelection)
            ? rawSelection.filter((id): id is string => typeof id === "string")
            : [];
    });

    return {
        id: record.id,
        email: normalizedEmail,
        selections,
    };
}

export async function saveJudgeSelectionRecord(
    email: string,
    selections: Record<JudgingCategory, string[]>
): Promise<JudgeSelectionRecord> {
    const normalizedEmail = email.trim().toLowerCase();
    const existingRecord = await findJudgeSelectionRecord(normalizedEmail);

    if (!existingRecord?.id) {
        throw new Error("This email is not registered for the judging panel.");
    }

    const fields: Record<string, string | string[]> = {
        [JUDGING_PANEL_EMAIL_FIELD]: normalizedEmail,
    };

    Object.entries(JUDGING_CATEGORY_SELECTION_FIELDS).forEach(([category, fieldName]) => {
        fields[fieldName] = selections[category as JudgingCategory] || [];
    });

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(JUDGING_PANEL_TABLE_NAME)}`;
    const res = await fetch(url, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({
            records: [
                { id: existingRecord.id, fields },
            ],
        }),
    });

    if (!res.ok) {
        let errDetail = res.statusText;

        try {
            const errBody = await res.json();
            errDetail = errBody?.error?.message || JSON.stringify(errBody) || errDetail;
        } catch {
            // Use status text if Airtable did not return JSON.
        }

        throw new Error(`Failed to save judge selections (${res.status}): ${errDetail}`);
    }

    const result = await res.json();
    const savedRecord = result?.records?.[0];

    if (!savedRecord) {
        throw new Error("Airtable did not return the saved judge selection record");
    }

    return {
        id: savedRecord.id,
        email: normalizedEmail,
        selections,
    };
}

export async function fetchNomineeById(id: string): Promise<Nominee | null> {
    const TABLE_NAME = "Nominations";
    // Fetch record directly by ID
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${encodeURIComponent(id)}`;

    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });

    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        throw new Error(`Failed to fetch nominee: ${res.statusText}`);
    }

    const record = await res.json();

    // Check if status is Live
    if (record.fields["Status"] !== "Live") {
        return null;
    }

    const firstName = record.fields["First Name"] || null;
    const lastName = record.fields["Last Name"] || null;
    const name = getNomineeName(record.fields);

    return {
        id: record.id,
        name,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        category: record.fields["Category"] || "Uncategorized",
        votes: record.fields["Votes"] || 0,
        image: getAttachmentUrl(record.fields["Profile Photo"]),
        description: record.fields["Nomination Reason"] || "No description provided.",
        organization: record.fields["Company Name"] || null,
        jobTitle: record.fields["Job Title"] || null,
        languagePreference: getNominationLanguagePreference(record.fields),
    };
}

export interface NominationAcceptanceData {
    id: string;
    nomineeName: string;
    customNominationImage: string | null;
    languagePreference: "en" | "fr" | null;
}

export interface NomineeProfileEditorData {
    id: string;
    nomineeName: string;
    category: string;
    companyName: string;
    jobTitle: string;
    linkedInProfile: string;
    companyWebsite: string;
    profilePhoto: string | null;
    customVoteImage: string | null;
    languagePreference: "en" | "fr" | null;
}

export async function fetchNominationAcceptanceDataById(id: string): Promise<NominationAcceptanceData | null> {
    const TABLE_NAME = "Nominations";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${encodeURIComponent(id)}`;

    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });

    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        let errDetail = res.statusText;
        try {
            const errBody = await res.json();
            errDetail = errBody?.error?.message || JSON.stringify(errBody) || errDetail;
        } catch {
            // ignore
        }
        throw new Error(`Failed to fetch nomination acceptance data (${res.status}): ${errDetail}`);
    }

    const record = await res.json();
    const fields = record?.fields ?? {};
    const nomineeName = getNomineeName(fields);

    const rawCustomImage = fields["custom-nomination-image"];
    const customNominationImage = getAttachmentUrl(rawCustomImage);

    return {
        id: record.id,
        nomineeName,
        customNominationImage,
        languagePreference: getNominationLanguagePreference(fields),
    };
}

export async function fetchNomineeProfileEditorDataById(id: string): Promise<NomineeProfileEditorData | null> {
    const TABLE_NAME = "Nominations";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${encodeURIComponent(id)}`;

    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });

    if (!res.ok) {
        if (res.status === 404) {
            return null;
        }
        throw new Error(`Failed to fetch nominee profile editor data: ${res.statusText}`);
    }

    const record = await res.json();
    const fields = record?.fields ?? {};

    return {
        id: record.id,
        nomineeName: getNomineeName(fields),
        category: fields["Category"] || "Uncategorized",
        companyName: fields["Company Name"] || "",
        jobTitle: fields["Job Title"] || "",
        linkedInProfile: fields["LinkedIn Profile"] || "",
        companyWebsite: fields["Company Website"] || "",
        profilePhoto: getAttachmentUrl(fields["Profile Photo"]),
        customVoteImage: getAttachmentUrl(fields["custom-vote-image"]),
        languagePreference: getNominationLanguagePreference(fields),
    };
}

export async function updateNomineeProfileEditorData(
    id: string,
    updates: {
        linkedInProfile: string;
        companyWebsite: string;
        profilePhotoUrl: string | null;
    }
): Promise<NomineeProfileEditorData> {
    const TABLE_NAME = "Nominations";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const profilePhotoUrl = updates.profilePhotoUrl?.trim() || null;
    const fields = {
        "LinkedIn Profile": updates.linkedInProfile.trim(),
        "Company Website": updates.companyWebsite.trim(),
        "Profile Photo": profilePhotoUrl
            ? [{
                url: profilePhotoUrl,
                filename: `${id}_profile-photo.${profilePhotoUrl.includes(".png") ? "png" : "jpg"}`
            }]
            : [],
    };

    const res = await fetch(url, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({
            records: [{ id, fields }]
        })
    });

    if (!res.ok) {
        let errDetail = res.statusText;

        try {
            const errBody = await res.json();
            errDetail = errBody?.error?.message || JSON.stringify(errBody) || errDetail;
        } catch {
            // ignore JSON parsing failures and use status text
        }

        throw new Error(`Failed to update nominee profile editor data (${res.status}): ${errDetail}`);
    }

    const result = await res.json();
    const updatedRecord = result?.records?.[0];

    if (!updatedRecord) {
        throw new Error("Airtable did not return the updated nominee record");
    }

    const updatedFields = updatedRecord.fields ?? {};

    return {
        id: updatedRecord.id,
        nomineeName: getNomineeName(updatedFields),
        category: updatedFields["Category"] || "Uncategorized",
        companyName: updatedFields["Company Name"] || "",
        jobTitle: updatedFields["Job Title"] || "",
        linkedInProfile: updatedFields["LinkedIn Profile"] || "",
        companyWebsite: updatedFields["Company Website"] || "",
        profilePhoto: getAttachmentUrl(updatedFields["Profile Photo"]),
        customVoteImage: getAttachmentUrl(updatedFields["custom-vote-image"]),
        languagePreference: getNominationLanguagePreference(updatedFields),
    };
}

export async function findVotingRecord(email: string) {
    const TABLE_NAME = "Voting Record";
    const filterFormula = encodeURIComponent(`{Voter Email}='${email}'`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${filterFormula}`;

    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to find voting record");

    const data = await res.json();
    return data.records[0] || null;
}

export async function createConfirmationRecord(email: string, nomineeId: string, token: string) {
    const TABLE_NAME = "Email Confirmations";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const body = {
        records: [{
            fields: {
                "Voter Email": email,
                "Voted For": [nomineeId],
                "Confirmation Token": token,
                "Vote Confirmed": false
            }
        }]
    };

    const res = await fetch(url, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json();
        console.error("Airtable Error:", err);
        throw new Error("Failed to create confirmation record");
    }

    return true;
}

export async function findConfirmationByEmailAndNominee(email: string, nomineeId: string) {
    const TABLE_NAME = "Email Confirmations";
    const filterFormula = encodeURIComponent(`LOWER({Voter Email})=LOWER('${email}')`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${filterFormula}`;

    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to find confirmation record by email and nominee");

    const data = await res.json();
    return (
        data.records.find((record: { fields?: Record<string, unknown> }) => {
            const votedForIds = record.fields?.["Voted For"];
            return Array.isArray(votedForIds) && votedForIds.includes(nomineeId);
        }) || null
    );
}

export async function findConfirmationByToken(token: string) {
    const TABLE_NAME = "Email Confirmations";
    const filterFormula = encodeURIComponent(`{Confirmation Token}='${token}'`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${filterFormula}`;

    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to find confirmation record");

    const data = await res.json();
    return data.records[0] || null;
}

export async function confirmVoteInAirtable(confirmationRecord: any) {
    const TABLE_NAME_CONFIRM = "Email Confirmations";
    const TABLE_NAME_VOTING = "Voting Record";

    if (confirmationRecord.fields["Vote Confirmed"]) {
        return false;
    }

    const { "Voter Email": email, "Voted For": votedForIds } = confirmationRecord.fields;
    const nomineeId = votedForIds ? votedForIds[0] : null;

    if (!nomineeId) throw new Error("No nominee associated with this confirmation");

    // 1. Mark confirmation as true
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME_CONFIRM)}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({
            records: [{
                id: confirmationRecord.id,
                fields: {
                    "Vote Confirmed": true,
                    "Confirmed At": new Date().toISOString()
                }
            }]
        })
    });

    // 2. Update or Create Voting Record
    const existingVotingRecord = await findVotingRecord(email);

    if (existingVotingRecord) {
        const currentVotes = existingVotingRecord.fields["Voted Nominees"] || [];
        if (!currentVotes.includes(nomineeId)) {
            await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME_VOTING)}`, {
                method: 'PATCH',
                headers: HEADERS,
                body: JSON.stringify({
                    records: [{
                        id: existingVotingRecord.id,
                        fields: { "Voted Nominees": [...currentVotes, nomineeId] }
                    }]
                })
            });
        }
    } else {
        await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME_VOTING)}`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({
                records: [{
                    fields: {
                        "Voter Email": email,
                        "Voted Nominees": [nomineeId]
                    }
                }]
            })
        });
    }

    return true;
}

export async function checkIfNomineeExists(email: string): Promise<boolean> {
    const TABLE_NAME = "Nominations";
    const filterFormula = encodeURIComponent(`LOWER({Nominee Email})=LOWER('${email}')`);
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${filterFormula}`;

    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
    if (!res.ok) return false;

    const data = await res.json();
    return data.records && data.records.length > 0;
}

export async function sendVoteRequestWebhook(email: string, nomineeData: {
    id: string;
    name: string;
    category?: string;
    description?: string;
    image?: string | null;
    votes?: number;
}) {
    const webhookUrl = process.env.AIRTABLE_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("AIRTABLE_WEBHOOK_URL not configured, skipping webhook");
        return;
    }

    try {
        const payload = {
            voterEmail: email,
            nominee: {
                id: nomineeData.id,
                name: nomineeData.name,
                category: nomineeData.category || "Unknown",
                description: nomineeData.description || "",
                imageUrl: nomineeData.image || null,
                currentVotes: nomineeData.votes || 0
            },
            timestamp: new Date().toISOString(),
            eventType: "vote_request"
        };

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            console.error(`Webhook failed with status ${res.status}`);
        } else {
            console.log("Webhook sent successfully for", nomineeData.name);
        }
    } catch (error) {
        console.error("Error sending webhook:", error);
        // Don't throw - webhook failures shouldn't break the vote flow
    }
}

export async function submitNomination(data: {
    nominatorEmail: string;
    nomineeFirstName: string;
    nomineeLastName: string;
    nomineeEmail: string;
    description: string;
    category: string;
    imageUrl: string | null;
    jobTitle?: string;
    organization?: string;
    nominatorName?: string;
    nominatorOrganization?: string;
    nominatorJobTitle?: string;
    language?: string;
}) {
    const TABLE_NAME = "Nominations";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const fullName = `${data.nomineeFirstName} ${data.nomineeLastName}`.trim();
    const fields: any = {
        "Nominator Email": data.nominatorEmail,
        "First Name": data.nomineeFirstName.trim(),
        "Last Name": data.nomineeLastName.trim(),
        "Name": fullName,
        "Nominee Email": data.nomineeEmail,
        "Nomination Reason": data.description,
        "Category": data.category,
        "Status": "Draft"
    };

    // Add language preference from i18n (English or French)
    if (data.language && (data.language === "English" || data.language === "French")) {
        fields["English or French"] = data.language;
    }

    // Add optional fields if provided and not empty
    if (data.jobTitle && data.jobTitle.trim()) {
        fields["Job Title"] = data.jobTitle.trim();
    }
    if (data.organization && data.organization.trim()) {
        fields["Company Name"] = data.organization.trim();
    }
    // Note: Nominator Name, Organization, and Job Title are stored in the Contacts table, not here

    if (data.imageUrl) {
        fields["Profile Photo"] = [{
            url: data.imageUrl,
            filename: `${fullName.replace(/\s+/g, '_')}_photo.png`
        }];
    }

    const body = {
        records: [{ fields }]
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        let err;
        try {
            err = await res.json();
        } catch (e) {
            const text = await res.text();
            console.error("Airtable Error Response (not JSON):", text);
            throw new Error(`Failed to submit nomination: ${res.status} ${res.statusText}`);
        }
        console.error("Airtable Submission Error:", JSON.stringify(err, null, 2));
        console.error("Fields being sent:", JSON.stringify(fields, null, 2));
        const errorMessage = err.error?.message || err.message || JSON.stringify(err);
        throw new Error(`Airtable Error: ${errorMessage}`);
    }

    const result = await res.json();
    // Return the record ID so we can link it to the contact
    return result.records?.[0]?.id || null;
}

export async function addContactToAirtable(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    organization?: string;
    jobTitle?: string;
    nominationId?: string;
    language?: string;
}) {
    const TABLE_NAME = "Contacts";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    // Check if contact already exists by email
    let existingRecord = null;
    
    const filterFormula = encodeURIComponent(`LOWER({Email})=LOWER('${data.email}')`);
    const checkUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${filterFormula}`;
    const checkRes = await fetch(checkUrl, { headers: HEADERS, cache: 'no-store' });
    
    if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.records && checkData.records.length > 0) {
            existingRecord = checkData.records[0];
        }
    }
    
    if (existingRecord) {
        // If contact exists, update it instead of creating a new one
        const fields: any = {};
        
        if (data.firstName && data.firstName.trim()) {
            fields["First Name"] = data.firstName.trim();
        }
        if (data.lastName && data.lastName.trim()) {
            fields["Last Name"] = data.lastName.trim();
        }
        const fullName = [data.firstName, data.lastName].filter(Boolean).map(s => s?.trim()).join(' ').trim();
        if (fullName) {
            fields["Name"] = fullName;
        }
        if (data.organization && data.organization.trim()) {
            fields["Company Name"] = data.organization.trim();
        }
        if (data.jobTitle && data.jobTitle.trim()) {
            fields["Job Title"] = data.jobTitle.trim();
        }
        if (data.language && (data.language === "English" || data.language === "French")) {
            fields["English or French"] = data.language;
        }
        
        // Link nomination if provided
        if (data.nominationId) {
            const existingNominations = existingRecord.fields["Nominations"] || [];
            // Only add if not already linked
            if (!existingNominations.includes(data.nominationId)) {
                fields["Nominations"] = [...existingNominations, data.nominationId];
            }
        }
        
        // Only update if there are fields to update
        if (Object.keys(fields).length > 0) {
            const updateUrl = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
            const updateRes = await fetch(updateUrl, {
                method: 'PATCH',
                headers: HEADERS,
                body: JSON.stringify({
                    records: [{
                        id: existingRecord.id,
                        fields
                    }]
                })
            });
            
            if (!updateRes.ok) {
                const err = await updateRes.json();
                console.error("Airtable Update Contact Error:", JSON.stringify(err, null, 2));
                // Log but don't throw - we'll try to create instead
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    // Create new contact if it doesn't exist
    // Build full contact record with all fields to avoid PATCH failures
    const fullName = [data.firstName, data.lastName].filter(Boolean).map(s => s?.trim()).join(' ').trim();
    const initialFields: any = {
        "Email": data.email.trim().toLowerCase()
    };
    if (data.firstName && data.firstName.trim()) {
        initialFields["First Name"] = data.firstName.trim();
    }
    if (data.lastName && data.lastName.trim()) {
        initialFields["Last Name"] = data.lastName.trim();
    }
    if (fullName) {
        initialFields["Name"] = fullName;
    }
    if (data.organization && data.organization.trim()) {
        initialFields["Company Name"] = data.organization.trim();
    }
    if (data.jobTitle && data.jobTitle.trim()) {
        initialFields["Job Title"] = data.jobTitle.trim();
    }
    if (data.language && (data.language === "English" || data.language === "French")) {
        initialFields["English or French"] = data.language;
    }
    if (data.nominationId) {
        initialFields["Nominations"] = [data.nominationId];
    }

    const fields: any = { ...initialFields };
    let body = {
        records: [{ fields: initialFields }]
    };

    let res = await fetch(url, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(body)
    });

    if (res.ok) {
        // Contact created successfully with all fields in initial create
        return true;
    } else {
        // Retry with same data (fields already populated from initialFields)
        body = {
            records: [{ fields }]
        };

        res = await fetch(url, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            let err;
            try {
                err = await res.json();
            } catch (e) {
                const text = await res.text();
                console.error("Airtable Error Response (not JSON):", text);
                throw new Error(`Failed to add contact: ${res.status} ${res.statusText}`);
            }
            console.error("Airtable Contact Error:", JSON.stringify(err, null, 2));
            console.error("Fields being sent:", JSON.stringify(fields, null, 2));
            const errorMessage = err.error?.message || err.message || JSON.stringify(err);
            throw new Error(`Airtable Error: ${errorMessage}`);
        }
    }

    return true;
}
