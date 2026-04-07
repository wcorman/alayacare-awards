"use client";

import React, { useState, useMemo } from "react";
import { Award, Heart, Briefcase, Sparkles, Medal, Trophy } from "lucide-react";
import { Nominee } from "@/lib/airtable";
import { nomineeDetailPath } from "@/lib/nomineeLocaleLink";
import { useTranslations } from "next-intl";
import Link from "next/link";

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  "Frontline Care": { icon: Heart, color: "#f37021" },
  "Operational Excellence": { icon: Award, color: "#113cca" },
  "Executive Leadership": { icon: Briefcase, color: "#ffaa05" },
  "Impact and Innovation": { icon: Sparkles, color: "#08193e" },
};

const PODIUM_ORDER = [2, 1, 3] as const; // Left: 2nd, Center: 1st, Right: 3rd

interface ResultsPodiumClientProps {
  nominees: Nominee[];
}

function getTopThreeByCategory(nominees: Nominee[]): Record<string, Nominee[]> {
  const byCategory: Record<string, Nominee[]> = {};
  for (const n of nominees) {
    if (!n.category) continue;
    if (!byCategory[n.category]) byCategory[n.category] = [];
    byCategory[n.category].push(n);
  }
  const result: Record<string, Nominee[]> = {};
  for (const [cat, list] of Object.entries(byCategory)) {
    result[cat] = list
      .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
      .slice(0, 3);
  }
  return result;
}

function PrizeBadge({ rank }: { rank: 1 | 2 | 3 }) {
  const config = {
    1: { bg: "bg-amber-400", icon: Trophy, label: "1st" },
    2: { bg: "bg-slate-300", icon: Medal, label: "2nd" },
    3: { bg: "bg-amber-700", icon: Medal, label: "3rd" },
  }[rank];
  const Icon = config.icon;
  return (
    <div
      className={`${config.bg} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg`}
      title={`${config.label} place`}
    >
      <Icon size={20} strokeWidth={2.5} />
    </div>
  );
}

function PodiumCard({
  nominee,
  rank,
  categoryColor,
  index,
}: {
  nominee: Nominee;
  rank: 1 | 2 | 3;
  categoryColor: string;
  index: number;
}) {
  const t = useTranslations("Results");
  const [imageUrl, setImageUrl] = useState(nominee.image);
  const handleImageError = () => {
    setImageUrl("/nominee-placeholder.webp");
  };

  const heightClass =
    rank === 1 ? "h-[220px]" : rank === 2 ? "h-[180px]" : "h-[140px]";
  const detailHref = nomineeDetailPath(nominee);

  return (
    <div
      className="flex flex-col items-center gap-3 animate-podium-entry"
      style={{
        animationDelay: `${index * 120}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Avatar + badge */}
      <div className="relative">
        <Link
          href={detailHref}
          className="block rounded-full overflow-hidden border-4 shadow-xl ring-2 ring-white/50 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ borderColor: categoryColor }}
        >
          <img
            src={imageUrl || "/nominee-placeholder.webp"}
            alt={nominee.name}
            className="w-20 h-20 object-cover"
            onError={handleImageError}
          />
        </Link>
        <div className="absolute -bottom-1 -right-1">
          <PrizeBadge rank={rank} />
        </div>
      </div>

      {/* Name */}
      <Link
        href={detailHref}
        className="text-center font-bold text-[#08193e] hover:text-[#1D5EED] transition-colors line-clamp-2 max-w-[140px]"
      >
        {nominee.name}
      </Link>

      {/* Votes */}
      <div className="text-sm font-semibold text-gray-600">
        {nominee.votes} {nominee.votes === 1 ? t("vote") : t("votes")}
      </div>

      {/* Podium block */}
      <div
        className={`w-full ${heightClass} rounded-t-xl flex items-center justify-center transition-all duration-500`}
        style={{
          backgroundColor: categoryColor,
          boxShadow: `0 -4px 14px ${categoryColor}40`,
        }}
      >
        <span className="text-white font-bold text-5xl drop-shadow-md">
          #{rank}
        </span>
      </div>
    </div>
  );
}

export default function ResultsPodiumClient({ nominees }: ResultsPodiumClientProps) {
  const t = useTranslations("Results");
  const tHome = useTranslations("Home");

  const topByCategory = useMemo(() => getTopThreeByCategory(nominees), [nominees]);

  const categories = useMemo(() => {
    return Object.keys(topByCategory).sort();
  }, [topByCategory]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0] ?? null
  );

  const winners = selectedCategory ? topByCategory[selectedCategory] ?? [] : [];
  const categoryInfo =
    selectedCategory && CATEGORY_CONFIG[selectedCategory]
      ? CATEGORY_CONFIG[selectedCategory]
      : { icon: Award, color: "#6b7280" };
  const IconComponent = categoryInfo.icon;

  const getTranslatedCategory = (cat: string) => {
    if (cat === "Frontline Care") return tHome("categories.frontline.name");
    if (cat === "Operational Excellence") return tHome("categories.operational.name");
    if (cat === "Executive Leadership") return tHome("categories.executive.name");
    if (cat === "Impact and Innovation") return tHome("categories.impact.name");
    return cat;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
      <style>{`
        @keyframes podiumEntry {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-podium-entry {
          animation: podiumEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#08193e] mb-3">{t("title")}</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
      </div>

      {/* Category toggles */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const info = CATEGORY_CONFIG[cat] || { icon: Award, color: "#6b7280" };
            const ActiveIcon = info.icon;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                  flex items-center gap-2
                  ${
                    isActive
                      ? "text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }
                `}
                style={
                  isActive
                    ? { backgroundColor: info.color }
                    : undefined
                }
              >
                <ActiveIcon size={18} />
                {getTranslatedCategory(cat)}
              </button>
            );
          })}
        </div>
      )}

      {/* Podium */}
      {selectedCategory && (
        <div
          key={selectedCategory}
          className="animate-podium-entry"
          style={{ animationDelay: "0ms" }}
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <IconComponent size={24} style={{ color: categoryInfo.color }} />
            <h2 className="text-xl font-bold text-[#08193e]">
              {getTranslatedCategory(selectedCategory)}
            </h2>
          </div>

          {winners.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">{t("noWinners")}</h3>
              <p className="text-gray-500 mt-2">{t("noWinnersSubtitle")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 md:gap-8 items-end">
              {PODIUM_ORDER.map((rank, idx) => {
                const nominee = winners[rank - 1];
                if (!nominee)
                  return (
                    <div key={rank} className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        —
                      </div>
                      <div className="h-[140px] w-full rounded-t-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 font-bold text-5xl">#{rank}</span>
                      </div>
                    </div>
                  );
                return (
                  <PodiumCard
                    key={nominee.id}
                    nominee={nominee}
                    rank={rank}
                    categoryColor={categoryInfo.color}
                    index={idx}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">{t("noResults")}</h3>
          <p className="text-gray-500 mt-2">{t("noResultsSubtitle")}</p>
        </div>
      )}
    </div>
  );
}
