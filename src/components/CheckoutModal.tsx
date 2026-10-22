import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '../types';
import { X, CheckCircle2, Download, ShieldCheck, CreditCard, ArrowLeft, Mail, FileCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { downloadProductPackage } from '../utils/fileDownloader';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
  onClearCart
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple-pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      setEmail(auth.currentUser.email || '');
      setName(auth.currentUser.displayName || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsProcessing(true);
    triggerHaptic('medium');

    const orderId = `EDS-${Math.floor(100000 + Math.random() * 900000)}`;
    const accessCode = `DL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const order: Order = {
      id: orderId,
      date: dateStr,
      email,
      customerName: name || 'Valued Creator',
      items: [...items],
      total,
      downloadAccessCode: accessCode,
      status: 'Processing',
      itemIds: items.map((i) => i.product.id),
      createdAt: dateStr
    };

    // If authenticated, persist to Firestore with real-time status tracking
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'orders', orderId), {
          orderId,
          userId: auth.currentUser.uid,
          customerEmail: email,
          customerName: name || 'Valued Creator',
          total,
          downloadAccessCode: accessCode,
          itemIds: items.map((i) => i.product.id),
          createdAt: dateStr,
          status: 'Processing',
        });

        // Simulate real-time digital file packaging and email delivery
        setTimeout(async () => {
          try {
            await setDoc(doc(db, 'orders', orderId), {
              status: 'Delivered',
            }, { merge: true });
          } catch (err) {
            console.warn('Could not update order status in background:', err);
          }
        }, 3500);
      } catch (err) {
        console.warn('Could not persist order to Firestore:', err);
      }
    }

    setCompletedOrder(order);
    setIsProcessing(false);
    onOrderCompleted(order);
    onClearCart();
    triggerHaptic('success');
  };

  const handleDownloadItem = (product: any) => {
    triggerHaptic('medium');
    downloadProductPackage(product, completedOrder?.id || 'EDSER-ORDER');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Checkout Header */}
        <div className="px-6 py-4 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <h2 id="checkout-modal-title" className="text-xl font-serif font-bold text-[#2D2A26]">
            {completedOrder ? 'Order Confirmed · Instant Downloads' : 'Express Digital Checkout'}
          </h2>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-stone-500 hover:text-[#2D2A26] rounded-full hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Completed Order State (Instant Download Delivery Center) */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#EEF2ED] text-[#70826E] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2D2A26]">
                Thank you, {completedOrder.customerName}!
              </h3>
              <p className="text-xs sm:text-sm text-[#5C564E] max-w-md mx-auto">
                Your digital templates are ready to download immediately. A backup access link has also been sent to{' '}
                <strong className="text-[#2D2A26]">{completedOrder.email}</strong>.
              </p>
            </div>

            {/* Receipt Summary Pill */}
            <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 flex flex-wrap items-center justify-between text-xs gap-4">
              <div>
                <span className="text-stone-500 block">Order Number</span>
                <span className="font-mono font-semibold text-[#2D2A26]">{completedOrder.id}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Date</span>
                <span className="font-semibold text-[#2D2A26]">{completedOrder.date}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Access Key</span>
                <span className="font-mono font-semibold text-[#70826E]">{completedOrder.downloadAccessCode}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Total Paid</span>
                <span className="font-serif font-bold text-sm text-[#2D2A26] tabular-nums">${completedOrder.total.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Download Files List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Your Purchased Digital Downloads
              </h4>
              <div className="space-y-3">
                {completedOrder.items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt=""
                        className="w-12 h-12 object-cover rounded-md bg-stone-100 shrink-0"
                      />
                      <div>
                        <h5 className="font-serif font-bold text-sm text-[#2D2A26]">{product.title}</h5>
                        <p className="text-[11px] text-stone-500">
                          {product.formats.join(' · ')} {quantity > 1 ? `(${quantity} licenses)` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadItem(product)}
                      className="min-h-[44px] px-4 py-2 bg-[#70826E] text-white hover:bg-[#5E6E5D] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E] shrink-0 active:scale-95"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      <span>Download File Package</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Guidance Tips */}
            <div className="bg-[#EEF2ED] rounded-xl p-4 text-xs text-[#4A453E] space-y-1.5 border border-[#D5E0D4]">
              <span className="font-semibold text-[#70826E] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                Next Steps for Printing & Digital Setup:
              </span>
              <p className="leading-relaxed">
                Save the downloaded package to your desktop, cloud drive (Google Drive, iCloud, Dropbox), or open directly in your tablet app (GoodNotes, Notability, or Excel). If printing at home, remember to set printer scale to 100% ("Actual Size").
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-full py-3 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36] transition-colors"
            >
              Continue Browsing EDSER
            </button>
          </div>
        ) : (
          /* Checkout Input Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Delivery Guarantee Pill */}
            <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-lg p-3 text-xs text-[#2D2A26] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#70826E] shrink-0" aria-hidden="true" />
              <span>Instant Digital Delivery: Download links available on this screen and delivered to your email.</span>
            </div>

            {/* Customer Contact Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                1. Delivery Email Address
              </h3>
              <div>
                <label htmlFor="checkout-email" className="block text-xs font-medium text-[#2D2A26] mb-1">
                  Email Address <span className="text-[#D48B80]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" aria-hidden="true" />
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-sm text-[#2D2A26] focus:border-[#70826E] focus:ring-1 focus:ring-[#70826E] outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Your instant download links and lifetime backup access will be emailed here.
                </p>
              </div>

              <div>
                <label htmlFor="checkout-name" className="block text-xs font-medium text-[#2D2A26] mb-1">
                  Full Name (Optional)
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Miller"
                  className="w-full px-4 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-sm text-[#2D2A26] focus:border-[#70826E] focus:ring-1 focus:ring-[#70826E] outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-2 border-t border-[#EFE9E1]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                2. Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPaymentMethod('card');
                  }}
                  className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[#70826E] bg-[#EEF2ED] text-[#2D2A26]'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#70826E]" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPaymentMethod('apple-pay');
                  }}
                  className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === 'apple-pay'
                      ? 'border-[#70826E] bg-[#EEF2ED] text-[#2D2A26]'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="font-bold"> Pay</span>
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPaymentMethod('paypal');
                  }}
                  className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-[#70826E] bg-[#EEF2ED] text-[#2D2A26]'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <span className="font-bold text-blue-700">PayPal</span>
                  <span>Checkout</span>
                </button>
              </div>
            </div>

            {/* Order Summary Line */}
            <div className="p-4 bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Shipping & Delivery (Instant Digital Access)</span>
                <span className="text-[#70826E] font-medium">$0.00</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-bold text-[#2D2A26]">
                <span className="font-serif">Total Due</span>
                <span className="font-serif tabular-nums">${total.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="px-4 py-3 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50 min-h-[44px] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Bag</span>
              </button>

              <button
                type="submit"
                disabled={isProcessing || !email}
                className="flex-1 min-h-[48px] py-3 px-6 bg-[#2D2A26] text-white text-sm font-semibold rounded-lg hover:bg-[#403C36] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#70826E]"
              >
                {isProcessing ? (
                  <span>Generating Secure Download Keys...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Complete Order & Get Instant Access (${total.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
