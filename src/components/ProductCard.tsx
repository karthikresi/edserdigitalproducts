import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Eye, Download, Check, Heart } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { handleImageFallback } from '../utils/imageFallback';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isInCart,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onAddToCart(product);
  };

  const handleCardClick = () => {
    triggerHaptic('light');
    onSelect(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    onToggleWishlist?.(product.id);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-[#70826E]"
      tabIndex={0}
      role="region"
      aria-label={`${product.title}, $${product.price.toFixed(2)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image Container with Fallback & Wishlist Button */}
      <div className="relative aspect-4/3 w-full bg-[#F3EFEA] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
          onError={(e) => handleImageFallback(e, product.title, product.category)}
        />

        {/* Wishlist Button floating top-right */}
        {onToggleWishlist && (
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition-colors z-10 ${
              isWishlisted
                ? 'bg-white text-[#D48B80] shadow-sm'
                : 'bg-white/80 text-stone-500 hover:text-[#D48B80] hover:bg-white'
            }`}
            aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            title={isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Subtle hover overlay affordance */}
        <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 text-[#2D2A26] text-xs font-medium px-3 py-1.5 rounded-md shadow-xs flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View Details
          </span>
        </div>
      </div>

      {/* Card Content with Zero-Pill Metadata Discipline */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#70826E]">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="flex items-center gap-1 text-stone-500">
              <Download className="w-3 h-3" aria-hidden="true" />
              Instant Download
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-lg font-serif font-bold text-[#2D2A26] group-hover:text-[#70826E] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-[#5C564E] line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Format Indicators (Clean unboxed inline text) */}
          <div className="text-xs text-stone-500 pt-1">
            <span className="font-medium text-[#2D2A26]">Formats:</span>{' '}
            {product.formats.slice(0, 2).join(' · ')}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#EFE9E1] flex items-center justify-between gap-3">
          <div>
            <span className="sr-only">Price:</span>
            <span className="text-lg font-serif font-bold text-[#2D2A26] tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            <span className="block text-[11px] text-[#70826E] font-medium">Digital Product</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#70826E] ${
                isInCart
                  ? 'bg-[#EEF2ED] text-[#70826E] hover:bg-[#E3EAE1]'
                  : 'bg-[#2D2A26] text-white hover:bg-[#403C36] active:scale-95'
              }`}
              aria-label={isInCart ? `Added to Cart: ${product.title}` : `Add to Cart: ${product.title}`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-[#70826E]" aria-hidden="true" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
