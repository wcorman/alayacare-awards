"use client";

import React, { useState } from 'react';
import { Mail, X, Loader2, AlertCircle, Briefcase } from 'lucide-react';


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
    const [email, setEmail] = useState('');
    const [isHomeCare, setIsHomeCare] = useState(false);
    const [name, setName] = useState('');
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
                    <h3 className="text-2xl font-bold mb-2 text-[#08193e]">Verification Required</h3>
                    <p className="text-gray-600 mb-6">
                        Thank you for voting for <strong>{nomineeName}</strong>. Please check your email inbox to finalize your submission. Your vote is pending confirmation.
                    </p>
                    <button
                        onClick={() => {
                            setEmail('');
                            setIsHomeCare(false);
                            setName('');
                            setOrganization('');
                            setJobTitle('');
                            onClose();
                        }}
                        className="w-full px-6 py-3 rounded-md font-semibold bg-[#f37021] text-white hover:bg-[#d85e15] transition-colors"
                    >
                        Close
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
                setName('');
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
                        setName('');
                        setOrganization('');
                        setJobTitle('');
                        onClose();
                    }} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold mb-2 text-[#08193e]">Confirm Your Vote</h3>
                <p className="text-gray-600 mb-6">
                    You are voting for <span className="font-bold text-[#f37021]">{nomineeName}</span>.
                    Please enter your email to verify your vote.
                </p>

                {errorMsg && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r flex items-start gap-3">
                        <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={20} />
                        <p className="text-amber-700 font-medium text-sm">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(email, isHomeCare, name, organization, jobTitle); }}>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 text-gray-700">Your Email Address</label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent transition-all"
                            placeholder="e.g. name@company.com"
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
                                className="w-5 h-5 rounded text-[#f37021] focus:ring-[#f37021]"
                                checked={isHomeCare}
                                onChange={(e) => {
                                    setIsHomeCare(e.target.checked);
                                    if (!e.target.checked) {
                                        setName('');
                                        setOrganization('');
                                        setJobTitle('');
                                    }
                                }}
                            />
                            <label htmlFor="industryCheckbox" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                <Briefcase size={16} className="text-[#1d5eed]" />
                                I am currently working in the home care industry.
                            </label>
                        </div>
                    </div>

                    {/* Name and Organization Fields */}
                    {isHomeCare && (
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent transition-all text-gray-900"
                                    placeholder="e.g. Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Organization</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent transition-all text-gray-900"
                                    placeholder="e.g. ABC Home Care"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Job Title Field */}
                    {isHomeCare && (
                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Job Title</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent transition-all text-gray-900"
                                placeholder="e.g. Caregiver, Registered Nurse, etc."
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-md font-semibold bg-[#f37021] text-white hover:bg-[#d85e15] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isChecking || (isHomeCare && (!name || !organization || !jobTitle))}
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Verifying...
                                </>
                            ) : (
                                "Submit Vote"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setEmail('');
                                setIsHomeCare(false);
                                setName('');
                                setOrganization('');
                                setJobTitle('');
                                onClose();
                            }}
                            className="px-6 py-3 rounded-md font-semibold bg-white text-[#08193e] border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            disabled={isChecking}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
