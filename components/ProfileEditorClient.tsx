"use client";

import { useEffect, useMemo, useState } from "react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import {
    CheckCircle2,
    Download,
    Globe,
    Link2,
    LockKeyhole,
    LoaderCircle,
    Mail,
    RotateCcw,
    Trash2,
    TriangleAlert,
    X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import NomineeImage from "@/components/NomineeImage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfileEditorClientProps {
    profile: {
        id: string;
        nomineeName: string;
        category: string;
        companyName: string;
        jobTitle: string;
        linkedInProfile: string;
        companyWebsite: string;
        profilePhoto: string | null;
        customVoteImage: string | null;
    };
}

interface EditableProfileState {
    linkedInProfile: string;
    companyWebsite: string;
    profilePhoto: string | null;
}

const editableInputClasses =
    "w-full rounded-xl border border-transparent bg-[#f3f6ff] px-4 py-3 text-sm text-[#08193e] outline-none transition focus:border-[#1D5EED]/20 focus:bg-white focus:ring-4 focus:ring-[#1D5EED]/10 placeholder:text-[#08193e]/35";

const readOnlyInputClasses =
    "w-full rounded-xl border border-transparent bg-[#e8eeff] px-4 py-3 text-sm text-[#08193e]/70 outline-none cursor-not-allowed";

const iconInputClasses =
    "absolute left-4 top-1/2 -translate-y-1/2 text-[#08193e]/30";

const readOnlyLockIconClasses =
    "absolute right-4 top-1/2 -translate-y-1/2 text-[#08193e]/10";

function normalizeState(state: EditableProfileState) {
    return {
        linkedInProfile: state.linkedInProfile.trim(),
        companyWebsite: state.companyWebsite.trim(),
        profilePhoto: state.profilePhoto || null,
    };
}

function getReadOnlyTooltip(t: ReturnType<typeof useTranslations>, fieldLabel: string) {
    return t("form.readOnlyTooltip", { field: fieldLabel });
}

