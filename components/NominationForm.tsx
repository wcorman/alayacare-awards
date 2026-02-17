"use client";

import React, { useState, useEffect } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader/next';
import '@uploadcare/react-uploader/core.css';
import { User, Users, ChevronRight, Upload, Check, Briefcase, AlertCircle, Loader2, UserPlus, Heart, Award, Sparkles, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const THEME = {
    colors: {
        deepBlue: '#08193e',
        logoOrange: '#f37021',
        lightBlue: '#1d5eed',
        grey: '#dadadf',
    },
};

// Canonical English values must match Airtable's Category single-select options exactly.
const CATEGORIES = [
    { id: 'frontline', nameKey: 'categories.frontline.name', value: 'Frontline Care', color: '#f37021', icon: Heart },
    { id: 'operational', nameKey: 'categories.operational.name', value: 'Operational Excellence', color: '#113cca', icon: Award },
    { id: 'executive', nameKey: 'categories.executive.name', value: 'Executive Leadership', color: '#ffaa05', icon: Briefcase },
    { id: 'impact', nameKey: 'categories.impact.name', value: 'Impact and Innovation', color: '#08193e', icon: Sparkles },
];


export default function NominationForm() {
    const router = useRouter();
    const t = useTranslations('NominationForm');
    const locale = useLocale();
    const tHome = useTranslations('Home');
    const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
    const [nominationType, setNominationType] = useState<'self' | 'other'>('other');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showTermsConfirm, setShowTermsConfirm] = useState(false);

    const [formData, setFormData] = useState({
        nomineeFirstName: '',
        nomineeLastName: '',
        nomineeEmail: '',
        category: 'Frontline Care',
        description: '',
        email: '', // Nominator email
        profileImage: null as string | null,
        isHomeCare: false,
        nominatorFirstName: '', // Nominator first name
        nominatorLastName: '', // Nominator last name
        nominatorOrganization: '', // Nominator organization
        nominatorJobTitle: '', // Nominator job title
        organization: '', // Nominee organization
        jobTitle: '', // Nominee job title
        agreedToTerms: false,
    });

    const handleTypeSelect = (type: 'self' | 'other') => {
        setNominationType(type);
        setStep('form');
    };

    useEffect(() => {
        if (!showTermsConfirm) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowTermsConfirm(false);
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [showTermsConfirm]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreedToTerms) return;
        setErrorMsg(null);
        setIsSubmitting(true);

        try {
            const nominatorEmail = nominationType === 'self' ? formData.nomineeEmail : formData.email;

            const language = locale === 'fr' ? 'French' : 'English';

            const res = await fetch('/api/nominate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nominatorEmail,
                    nomineeFirstName: formData.nomineeFirstName,
                    nomineeLastName: formData.nomineeLastName,
                    nomineeEmail: formData.nomineeEmail,
                    description: formData.description,
                    category: formData.category,
                    imageUrl: formData.profileImage,
                    jobTitle: formData.jobTitle || '',
                    organization: formData.organization || '',
                    nominatorFirstName: formData.nominatorFirstName || '',
                    nominatorLastName: formData.nominatorLastName || '',
                    nominatorOrganization: formData.nominatorOrganization || '',
                    nominatorJobTitle: formData.nominatorJobTitle || '',
                    isHomeCare: nominationType === 'other' ? formData.isHomeCare : false,
                    language
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setStep('success');
            } else {
                if (data.reason === 'duplicate_nominee') {
                    setErrorMsg(t('errors.duplicate'));
                } else {
                    // Show the actual error message if available
                    const errorMsg = data.error || t('errors.generic');
                    console.error("Nomination API Error:", data);
                    setErrorMsg(errorMsg);
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(t('errors.network'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSelf = nominationType === 'self';

    if (step === 'type') {
        return (
            <div className="py-8 px-6 lg:px-12 bg-gray-50 min-h-screen flex flex-col items-center">
                <div className="max-w-4xl w-full text-center">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-[#1D5EED] mb-6 font-medium mx-0">
                        <ChevronRight className="rotate-180" size={20} /> {t('backToHome')}
                    </button>

                    <h2 className="text-3xl font-bold mb-3" style={{ color: THEME.colors.deepBlue }}>{t('typeSelection.title')}</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        {t('typeSelection.description')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {/* Self */}
                        <div
                            onClick={() => handleTypeSelect('self')}
                            className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:border-2 border-transparent hover:border-[#1D5EED] transition-all group h-full flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <User size={48} className="text-[#1D5EED]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: THEME.colors.deepBlue }}>{t('typeSelection.myself.title')}</h3>
                            <p className="text-gray-600">{t('typeSelection.myself.description')}</p>
                            <div className="mt-8">
                                <span className="text-[#1D5EED] font-bold group-hover:underline flex items-center gap-2">
                                    {t('typeSelection.myself.continue')} <ChevronRight size={16} />
                                </span>
                            </div>
                        </div>

                        {/* Other */}
                        <div
                            onClick={() => handleTypeSelect('other')}
                            className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:border-2 border-transparent hover:border-[#1D5EED] transition-all group h-full flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <Users size={48} className="text-[#1D5EED]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: THEME.colors.deepBlue }}>{t('typeSelection.someoneElse.title')}</h3>
                            <p className="text-gray-600">{t('typeSelection.someoneElse.description')}</p>
                            <div className="mt-8">
                                <span className="text-[#1D5EED] font-bold group-hover:underline flex items-center gap-2">
                                    {t('typeSelection.someoneElse.continue')} <ChevronRight size={16} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
                <div className="bg-white rounded-lg shadow-md max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <Check size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: THEME.colors.deepBlue }}>
                        {formData.isHomeCare ? t('success.homeCareTitle') : t('success.otherTitle')}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        {t('success.message')}
                    </p>
                    <div className="space-y-3">
                        <button onClick={() => window.location.href = '/nominate'} className="w-full px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA]">
                            {t('success.voteForOthers')}
                        </button>
                        <button onClick={() => router.push('/')} className="w-full px-6 py-3 rounded-md font-semibold bg-white text-[#08193e] border border-gray-300 hover:bg-gray-50">
                            {t('success.returnHome')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-6 lg:px-12 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => setStep('type')} className="flex items-center gap-2 text-gray-500 hover:text-[#1D5EED] mb-6 font-medium">
                    <ChevronRight className="rotate-180" size={20} /> {t('backToSelection')}
                </button>

                <div className="bg-white rounded-lg shadow-md p-6 md:p-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: THEME.colors.deepBlue }}>
                            {isSelf ? t('form.selfTitle') : t('form.otherTitle')}
                        </h2>
                        <p className="text-gray-600">
                            {isSelf ? t('form.selfSubtitle') : t('form.otherSubtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* First Name and Last Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">
                                    {isSelf ? t('form.fields.yourFirstName') : t('form.fields.nomineeFirstName')}
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder={t('form.placeholders.firstName')}
                                    value={formData.nomineeFirstName}
                                    onChange={e => setFormData({ ...formData, nomineeFirstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">
                                    {isSelf ? t('form.fields.yourLastName') : t('form.fields.nomineeLastName')}
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder={t('form.placeholders.lastName')}
                                    value={formData.nomineeLastName}
                                    onChange={e => setFormData({ ...formData, nomineeLastName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Nominee Email */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {isSelf ? t('form.fields.yourEmail') : t('form.fields.nomineeEmail')}
                            </label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                placeholder={t('form.placeholders.email')}
                                value={formData.nomineeEmail}
                                onChange={e => setFormData({ ...formData, nomineeEmail: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {isSelf ? t('form.fields.emailNotificationSelf') : t('form.fields.emailNotificationOther')}
                            </p>
                        </div>

                        {/* Organization and Job Title Fields (For All Nominations) */}
                        <>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">
                                    {isSelf ? t('form.fields.organization') : t('form.fields.nomineeOrganization')}
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder={t('form.placeholders.organization')}
                                    value={formData.organization}
                                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">
                                    {isSelf ? t('form.fields.jobTitle') : t('form.fields.nomineeJobTitle')}
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder={t('form.placeholders.jobTitle')}
                                    value={formData.jobTitle}
                                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                />
                            </div>
                        </>

                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {isSelf ? t('form.fields.yourPhoto') : t('form.fields.nomineePhoto')}
                            </label>
                            <div className="mb-4">
                                <FileUploaderRegular
                                    sourceList="local, camera, facebook"
                                    classNameUploader="uc-light"
                                    pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || ''}
                                    onChange={(info) => {
                                        if (info.allEntries.length > 0 && info.allEntries[0].status === 'success') {
                                            setFormData(prev => ({ ...prev, profileImage: info.allEntries[0].cdnUrl }));
                                        } else if (info.allEntries.length === 0) {
                                            setFormData(prev => ({ ...prev, profileImage: null }));
                                        }
                                    }}
                                />
                            </div>
                        </div>



                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.awardCategory')}</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CATEGORIES.map(cat => {
                                    const categoryLabel = tHome(cat.nameKey);
                                    const isSelected = formData.category === cat.value;
                                    return (
                                        <div
                                            key={cat.id}
                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                            className={`cursor-pointer p-4 rounded-md border-2 transition-all flex items-center gap-3 ${isSelected ? 'bg-blue-50 border-[#1D5EED]' : 'hover:bg-gray-50 border-gray-200'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white`} style={{ backgroundColor: cat.color }}>
                                                <cat.icon size={18} />
                                            </div>
                                            <span className="font-medium text-sm text-gray-800">{categoryLabel}</span>
                                            {isSelected && <Check size={16} className="ml-auto text-[#1D5EED]" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.reasonForNomination')}</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                placeholder={isSelf ? t('form.fields.reasonPlaceholderSelf') : t('form.fields.reasonPlaceholderOther')}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Nominator Email (Hidden if Self) */}
                        {!isSelf && (
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.nominatorEmail')}</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder={t('form.fields.nominatorEmailPlaceholder')}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Industry Checkbox (Only for Other Nominations) */}
                        {!isSelf && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md border border-blue-100">
                                <input
                                    type="checkbox"
                                    id="industryCheckbox"
                                    className="w-5 h-5 rounded text-[#f37021] focus:ring-[#f37021]"
                                    checked={formData.isHomeCare}
                                    onChange={e => setFormData({ 
                                        ...formData, 
                                        isHomeCare: e.target.checked,
                                        nominatorFirstName: e.target.checked ? formData.nominatorFirstName : '',
                                        nominatorLastName: e.target.checked ? formData.nominatorLastName : '',
                                        nominatorOrganization: e.target.checked ? formData.nominatorOrganization : '',
                                        nominatorJobTitle: e.target.checked ? formData.nominatorJobTitle : ''
                                    })}
                                />
                                <label htmlFor="industryCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                    <Briefcase size={16} className="text-[#1d5eed]" />
                                    {t('form.fields.industryCheckbox')}
                                </label>
                            </div>
                        )}
                        
                        {/* Nominator Info Fields (Only for Other Nominations when checkbox is checked) */}
                        {!isSelf && formData.isHomeCare && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.nominatorFirstName')}</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                            placeholder={t('form.placeholders.firstName')}
                                            value={formData.nominatorFirstName}
                                            onChange={e => setFormData({ ...formData, nominatorFirstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.nominatorLastName')}</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                            placeholder={t('form.placeholders.lastName')}
                                            value={formData.nominatorLastName}
                                            onChange={e => setFormData({ ...formData, nominatorLastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.nominatorOrganization')}</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder={t('form.placeholders.organization')}
                                        value={formData.nominatorOrganization}
                                        onChange={e => setFormData({ ...formData, nominatorOrganization: e.target.value })}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">{t('form.fields.nominatorJobTitle')}</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder={t('form.placeholders.jobTitle')}
                                        value={formData.nominatorJobTitle}
                                        onChange={e => setFormData({ ...formData, nominatorJobTitle: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        {/* Terms and conditions (required) */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="termsCheckbox"
                                required
                                className="w-5 h-5 mt-0.5 rounded text-[#1D5EED] focus:ring-[#1D5EED]"
                                checked={formData.agreedToTerms}
                                onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                            />
                            <label htmlFor="termsCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer">
                                {t('form.fields.termsAgreePrefix')}{' '}
                                <Link
                                    href="/terms"
                                    className="text-[#1D5EED] underline hover:text-[#113CCA]"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowTermsConfirm(true);
                                    }}
                                >
                                    {t('form.fields.termsAgreeLink')}
                                </Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            disabled={isSubmitting || !formData.agreedToTerms || (!formData.nomineeFirstName || !formData.nomineeLastName || !formData.organization || !formData.jobTitle || (!isSelf && formData.isHomeCare && (!formData.nominatorFirstName || !formData.nominatorLastName || !formData.nominatorOrganization || !formData.nominatorJobTitle)))}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> {t('form.submitting')}
                                </>
                            ) : (
                                t('form.submit')
                            )}
                        </button>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
                                <div className="flex items-center">
                                    <AlertCircle className="text-amber-500 mr-2" size={20} />
                                    <p className="text-amber-700 font-medium">{errorMsg}</p>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>

            {/* Terms leave confirmation modal */}
            {showTermsConfirm && (
                <>
                    <style>{`
                        @keyframes termsModalIn {
                            from { opacity: 0; transform: scale(0.97); }
                            to { opacity: 1; transform: scale(1); }
                        }
                        .terms-modal-panel {
                            animation: termsModalIn 0.2s ease-out;
                        }
                    `}</style>
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(8, 25, 62, 0.6)' }}
                        onClick={() => setShowTermsConfirm(false)}
                    >
                        <div
                            className="terms-modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="terms-modal-title"
                    >
                        <div className="p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                    <FileText className="text-amber-600" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 id="terms-modal-title" className="text-xl font-bold text-[#08193e]">
                                            {t('form.fields.termsModalTitle')}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowTermsConfirm(false)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                            aria-label="Close"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="mt-2 text-gray-600 text-[15px] leading-relaxed">
                                        {t('form.fields.termsLeaveConfirm')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowTermsConfirm(false)}
                                    className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    {t('form.fields.termsModalStay')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTermsConfirm(false);
                                        router.push('/terms');
                                    }}
                                    className="px-5 py-2.5 rounded-lg font-semibold text-white bg-[#1D5EED] hover:bg-[#113CCA] transition-colors"
                                >
                                    {t('form.fields.termsModalContinue')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
