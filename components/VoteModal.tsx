"use client";

import React, { useState } from 'react';
import { Mail, X, Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { useTranslations } from 'next-intl';


interface VoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    nomineeName: string;
    onSubmit: (email: string, isHomeCare?: boolean, name?: string, organization?: string, jobTitle?: string) => Promise<void>;
    isChecking: boolean;
    errorMsg: string | null;
    voteCompleted: boolean;
}

export default function VoteModal({
    isOpen,
    onClose,
    nomineeName,
    onSubmit,
    isChecking,
    errorMsg,
    voteCompleted,
}: VoteModalProps) {
    const t = useTranslations('VoteModal');
    const [email, setEmail] = useState('');
    const [isHomeCare, setIsHomeCare] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [organization, setOrganization] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    if (!isOpen) return null;

    if (voteCompleted) {
        return (
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
                style={{ backgroundColor: 'rgba(0, 0, 12, 0.82)' }}
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Mail size={40} className="text-gray-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-[#08193e]">{t('verificationRequired')}</h3>
                    <p className="text-gray-600 mb-6">
                        {t('thankYou', { name: nomineeName })}
                    </p>
                    <button
                        onClick={() => {
                            setEmail('');
                            setIsHomeCare(false);
                            setFirstName('');
                            setLastName('');
                            setOrganization('');
                            setJobTitle('');
                            onClose();
                        }}
                        className="w-full px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-colors"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
            style={{ backgroundColor: 'rgba(0, 0, 12, 0.82)' }}
            onClick={() => {
                setEmail('');
                setIsHomeCare(false);
                setFirstName('');
                setLastName('');
                setOrganization('');
                setJobTitle('');
                onClose();
            }}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => {
                        setEmail('');
                        setIsHomeCare(false);
                        setFirstName('');
                        setLastName('');
                        setOrganization('');
                        setJobTitle('');
                        onClose();
                    }} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold mb-2 text-[#08193e]">{t('confirmVote')}</h3>
                <p className="text-gray-600 mb-6">
                    {t('votingFor', { name: nomineeName })}{' '}
                    {t('enterEmail')}
                </p>

                {errorMsg && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r flex items-start gap-3">
                        <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={20} />
                        <p className="text-amber-700 font-medium text-sm">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(email, isHomeCare, [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || undefined, organization, jobTitle); }}>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-700">{t('fields.email')}</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all"
                            placeholder={t('fields.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Industry Checkbox */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md border border-blue-100">
                            <input
                                type="checkbox"
                                id="industryCheckbox"
                                className="w-5 h-5 rounded text-[#1D5EED] focus:ring-[#1D5EED]"
                                checked={isHomeCare}
                                onChange={(e) => {
                                    setIsHomeCare(e.target.checked);
                                    if (!e.target.checked) {
                                        setFirstName('');
                                        setLastName('');
                                        setOrganization('');
                                        setJobTitle('');
                                    }
                                }}
                            />
                            <label htmlFor="industryCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                <Briefcase size={16} className="text-[#1d5eed]" />
                                {t('fields.industryCheckbox')}
                            </label>
                        </div>
                    </div>

                    {/* Name and Organization Fields */}
                    {isHomeCare && (
                        <>
                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">{t('fields.firstName')}</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder={t('fields.firstNamePlaceholder')}
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">{t('fields.lastName')}</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder={t('fields.lastNamePlaceholder')}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2 text-gray-700">{t('fields.organization')}</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder={t('fields.organizationPlaceholder')}
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Job Title Field */}
                    {isHomeCare && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2 text-gray-700">{t('fields.jobTitle')}</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                placeholder={t('fields.jobTitlePlaceholder')}
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isChecking || (isHomeCare && (!firstName.trim() || !lastName.trim() || !organization || !jobTitle))}
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> {t('verifying')}
                                </>
                            ) : (
                                t('submitVote')
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEmail('');
                                setIsHomeCare(false);
                                setFirstName('');
                                setLastName('');
                                setOrganization('');
                                setJobTitle('');
                                onClose();
                            }}
                            className="px-6 py-3 rounded-md font-semibold bg-white text-[#08193e] border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            disabled={isChecking}
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
