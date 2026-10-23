import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import {
  X,
  Download,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  Package,
  Sparkles,
  Zap,
  Key,
  Copy,
  Check,
  LogIn,
  Filter,
  AlertCircle
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { downloadProductPackage } from '../utils/fileDownloader';
import { PRODUCTS } from '../data/products';
import { Order, OrderStatus } from '../types';

interface FirestoreOrderDoc {
  id: string;
  orderId?: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
  total: number;
  downloadAccessCode: string;
  itemIds?: string[];
  createdAt?: string;
  status?: OrderStatus;
}

interface UserLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onOpenAuth?: () => void;
}

export const UserLibraryModal: React.FC<UserLibraryModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth
}) => {
  const [orders, setOrders] = useState<FirestoreOrderDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Delivered' | 'Processing'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Real-time Firestore subscription via onSnapshot
  useEffect(() => {
    if (!isOpen || !user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const path = 'orders';
    const q = query(collection(db, path), where('userId', '==', user.uid));

    // Listen for live updates whenever orders are created, processing, or delivered
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: FirestoreOrderDoc[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            orderId: data.orderId || docSnap.id,
            userId: data.userId,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            total: typeof data.total === 'number' ? data.total : 0,
            downloadAccessCode: data.downloadAccessCode || 'N/A',
            itemIds: Array.isArray(data.itemIds) ? data.itemIds : [],
            createdAt: data.createdAt || 'Recent',
            // Default to 'Delivered' if unassigned, or reflect current Firestore status
            status: (data.status as OrderStatus) || 'Delivered',
          });
        });

        // Sort latest orders to the top
        list.reverse();
        setOrders(list);
        setIsLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, path);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyCode = (code: string, id: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  /**
   * Allows users or reviewers to interactively toggle/simulate real-time status changes
   * between 'Processing' and 'Delivered' in Firestore.
   */
  const handleToggleStatus = async (orderId: string, currentStatus: OrderStatus) => {
    if (!user) return;
    triggerHaptic('medium');
    const newStatus: OrderStatus = currentStatus === 'Processing' ? 'Delivered' : 'Processing';
    setUpdatingOrderId(orderId);

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
      });
      triggerHaptic('success');
    } catch (err) {
      console.warn('Could not update order status:', err);
      // Fallback try with setDoc merge
      try {
        await setDoc(doc(db, 'orders', orderId), { status: newStatus }, { merge: true });
      } catch (innerErr) {
        handleFirestoreError(innerErr, OperationType.UPDATE, `orders/${orderId}`);
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /**
   * Creates a sample instant demo order in Firestore to immediately test and observe real-time tracking
   */
  const handleCreateDemoOrder = async () => {
    if (!user) return;
    triggerHaptic('medium');
    const demoId = `EDS-${Math.floor(100000 + Math.random() * 900000)}`;
    const accessKey = `DL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    try {
      await setDoc(doc(db, 'orders', demoId), {
        orderId: demoId,
        userId: user.uid,
        customerEmail: user.email || 'customer@example.com',
        customerName: user.displayName || 'Valued Creator',
        total: 14.50,
        downloadAccessCode: accessKey,
        itemIds: ['undated-daily-planner', 'wildlife-coloring-adventure'],
        createdAt: dateStr,
        status: 'Processing',
      });

      // Auto-transition from Processing to Delivered in real time after 4 seconds
      setTimeout(async () => {
        try {
          await setDoc(doc(db, 'orders', demoId), { status: 'Delivered' }, { merge: true });
        } catch {
          // ignore background timeout failure
        }
      }, 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${demoId}`);
    }
  };

  if (!isOpen) return null;

  // Filter orders by selected status tab
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const processingCount = orders.filter((o) => o.status === 'Processing').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EFE9E1]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 id="library-modal-title" className="font-serif font-bold text-xl text-[#2D2A26]">
                My Digital Library & Order Status
              </h2>
              {user && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {user ? (
                <>Cloud sync connected to <strong className="font-medium text-[#2D2A26]">{user.email}</strong></>
              ) : (
                'Sign in to track cloud orders and access your permanent download licenses.'
              )}
            </p>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
            aria-label="Close library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unauthenticated State */}
        {!user ? (
          <div className="py-10 text-center space-y-4 bg-white/70 border border-[#EFE9E1] rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EE] text-[#70826E] flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-[#2D2A26]">Sign In to View Orders</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Sign in with Google to view the real-time status of your orders, manage licenses, and download your files anytime.
              </p>
            </div>
            {onOpenAuth && (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenAuth();
                }}
                className="px-5 py-2.5 bg-[#70826E] hover:bg-[#5E6E5D] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-2 transition-transform active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Filter Tabs & Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-[#EFE9E1]/60 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setStatusFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#2D2A26] font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-[#2D2A26]'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setStatusFilter('Delivered');
                  }}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    statusFilter === 'Delivered'
                      ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Delivered ({deliveredCount})</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setStatusFilter('Processing');
                  }}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                    statusFilter === 'Processing'
                      ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-amber-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Processing ({processingCount})</span>
                </button>
              </div>

              {/* Demo order generation trigger to see real-time updates */}
              <button
                onClick={handleCreateDemoOrder}
                className="text-[11px] font-semibold text-[#70826E] hover:text-[#5E6E5D] flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-[#EEF2ED] transition-colors"
                title="Create a test order in Firestore to watch live Processing -> Delivered state transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+ Test Live Order</span>
              </button>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {isLoading ? (
                <div className="py-14 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#70826E]" />
                  <span>Fetching real-time orders from Firestore...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-white/60 border border-[#EFE9E1] rounded-xl p-6">
                  <Package className="w-10 h-10 text-stone-300 mx-auto" />
                  <h3 className="font-serif font-bold text-base text-[#2D2A26]">
                    {statusFilter === 'all'
                      ? 'No Cloud Orders Found Yet'
                      : `No Orders in '${statusFilter}' Status`}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {statusFilter === 'all'
                      ? 'Your purchased digital planners, spreadsheets, and activity kits will automatically appear here with real-time fulfillment status.'
                      : `Switch back to "All" or place a new order to see real-time order tracking.`}
                  </p>
                  <button
                    onClick={handleCreateDemoOrder}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#70826E] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#5E6E5D] transition-transform active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create Sample Test Order</span>
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isDelivered = order.status === 'Delivered';
                  const isUpdatingThis = updatingOrderId === order.orderId;

                  return (
                    <div
                      key={order.id}
                      className={`bg-white border rounded-xl p-4 sm:p-5 space-y-4 transition-all shadow-2xs ${
                        isDelivered
                          ? 'border-[#EFE9E1]'
                          : 'border-amber-200 bg-amber-50/20'
                      }`}
                    >
                      {/* Top Bar: Order ID, Date, and Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F4EFEA]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#2D2A26]">
                              {order.orderId || order.id}
                            </span>
                            <span className="text-[11px] text-stone-400">•</span>
                            <span className="text-[11px] text-stone-500">{order.createdAt}</span>
                          </div>
                          {order.total > 0 && (
                            <p className="text-[11px] text-stone-500 font-serif">
                              Total: <strong className="text-[#2D2A26]">${order.total.toFixed(2)} USD</strong>
                            </p>
                          )}
                        </div>

                        {/* Real-time Order Status Badge */}
                        <div className="flex items-center gap-2">
                          {isDelivered ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Delivered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                              <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                              <span>Processing</span>
                            </span>
                          )}

                          {/* Interactive Status Toggle for Review & Testing */}
                          <button
                            onClick={() => handleToggleStatus(order.orderId || order.id, order.status || 'Delivered')}
                            disabled={isUpdatingThis}
                            className="text-[10px] font-medium text-stone-500 hover:text-stone-800 underline underline-offset-2 px-1.5 py-1 rounded hover:bg-stone-100 transition-colors"
                            title="Toggle Firestore status between Processing and Delivered"
                          >
                            {isUpdatingThis ? 'Updating...' : `Set to ${isDelivered ? 'Processing' : 'Delivered'}`}
                          </button>
                        </div>
                      </div>

                      {/* Processing Notice Banner if currently Processing */}
                      {!isDelivered && (
                        <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-semibold text-amber-900">
                              Order is currently processing
                            </p>
                            <p className="text-[11px] text-amber-800/90 leading-relaxed">
                              Your 300 DPI high-resolution files and custom lifetime license are being formatted. Status will switch to <strong>Delivered</strong> automatically in real-time.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Purchased Products in this Order */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          Digital Items Included ({(order.itemIds || []).length}):
                        </div>
                        <div className="space-y-2">
                          {(order.itemIds || ['undated-daily-planner']).map((prodId: string) => {
                            const prod = PRODUCTS.find((p) => p.id === prodId) || PRODUCTS[0];
                            return (
                              <div
                                key={prodId}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] border border-[#EFE9E1] p-3 rounded-lg text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prod.image}
                                    alt=""
                                    className="w-10 h-10 object-cover rounded-md bg-stone-100 shrink-0 border border-stone-200"
                                  />
                                  <div>
                                    <div className="font-serif font-bold text-[#2D2A26]">{prod.title}</div>
                                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                                      <span>{prod.categoryLabel}</span>
                                      <span>•</span>
                                      <span>{prod.formats[0]}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <button
                                    onClick={() => {
                                      triggerHaptic('medium');
                                      downloadProductPackage(prod, order.orderId || order.id);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                      isDelivered
                                        ? 'bg-[#70826E] text-white hover:bg-[#5E6E5D] shadow-2xs active:scale-95'
                                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                    }`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{isDelivered ? 'Download Files' : 'Preview Sample'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Download Access Code Key */}
                      <div className="pt-2 border-t border-[#F4EFEA] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-stone-600">
                          <Key className="w-3.5 h-3.5 text-[#70826E]" />
                          <span className="text-[11px]">Lifetime License Code:</span>
                          <code className="px-2 py-0.5 bg-stone-100 text-stone-800 font-mono rounded text-[11px] border border-stone-200">
                            {order.downloadAccessCode}
                          </code>
                        </div>

                        <button
                          onClick={() => handleCopyCode(order.downloadAccessCode, order.id)}
                          className="text-[11px] font-medium text-[#70826E] hover:text-[#5E6E5D] flex items-center gap-1 px-2 py-1 rounded hover:bg-[#EEF2ED] transition-colors"
                        >
                          {copiedCodeId === order.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer info badge */}
        <div className="pt-3 border-t border-[#EFE9E1] flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5 text-[#70826E] font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Lifetime download access guaranteed across all devices</span>
          </div>
          <div className="text-[10px] text-stone-400">
            Powered by Firebase Cloud Firestore
          </div>
        </div>

      </div>
    </div>
  );
};
