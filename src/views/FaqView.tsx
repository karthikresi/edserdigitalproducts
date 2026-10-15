import React, { useState } from 'react';
import { FAQS } from '../data/products';
import { ChevronDown, ChevronUp, Download, Printer, Laptop, ShieldCheck, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const FaqView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    triggerHaptic('light');
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
          Help & Guidance
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#5C564E] leading-relaxed">
          Everything you need to know about accessing your downloads, printing templates at home, and software compatibility.
        </p>
      </div>

      {/* 3 Practical Quick Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
            <Download className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2D2A26]">1. Instant Access</h3>
          <p className="text-xs text-[#5C564E] leading-relaxed">
            Download your files immediately on your order confirmation screen. A backup link is sent to your email with lifetime access.
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
            <Printer className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2D2A26]">2. Easy Printing</h3>
          <p className="text-xs text-[#5C564E] leading-relaxed">
            Print at home or your local print shop. Always select "Actual Size" or 100% scale. For daily planners, 28–32 lb paper gives the best feel.
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
            <Laptop className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base text-[#2D2A26]">3. Compatibility</h3>
          <p className="text-xs text-[#5C564E] leading-relaxed">
            Compatible with free Adobe Acrobat, Apple Preview, GoodNotes, Notability, Google Sheets, Microsoft Excel, and Numbers.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        <h2 className="text-lg font-serif font-bold text-[#2D2A26] pb-2 border-b border-[#EFE9E1]">
          Common Questions
        </h2>

        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-base text-[#2D2A26] hover:text-[#70826E] transition-colors"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#70826E] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5C564E] leading-relaxed border-t border-stone-100 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flagged Missing Details for Store Owner Note as requested */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>Notice for Store Owner</span>
        </div>
        <p className="leading-relaxed">
          The above FAQ answers reflect verified delivery, printing, and format standards. If you offer specialized print-partner discounts (such as Staples, Office Depot, or local European print shops) or wish to include specific custom license agreements, update your merchant documentation to add them.
        </p>
      </div>

    </div>
  );
};
