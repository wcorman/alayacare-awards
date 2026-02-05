"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const nextLocale = locale === 'fr' ? 'en' : 'fr';

    const isActive = (path: string) => pathname === path;

    const THEME_COLORS = {
        deepBlue: '#08193e',
        logoOrange: '#f37021',
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center cursor-pointer">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold leading-none tracking-tight" style={{ color: THEME_COLORS.deepBlue }}>AlayaCare</span>
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">Awards</span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className={`font-medium hover:text-[#1D5EED] transition-colors ${isActive('/') ? 'text-[#1D5EED]' : 'text-[#08193e]'}`}
                    >
                        Home
                    </Link>
                    <Link
                        href="/eligibility"
                        className={`font-medium hover:text-[#1D5EED] transition-colors ${isActive('/eligibility') ? 'text-[#1D5EED]' : 'text-[#08193e]'}`}
                    >
                        Eligibility
                    </Link>
                    <Link
                        href="/nominate"
                        className={`font-medium hover:text-[#1D5EED] transition-colors ${isActive('/nominate') ? 'text-[#1D5EED]' : 'text-[#08193e]'}`}
                    >
                        Nominate
                    </Link>
                    <Link
                        href="/vote"
                        className="py-2 px-4 text-sm font-semibold rounded-md bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-colors"
                    >
                        Vote Now
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
                            router.refresh();
                        }}
                        className="py-2 px-3 text-sm font-semibold rounded-md border border-[#08193e] text-[#08193e] hover:text-[#1D5EED] hover:border-[#1D5EED] transition-colors"
                        aria-label={`Switch language to ${nextLocale === 'fr' ? 'French' : 'English'}`}
                    >
                        {nextLocale.toUpperCase()}
                    </button>
                </nav>

                <button className="md:hidden text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg border-t z-50 flex flex-col p-4 animate-fade-in-down">
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-4 text-left font-medium border-b hover:bg-gray-50 text-[#08193e]"
                    >
                        Home
                    </Link>
                    <Link
                        href="/eligibility"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-4 text-left font-medium border-b hover:bg-gray-50 text-[#08193e]"
                    >
                        Eligibility
                    </Link>
                    <Link
                        href="/nominate"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-4 text-left font-medium border-b hover:bg-gray-50 text-[#08193e]"
                    >
                        Nominate
                    </Link>
                    <Link
                        href="/vote"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-4 text-left font-medium border-b hover:bg-gray-50 text-[#08193e] bg-[#1D5EED] text-white hover:bg-[#113CCA]"
                    >
                        Vote Now
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
                            router.refresh();
                            setMobileMenuOpen(false);
                        }}
                        className="p-4 text-left font-medium border-b hover:bg-gray-50 text-[#08193e]"
                        aria-label={`Switch language to ${nextLocale === 'fr' ? 'French' : 'English'}`}
                    >
                        {nextLocale === 'fr' ? 'Français' : 'English'}
                    </button>
                </div>
            )}
        </header>
    );
}
