import React, { useState } from 'react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, Download, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ShopViewProps {
  products: Product[];
  initialCategory?: ProductCategory | 'all';
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  initialCategory = 'all',
  onSelectProduct,
  onAddToCart,
  cartProductIds,
  wishlistIds,
  onToggleWishlist,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  React.useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    const matchesFormat =
      formatFilter === 'all' ||
      (formatFilter === 'spreadsheet' && product.formats.some((f) => f.includes('Excel') || f.includes('Sheets'))) ||
      (formatFilter === 'pdf' && product.formats.some((f) => f.includes('PDF')));

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      product.title.toLowerCase().includes(query) ||
      product.shortDescription.toLowerCase().includes(query) ||
      product.fullDescription.toLowerCase().includes(query) ||
      product.formats.some((f) => f.toLowerCase().includes(query));

    return matchesCategory && matchesFormat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Category Heading & Intro */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E]">
          Digital Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2A26]">
          {selectedCategory === 'all'
            ? 'All Digital Downloads'
            : selectedCategory === 'planners-organization'
            ? 'Planners & Organization'
            : 'Kids’ Screen-Free Activities'}
        </h1>
        <p className="text-sm text-[#5C564E] max-w-2xl leading-relaxed">
          Instantly downloadable printables and editable spreadsheets. No waiting, no physical shipping fees, and lifetime access to your purchased files.
        </p>
      </div>

      {/* Filter and Search Bar Controls (Interactive segmented buttons allowed by skill) */}
      <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Category Tabs (Segmented control) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F3EFEA] rounded-xl overflow-x-auto text-xs font-medium text-stone-700">
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory('all');
              }}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[40px] ${
                selectedCategory === 'all'
                  ? 'bg-white text-[#2D2A26] font-semibold shadow-xs'
                  : 'hover:text-[#2D2A26]'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory('planners-organization');
              }}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[40px] ${
                selectedCategory === 'planners-organization'
                  ? 'bg-white text-[#2D2A26] font-semibold shadow-xs'
                  : 'hover:text-[#2D2A26]'
              }`}
            >
              Planners & Organization
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory('kids-activities');
              }}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[40px] ${
                selectedCategory === 'kids-activities'
                  ? 'bg-white text-[#2D2A26] font-semibold shadow-xs'
                  : 'hover:text-[#2D2A26]'
              }`}
            >
              Kids’ Activities
            </button>
          </div>

          {/* Inline Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, keyword, or format..."
              className="w-full pl-9 pr-9 py-2 bg-white border border-[#EFE9E1] rounded-xl text-xs sm:text-sm text-[#2D2A26] placeholder:text-stone-400 focus:border-[#70826E] focus:ring-1 focus:ring-[#70826E] outline-none"
              aria-label="Filter products by text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 p-0.5"
                aria-label="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Format Selector Row */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#EFE9E1] text-xs text-stone-600 overflow-x-auto">
          <span className="flex items-center gap-1 font-medium text-stone-700 whitespace-nowrap">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Format:
          </span>
          <button
            onClick={() => setFormatFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              formatFilter === 'all' ? 'bg-[#2D2A26] text-white font-medium' : 'bg-stone-100 hover:bg-stone-200'
            }`}
          >
            All Formats
          </button>
          <button
            onClick={() => setFormatFilter('pdf')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              formatFilter === 'pdf' ? 'bg-[#2D2A26] text-white font-medium' : 'bg-stone-100 hover:bg-stone-200'
            }`}
          >
            Printable PDFs
          </button>
          <button
            onClick={() => setFormatFilter('spreadsheet')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
              formatFilter === 'spreadsheet' ? 'bg-[#2D2A26] text-white font-medium' : 'bg-stone-100 hover:bg-stone-200'
            }`}
          >
            Spreadsheets (.xlsx / Google Sheets)
          </button>
        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF9] border border-[#EFE9E1] rounded-2xl p-8 space-y-3">
          <Download className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#2D2A26]">No templates match your criteria</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your search query or choosing "All Items" to browse our complete collection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setFormatFilter('all');
            }}
            className="mt-2 px-4 py-2 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
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
      )}

    </div>
  );
};
