"use client";

import { useMemo, useState } from "react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import {
    CheckCircle2,
    CircleHelp,
    Globe,
    Link2,
    LoaderCircle,
    RotateCcw,
    Trash2,
    TriangleAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
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

    const hasChanges = JSON.stringify(normalizeState(formState)) !== JSON.stringify(normalizeState(savedState));
    const uploadcarePublicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "";

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
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-[#52607d]">{label}</label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={tooltip}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#7b88a8] transition hover:bg-[#eef3ff] hover:text-[#1D5EED] focus:outline-none focus:ring-2 focus:ring-[#1D5EED]/20"
                            >
                                <CircleHelp size={14} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                </div>
                <input
                    type="text"
                    value={value}
                    disabled
                    className={`${readOnlyInputClasses} ${extraClassName}`}
                />
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <section className="lg:col-span-4 rounded-[28px] bg-white p-8 shadow-[0_20px_50px_rgba(8,25,62,0.08)]">
                    <h2 className="mb-6 text-base font-semibold text-[#08193e]">{t("photoCard.title")}</h2>

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

                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-medium text-[#1D5EED]">
                        {t("photoCard.pendingSave")}
                    </div>

                    {uploadcarePublicKey ? (
                        <div className="w-full">
                            <FileUploaderRegular
                                sourceList="local, camera, facebook"
                                classNameUploader="uc-light"
                                pubkey={uploadcarePublicKey}
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

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setFormState((prev) => ({ ...prev, profilePhoto: null }));
                                setErrorMessage(null);
                                setSuccessMessage(null);
                            }}
                            disabled={!formState.profilePhoto}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#08193e] transition hover:bg-[#f4f6fb] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            {t("photoCard.removeButton")}
                        </button>
                    </div>

                    <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#52607d]">
                        {t("photoCard.help")}
                    </p>
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
                            {renderReadOnlyField(t("form.fields.nominationId"), profile.id, "font-mono")}
                            {renderReadOnlyField(t("form.fields.jobTitle"), profile.jobTitle || t("form.emptyValue"))}
                            {renderReadOnlyField(t("form.fields.companyName"), profile.companyName || t("form.emptyValue"))}

                            <div className="md:col-span-2">
                                {renderReadOnlyField(t("form.fields.category"), profile.category)}
                            </div>
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
        </TooltipProvider>
    );
}
