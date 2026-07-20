"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Linkedin, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

const PRESS_RELEASE_URL_EN =
  "https://alayacare.com/wp-content/uploads/2026/07/Celebrating-INSERT-YOUR-NAME-2026-Home-Based-Care-Momentum.docx";
const PRESS_RELEASE_URL_FR =
  "https://alayacare.com/wp-content/uploads/2026/07/FR-press-release-template.docx";

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
  customVoteImage?: string | null;
  nomineeName?: string;
  socialShareFilename?: string;
  onOpenLightbox?: () => void;
}

export default function WinnerShareActions({
  categoryName,
  categoryKey,
  companyName,
  customVoteImage = null,
  nomineeName = "",
  socialShareFilename,
  onOpenLightbox,
}: WinnerShareActionsProps) {
  const t = useTranslations("ProfilePage.winnerShare");
  const tSocial = useTranslations("ProfilePage.socialCard");
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

  const hasSocialImage = Boolean(customVoteImage);

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

      <div
        className={`mt-8 grid grid-cols-1 gap-6 ${
          hasSocialImage ? "lg:grid-cols-2 lg:gap-8" : ""
        }`}
      >
        {hasSocialImage && customVoteImage ? (
          <div className="flex flex-col rounded-[20px] border border-[#dfe8ff] bg-[#f8faff] p-5">
            <div className="text-sm font-semibold leading-snug text-[#1D5EED]">
              {tSocial("title")}
            </div>
            <button
              type="button"
              onClick={onOpenLightbox}
              className="mt-4 block w-full flex-1 cursor-pointer overflow-hidden rounded-[18px] border border-[#dfe8ff] bg-white text-left shadow-[0_10px_25px_rgba(8,25,62,0.06)] transition hover:shadow-[0_14px_32px_rgba(8,25,62,0.1)] focus:outline-none focus:ring-4 focus:ring-[#1D5EED]/15"
              aria-label={tSocial("openLightbox")}
            >
              <img
                src={customVoteImage}
                alt={tSocial("imageAlt", { name: nomineeName })}
                className="h-auto w-full object-contain"
              />
            </button>
            <a
              href={customVoteImage}
              download={socialShareFilename}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#1D5EED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#113cca]"
            >
              <Download size={16} />
              {tSocial("downloadButton")}
            </a>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-col">
          <blockquote
            className={`flex-1 rounded-[20px] border bg-[#f8faff] px-5 py-5 text-sm leading-relaxed text-[#52607d] whitespace-pre-line transition-colors md:text-base ${
              isCopyHovered ? "border-[#1D5EED]" : "border-[#dfe8ff]"
            }`}
          >
            {socialCopy}
          </blockquote>
          <p className="mt-3 text-xs leading-relaxed text-[#52607d]/80">
            {t("captionFootnote")}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-[#dfe8ff] pt-8">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D5EED]">
          {t("pressReleaseHeading")}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={PRESS_RELEASE_URL_EN}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D5EED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#113cca]"
          >
            <Download size={16} />
            {t("downloadPressReleaseEn")}
          </a>
          <a
            href={PRESS_RELEASE_URL_FR}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1D5EED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#113cca]"
          >
            <Download size={16} />
            {t("downloadPressReleaseFr")}
          </a>
        </div>
      </div>
    </section>
  );
}
