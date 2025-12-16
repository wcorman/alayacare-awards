import { NextResponse } from 'next/server';
import { fetchNominations } from '@/lib/airtable';

export async function GET() {
    try {
        const nominees = await fetchNominations();
        return NextResponse.json(nominees);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch nominees" }, { status: 500 });
    }
}
