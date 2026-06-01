import JudgingPanelClient from "@/components/JudgingPanelClient";
import { fetchJudgingNominations } from "@/lib/airtable";

export const revalidate = 60;

export default async function JudgingPanelPage() {
    const nominees = await fetchJudgingNominations();

    return (
        <div className="h-full min-h-0 bg-[#08193e] text-white">
            <JudgingPanelClient nominees={nominees} />
        </div>
    );
}
