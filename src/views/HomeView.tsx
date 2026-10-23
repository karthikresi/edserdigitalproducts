import React from 'react';
import { Product, ActivePage } from '../types';
import { ProductCard } from '../components/ProductCard';
import { HowItWorks } from '../components/HowItWorks';
import { HERO_IMAGE } from '../data/products';
import { ArrowRight, Sparkles, Bell, Download, ShieldCheck, Heart } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { handleImageFallback } from '../utils/imageFallback';

interface HomeViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onNavigate: (page: ActivePage) => void;
  onOpenNotifications: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  wishlistIds,
  onToggleWishlist,
  onNavigate,
  onOpenNotifications
}) => {
  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-12" aria-labelledby="hero-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Hero Copy (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Quiet unboxed kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#70826E]">
                <span>EDSER Digital Stationery</span>
                <span aria-hidden="true">·</span>
                <span>Instant Home Downloads</span>
              </div>

              {/* Exact required headline */}
              <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#2D2A26] tracking-tight leading-[1.12] text-balance">
                Plan your days. Make room for joy.
              </h1>

              {/* Exact required supporting text */}
              <p className="text-base sm:text-lg text-[#5C564E] max-w-xl leading-relaxed">
                Discover printable planners, practical spreadsheets, and creative activities for little explorers.
              </p>

              {/* Primary & Secondary Buttons as requested */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    onNavigate('shop');
                  }}
                  className="min-h-[48px] px-6 py-3.5 bg-[#2D2A26] text-white font-medium text-sm rounded-lg hover:bg-[#403C36] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-[#70826E]"
                >
                  <span>Shop digital downloads</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('light');
                    onNavigate('planners');
                  }}
                  className="min-h-[48px] px-6 py-3.5 bg-[#FFFDF9] border border-[#EFE9E1] text-[#2D2A26] hover:bg-[#F3EFEA] hover:border-[#D5E0D4] font-medium text-sm rounded-lg transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#70826E]"
                >
                  <span>Explore planners</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-[#EFE9E1] flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#70826E] font-medium">
                <span className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Instant File Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Lifetime Access & Free Re-Downloads
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                  Print As Many Copies As You Need
                </span>
              </div>
            </div>

            {/* Hero Image Showcase (5 cols on desktop) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#EFE9E1] shadow-md bg-[#F3EFEA] aspect-4/3 lg:aspect-4/3">
                <img
                  src={HERO_IMAGE}
                  alt="Aesthetic flatlay of printed undated daily planners, botanical sprigs, and creative stationery"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageFallback(e, 'EDSER Digital Stationery Collection', 'planners-organization')}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" aria-labelledby="featured-products-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
              Featured Collection
            </span>
            <h2 id="featured-products-heading" className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26] mt-1">
              Curated for Calm & Creativity
            </h2>
            <p className="text-sm text-[#5C564E] mt-1">
              Practical tools for everyday organization and imaginative, screen-free learning.
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('shop');
            }}
            className="text-xs font-semibold text-[#2D2A26] hover:text-[#70826E] flex items-center gap-1 py-1"
          >
            <span>View All Templates</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* 3-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.includes(product.id)}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Automated Launch Notification Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E] flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Collection Notification System
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2A26]">
              Upcoming Printable Drops
            </h3>
            <p className="text-sm text-[#5C564E] max-w-xl">
              Get notified first when our seasonal Nature Journal, homeschool kits, and financial dashboards are released.
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenNotifications();
            }}
            className="min-h-[48px] px-6 py-3 bg-[#70826E] text-white hover:bg-[#5E6E5D] font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shrink-0 active:scale-[0.98] shadow-xs focus-visible:ring-2 focus-visible:ring-[#70826E]"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            <span>Set Up Collection Alerts</span>
          </button>
        </div>
      </section>

    </div>
  );
};
