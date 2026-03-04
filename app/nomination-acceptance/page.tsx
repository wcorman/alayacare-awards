import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NominationAcceptanceShare from "@/components/NominationAcceptanceShare";
import { fetchNominationAcceptanceDataById } from "@/lib/airtable";

export const metadata: Metadata = {
  title: "Nomination Acceptance | Home-Based Care Momentum Awards",
  description: "Information for nominees who accepted their nomination.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface NominationAcceptancePageProps {
  searchParams?: Promise<{ id?: string | string[] }>;
}


export default async function NominationAcceptancePage({ searchParams }: NominationAcceptancePageProps) {
  const t = await getTranslations("NominationAcceptance.page");
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const idParam = resolvedSearchParams?.id;
  const recordId = Array.isArray(idParam) ? idParam[0] : idParam;

  const nominationData = recordId
    ? await fetchNominationAcceptanceDataById(recordId)
    : null;

  const customImageUrl = nominationData?.customNominationImage || null;

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      <section
        className="relative text-white py-[calc(4rem+2px)] px-[calc(1.5rem+2px)] lg:px-[calc(3rem+2px)] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #08193e 0%, #113cca 100%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t("heroTitle")}
          </h1>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-[#08193e] mb-3">
              {t("nextStepsTitle")}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                {t("nextStepsEligibilityPrefix")}{" "}
                <Link href="/eligibility" className="text-[#1D5EED] font-semibold hover:underline">
                  {t("nextStepsEligibilityLink")}
                </Link>
              </li>
              <li>
                {t("nextStepsTimelinePrefix")}{" "}
                <Link href="/#key-dates" className="text-[#1D5EED] font-semibold hover:underline">
                  {t("nextStepsTimelineLink")}
                </Link>
              </li>
            </ul>
          </div>

          <NominationAcceptanceShare
            customImageUrl={customImageUrl}
            nomineeName={nominationData?.nomineeName || null}
          />

          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#08193e] mb-2">{t("questionsTitle")}</h3>
            <p className="text-gray-700 leading-relaxed">
              {t("questionsPrefix")}{" "}
              <a
                href="mailto:awards@alayacare.com"
                className="text-[#1D5EED] font-semibold hover:underline"
              >
                awards@alayacare.com
              </a>{" "}
              {t("questionsSuffix")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
