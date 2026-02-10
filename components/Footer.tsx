"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');
    
    return (
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-gray-600 mb-2">
                    {t('tagline')}
                </p>
                <p className="text-gray-600 text-sm">
                    {t('poweredBy')}{' '}
                    <Link 
                        href="https://alayacare.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#08193e] hover:text-[#1D5EED] transition-colors font-semibold"
                    >
                        AlayaCare
                    </Link>
                    .
                </p>
            </div>
        </footer>
    );
}

