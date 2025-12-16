"use client";

import React, { useState } from 'react';
import { Mail, X, Loader2, AlertCircle } from 'lucide-react';

interface VoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    nomineeName: string;
    onSubmit: (email: string) => Promise<void>;
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
                        onClick={onClose}
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
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
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

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(email); }}>
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

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-md font-semibold bg-[#f37021] text-white hover:bg-[#d85e15] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isChecking}
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
                            onClick={onClose}
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
