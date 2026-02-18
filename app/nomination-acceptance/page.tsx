import Link from "next/link";
import type { Metadata } from "next";
import NominationAcceptanceShare from "@/components/NominationAcceptanceShare";

export const metadata: Metadata = {
  title: "Nomination Acceptance | Home-Based Care Momentum Awards",
  description: "Information for nominees who accepted their nomination.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NominationAcceptancePage() {
  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      <section
        className="relative text-white py-16 px-6 lg:px-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #08193e 0%, #113cca 100%)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Thank you for accepting your nomination!
          </h1>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-[#08193e] mb-3">
              To learn more about The Home-Based Care Momentum Awards and what happens next, you can:
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                Review the award overview and criteria{" "}
                <Link href="/eligibility" className="text-[#1D5EED] font-semibold hover:underline">
                  on the eligibility page
                </Link>
              </li>
              <li>
                See the key dates and milestones{" "}
                <Link href="/#key-dates" className="text-[#1D5EED] font-semibold hover:underline">
                  on the homepage timeline
                </Link>
              </li>
            </ul>
          </div>

          <NominationAcceptanceShare />

          <div className="rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-[#08193e] mb-2">Questions?</h3>
            <p className="text-gray-700 leading-relaxed">
              Have questions about the Momentum Awards? Please email{" "}
              <a
                href="mailto:awards@alayacare.com"
                className="text-[#1D5EED] font-semibold hover:underline"
              >
                awards@alayacare.com
              </a>{" "}
              and a member of the awards committee will be happy to help.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
