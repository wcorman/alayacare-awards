"use client";

import { useMemo, useState } from "react";
import { Copy, Facebook, Instagram, Linkedin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const AWARDS_URL = "https://awards.alayacare.com/";
const FALLBACK_NOMINATION_IMAGE_URL =
  "https://2702101.fs1.hubspotusercontent-na1.net/hubfs/2702101/Ive%20been%20nominated%20for%20the%20Momentum%20Awards!.png";
const FALLBACK_NOMINATION_IMAGE_URL_FR =
  "https://2702101.fs1.hubspotusercontent-na1.net/hubfs/2702101/Momentum-nomination-acceptance-fr.png";

interface NominationAcceptanceShareProps {
  customImageUrl?: string | null;
  nomineeName?: string | null;
}

export default function NominationAcceptanceShare({
  customImageUrl = null,
  nomineeName = null,
}: NominationAcceptanceShareProps) {
  const t = useTranslations("NominationAcceptance.share");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [isCopyButtonHovered, setIsCopyButtonHovered] = useState(false);
  const fallbackImageUrl =
    locale === "fr" ? FALLBACK_NOMINATION_IMAGE_URL_FR : FALLBACK_NOMINATION_IMAGE_URL;
  const imageUrlToUse = customImageUrl || fallbackImageUrl;
  const socialCopy = t("socialCopy");

  const shareLinks = useMemo(() => {
    const encodedMessage = encodeURIComponent(socialCopy);
    const encodedUrl = encodeURIComponent(AWARDS_URL);

    return {
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      instagram: "https://www.instagram.com/",
    };
  }, [socialCopy]);

  const copySocialText = async () => {
    try {
      await navigator.clipboard.writeText(socialCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
      <h3 className="text-xl font-bold text-[#08193e] mb-3">{t("title")}</h3>

      <>
        <div className="max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <img
            src={imageUrlToUse}
            alt={t("imageAlt", { name: nomineeName || t("fallbackName") })}
            className="w-full h-auto object-contain"
          />
        </div>
        <a
          href={imageUrlToUse}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center rounded-md bg-[#1D5EED] px-4 py-2 text-white font-semibold hover:bg-[#113CCA] transition-colors"
        >
          {t("downloadImage")}
        </a>
      </>

      <blockquote
        className={`relative mt-4 rounded-lg border bg-white px-8 py-6 text-gray-700 leading-relaxed whitespace-pre-line transition-colors ${
          isCopyButtonHovered ? "border-[#1D5EED]" : "border-blue-100"
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1 select-none text-5xl leading-none text-blue-200/70"
        >
          &ldquo;
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1 select-none text-5xl leading-none text-blue-200/70"
        >
          &rdquo;
        </span>
        {socialCopy}
      </blockquote>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-[#0a66c2] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Linkedin size={18} />
          {t("shareOnLinkedIn")}
        </a>

        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-[#1877f2] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Facebook size={18} />
          {t("shareOnFacebook")}
        </a>

        <a
          href={shareLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={copySocialText}
          className="inline-flex items-center gap-2 rounded-md bg-[#d62976] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Instagram size={18} />
          {t("openInstagram")}
        </a>

        <button
          type="button"
          onClick={copySocialText}
          onMouseEnter={() => setIsCopyButtonHovered(true)}
          onMouseLeave={() => setIsCopyButtonHovered(false)}
          className="inline-flex items-center gap-2 rounded-md border border-[#08193e] px-4 py-2 font-semibold text-[#08193e] hover:bg-white transition-colors"
        >
          <Copy size={18} />
          {copied ? t("copied") : t("copyPostText")}
        </button>
      </div>

    </div>
  );
}
