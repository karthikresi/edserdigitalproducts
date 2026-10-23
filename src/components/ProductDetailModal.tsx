import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../types';
import {
  X,
  Check,
  ShoppingBag,
  Download,
  Printer,
  Laptop,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Heart,
  Star,
  User as UserIcon,
  Trash2,
  MessageSquare,
  Send,
  CheckCircle2,
  LogIn,
  Maximize2,
  Eye,
  FileText,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { downloadProductPackage } from '../utils/fileDownloader';
import { PrintPreview } from './PrintPreview';
import { handleImageFallback } from '../utils/imageFallback';
import { db } from '../firebase';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
  onInstantBuy: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  user?: User | null;
  onOpenAuth?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isInCart,
  onInstantBuy,
  isWishlisted = false,
  onToggleWishlist,
  user,
  onOpenAuth,
}) => {
  // Review state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [visualMode, setVisualMode] = useState<'photo' | 'print'>('photo');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Keyboard navigation & lock scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (product) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  // Set default reviewer name when user changes
  useEffect(() => {
    if (user) {
      setReviewerName(user.displayName || user.email?.split('@')[0] || 'Creative Explorer');
    } else {
      setReviewerName('');
    }
  }, [user]);

  // Subscribe to reviews in Firestore for current product
  useEffect(() => {
    if (!product) {
      setReviews([]);
      return;
    }

    setIsLoadingReviews(true);
    setFormFeedback(null);
    setReviewTitle('');
    setReviewComment('');
    setIsFormExpanded(false);

    const reviewsPath = `products/${product.id}/reviews`;
    const reviewsRef = collection(db, 'products', product.id, 'reviews');

    const unsubscribe = onSnapshot(
      reviewsRef,
      (snapshot) => {
        const loaded: ProductReview[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            productId: data.productId || product.id,
            userId: data.userId || '',
            userName: data.userName || 'Anonymous',
            userPhotoURL: data.userPhotoURL || '',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            title: data.title || '',
            comment: data.comment || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        // Sort descending by creation date
        loaded.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReviews(loaded);
        setIsLoadingReviews(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, reviewsPath);
        setIsLoadingReviews(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [product]);

  if (!product) return null;

  const handleDownloadSample = () => {
    triggerHaptic('medium');
    downloadProductPackage(product, 'SAMPLE-PREVIEW');
  };

  // Submit new review to Firestore
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormFeedback({
        type: 'error',
        message: 'Please sign in with your Google account to post a verified review.',
      });
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (trimmedComment.length < 3) {
      setFormFeedback({
        type: 'error',
        message: 'Please write at least 3 characters in your review feedback.',
      });
      return;
    }

    if (trimmedComment.length > 1000) {
      setFormFeedback({
        type: 'error',
        message: 'Review text exceeds maximum allowed 1,000 characters.',
      });
      return;
    }

    setIsSubmittingReview(true);
    setFormFeedback(null);

    // Sanitized alphanumeric ID meeting isValidId regex: ^[a-zA-Z0-9_\-]+$
    const cleanUid = user.uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const reviewId = `rev_${Date.now()}_${cleanUid}`;
    const path = `products/${product.id}/reviews/${reviewId}`;

    const reviewPayload = {
      reviewId,
      productId: product.id,
      userId: user.uid,
      userName: (reviewerName.trim() || user.displayName || 'Verified Customer').slice(0, 128),
      userPhotoURL: user.photoURL || '',
      rating: Math.max(1, Math.min(5, Math.floor(ratingInput))), // guaranteed integer 1-5
      title: reviewTitle.trim().slice(0, 128),
      comment: trimmedComment.slice(0, 1000),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'products', product.id, 'reviews', reviewId), reviewPayload);
      triggerHaptic('success');
      setFormFeedback({
        type: 'success',
        message: 'Thank you! Your review has been saved to the EDSER community.',
      });
      setReviewComment('');
      setReviewTitle('');
      setIsFormExpanded(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
      setFormFeedback({
        type: 'error',
        message: 'Could not submit your review. Please try again.',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Delete own review from Firestore
  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm('Are you sure you want to delete your review?');
    if (!confirmDelete) return;

    triggerHaptic('medium');
    const path = `products/${product.id}/reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, 'products', product.id, 'reviews', reviewId));
      triggerHaptic('light');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Compute rating metrics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const userHasReviewed = user ? reviews.some((r) => r.userId === user.uid) : false;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="sticky top-0 z-10 bg-[#FAF8F5]/95 backdrop-blur-md px-6 py-4 border-b border-[#EFE9E1] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#70826E]">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500">Digital Product</span>
            {totalReviews > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {averageRating.toFixed(1)} ({totalReviews})
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-full text-stone-500 hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Hero Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Preview Left (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Segmented View Mode Toggle */}
              <div className="flex rounded-lg p-1 bg-[#F3EFEA] border border-[#EFE9E1] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVisualMode('photo');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs ${
                    visualMode === 'photo'
                      ? 'bg-white text-[#2D2A26] shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Product Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVisualMode('print');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs ${
                    visualMode === 'print'
                      ? 'bg-[#70826E] text-white shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A4 / Letter Print</span>
                </button>
              </div>

              {/* Visual Display Container */}
              {visualMode === 'photo' ? (
                <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-100 border border-[#EFE9E1] shadow-xs relative group">
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageFallback(e, product.title, product.category)}
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setVisualMode('print');
                      }}
                      className="bg-white/95 text-[#2D2A26] text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3 text-[#70826E]" />
                      Simulate Print
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-[#EFEBE4] border border-[#EFE9E1] shadow-xs p-3 flex flex-col items-center justify-center relative">
                  <div className="w-4/5 h-[90%] bg-white rounded-xs shadow-md border border-stone-200 flex flex-col justify-between p-3 text-[9px] select-none">
                    <div className="border-b border-stone-300 pb-1 flex justify-between items-center text-stone-500">
                      <span className="font-bold text-[#70826E] text-[10px] truncate max-w-[130px]">{product.title}</span>
                      <span className="font-mono text-[8px] bg-stone-100 px-1 rounded">A4 / Letter</span>
                    </div>
                    <div className="space-y-1.5 py-1 flex-1 flex flex-col justify-center">
                      <div className="h-1.5 bg-stone-200 rounded-xs w-3/4" />
                      <div className="h-1 bg-stone-100 rounded-xs w-full" />
                      <div className="h-1 bg-stone-100 rounded-xs w-5/6" />
                      <div className="grid grid-cols-3 gap-1 pt-1">
                        <div className="h-8 border border-dashed border-stone-300 rounded bg-[#FAF8F5] p-1 flex items-center justify-center text-[7px] text-[#70826E] font-medium">Safe Margin</div>
                        <div className="h-8 border border-dashed border-stone-300 rounded bg-[#FAF8F5] p-1 flex items-center justify-center text-[7px] text-[#70826E] font-medium">Vector 300DPI</div>
                        <div className="h-8 border border-dashed border-stone-300 rounded bg-[#FAF8F5] p-1 flex items-center justify-center text-[7px] text-[#70826E] font-medium">Ink-Friendly</div>
                      </div>
                    </div>
                    <div className="border-t border-stone-200 pt-1 flex justify-between text-[8px] text-stone-400">
                      <span>0.5" Margins</span>
                      <span>100% True Scale</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setIsPreviewModalOpen(true);
                    }}
                    className="absolute inset-0 bg-stone-900/20 hover:bg-stone-900/30 transition-colors flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[1px]"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand Full Print Suite</span>
                  </button>
                </div>
              )}

              {/* Dedicated Print Preview Button */}
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  const el = document.getElementById('interactive-print-preview-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setIsPreviewModalOpen(true);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-[#FAF0EE] border border-[#D48B80]/40 hover:bg-[#F4E4E1] text-xs font-semibold text-[#B3584B] flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#D48B80]"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Simulate A4 & US Letter Page Print</span>
              </button>

              {/* Digital Product Delivery Banner */}
              <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-lg p-3 text-xs text-[#2D2A26] flex items-start gap-2.5">
                <ShieldCheck
                  className="w-4 h-4 text-[#70826E] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <strong className="font-semibold block text-[#70826E]">
                    Instant Digital Delivery Guaranteed
                  </strong>
                  <span className="text-stone-600">
                    No physical item will be shipped. Direct download links are presented
                    immediately after checkout and emailed with permanent lifetime access.
                  </span>
                </div>
              </div>

              {/* Sample Download Button */}
              <button
                onClick={handleDownloadSample}
                className="w-full py-2 px-4 rounded-lg border border-dashed border-stone-300 hover:border-[#70826E] bg-white text-xs font-medium text-[#2D2A26] hover:text-[#70826E] flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
                title="Download a sample access sheet demonstrating the delivery format"
              >
                <Download className="w-3.5 h-3.5 text-[#70826E]" aria-hidden="true" />
                <span>Test Download Access Package (.txt preview)</span>
              </button>
            </div>

            {/* Product Purchase Module Right (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2
                  id="product-modal-title"
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2A26] leading-tight"
                >
                  {product.title}
                </h2>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-serif font-bold text-[#2D2A26] tabular-nums">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    One-time payment · Household license
                  </span>
                </div>

                {/* Rating line */}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-500" aria-label={`Rated ${averageRating.toFixed(1)} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(averageRating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-stone-600 font-medium">
                    {totalReviews > 0
                      ? `${averageRating.toFixed(1)} (${totalReviews} review${totalReviews === 1 ? '' : 's'})`
                      : 'No reviews yet'}
                  </span>
                  <span className="text-stone-300">·</span>
                  <button
                    onClick={() => {
                      const reviewSection = document.getElementById('customer-reviews-section');
                      reviewSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[#70826E] hover:underline"
                  >
                    View reviews
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#4A453E] leading-relaxed">
                {product.fullDescription}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    onAddToCart(product);
                  }}
                  className={`flex-1 min-h-[48px] px-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-[#70826E] ${
                    isInCart
                      ? 'bg-[#EEF2ED] text-[#70826E] border border-[#C6D6C4]'
                      : 'bg-[#2D2A26] text-white hover:bg-[#403C36] active:scale-[0.99]'
                  }`}
                  aria-label={
                    isInCart
                      ? 'Item already added to cart'
                      : 'Add this digital download to cart'
                  }
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4 text-[#70826E]" aria-hidden="true" />
                      <span>In Your Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('success');
                    onInstantBuy(product);
                  }}
                  className="min-h-[48px] px-6 py-3 rounded-lg text-sm font-semibold bg-[#D48B80] text-white hover:bg-[#C2796E] transition-colors flex items-center justify-center gap-2 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#D48B80]"
                  aria-label="Direct instant purchase"
                >
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Buy Now with Instant Access</span>
                </button>

                {onToggleWishlist && (
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onToggleWishlist(product.id);
                    }}
                    className={`min-h-[48px] px-4 py-3 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-colors ${
                      isWishlisted
                        ? 'border-[#D48B80] bg-[#F7EAE7] text-[#D48B80]'
                        : 'border-stone-300 bg-white text-stone-700 hover:border-[#D48B80] hover:text-[#D48B80]'
                    }`}
                    aria-label={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                  </button>
                )}
              </div>

              {/* Key Features Bullet List */}
              <div className="pt-4 border-t border-[#EFE9E1] space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Core Highlights
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4A453E]">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#70826E] font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Deep Specifications Grid (File Formats, Compatibility, Included Content, Printing) */}
          <div className="pt-6 border-t border-[#EFE9E1] grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Included Contents */}
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#70826E]" aria-hidden="true" />
                What's Included in Your Download
              </h4>
              <ul className="space-y-2 text-xs text-[#5C564E]">
                {product.includedContents.map((content, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-stone-400 font-mono text-[10px] mt-0.5">
                      {idx + 1}.
                    </span>
                    <span>{content}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 2: Formats & Dimensions */}
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#70826E]" aria-hidden="true" />
                File Formats & Page Sizes
              </h4>
              <div className="space-y-2 text-xs text-[#5C564E]">
                <div>
                  <strong className="block text-[#2D2A26]">Provided Formats:</strong>
                  <span>{product.formats.join(', ')}</span>
                </div>
                <div className="pt-1">
                  <strong className="block text-[#2D2A26]">Included Document Sizes:</strong>
                  <span>{product.sizes.join(' · ')}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Software & Hardware Compatibility */}
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#70826E]" aria-hidden="true" />
                Software Compatibility
              </h4>
              <ul className="space-y-1.5 text-xs text-[#5C564E]">
                {product.compatibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#70826E]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 4: Printing Guidance */}
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#70826E]" aria-hidden="true" />
                Printing Guidance & Recommendations
              </h4>
              <div className="space-y-2 text-xs text-[#5C564E]">
                <div>
                  <strong className="text-[#2D2A26]">Paper Stock:</strong>{' '}
                  {product.printingGuidance.recommendedPaper}
                </div>
                <div>
                  <strong className="text-[#2D2A26]">Printer Setup:</strong>{' '}
                  {product.printingGuidance.printerSettings}
                </div>
                <div>
                  <strong className="text-[#2D2A26]">Margins:</strong>{' '}
                  {product.printingGuidance.margins}
                </div>
                {product.printingGuidance.bindingTips && (
                  <div>
                    <strong className="text-[#2D2A26]">Finishing & Binding:</strong>{' '}
                    {product.printingGuidance.bindingTips}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Store Owner Configuration Flag (Transparent & helpful) */}
          {product.ownerNotesPrompt && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle
                className="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <strong className="font-semibold block text-amber-950">
                  Store Owner Note (Flagged Configuration Detail)
                </strong>
                <span className="text-amber-800 leading-relaxed">
                  {product.ownerNotesPrompt}
                </span>
              </div>
            </div>
          )}

          {/* INTERACTIVE PRINT PREVIEW SECTION (A4 / US LETTER SIMULATION) */}
          <section
            id="interactive-print-preview-section"
            className="pt-8 border-t border-[#EFE9E1] space-y-4"
            aria-label="Interactive Page Print Preview"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2D2A26] flex items-center gap-2">
                  <Printer className="w-5 h-5 text-[#70826E]" aria-hidden="true" />
                  Print Preview (A4 & US Letter)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Simulate page margins, printer safe areas, and multi-sheet layouts before purchase or printing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsPreviewModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-[#70826E] text-xs font-medium text-stone-700 hover:text-[#70826E] bg-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open Full-Screen Studio</span>
              </button>
            </div>

            <PrintPreview product={product} isInline={true} />
          </section>

          {/* CUSTOMER REVIEWS & RATINGS SYSTEM (PERSISTED IN FIRESTORE) */}
          <section
            id="customer-reviews-section"
            className="pt-8 border-t border-[#EFE9E1] space-y-6"
            aria-label="Customer Reviews"
          >
            {/* Header & Score Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE9E1]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2D2A26] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#70826E]" aria-hidden="true" />
                  Customer Feedback & Reviews
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Real experiences from customers printing, planning, and organizing with this template.
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-4 bg-white border border-[#EFE9E1] px-4 py-2.5 rounded-xl shadow-xs">
                <div className="text-center">
                  <div className="text-2xl font-serif font-bold text-[#2D2A26] leading-none">
                    {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium uppercase tracking-wider mt-0.5">
                    out of 5
                  </div>
                </div>

                <div className="h-8 w-px bg-stone-200" aria-hidden="true" />

                <div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} in database
                  </div>
                </div>
              </div>
            </div>

            {/* Post Review Form / Prompt Box */}
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-5 space-y-4">
              {user ? (
                <div>
                  {!isFormExpanded && !userHasReviewed ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-[#2D2A26]">
                          Have you used this template?
                        </h4>
                        <p className="text-xs text-stone-500">
                          Share your printing tips, paper advice, or organization insights.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setIsFormExpanded(true);
                        }}
                        className="px-4 py-2 bg-[#2D2A26] hover:bg-[#403C36] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#70826E]"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Write a Review
                      </button>
                    </div>
                  ) : null}

                  {userHasReviewed && !isFormExpanded && (
                    <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-lg p-3 text-xs text-[#2D2A26] flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[#70826E] font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        You have posted a review for this download.
                      </span>
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          setIsFormExpanded(true);
                        }}
                        className="text-xs text-[#70826E] font-semibold hover:underline"
                      >
                        Write another feedback
                      </button>
                    </div>
                  )}

                  {isFormExpanded && (
                    <form onSubmit={handleSubmitReview} className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          Share Your Customer Review
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsFormExpanded(false)}
                          className="text-xs text-stone-400 hover:text-stone-600"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Interactive Star Rating Selector */}
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1.5">
                          Your Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => {
                                  triggerHaptic('light');
                                  setRatingInput(star);
                                }}
                                className="p-1 rounded-sm focus-visible:ring-2 focus-visible:ring-[#70826E] transition-transform hover:scale-110"
                                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    (hoverRating || ratingInput) >= star
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-stone-600 ml-2">
                            {ratingInput === 5 && '5 Stars · Excellent & Recommended'}
                            {ratingInput === 4 && '4 Stars · Great Download'}
                            {ratingInput === 3 && '3 Stars · Good & Useful'}
                            {ratingInput === 2 && '2 Stars · Needs Improvement'}
                            {ratingInput === 1 && '1 Star · Poor Experience'}
                          </span>
                        </div>
                      </div>

                      {/* Review Title Input */}
                      <div>
                        <label
                          htmlFor="review-title"
                          className="block text-xs font-medium text-stone-600 mb-1"
                        >
                          Headline (Optional)
                        </label>
                        <input
                          id="review-title"
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          maxLength={128}
                          placeholder="e.g. Crisp layout, printed beautifully on cardstock!"
                          className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#70826E] text-[#2D2A26]"
                        />
                      </div>

                      {/* Review Comment Textarea */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label
                            htmlFor="review-comment"
                            className="block text-xs font-medium text-stone-600"
                          >
                            Detailed Feedback <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[11px] text-stone-400">
                            {reviewComment.length}/1000 characters
                          </span>
                        </div>
                        <textarea
                          id="review-comment"
                          rows={3}
                          required
                          minLength={3}
                          maxLength={1000}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How did this download work for your home, schedule, or children? Any paper or printer settings you recommend?"
                          className="w-full text-xs p-3 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#70826E] text-[#2D2A26] leading-relaxed"
                        />
                      </div>

                      {/* Reviewer Name Display */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="reviewer-name"
                            className="block text-xs font-medium text-stone-600 mb-1"
                          >
                            Display Name
                          </label>
                          <input
                            id="reviewer-name"
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            maxLength={128}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#70826E] text-[#2D2A26]"
                          />
                        </div>
                        <div className="flex items-end">
                          <span className="text-[11px] text-stone-500 pb-2">
                            Posting as verified Google account ({user.email})
                          </span>
                        </div>
                      </div>

                      {/* Feedback banner */}
                      {formFeedback && (
                        <div
                          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                            formFeedback.type === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {formFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>{formFeedback.message}</span>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsFormExpanded(false)}
                          className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReview || reviewComment.trim().length < 3}
                          className="px-5 py-2.5 bg-[#70826E] hover:bg-[#5E6F5C] disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-[#70826E]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingReview ? 'Posting...' : 'Post Verified Review'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* Unauthenticated state prompt */
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-[#2D2A26] flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Have you downloaded or printed this?
                    </h4>
                    <p className="text-xs text-stone-500">
                      Sign in with your Google account to post a review and help other shoppers.
                    </p>
                  </div>
                  {onOpenAuth ? (
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        onOpenAuth();
                      }}
                      className="px-4 py-2.5 bg-[#2D2A26] hover:bg-[#403C36] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shrink-0 focus-visible:ring-2 focus-visible:ring-[#70826E]"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In to Review
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {isLoadingReviews ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  Loading customer reviews from Firestore...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 px-4 bg-white/60 border border-dashed border-[#EFE9E1] rounded-xl space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EFE9E1] flex items-center justify-center mx-auto text-stone-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-serif font-semibold text-[#2D2A26]">
                    No reviews yet for this template
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Be the first to share your thoughts! Whether it's the paper quality you chose or how much time it saved you, your feedback helps the EDSER community.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EFE9E1]">
                  {reviews.map((review) => {
                    const isOwnReview = user?.uid === review.userId;
                    const formattedDate = new Date(review.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }
                    );

                    return (
                      <article
                        key={review.id}
                        className="py-4 space-y-2 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {review.userPhotoURL ? (
                              <img
                                src={review.userPhotoURL}
                                alt={review.userName}
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-full object-cover border border-[#EFE9E1]"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#EEF2ED] border border-[#D5E0D4] text-[#70826E] text-xs font-semibold flex items-center justify-center">
                                {review.userName.charAt(0).toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-[#2D2A26]">
                                  {review.userName}
                                </span>
                                <span className="text-[10px] bg-[#EEF2ED] text-[#70826E] font-medium px-1.5 py-0.5 rounded">
                                  Verified
                                </span>
                              </div>
                              <span className="text-[11px] text-stone-400">{formattedDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center text-amber-500" aria-label={`${review.rating} of 5 stars`}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= review.rating
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-stone-300'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Author delete button */}
                            {isOwnReview && (
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="p-1 rounded text-stone-400 hover:text-red-600 transition-colors"
                                title="Delete your review"
                                aria-label="Delete your review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {review.title && (
                          <h5 className="text-xs font-semibold text-[#2D2A26] pt-0.5">
                            {review.title}
                          </h5>
                        )}

                        <p className="text-xs text-[#5C564E] leading-relaxed whitespace-pre-line">
                          {review.comment}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Full-Screen Print Preview Lightbox Modal */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-60 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Full-Screen Print Preview Studio"
        >
          <div className="relative w-full max-w-5xl bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col">
            <div className="sticky top-0 z-10 bg-[#FAF8F5]/95 backdrop-blur-md px-6 py-3 border-b border-[#EFE9E1] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#70826E]">
                <Printer className="w-4 h-4" />
                <span>Full-Screen Print Preview Studio</span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-600 font-normal">{product.title}</span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsPreviewModalOpen(false);
                }}
                className="p-1.5 rounded-full text-stone-500 hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
                aria-label="Close full-screen print preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">
              <PrintPreview product={product} onClose={() => setIsPreviewModalOpen(false)} isInline={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
