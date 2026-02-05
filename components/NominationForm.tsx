"use client";

import React, { useState } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader/next';
import '@uploadcare/react-uploader/core.css';
import { User, Users, ChevronRight, Upload, Check, Briefcase, AlertCircle, Loader2, UserPlus, Heart, Award, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const THEME = {
    colors: {
        deepBlue: '#08193e',
        logoOrange: '#f37021',
        lightBlue: '#1d5eed',
        grey: '#dadadf',
    },
};

const CATEGORIES = [
    { id: 'frontline', name: "Frontline Care", color: '#f37021', icon: Heart },
    { id: 'operational', name: "Operational Excellence", color: '#113cca', icon: Award },
    { id: 'executive', name: "Executive Leadership", color: '#ffaa05', icon: Briefcase },
    { id: 'impact', name: "Impact and Innovation", color: '#08193e', icon: Sparkles },
];


export default function NominationForm() {
    const router = useRouter();
    const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
    const [nominationType, setNominationType] = useState<'self' | 'other'>('other');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nomineeName: '',
        nomineeEmail: '',
        category: 'Frontline Care',
        description: '',
        email: '', // Nominator email
        profileImage: null as string | null,
        isHomeCare: false,
        name: '', // Nominator name
        nominatorOrganization: '', // Nominator organization
        nominatorJobTitle: '', // Nominator job title
        organization: '', // Nominee organization
        jobTitle: '', // Nominee job title
    });

    const handleTypeSelect = (type: 'self' | 'other') => {
        setNominationType(type);
        setStep('form');
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsSubmitting(true);

        try {
            const nominatorEmail = nominationType === 'self' ? formData.nomineeEmail : formData.email;

            const res = await fetch('/api/nominate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nominatorEmail,
                    nomineeName: formData.nomineeName,
                    nomineeEmail: formData.nomineeEmail,
                    description: formData.description,
                    category: formData.category,
                    imageUrl: formData.profileImage,
                    jobTitle: formData.jobTitle || '',
                    organization: formData.organization || '',
                    nominatorName: formData.name || '',
                    nominatorOrganization: formData.nominatorOrganization || '',
                    nominatorJobTitle: formData.nominatorJobTitle || '',
                    isHomeCare: nominationType === 'other' ? formData.isHomeCare : false
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setStep('success');
            } else {
                if (data.reason === 'duplicate_nominee') {
                    setErrorMsg("This person has already been nominated. Thank you for your enthusiasm.");
                } else {
                    // Show the actual error message if available
                    const errorMsg = data.error || "An error occurred. Please try again.";
                    console.error("Nomination API Error:", data);
                    setErrorMsg(errorMsg);
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSelf = nominationType === 'self';

    if (step === 'type') {
        return (
            <div className="py-8 px-6 lg:px-12 bg-gray-50 min-h-screen flex flex-col items-center">
                <div className="max-w-4xl w-full text-center">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-[#1D5EED] mb-6 font-medium mx-auto md:mx-0">
                        <ChevronRight className="rotate-180" size={20} /> Back to Home
                    </button>

                    <h2 className="text-3xl font-bold mb-3" style={{ color: THEME.colors.deepBlue }}>Who are you nominating?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        You can nominate yourself for your own achievements, or recognize a colleague who has gone above and beyond.
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
                            <h3 className="text-2xl font-bold mb-3" style={{ color: THEME.colors.deepBlue }}>Myself</h3>
                            <p className="text-gray-600">I am a care leader and I want to share my own story of excellence.</p>
                            <div className="mt-8">
                                <span className="text-[#1D5EED] font-bold group-hover:underline flex items-center gap-2">
                                    Continue <ChevronRight size={16} />
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
                            <h3 className="text-2xl font-bold mb-3" style={{ color: THEME.colors.deepBlue }}>Someone Else</h3>
                            <p className="text-gray-600">I want to nominate a colleague, employee, or friend for their amazing work.</p>
                            <div className="mt-8">
                                <span className="text-[#1D5EED] font-bold group-hover:underline flex items-center gap-2">
                                    Continue <ChevronRight size={16} />
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
                        {formData.isHomeCare ? "Nomination Submitted!" : "Thank You for Your Nomination!"}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        We'll review your submission shortly.
                    </p>
                    <div className="space-y-3">
                        <button onClick={() => router.push('/')} className="w-full px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA]">
                            Vote for Others
                        </button>
                        <button onClick={() => router.push('/')} className="w-full px-6 py-3 rounded-md font-semibold bg-white text-[#08193e] border border-gray-300 hover:bg-gray-50">
                            Return Home
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
                    <ChevronRight className="rotate-180" size={20} /> Back to Selection
                </button>

                <div className="bg-white rounded-lg shadow-md p-6 md:p-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: THEME.colors.deepBlue }}>
                            {isSelf ? "Tell Us Your Story" : "Nominate a Care Leader"}
                        </h2>
                        <p className="text-gray-600">
                            {isSelf ? "You do amazing work. Help us recognize it." : "Shine a light on someone who makes a difference."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {isSelf ? "Your Name" : "Nominee Name"}
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                placeholder={isSelf ? "e.g. Jane Doe" : "e.g. Jane Doe"}
                                value={formData.nomineeName}
                                onChange={e => setFormData({ ...formData, nomineeName: e.target.value })}
                            />
                        </div>

                        {/* Nominee Email */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {isSelf ? "Your Email" : "Nominee Email"}
                            </label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                placeholder="e.g. jane.doe@careprovider.com"
                                value={formData.nomineeEmail}
                                onChange={e => setFormData({ ...formData, nomineeEmail: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">We'll use this to notify {isSelf ? "you" : "them"} if {isSelf ? "you" : "they"} win.</p>
                        </div>

                        {/* Organization and Job Title Fields (For All Nominations) */}
                        <>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">
                                    {isSelf ? "Organization" : "Nominee Organization"}
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder="e.g. ABC Home Care"
                                    value={formData.organization}
                                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">
                                    {isSelf ? "Job Title" : "Nominee Job Title"}
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder="e.g. Caregiver, Registered Nurse, etc."
                                    value={formData.jobTitle}
                                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                />
                            </div>
                        </>

                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">
                                {isSelf ? "Your Profile Photo (Optional)" : "Nominee Profile Photo (Optional)"}
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
                            <label className="block text-sm font-bold mb-2 text-gray-700">Award Category</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CATEGORIES.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setFormData({ ...formData, category: cat.name })}
                                        className={`cursor-pointer p-4 rounded-md border-2 transition-all flex items-center gap-3 ${formData.category === cat.name ? 'bg-blue-50 border-[#1D5EED]' : 'hover:bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white`} style={{ backgroundColor: cat.color }}>
                                            <cat.icon size={18} />
                                        </div>
                                        <span className="font-medium text-sm text-gray-800">{cat.name}</span>
                                        {formData.category === cat.name && <Check size={16} className="ml-auto text-[#1D5EED]" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Reason for Nomination</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                placeholder={isSelf ? "Tell us why you deserve to win..." : "Tell us why this person deserves to win..."}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Nominator Email (Hidden if Self) */}
                        {!isSelf && (
                            <div>
                                <label className="block text-sm font-bold mb-2 text-gray-700">Your Email (Required for submission)</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                    placeholder="So we can contact you if they win"
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
                                        name: e.target.checked ? formData.name : '',
                                        nominatorOrganization: e.target.checked ? formData.nominatorOrganization : '',
                                        nominatorJobTitle: e.target.checked ? formData.nominatorJobTitle : ''
                                    })}
                                />
                                <label htmlFor="industryCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                    <Briefcase size={16} className="text-[#1d5eed]" />
                                    I am currently working in the home care industry.
                                </label>
                            </div>
                        )}
                        
                        {/* Nominator Info Fields (Only for Other Nominations when checkbox is checked) */}
                        {!isSelf && formData.isHomeCare && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder="e.g. Jane Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Your Organization</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder="e.g. ABC Home Care"
                                        value={formData.nominatorOrganization}
                                        onChange={e => setFormData({ ...formData, nominatorOrganization: e.target.value })}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700">Your Job Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D5EED] focus:border-transparent transition-all text-gray-900"
                                        placeholder="e.g. Caregiver, Registered Nurse, etc."
                                        value={formData.nominatorJobTitle}
                                        onChange={e => setFormData({ ...formData, nominatorJobTitle: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                        

                        <button
                            type="submit"
                            className="w-full px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            disabled={isSubmitting || (!formData.organization || !formData.jobTitle || (!isSelf && formData.isHomeCare && (!formData.name || !formData.nominatorOrganization || !formData.nominatorJobTitle)))}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Submitting...
                                </>
                            ) : (
                                "Submit Nomination"
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
        </div>
    );
}
