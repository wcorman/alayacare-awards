import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-gray-600 mb-2">
                    Celebrating caregivers everywhere.
                </p>
                <p className="text-gray-600 text-sm">
                    Powered by{' '}
                    <Link 
                        href="https://alayacare.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#08193e] hover:text-[#f37021] transition-colors font-semibold"
                    >
                        AlayaCare
                    </Link>
                    .
                </p>
            </div>
        </footer>
    );
}

