"use client";

import React, { useState, useMemo } from "react";
import { Award, Heart, Briefcase, Sparkles } from "lucide-react";
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

const CATEGORY_ORDER = [
  "Frontline Care",
  "Operational Excellence",
  "Executive Leadership",
  "Impact and Innovation",
];

interface ResultsPodiumClientProps {
  nominees: Nominee[];
}

function getWinnersByCategory(nominees: Nominee[]): Record<string, Nominee[]> {
  const byCategory: Record<string, Nominee[]> = {};
  for (const n of nominees) {
    if (!n.category) continue;
    if (!byCategory[n.category]) byCategory[n.category] = [];
    byCategory[n.category].push(n);
  }
  const result: Record<string, Nominee[]> = {};
  for (const [cat, list] of Object.entries(byCategory)) {
    result[cat] = [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }
  return result;
}

function WinnerRow({
  nominee,
  categoryColor,
  index,
}: {
  nominee: Nominee;
  categoryColor: string;
  index: number;
}) {
  const [imageUrl, setImageUrl] = useState(nominee.image);
  const detailHref = nomineeDetailPath(nominee);

  return (
    <Link
      href={detailHref}
      className="group animate-winner-entry flex items-center gap-4 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "both",
      }}
    >
      <div
        className="relative shrink-0 rounded-full overflow-hidden border-2 w-14 h-14"
        style={{ borderColor: categoryColor }}
      >
        <img
          src={imageUrl || "/nominee-placeholder.webp"}
          alt={nominee.name}
          className="w-full h-full object-cover"
          onError={() => setImageUrl("/nominee-placeholder.webp")}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-[#08193e] group-hover:text-[#1D5EED] transition-colors truncate">
          {nominee.name}
        </h3>
        {(nominee.jobTitle || nominee.organization) && (
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {[nominee.jobTitle, nominee.organization].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function ResultsPodiumClient({ nominees }: ResultsPodiumClientProps) {
  const t = useTranslations("Results");
  const tHome = useTranslations("Home");

  const winnersByCategory = useMemo(() => getWinnersByCategory(nominees), [nominees]);

  const categories = useMemo(() => {
    const present = Object.keys(winnersByCategory);
    return [
      ...CATEGORY_ORDER.filter((cat) => present.includes(cat)),
      ...present.filter((cat) => !CATEGORY_ORDER.includes(cat)).sort(),
    ];
  }, [winnersByCategory]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0] ?? null
  );

  const winners = selectedCategory ? winnersByCategory[selectedCategory] ?? [] : [];
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
        @keyframes winnerEntry {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-winner-entry {
          animation: winnerEntry 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#08193e] mb-3">{t("title")}</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
      </div>

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
                style={isActive ? { backgroundColor: info.color } : undefined}
              >
                <ActiveIcon size={18} />
                {getTranslatedCategory(cat)}
              </button>
            );
          })}
        </div>
      )}

      {selectedCategory && (
        <div key={selectedCategory} className="animate-winner-entry">
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
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
              {winners.map((nominee, index) => (
                <li key={nominee.id}>
                  <WinnerRow
                    nominee={nominee}
                    categoryColor={categoryInfo.color}
                    index={index}
                  />
                </li>
              ))}
            </ul>
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
