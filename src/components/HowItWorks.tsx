import React from 'react';
import { Search, CreditCard, Printer, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Template',
      description: 'Explore printable planners, automated spreadsheets, or screen-free activities crafted for everyday ease and mindful joy.',
      icon: Search
    },
    {
      number: '02',
      title: 'Instant Digital Checkout',
      description: 'Complete purchase securely. There are no shipping delays or packaging fees—your files are generated the moment checkout completes.',
      icon: CreditCard
    },
    {
      number: '03',
      title: 'Print or Use Digitally',
      description: 'Download your files immediately on-screen or via your confirmation email. Print at home or load directly into your favorite tablet app.',
      icon: Printer
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FFFDF9] border-y border-[#EFE9E1]" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
            Simple & Transparent Delivery
          </span>
          <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26] tracking-tight">
            How EDSER Digital Downloads Work
          </h2>
          <p className="text-sm sm:text-base text-[#5C564E] leading-relaxed">
            From checkout to your kitchen table or tablet screen in less than two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-bold text-[#D48B80] tabular-nums">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#2D2A26]">
                    {step.title}
                  </h3>

                  <p className="text-sm text-[#5C564E] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EFE9E1] flex items-center gap-1.5 text-xs text-[#70826E] font-medium">
                  <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Lifetime Access Included</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
