const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;

if (!BASE_ID || !TOKEN) {
    throw new Error("Missing Airtable environment variables");
}

const HEADERS = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
};

export interface Nominee {
    id: string;
    name: string;
    category: string;
    votes: number;
    image: string | null;
    description: string;
}

export async function fetchNominations(): Promise<Nominee[]> {
    const TABLE_NAME = "Nominations";
    const sortQuery = "sort[0][field]=Votes&sort[0][direction]=desc";
    const filterFormula = encodeURIComponent("{Status}='Live'");

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?${sortQuery}&filterByFormula=${filterFormula}`;

    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 60 } }); // Cache for 60s

    if (!res.ok) {
        throw new Error(`Failed to fetch nominees: ${res.statusText}`);
    }

    const data = await res.json();

    return data.records.map((record: any) => ({
        id: record.id,
        name: record.fields["Name"] || "Unknown Name",
        category: record.fields["Category"] || "Uncategorized",
        votes: record.fields["Votes"] || 0,
        image: record.fields["Profile Photo"]?.[0]?.url || null,
        description: record.fields["Nomination Reason"] || "No description provided.",
    }));
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
    nomineeName: string;
    nomineeEmail: string;
    description: string;
    category: string;
    imageUrl: string | null;
}) {
    const TABLE_NAME = "Nominations";
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const fields: any = {
        "Nominator Email": data.nominatorEmail,
        "Name": data.nomineeName,
        "Nominee Email": data.nomineeEmail,
        "Nomination Reason": data.description,
        "Category": data.category,
        "Votes": 0,
        "Status": "Draft"
    };

    if (data.imageUrl) {
        fields["Profile Photo"] = [{
            url: data.imageUrl,
            filename: `${data.nomineeName.replace(/\s+/g, '_')}_photo.png`
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
        const err = await res.json();
        console.error("Airtable Submission Error:", err);
        throw new Error("Failed to submit nomination");
    }

    return true;
}
