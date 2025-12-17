'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VoteConfirmationPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [nomineeName, setNomineeName] = useState('');
    const [category, setCategory] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const voteStatus = searchParams.get('vote');
        const nominee = searchParams.get('nominee');
        const cat = searchParams.get('category');

        if (voteStatus === 'confirmed' && nominee) {
            setNomineeName(nominee);
            setCategory(cat || '');
            setIsOpen(true);
        }
    }, [searchParams]);

    const handleClose = () => {
        setIsOpen(false);
        // Clean up URL parameters
        router.push('/');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Success icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    Thank You!
                </h2>
                <p className="text-gray-600 text-center mb-2">
                    Your vote has been confirmed for
                </p>
                <p className="text-xl font-semibold text-[#00A3E0] text-center mb-1">
                    {nomineeName}
                </p>
                {category && (
                    <p className="text-sm text-gray-500 text-center mb-6">
                        {category}
                    </p>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3 mt-6">
                    <Link
                        href="/categories"
                        className="block w-full bg-[#00A3E0] text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-[#0088c0] transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Vote for Others
                    </Link>
                    <button
                        onClick={handleClose}
                        className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