export default function ProfileEditorClient({ profile }: ProfileEditorClientProps) {
    const t = useTranslations("ProfilePage");
    const locale = useLocale();
    const initialState = useMemo<EditableProfileState>(() => ({
        linkedInProfile: profile.linkedInProfile || "",
        companyWebsite: profile.companyWebsite || "",
        profilePhoto: profile.profilePhoto || null,
    }), [profile.companyWebsite, profile.linkedInProfile, profile.profilePhoto]);

    const [savedState, setSavedState] = useState<EditableProfileState>(initialState);
    const [formState, setFormState] = useState<EditableProfileState>(initialState);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSocialLightboxOpen, setIsSocialLightboxOpen] = useState(false);

    const hasChanges = JSON.stringify(normalizeState(formState)) !== JSON.stringify(normalizeState(savedState));
    const uploadcarePublicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "";
    const profileUpdateMailtoHref = useMemo(() => {
        const subject = `Profile update request for ${profile.nomineeName}`;
        return `mailto:awards@alayacare.com?subject=${encodeURIComponent(subject)}`;
    }, [profile.nomineeName]);
    const socialShareFilename = useMemo(() => {
        const normalizedName = profile.nomineeName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "nominee";

        const extension = profile.customVoteImage?.match(/\.([a-zA-Z0-9]+)(?:[?#].*)?$/)?.[1] || "png";

        return `${normalizedName}-social-share.${extension}`;
    }, [profile.customVoteImage, profile.nomineeName]);

    useEffect(() => {
        if (!isSocialLightboxOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsSocialLightboxOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isSocialLightboxOpen]);

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: profile.id,
                    linkedInProfile: formState.linkedInProfile,
                    companyWebsite: formState.companyWebsite,
                    profilePhotoUrl: formState.profilePhoto,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error || t("messages.saveError"));
            }

            const nextState = {
                linkedInProfile: payload.profile.linkedInProfile || "",
                companyWebsite: payload.profile.companyWebsite || "",
                profilePhoto: payload.profile.profilePhoto || null,
            };

            setSavedState(nextState);
            setFormState(nextState);
            setSuccessMessage(t("messages.saveSuccess"));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : t("messages.saveError"));
        } finally {
            setIsSaving(false);
        }
    }

    function handleDiscard() {
        setFormState(savedState);
        setErrorMessage(null);
        setSuccessMessage(null);
    }

    function renderReadOnlyField(label: string, value: string, extraClassName = "") {
        const tooltip = getReadOnlyTooltip(t, label);

        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#52607d]">{label}</label>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div tabIndex={0} className="rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D5EED]/20">
                            <div className="relative">
                                <LockKeyhole size={18} className={readOnlyLockIconClasses} />
                                <input
                                    type="text"
                                    value={value}
                                    disabled
                                    className={`${readOnlyInputClasses} pr-11 ${extraClassName}`}
                                />
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <section className="lg:col-span-4 rounded-[28px] bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
                    <div className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.24em] text-[#1D5EED]">
                        {t("photoCard.title")}
                    </div>

                <div className="flex flex-col items-center text-center">
                    <div className="group relative mb-5 h-44 w-44 overflow-hidden rounded-full border-4 border-[#dfe8ff] bg-[#f3f6ff] shadow-[0_14px_30px_rgba(8,25,62,0.08)]">
                        <NomineeImage
                            key={formState.profilePhoto || "nominee-placeholder"}
                            src={formState.profilePhoto}
                            alt={profile.nomineeName}
                            className="h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1D5EED]/15 opacity-0 transition group-hover:opacity-100" />
                    </div>

                    <div className="inline-flex items-center justify-center rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-medium text-[#1D5EED]">
                        {t("photoCard.pendingSave")}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        {uploadcarePublicKey ? (
                            <div>
                                <FileUploaderRegular
                                    sourceList="local, camera, facebook"
                                    classNameUploader="uc-light"
                                    pubkey={uploadcarePublicKey}
                                    imgOnly
                                    useCloudImageEditor
                                    cloudImageEditorAutoOpen
                                    cloudImageEditorTabs="crop"
                                    cropPreset="1:1"
                                    localeDefinitionOverride={{
                                        [locale]: {
                                            "upload-files": t("photoCard.uploadButton"),
                                            "upload-file": t("photoCard.uploadButton"),
                                        },
                                    }}
                                    onChange={(info) => {
                                        if (info.allEntries.length > 0 && info.allEntries[0].status === "success") {
                                            setFormState((prev) => ({
                                                ...prev,
                                                profilePhoto: info.allEntries[0].cdnUrl,
                                            }));
                                            setErrorMessage(null);
                                            setSuccessMessage(null);
                                        } else if (info.allEntries.length === 0) {
                                            setFormState((prev) => ({
                                                ...prev,
                                                profilePhoto: null,
                                            }));
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <p className="rounded-2xl bg-[#fff5ef] px-4 py-3 text-sm text-[#9a4e15]">
                                {t("photoCard.uploadUnavailable")}
                            </p>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormState((prev) => ({ ...prev, profilePhoto: null }));
                                        setErrorMessage(null);
                                        setSuccessMessage(null);
                                    }}
                                    disabled={!formState.profilePhoto}
                                    aria-label={t("photoCard.removeButton")}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#08193e] transition hover:bg-[#f4f6fb] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {t("photoCard.removeButton")}
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#52607d]">
                        {t("photoCard.help")}
                    </p>

                    {profile.customVoteImage ? (
                        <div className="mt-8 w-full rounded-[24px] border border-[#dfe8ff] bg-[#f8faff] p-5 text-left">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1D5EED]">
                                {t("socialCard.title")}
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[#52607d]">
                                {t("socialCard.description")}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsSocialLightboxOpen(true)}
                                className="mt-4 block w-full cursor-pointer overflow-hidden rounded-[18px] border border-[#dfe8ff] bg-white text-left shadow-[0_10px_25px_rgba(8,25,62,0.06)] transition hover:shadow-[0_14px_32px_rgba(8,25,62,0.1)] focus:outline-none focus:ring-4 focus:ring-[#1D5EED]/15"
                                aria-label={t("socialCard.openLightbox")}
                            >
                                <img
                                    src={profile.customVoteImage}
                                    alt={t("socialCard.imageAlt", { name: profile.nomineeName })}
                                    className="h-auto w-full object-contain"
                                />
                            </button>
                            <a
                                href={profile.customVoteImage}
                                download={socialShareFilename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1D5EED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#113cca]"
                            >
                                <Download size={16} />
                                {t("socialCard.downloadButton")}
                            </a>
                        </div>
                    ) : null}
                </div>
                </section>

                <section className="lg:col-span-8 rounded-[28px] bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
                    <div className="mb-8 text-sm font-semibold uppercase tracking-[0.24em] text-[#1D5EED]">
                        {t("form.readOnlyEyebrow")}
                    </div>

                {(errorMessage || successMessage) && (
                    <div
                        className={`mb-8 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                            errorMessage
                                ? "bg-[#fff3f1] text-[#9d3329]"
                                : "bg-[#eefbf4] text-[#176a3a]"
                        }`}
                    >
                        {errorMessage ? <TriangleAlert size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
                        <span>{errorMessage || successMessage}</span>
                    </div>
                )}

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                            {renderReadOnlyField(t("form.fields.fullName"), profile.nomineeName)}
                            {renderReadOnlyField(t("form.fields.category"), profile.category)}
                            {renderReadOnlyField(t("form.fields.jobTitle"), profile.jobTitle || t("form.emptyValue"))}
                            {renderReadOnlyField(t("form.fields.companyName"), profile.companyName || t("form.emptyValue"))}
                        </div>

                        <div className="h-px bg-[#d7def2]" />

                        <div>
                            <div className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#1D5EED]">
                                {t("form.editableEyebrow")}
                            </div>

                        <div className="grid grid-cols-1 gap-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#52607d]">{t("form.fields.linkedInProfile")}</label>
                                <div className="relative">
                                    <Link2 size={18} className={iconInputClasses} />
                                    <input
                                        type="url"
                                        value={formState.linkedInProfile}
                                        onChange={(event) => {
                                            setFormState((prev) => ({ ...prev, linkedInProfile: event.target.value }));
                                            setErrorMessage(null);
                                            setSuccessMessage(null);
                                        }}
                                        placeholder={t("form.placeholders.linkedInProfile")}
                                        className={`${editableInputClasses} pl-11`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-[#52607d]">{t("form.fields.companyWebsite")}</label>
                                <div className="relative">
                                    <Globe size={18} className={iconInputClasses} />
                                    <input
                                        type="url"
                                        value={formState.companyWebsite}
                                        onChange={(event) => {
                                            setFormState((prev) => ({ ...prev, companyWebsite: event.target.value }));
                                            setErrorMessage(null);
                                            setSuccessMessage(null);
                                        }}
                                        placeholder={t("form.placeholders.companyWebsite")}
                                        className={`${editableInputClasses} pl-11`}
                                    />
                                </div>
                            </div>
                        </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-[#d7def2] pt-6 sm:flex-row sm:items-center sm:justify-end">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a
                                        href={profileUpdateMailtoHref}
                                        className="inline-flex items-center justify-center rounded-full px-4 py-3 text-[#1D5EED] transition hover:bg-[#eef3ff] sm:mr-auto"
                                        aria-label={t("actions.emailTooltip")}
                                    >
                                        <Mail size={18} />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {t("actions.emailTooltip")}
                                </TooltipContent>
                            </Tooltip>
                            <button
                                type="button"
                                onClick={handleDiscard}
                                disabled={!hasChanges || isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#1D5EED] transition hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RotateCcw size={16} />
                                {t("actions.discard")}
                            </button>

                            <button
                                type="submit"
                                disabled={!hasChanges || isSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0046c3] to-[#1D5EED] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_30px_rgba(29,94,237,0.22)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                            >
                                {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {isSaving ? t("actions.saving") : t("actions.save")}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
            {profile.customVoteImage && isSocialLightboxOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#08193e]/85 p-4 sm:p-8"
                    onClick={() => setIsSocialLightboxOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("socialCard.title")}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_30px_80px_rgba(8,25,62,0.35)] sm:p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setIsSocialLightboxOpen(false)}
                            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#08193e] transition hover:bg-[#eef3ff] focus:outline-none focus:ring-4 focus:ring-[#1D5EED]/15"
                            aria-label={t("socialCard.closeLightbox")}
                        >
                            <X size={18} />
                        </button>
                        <div className="overflow-auto rounded-[20px] border border-[#dfe8ff] bg-[#f8faff] p-2 sm:p-4">
                            <img
                                src={profile.customVoteImage}
                                alt={t("socialCard.imageAlt", { name: profile.nomineeName })}
                                className="mx-auto max-h-[70vh] h-auto w-full object-contain"
                            />
                        </div>
                        <div className="mt-4 flex justify-center">
                            <a
                                href={profile.customVoteImage}
                                download={socialShareFilename}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[#1D5EED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#113cca]"
                            >
                                <Download size={16} />
                                {t("socialCard.downloadButton")}
                            </a>
                        </div>
                    </div>
                </div>
            ) : null}
        </TooltipProvider>
    );
}
