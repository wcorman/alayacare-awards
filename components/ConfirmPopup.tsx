"use client";

import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConfirmPopup() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'confirmed' | 'invalid' | 'error' | null>(null);

    useEffect(() => {
        const voteParam = searchParams.get('vote');
        const nomineeParam = searchParams.get('nominee');

        // Don't show this popup if nominee parameter exists (VoteConfirmationPopup handles that)
        if (nomineeParam) {
            return;
        }

        if (voteParam === 'confirmed') {
            setStatus('confirmed');
            setIsOpen(true);
        } else if (voteParam === 'invalid') {
            setStatus('invalid');
            setIsOpen(true);
        } else if (voteParam === 'error') {
            setStatus('error');
            setIsOpen(true);
        }
    }, [searchParams]);

    const handleClose = () => {
        setIsOpen(false);
        // Remove query params
        router.replace('/vote');
    };

    if (!isOpen || !status) return null;

    const isSuccess = status === 'confirmed';
    const title = isSuccess ? 'Vote Verified' : 'Verification Failed';
    const message = isSuccess
        ? 'Your vote has been successfully verified and counted.'
        : 'This confirmation link is invalid or has expired.';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 text-center relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isSuccess ? <Check size={32} /> : <AlertCircle size={32} />}
                </div>

                <h3 className="text-2xl font-bold mb-3 text-[#08193e]">{title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 rounded-md font-semibold transition-all duration-200 shadow-sm bg-[#f37021] text-white hover:bg-[#d85e15]"
                >
                    {isSuccess ? 'View All Nominees' : 'Close'}
                </button>
            </div>
        </div>
    );
}
