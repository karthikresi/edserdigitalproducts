import React from 'react';
import { ActivePage } from '../types';
import { Download, Heart, ShieldCheck, Mail } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
  onOpenNotifications: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenNotifications }) => {
  const handleNav = (page: ActivePage) => {
    triggerHaptic('light');
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#F3EFEA] border-t border-[#EFE9E1] text-[#2D2A26] transition-colors" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-2xl font-serif font-bold text-[#2D2A26] block">
              EDSER
            </span>
            <p className="text-sm text-[#5C564E] max-w-sm leading-relaxed">
              Mindful digital downloads designed to bring quiet organization to daily routines and creative, screen-free wonder to children.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#70826E] font-medium pt-1">
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Instant Downloads · No Physical Shipping</span>
            </div>
          </div>

          {/* Nav Col 1: Shop Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Browse Collections
            </h4>
            <ul className="space-y-2 text-sm text-[#4A453E]">
              <li>
                <button
                  onClick={() => handleNav('shop')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Shop All Templates
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('planners')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Planners & Organization
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('kids')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Kids’ Activities
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenNotifications();
                  }}
                  className="text-[#D48B80] hover:underline transition-colors text-left font-medium"
                >
                  Upcoming Collection Drops
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Col 2: Help & Guidance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-[#4A453E]">
              <li>
                <button
                  onClick={() => handleNav('faq')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  FAQs & Download Help
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('faq')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Printing & Paper Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('faq')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Software Compatibility
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Col 3: Policies & Store Owner Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Policies & Info
            </h4>
            <ul className="space-y-2 text-sm text-[#4A453E]">
              <li>
                <button
                  onClick={() => handleNav('policies')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Digital Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('policies')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  Refunds & Replacements
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-[#70826E] transition-colors text-left"
                >
                  About EDSER
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-[#70826E] transition-colors text-left text-xs text-stone-500"
                >
                  Store Owner Notes
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-[#EFE9E1] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} EDSER Digital Downloads. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#70826E]">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Secure 256-Bit SSL Checkout
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Personal Household License</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
