import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CircleAlert, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ProfileEditorClient from "@/components/ProfileEditorClient";
import { fetchNomineeProfileEditorDataById } from "@/lib/airtable";
import { redirectIfNomineeLocaleMismatch } from "@/lib/redirectNomineeLocale";

export const metadata: Metadata = {
    title: "Nominee Profile | Home-Based Care Momentum Awards",
    description: "Nominee profile settings for the Home-Based Care Momentum Awards.",
    robots: {
        index: false,
        follow: false,
    },
};

export const dynamic = "force-dynamic";

interface ProfilePageProps {
    searchParams?: Promise<{ id?: string | string[] }>;
}

const CATEGORY_CONFIG = {
    "Frontline Care": { iconPath: "/frontline-care.png", color: "#f37021" },
    "Operational Excellence": { iconPath: "/operational-excellence.png", color: "#113cca" },
    "Executive Leadership": { iconPath: "/executive-leadership.png", color: "#ffaa05" },
    "Impact and Innovation": { iconPath: "/Impact-and-innovation.png", color: "#08193e" },
} as const;

function translateCategory(category: string, tHome: Awaited<ReturnType<typeof getTranslations>>) {
    return category === "Frontline Care" ? tHome("categories.frontline.name") :
        category === "Operational Excellence" ? tHome("categories.operational.name") :
            category === "Executive Leadership" ? tHome("categories.executive.name") :
                category === "Impact and Innovation" ? tHome("categories.impact.name") :
                    category;
}

function EmptyState({
    title,
    description,
    cta,
}: {
    title: string;
    description: string;
    cta: string;
}) {
    return (
        <div className="rounded-[28px] bg-white p-10 text-center shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3ff] text-[#1D5EED]">
                <CircleAlert size={26} />
            </div>
            <h2 className="text-2xl font-bold text-[#08193e]">{title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#52607d]">{description}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0046c3] to-[#1D5EED] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(29,94,237,0.2)] transition hover:scale-[1.01]"
                >
                    {cta}
                </Link>
                <a
                    href="mailto:awards@alayacare.com"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#08193e] transition hover:bg-[#eef3ff]"
                >
                    <Mail size={16} />
                    awards@alayacare.com
                </a>
            </div>
        </div>
    );
}

function MissingIdSkeleton({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
    const fieldLabels = [
        t("form.fields.fullName"),
        t("form.fields.nominationId"),
        t("form.fields.jobTitle"),
        t("form.fields.companyName"),
        t("form.fields.category"),
        t("form.fields.linkedInProfile"),
        t("form.fields.companyWebsite"),
    ];

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <section className="lg:col-span-4 rounded-[28px] bg-white p-8 shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
                <h2 className="mb-6 text-base font-semibold text-[#08193e]">{t("photoCard.title")}</h2>

                <div className="flex flex-col items-center text-center">
                    <div className="mb-5 h-44 w-44 animate-pulse rounded-full border-4 border-[#dfe8ff] bg-[#edf2ff]" />
                    <div className="mb-3 h-8 w-48 animate-pulse rounded-full bg-[#eef3ff]" />
                    <div className="h-4 w-56 animate-pulse rounded-full bg-[#f3f6ff]" />
                    <div className="mt-2 h-4 w-44 animate-pulse rounded-full bg-[#f3f6ff]" />
                </div>
            </section>

            <section className="lg:col-span-8 rounded-[28px] bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
                <div className="mb-8 rounded-2xl bg-[#eef3ff] px-5 py-4 text-[#08193e]">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1D5EED] shadow-sm">
                            <Mail size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{t("empty.missingIdTitle")}</h2>
                            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#52607d]">
                                {t("empty.missingIdDescription")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#1D5EED]">
                        {t("form.readOnlyEyebrow")}
                    </div>
                    <p className="max-w-2xl text-sm leading-relaxed text-[#52607d]">
                        {t("empty.skeletonDescription")}
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                        {fieldLabels.slice(0, 4).map((label) => (
                            <div key={label} className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#52607d]">{label}</label>
                                <div className="h-12 animate-pulse rounded-xl bg-[#eef3ff]" />
                            </div>
                        ))}

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-medium text-[#52607d]">{fieldLabels[4]}</label>
                            <div className="h-12 animate-pulse rounded-xl bg-[#eef3ff]" />
                        </div>
                    </div>

                    <div className="h-px bg-[#d7def2]" />

                    <div>
                        <div className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#1D5EED]">
                            {t("form.editableEyebrow")}
                        </div>

                        <div className="grid grid-cols-1 gap-y-6">
                            {fieldLabels.slice(5).map((label) => (
                                <div key={label} className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#52607d]">{label}</label>
                                    <div className="h-12 animate-pulse rounded-xl bg-[#f3f6ff]" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[#d7def2] pt-6 sm:flex-row sm:items-center sm:justify-end">
                        <div className="h-11 w-28 animate-pulse rounded-full bg-[#eef3ff]" />
                        <div className="h-11 w-36 animate-pulse rounded-full bg-[#dfe8ff]" />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
    const t = await getTranslations("ProfilePage");
    const tHome = await getTranslations("Home");
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const idParam = resolvedSearchParams?.id;
    const recordId = Array.isArray(idParam) ? idParam[0] : idParam;

    const profile = recordId
        ? await fetchNomineeProfileEditorDataById(recordId)
        : null;

    if (profile && recordId) {
        await redirectIfNomineeLocaleMismatch(
            profile.languagePreference,
            `/profile?id=${encodeURIComponent(recordId)}`
        );
    }

    const localizedProfile = profile
        ? {
            ...profile,
            category: translateCategory(profile.category, tHome),
        }
        : null;
    const categoryInfo = profile ? (CATEGORY_CONFIG[profile.category as keyof typeof CATEGORY_CONFIG] || null) : null;
    const eyebrowText = localizedProfile?.nomineeName || t("eyebrow");

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fbfcff_35%,#f7f9fc_100%)] text-slate-800">
            <section
                className="relative overflow-hidden px-6 pb-24 pt-16 text-white lg:px-12"
                style={{ background: "linear-gradient(135deg, #08193e 0%, #113cca 100%)" }}
            >
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-bl-full bg-white opacity-5" />
                <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-tr-full bg-[#f37021] opacity-10" />
                {categoryInfo?.iconPath && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-8 md:flex lg:pr-16">
                        <div
                            className="relative h-[260px] w-[260px] opacity-[0.16]"
                            style={{ filter: "saturate(0.9) brightness(1.05)" }}
                        >
                            <Image
                                src={categoryInfo.iconPath}
                                alt=""
                                fill
                                sizes="260px"
                                className="object-contain"
                            />
                        </div>
                    </div>
                )}

                <div className="relative z-10 mx-auto max-w-6xl">
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium">{t("backToHome")}</span>
                    </Link>

                    <div className="max-w-3xl">
                        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
                            {eyebrowText}
                        </div>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                            {t("title")}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
                            {t("description")}
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-6 pb-16 pt-12 lg:px-12">
                <div className="mx-auto max-w-6xl">
                    {!recordId ? (
                        <MissingIdSkeleton t={t} />
                    ) : localizedProfile ? (
                        <ProfileEditorClient profile={localizedProfile} />
                    ) : (
                        <EmptyState
                            title={t("empty.invalidIdTitle")}
                            description={t("empty.invalidIdDescription")}
                            cta={t("empty.backHome")}
                        />
                    )}
                </div>
            </section>
        </main>
    );
}
