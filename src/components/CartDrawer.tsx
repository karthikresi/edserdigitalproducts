import React, { useEffect } from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { handleImageFallback } from '../utils/imageFallback';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onSelectProduct: (product: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onSelectProduct
}) => {
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

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="w-full max-w-md bg-[#FAF8F5] border-l border-[#EFE9E1] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Cart Header */}
        <div className="px-6 py-5 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <h2 id="cart-drawer-title" className="text-xl font-serif font-bold text-[#2D2A26]">
              Your Shopping Bag
            </h2>
            <p className="text-xs text-[#70826E] font-medium mt-0.5">
              {items.length === 0
                ? 'Your bag is empty'
                : `${items.reduce((sum, item) => sum + item.quantity, 0)} digital item${items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-stone-500 hover:text-[#2D2A26] rounded-full hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#70826E]">
                <Download className="w-8 h-8" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-[#2D2A26]">No downloads in cart</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Choose a printable planner or kids’ activity to start organizing your days and making room for joy.
                </p>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="mt-4 px-5 py-2.5 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
              >
                Explore Digital Downloads
              </button>
            </div>
          ) : (
            <ul className="space-y-4" aria-label="Cart items">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 flex gap-4 shadow-xs"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 object-cover rounded-lg bg-stone-100 shrink-0 cursor-pointer"
                    onError={(e) => handleImageFallback(e, product.title, product.category)}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                          className="text-left font-serif font-semibold text-sm text-[#2D2A26] hover:text-[#70826E] transition-colors line-clamp-1"
                        >
                          {product.title}
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            onRemoveItem(product.id);
                          }}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          aria-label={`Remove ${product.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="text-[11px] text-[#70826E] block font-medium">
                        Instant Digital Download
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQuantity(product.id, quantity - 1);
                          }}
                          className="p-1 text-stone-600 hover:text-[#2D2A26] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label={`Decrease quantity of ${product.title}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold tabular-nums text-[#2D2A26]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            triggerHaptic('light');
                            onUpdateQuantity(product.id, quantity + 1);
                          }}
                          className="p-1 text-stone-600 hover:text-[#2D2A26] transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          aria-label={`Increase quantity of ${product.title}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-serif font-bold text-sm text-[#2D2A26] tabular-nums">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#EFE9E1] bg-[#FAF8F5] space-y-4">
            
            {/* Delivery Guarantee Pill */}
            <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-lg p-3 text-xs text-[#2D2A26] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#70826E] shrink-0" aria-hidden="true" />
              <span>Instant link on confirmation & permanent email delivery ($0.00 delivery fee)</span>
            </div>

            {/* Subtotal */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Digital Delivery</span>
                <span className="text-[#70826E] font-medium">Free / Instant</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-[#2D2A26]">
                <span className="font-serif">Subtotal</span>
                <span className="font-serif font-bold text-lg tabular-nums">
                  ${subtotal.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                onProceedToCheckout();
              }}
              className="w-full min-h-[48px] py-3.5 px-4 bg-[#2D2A26] text-white font-medium text-sm rounded-lg hover:bg-[#403C36] active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#70826E]"
            >
              <span>Proceed to Instant Checkout</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
