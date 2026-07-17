"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Linkedin, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

const PRESS_RELEASE_URL =
  "https://alayacare.com/wp-content/uploads/2026/07/Celebrating-INSERT-YOUR-NAME-2026-Home-Based-Care-Momentum.docx";

const CATEGORY_HASHTAGS: Record<string, string> = {
  "Frontline Care": "FrontlineCare",
  "Operational Excellence": "OperationalExcellence",
  "Executive Leadership": "ExecutiveLeadership",
  "Impact and Innovation": "ImpactAndInnovation",
};

interface WinnerShareActionsProps {
  categoryName: string;
  /** English Airtable category value, used for hashtag mapping. */
  categoryKey: string;
  companyName: string | null;
}

export default function WinnerShareActions({
  categoryName,
  categoryKey,
  companyName,
}: WinnerShareActionsProps) {
  const t = useTranslations("ProfilePage.winnerShare");
  const [copied, setCopied] = useState(false);
  const [isCopyHovered, setIsCopyHovered] = useState(false);

  const company = companyName?.trim() || t("companyFallback");
  const categoryHashtag =
    CATEGORY_HASHTAGS[categoryKey] ||
    categoryKey.replace(/[^a-zA-Z0-9]+/g, "");

  const socialCopy = t("linkedinCaption", {
    category: categoryName,
    company,
    categoryHashtag,
  });

  const linkedInHref = useMemo(() => {
    return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(socialCopy)}`;
  }, [socialCopy]);

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(socialCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-[28px] bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff5ef] text-[#f37021]">
          <Trophy size={20} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D5EED]">
            {t("title")}
          </div>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-[#52607d]">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={PRESS_RELEASE_URL}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D5EED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#113cca]"
        >
          <Download size={16} />
          {t("downloadPressRelease")}
        </a>

        <a
          href={linkedInHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a66c2] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Linkedin size={16} />
          {t("shareOnLinkedIn")}
        </a>

        <button
          type="button"
          onClick={copyCaption}
          onMouseEnter={() => setIsCopyHovered(true)}
          onMouseLeave={() => setIsCopyHovered(false)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#08193e] px-5 py-3 text-sm font-semibold text-[#08193e] transition hover:bg-[#f4f6fb]"
        >
          <Copy size={16} />
          {copied ? t("copied") : t("copyCaption")}
        </button>
      </div>

      <blockquote
        className={`mt-6 rounded-[20px] border bg-[#f8faff] px-5 py-5 text-sm leading-relaxed text-[#52607d] whitespace-pre-line transition-colors md:text-base ${
          isCopyHovered ? "border-[#1D5EED]" : "border-[#dfe8ff]"
        }`}
      >
        {socialCopy}
      </blockquote>
    </section>
  );
}
