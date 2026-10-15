import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { X, Heart, ShoppingBag, Trash2, ShieldCheck, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  allProducts: Product[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
  user: User | null;
  onOpenAuth: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  allProducts,
  onToggleWishlist,
  onAddToCart,
  cartProductIds,
  user,
  onOpenAuth,
  onSelectProduct,
}) => {
  const [notifyOnUpdates, setNotifyOnUpdates] = useState(true);
  const [wishlistNote, setWishlistNote] = useState('');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSavedMessage, setPrefsSavedMessage] = useState('');

  // Load wishlist preferences from Firestore if user is logged in
  useEffect(() => {
    if (user && isOpen) {
      const loadUserPrefs = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.wishlistPreferences) {
              setNotifyOnUpdates(data.wishlistPreferences.notifyOnUpdates ?? true);
              setWishlistNote(data.wishlistPreferences.note ?? '');
            }
          }
        } catch (err) {
          console.warn('Could not load wishlist preferences:', err);
        }
      };
      loadUserPrefs();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsSavingPrefs(true);
    triggerHaptic('medium');
    const path = `users/${user.uid}`;

    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          wishlistPreferences: {
            notifyOnUpdates,
            note: wishlistNote.trim(),
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );
      setPrefsSavedMessage('Preferences saved to your Firestore profile!');
      triggerHaptic('success');
      setTimeout(() => setPrefsSavedMessage(''), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wishlist-drawer-title"
    >
      <div className="w-full max-w-md bg-[#FAF8F5] border-l border-[#EFE9E1] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F7EAE7] text-[#D48B80] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 id="wishlist-drawer-title" className="text-xl font-serif font-bold text-[#2D2A26]">
                My Wishlist
              </h2>
              <span className="text-xs text-[#70826E] font-medium block">
                {wishlistedProducts.length === 0
                  ? 'No saved templates'
                  : `${wishlistedProducts.length} saved item${wishlistedProducts.length === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-stone-500 hover:text-[#2D2A26] rounded-full hover:bg-[#F3EFEA] transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Cloud Sync Status */}
          {user ? (
            <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-xl p-3 text-xs text-[#2D2A26] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#70826E]" />
                <span>Synced to Firestore ({user.email})</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-3.5 text-xs text-stone-700 space-y-2">
              <p className="leading-relaxed">
                Items are currently saved locally. Sign in with Google to sync your wishlist and preferences to your Firestore profile.
              </p>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onOpenAuth();
                }}
                className="px-3 py-1.5 bg-[#2D2A26] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Sync</span>
              </button>
            </div>
          )}

          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F7EAE7] flex items-center justify-center text-[#D48B80] mx-auto">
                <Heart className="w-8 h-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-[#2D2A26]">Your wishlist is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Click the heart icon on any planner, spreadsheet, or activity book to save it for later.
                </p>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="mt-2 px-5 py-2.5 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36] transition-colors"
              >
                Browse All Templates
              </button>
            </div>
          ) : (
            <ul className="space-y-3.5" aria-label="Wishlist items">
              {wishlistedProducts.map((product) => {
                const isInCart = cartProductIds.includes(product.id);
                return (
                  <li
                    key={product.id}
                    className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 flex gap-3.5 shadow-2xs"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg bg-stone-100 shrink-0 cursor-pointer"
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
                              triggerHaptic('light');
                              onToggleWishlist(product.id);
                            }}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            aria-label={`Remove ${product.title} from wishlist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-stone-500 block">
                          ${product.price.toFixed(2)} USD · Instant Download
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            onAddToCart(product);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            isInCart
                              ? 'bg-[#EEF2ED] text-[#70826E]'
                              : 'bg-[#2D2A26] text-white hover:bg-[#403C36]'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isInCart ? 'In Bag' : 'Add to Bag'}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Firestore User Preferences Form */}
          {wishlistedProducts.length > 0 && (
            <div className="pt-4 border-t border-[#EFE9E1]">
              <form onSubmit={handleSavePreferences} className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 space-y-3">
                <span className="text-xs font-serif font-bold text-[#2D2A26] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D48B80]" />
                  Wishlist & Notification Preferences
                </span>

                <label className="flex items-start gap-2.5 text-xs text-[#4A453E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnUpdates}
                    onChange={(e) => setNotifyOnUpdates(e.target.checked)}
                    className="mt-0.5 rounded text-[#70826E] focus:ring-[#70826E]"
                  />
                  <span>Send me email notifications if seasonal additions or bonuses launch for my saved items</span>
                </label>

                <div>
                  <label htmlFor="wishlist-note" className="block text-[11px] font-medium text-stone-500 mb-1">
                    Personal Planning Note (Saved in Firestore)
                  </label>
                  <input
                    id="wishlist-note"
                    type="text"
                    value={wishlistNote}
                    onChange={(e) => setWishlistNote(e.target.value)}
                    placeholder="e.g. Planning for homeschool term or holiday gifting"
                    className="w-full px-3 py-2 bg-white border border-[#EFE9E1] rounded-lg text-xs text-[#2D2A26] outline-none focus:border-[#70826E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="w-full py-2 bg-[#70826E] hover:bg-[#5E6E5D] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {isSavingPrefs ? 'Saving to Firestore...' : 'Save Preferences to Profile'}
                </button>

                {prefsSavedMessage && (
                  <p className="text-[11px] text-[#70826E] font-medium text-center">
                    {prefsSavedMessage}
                  </p>
                )}
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#EFE9E1] bg-[#FAF8F5]">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full py-3 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36] transition-colors"
          >
            Continue Exploring Store
          </button>
        </div>

      </div>
    </div>
  );
};
