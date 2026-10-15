import React from 'react';
import { Sparkles, Heart, Printer, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { HERO_IMAGE } from '../data/products';

interface AboutViewProps {
  onShopClick: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onShopClick }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      
      {/* Editorial Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
          Our Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#2D2A26] leading-tight text-balance">
          Crafted for intentional days and screen-free wonder.
        </h1>
        <p className="text-base text-[#5C564E] leading-relaxed">
          EDSER began with a quiet conviction: that thoughtful, well-designed stationery helps people slow down, clarify what matters, and cultivate calm at home.
        </p>
      </div>

      {/* Atmospheric Image */}
      <div className="rounded-2xl overflow-hidden border border-[#EFE9E1] shadow-xs aspect-16/9 bg-[#F3EFEA]">
        <img
          src={HERO_IMAGE}
          alt="EDSER stationery, botanical sprigs, and undated planners on textured linen paper"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Mindful Organization</h3>
          <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
            Our planners and meal sheets are designed to diminish cognitive clutter—leaving room for creativity, presence, and ease.
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-[#F7EAE7] flex items-center justify-center text-[#D48B80]">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Screen-Free Discovery</h3>
          <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
            For children, we create physical, tactile activities that encourage hands-on motor development, coloring, and outdoor observation.
          </p>
        </div>

        <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-6 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
            <Printer className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Zero Shipping Waste</h3>
          <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
            Instant digital downloads reduce shipping packaging, fossil fuels, and inventory waste. You print only what you actually need.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-8 border-t border-[#EFE9E1] space-y-4">
        <h3 className="font-serif font-bold text-2xl text-[#2D2A26]">
          Ready to bring intentionality to your routine?
        </h3>
        <button
          onClick={() => {
            triggerHaptic('medium');
            onShopClick();
          }}
          className="px-6 py-3 bg-[#2D2A26] text-white text-sm font-semibold rounded-lg hover:bg-[#403C36] transition-colors"
        >
          Explore All Templates
        </button>
      </div>

    </div>
  );
};
