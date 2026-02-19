"use client";

import { useMemo, useState } from "react";
import { Copy, Facebook, Instagram, Linkedin } from "lucide-react";

const AWARDS_URL = "https://awards.alayacare.com/";
const SOCIAL_COPY = `I’m excited to be nominated for the 2026 Home-Based Care Momentum Awards presented by AlayaCare, recognizing leaders moving our industry forward! 🎉 Public voting starts May 1 — stay tuned to cast your vote!
Learn more about the awards: ${AWARDS_URL}
#MomentumAwards2026`;

interface NominationAcceptanceShareProps {
  customImageUrl?: string | null;
  nomineeName?: string | null;
}

export default function NominationAcceptanceShare({
  customImageUrl = null,
  nomineeName = null,
}: NominationAcceptanceShareProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = useMemo(() => {
    const encodedMessage = encodeURIComponent(SOCIAL_COPY);
    const encodedUrl = encodeURIComponent(AWARDS_URL);

    return {
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      instagram: "https://www.instagram.com/",
    };
  }, []);

  const copySocialText = async () => {
    try {
      await navigator.clipboard.writeText(SOCIAL_COPY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
      <h3 className="text-xl font-bold text-[#08193e] mb-3">Share the good news on social media</h3>

      {customImageUrl && (
        <>
          <div className="max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <img
              src={customImageUrl}
              alt={`${nomineeName || "Nominee"} nomination image`}
              className="w-full h-auto object-contain"
            />
          </div>
          <a
            href={customImageUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center rounded-md bg-[#1D5EED] px-4 py-2 text-white font-semibold hover:bg-[#113CCA] transition-colors"
          >
            Download image
          </a>
        </>
      )}

      <blockquote className="mt-4 rounded-lg border border-blue-100 bg-white p-4 text-gray-700 leading-relaxed whitespace-pre-line">
        &ldquo;{SOCIAL_COPY}&rdquo;
      </blockquote>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-[#0a66c2] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Linkedin size={18} />
          Share on LinkedIn
        </a>

        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-[#1877f2] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Facebook size={18} />
          Share on Facebook
        </a>

        <a
          href={shareLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={copySocialText}
          className="inline-flex items-center gap-2 rounded-md bg-[#d62976] px-4 py-2 text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Instagram size={18} />
          Open Instagram
        </a>

        <button
          type="button"
          onClick={copySocialText}
          className="inline-flex items-center gap-2 rounded-md border border-[#08193e] px-4 py-2 font-semibold text-[#08193e] hover:bg-white transition-colors"
        >
          <Copy size={18} />
          {copied ? "Copied!" : "Copy post text"}
        </button>
      </div>

    </div>
  );
}
