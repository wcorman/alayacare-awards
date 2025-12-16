
import React from 'react';
import Link from 'next/link';
import { UserPlus, Heart, Sparkles, Star, Trophy, Check } from 'lucide-react';

// Force dynamic rendering so we always get the latest nominees
export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { id: 'compassion', name: "Compassion in Care", icon: Heart, color: '#f37021', description: "For caregivers who show extraordinary empathy." },
  { id: 'innovation', name: "Innovation Excellence", icon: Sparkles, color: '#113cca', description: "For finding new, better ways to deliver care." },
  { id: 'rookie', name: "Rookie of the Year", icon: Star, color: '#ffaa05', description: "Best newcomer (under 1 year) demonstrating potential." },
  { id: 'lifetime', name: "Lifetime Achievement", icon: Trophy, color: '#08193e', description: "Honoring long-term dedication and impact." },
];

export default async function Home() {
  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      {/* Hero Section */}
      <section
        className="relative text-white py-20 px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, #08193e 0%, #113cca 100%)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#f37021] mb-6 inline-block">
            2025 Caregiver Awards
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Better Technology. <br />
            <span className="text-[#f37021]">Better Outcomes.</span> <br />
            Best Caregivers.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            Help us recognize the unsung heroes who deliver extraordinary home care every single day.
            Vote for this year's stars below.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/nominate"
              className="px-6 py-3 rounded-md font-semibold bg-[#f37021] text-white hover:bg-[#d85e15] transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              <UserPlus size={20} /> Nominate a Caregiver
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#08193e]">Award Categories</h2>
            <div className="h-1 w-20 mx-auto rounded bg-[#f37021]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="p-6 text-center group border-t-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all" style={{ borderColor: cat.color }}>
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <cat.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#08193e]">{cat.name}</h3>
                <p className="text-gray-600 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebrating Excellence Section */}
      <section className="py-16 px-6 lg:px-12 bg-[#dadadf]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6 text-[#08193e]">Celebrating Excellence</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              At AlayaCare, we believe that technology is only as good as the people who use it.
              These awards celebrate the human touch, the late-night visits, the compassionate listening,
              and the innovative problem-solving that defines exceptional home care.
            </p>
            <ul className="space-y-4">
              {[
                "Recognize outstanding dedication",
                "Share inspiring stories of care",
                "Build a stronger care community"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-[#1d5eed]">
                  <Check size={20} className="text-[#f37021]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            {/* Placeholder images using colors/patterns since we don't have the original assets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg shadow-lg w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 transform translate-y-4 flex items-center justify-center text-white font-bold opacity-80">
                Care & Compassion
              </div>
              <div className="rounded-lg shadow-lg w-full h-48 bg-gradient-to-br from-orange-300 to-orange-500 transform -translate-y-4 flex items-center justify-center text-white font-bold opacity-80">
                Innovation
              </div>
            </div>
            <div className="absolute -z-10 top-0 right-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#f37021 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
          </div>
        </div>
      </section>
    </main>
  );
}
