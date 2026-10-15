import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { Search, X, Download, ArrowRight, CornerDownLeft } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  initialQuery?: string;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();
  const results = products.filter((p) => {
    if (!normalized) return true;
    return (
      p.title.toLowerCase().includes(normalized) ||
      p.shortDescription.toLowerCase().includes(normalized) ||
      p.fullDescription.toLowerCase().includes(normalized) ||
      p.categoryLabel.toLowerCase().includes(normalized) ||
      p.formats.some((f) => f.toLowerCase().includes(normalized)) ||
      p.features.some((feat) => feat.toLowerCase().includes(normalized))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Search digital downloads"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#EFE9E1] flex items-center gap-3 bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-stone-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search printable planners, spreadsheets, coloring books..."
            className="flex-1 bg-transparent text-base sm:text-lg text-[#2D2A26] placeholder:text-stone-400 outline-none font-serif"
            aria-label="Search digital downloads"
          />
          {query && (
            <button
              onClick={() => {
                triggerHaptic('light');
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-md"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-2.5 py-1 text-xs text-stone-500 hover:text-[#2D2A26] rounded-md hover:bg-[#F3EFEA] transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Live Status Region for Screen Readers */}
        <div className="sr-only" aria-live="polite">
          {results.length} digital products found for query {query}
        </div>

        {/* Quick Filter Tag Buttons */}
        <div className="px-5 py-2.5 bg-[#F3EFEA]/60 border-b border-[#EFE9E1] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-stone-500 text-[11px] whitespace-nowrap">Suggested:</span>
          {['All', 'Planners', 'Meal Planner', 'Kids', 'Coloring Book', 'Spreadsheet'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                triggerHaptic('light');
                setQuery(tag === 'All' ? '' : tag);
              }}
              className="px-2.5 py-1 rounded-md bg-white border border-[#EFE9E1] hover:border-[#70826E] text-stone-700 whitespace-nowrap transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-stone-500">
              <p className="font-serif text-base text-[#2D2A26]">No templates matching "{query}"</p>
              <p className="text-xs">Try searching for "planner", "meal", "spreadsheet", or "national parks".</p>
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectProduct(product);
                  onClose();
                }}
                className="group p-3 sm:p-4 rounded-xl bg-[#FFFDF9] hover:bg-[#EEF2ED] border border-[#EFE9E1] hover:border-[#D5E0D4] transition-all flex items-center justify-between gap-4 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSelectProduct(product);
                    onClose();
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#70826E]">
                      <span>{product.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span>Digital Download</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#2D2A26] group-hover:text-[#70826E] transition-colors truncate">
                      {product.title}
                    </h4>
                    <p className="text-xs text-stone-500 truncate max-w-md">
                      {product.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-serif font-bold text-sm text-[#2D2A26] tabular-nums">
                    ${product.price.toFixed(2)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#70826E] group-hover:text-white flex items-center justify-center text-stone-400 transition-colors shadow-2xs">
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-2.5 bg-[#FAF8F5] border-t border-[#EFE9E1] text-[11px] text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3 text-[#70826E]" />
            All products are instant digital downloads
          </span>
          <span className="hidden sm:inline">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
