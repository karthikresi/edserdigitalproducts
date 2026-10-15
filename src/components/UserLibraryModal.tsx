import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { X, Download, ShieldCheck, FileCheck, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { downloadProductPackage } from '../utils/fileDownloader';
import { PRODUCTS } from '../data/products';

interface UserLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserLibraryModal: React.FC<UserLibraryModalProps> = ({ isOpen, onClose, user }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    const path = 'orders';
    try {
      const q = query(collection(db, path), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setOrders(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE9E1]">
          <div>
            <h2 id="library-modal-title" className="font-serif font-bold text-xl text-[#2D2A26]">
              My Digital Downloads Library
            </h2>
            <p className="text-xs text-stone-500">
              Synced with your Firebase account ({user?.email})
            </p>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
            aria-label="Close library"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#70826E]" />
              <span>Loading your cloud orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileCheck className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#2D2A26]">No Cloud Orders Found Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Any digital planners or kids' activities you purchase while signed in will automatically appear here with lifetime re-download access.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-[#2D2A26]">Order: {order.orderId || order.id}</span>
                  <span className="text-stone-500">{order.createdAt}</span>
                </div>

                <div className="space-y-2">
                  {(order.itemIds || []).map((prodId: string) => {
                    const prod = PRODUCTS.find((p) => p.id === prodId) || PRODUCTS[0];
                    return (
                      <div key={prodId} className="flex items-center justify-between bg-stone-50 p-2.5 rounded-lg text-xs">
                        <span className="font-medium text-[#2D2A26]">{prod.title}</span>
                        <button
                          onClick={() => {
                            triggerHaptic('medium');
                            downloadProductPackage(prod, order.orderId);
                          }}
                          className="px-3 py-1 bg-[#70826E] text-white rounded-md text-[11px] font-semibold flex items-center gap-1.5"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-[#EFE9E1] flex items-center gap-2 text-[11px] text-[#70826E]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lifetime access guarantee active for all registered downloads</span>
        </div>

      </div>
    </div>
  );
};
