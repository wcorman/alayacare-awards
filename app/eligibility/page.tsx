import React from 'react';
import { Heart, Award, Briefcase, Sparkles, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function EligibilityPage() {
  const categories = [
    {
      id: 'frontline',
      name: 'Changemakers in Frontline Care',
      icon: Heart,
      color: '#f37021',
      description: 'This category celebrates caregivers who deliver direct care and support in the home or community.',
      requirements: [
        'Work in a direct care / client-facing role, such as:',
        {
          type: 'list',
          items: [
            'Personal Support Worker (PSW), Home Health Aide (HHA), Home Support Worker (HSW), Care Aide, Companion, or similar',
            'Registered Nurse (RN), Licensed/Registered Practical Nurse (LPN/RPN), Nurse Practitioner (NP)',
            'Allied health professionals providing care at home (e.g., physiotherapist, occupational therapist, speech-language pathologist, social worker, respiratory therapist)'
          ]
        },
        'Provide hands-on care, support, or clinical services in clients\' homes or community settings.',
        'Demonstrate exceptional compassion, reliability, and client-centred care, going above and beyond typical expectations.',
        'Positively impact client outcomes, safety, experience, or quality of life through their day-to-day work.',
        'Meet the organization-level eligibility outlined above.'
      ]
    },
    {
      id: 'operational',
      name: 'Changemakers in Operational Excellence',
      icon: Award,
      color: '#113cca',
      description: 'This category recognizes behind-the-scenes champions whose work keeps home-based care running smoothly, efficiently, and safely.',
      requirements: [
        'Work in a non-frontline, operations-focused role, such as:',
        {
          type: 'list',
          items: [
            'Scheduler, Service Coordinator, Intake Coordinator, Client Services Representative',
            'Operations, Quality, or Performance Improvement Specialist',
            'HR, Finance, Billing, or Payroll professional focused on home-based care',
            'IT Specialist, Systems Administrator, Data/Reporting Analyst, or similar'
          ]
        },
        'Play a key role in supporting caregivers, clients, and field operations (e.g., scheduling, capacity optimization, workflow design, billing integrity, compliance).',
        'Demonstrate measurable contributions to:',
        {
          type: 'list',
          items: [
            'Process improvement or efficiency gains',
            'Data-driven decision-making',
            'Quality, safety, or compliance',
            'Employee or client experience'
          ]
        },
        'Champion collaboration across teams to solve operational challenges.',
        'Meet the organization-level eligibility outlined above.'
      ]
    },
    {
      id: 'executive',
      name: 'Changemakers in Executive Leadership',
      icon: Briefcase,
      color: '#ffaa05',
      description: 'This category honours senior leaders who are shaping the future of home-based care through strategic vision, culture-building, and bold decision-making.',
      requirements: [
        'Hold a senior leadership role at a home-based care organization, typically VP level or above, such as:',
        {
          type: 'list',
          items: [
            'Vice President',
            'Senior Vice President',
            'Executive Vice President',
            'Chief Executive Officer (CEO), Chief Operating Officer (COO), Chief Clinical Officer (CCO), Chief Nursing Officer (CNO), Chief Technology Officer (CTO), Chief Strategy Officer (CSO), or equivalent',
            'President, Founder, or Co-Founder'
          ]
        },
        'Have direct or shared responsibility for organizational strategy, growth, quality, or innovation in home-based care services.',
        'Demonstrate:',
        {
          type: 'list',
          items: [
            'Visionary leadership in expanding or improving home-based care',
            'A clear commitment to care quality, safety, and equity',
            'Investment in people and culture (e.g., supporting staff, enabling teams with tools and training, driving engagement)',
            'Tangible impact on organizational performance, client outcomes, or community reach'
          ]
        },
        'Meet the organization-level eligibility outlined above.'
      ]
    },
    {
      id: 'impact',
      name: 'Changemakers in Impact and Innovation',
      icon: Sparkles,
      color: '#08193e',
      description: 'This category recognizes trailblazers at any level or function who are driving meaningful change, testing new ideas, or redefining what\'s possible in home-based care.',
      requirements: [
        'Work in any role or level (frontline, operational, clinical, technical, or leadership) within an eligible home-based care organization.',
        'Be leading or significantly contributing to unique, high-impact initiatives, for example:',
        {
          type: 'list',
          items: [
            'Implementing new models of care (e.g., hybrid virtual/in-person care, specialized programs for complex populations)',
            'Piloting or scaling innovative technologies or data-driven approaches that improve client or staff experience',
            'Designing novel workflows, partnerships, or community programs that increase access to care',
            'Advancing equity, inclusion, or culturally competent care in home and community settings',
            'Championing sustainability or scalable best practices that others in the industry can learn from'
          ]
        },
        'Show clear, demonstrable impact on:',
        {
          type: 'list',
          items: [
            'Client outcomes or experience',
            'Staff experience, satisfaction, or retention',
            'Operational performance or quality',
            'The broader home-based care industry (e.g., thought leadership, advocacy, knowledge-sharing)'
          ]
        },
        'Meet the organization-level eligibility outlined above.'
      ]
    }
  ];

  const renderRequirement = (req: string | { type: string; items: string[] }, index: number) => {
    if (typeof req === 'string') {
      return (
        <li key={index} className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#f37021] flex-shrink-0 mt-0.5" />
          <span className="text-gray-700">{req}</span>
        </li>
      );
    } else if (req.type === 'list') {
      return (
        <li key={index} className="ml-8 mt-2">
          <ul className="space-y-2">
            {req.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#f37021] font-bold">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </li>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-slate-800">
      {/* Hero Section */}
      <section
        className="relative text-white py-16 px-6 lg:px-12 overflow-hidden"
        style={{ background: `linear-gradient(135deg, #08193e 0%, #113cca 100%)` }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f37021] opacity-10 rounded-tr-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Eligibility Details
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            The Changemakers in Home-Based Care Awards recognize outstanding individuals who are elevating home-based care every day — from the front lines to the back office, and the C-suite to visionary innovators.
          </p>
        </div>
      </section>

      {/* Organization-Level Eligibility */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-[#08193e]">Organization-Level Eligibility</h2>
            <div className="h-1 w-20 rounded bg-[#f37021] mb-6"></div>
            <p className="text-gray-700 mb-6">
              All categories share the same organization-level eligibility. To be eligible, nominees must:
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 border-l-4" style={{ borderColor: '#f37021' }}>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#f37021] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Be currently employed (full-time, part-time, or contract) by a home-based care organization that provides one or more of the following services:
                </span>
              </li>
              <li className="ml-8">
                <ul className="space-y-2">
                  {['Home care', 'Home health', 'Home infusion', 'Hospice', 'Community care'].map((service, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#f37021] font-bold">•</span>
                      <span className="text-gray-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#f37021] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  Provide services in a home or community-based setting (not exclusively facility-based).
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border-l-4" style={{ borderColor: '#113cca' }}>
            <h3 className="font-bold text-lg mb-3 text-[#08193e]">Additional Notes</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>Nominations may come from colleagues, supervisors, direct reports, or self-nominations, subject to the award program's submission process.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>Each individual can be nominated in one primary category that best reflects their role and impact.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>Organizations may submit multiple nominations across categories.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#113cca] font-bold">•</span>
                <span>Final eligibility and category placement are at the discretion of the awards committee, based on the information provided in the nomination.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Category Eligibility */}
      <section className="py-16 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#08193e]">Category Eligibility</h2>
            <div className="h-1 w-20 mx-auto rounded bg-[#f37021]"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Each category has specific eligibility requirements. Review the details below to determine the best category for your nomination.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border-t-4"
                  style={{ borderColor: category.color }}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${category.color}15`, color: category.color }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-[#08193e]">{category.name}</h3>
                        <p className="text-gray-600 mb-4">{category.description}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold text-lg mb-4 text-[#08193e]">Nominees should:</h4>
                      <ul className="space-y-3">
                        {category.requirements.map((req, idx) => renderRequirement(req, idx))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#08193e] to-[#113cca] rounded-lg p-8 text-white">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold mb-3">Have questions about the eligibility criteria?</h3>
            <p className="text-gray-200 mb-6">
              Please email us at{' '}
              <a
                href="mailto:awards@alayacare.com"
                className="text-[#f37021] hover:text-[#ff8c42] font-semibold underline transition-colors"
              >
                awards@alayacare.com
              </a>
            </p>
            <Link
              href="/nominate"
              className="inline-block px-6 py-3 rounded-md font-semibold bg-[#1D5EED] text-white hover:bg-[#113CCA] transition-all duration-200 shadow-sm"
            >
              Ready to Nominate?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
