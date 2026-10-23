import React, { useState, useEffect } from 'react';
import { CollectionNotification, ProductCategory } from '../types';
import { X, Bell, Check, Sparkles, Send, Calendar, Tag } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CollectionNotification[];
  onTriggerTestAlert: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onTriggerTestAlert
}) => {
  const [email, setEmail] = useState('');
  const [subscribedCategories, setSubscribedCategories] = useState<ProductCategory[]>([
    'planners-organization',
    'kids-activities'
  ]);
  const [frequency, setFrequency] = useState<'instant' | 'monthly'>('instant');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('edser_notification_prefs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
          setEmail(parsed.email);
          setIsSubscribed(true);
        }
      } catch {
        // Ignore
      }
    }
  }, []);

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

  const handleToggleCategory = (cat: ProductCategory) => {
    triggerHaptic('light');
    if (subscribedCategories.includes(cat)) {
      if (subscribedCategories.length > 1) {
        setSubscribedCategories(subscribedCategories.filter((c) => c !== cat));
      }
    } else {
      setSubscribedCategories([...subscribedCategories, cat]);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    triggerHaptic('success');
    const prefs = {
      email,
      subscribedCategories,
      frequency,
      subscribedAt: new Date().toISOString()
    };
    localStorage.setItem('edser_notification_prefs', JSON.stringify(prefs));
    setIsSubscribed(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE9E1] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D48B80]/20 flex items-center justify-center text-[#D48B80]">
              <Bell className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="notif-modal-title" className="text-lg font-serif font-bold text-[#2D2A26]">
                Collection Launch Alerts
              </h2>
              <p className="text-xs text-stone-500">Automated notification system for new printable drops</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-stone-500 hover:text-[#2D2A26] rounded-full hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Subscription Box */}
          <div className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#70826E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Never Miss a New Template Release
              </span>
              <p className="text-xs text-[#5C564E]">
                Get automated email alerts the moment a seasonal planner, homeschool kit, or spreadsheet collection goes live.
              </p>
            </div>

            {isSubscribed ? (
              <div className="bg-[#EEF2ED] border border-[#D5E0D4] rounded-lg p-3.5 text-xs text-[#2D2A26] space-y-2">
                <div className="flex items-center gap-2 text-[#70826E] font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Alerts active for {email}</span>
                </div>
                <p className="text-stone-600">
                  You are registered to receive {frequency} launch notifications for{' '}
                  <strong>{subscribedCategories.length === 2 ? 'All Collections' : subscribedCategories[0] === 'planners-organization' ? 'Planners' : "Kids' Activities"}</strong>.
                </p>
                <button
                  onClick={() => setIsSubscribed(false)}
                  className="text-stone-500 underline hover:text-[#2D2A26] text-[11px]"
                >
                  Modify preferences or change email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                  <label htmlFor="notif-email" className="block text-xs font-medium text-[#2D2A26] mb-1">
                    Your Email Address
                  </label>
                  <input
                    id="notif-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="explorer@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EFE9E1] rounded-lg text-xs text-[#2D2A26] focus:border-[#70826E] outline-none"
                  />
                </div>

                {/* Category Checkboxes */}
                <div>
                  <span className="block text-xs font-medium text-[#2D2A26] mb-1.5">
                    Select Collection Types to Follow:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('planners-organization')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        subscribedCategories.includes('planners-organization')
                          ? 'bg-[#70826E] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {subscribedCategories.includes('planners-organization') && <Check className="w-3 h-3" />}
                      <span>Planners & Organization</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleCategory('kids-activities')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        subscribedCategories.includes('kids-activities')
                          ? 'bg-[#70826E] text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {subscribedCategories.includes('kids-activities') && <Check className="w-3 h-3" />}
                      <span>Kids’ Activities</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#2D2A26] text-white text-xs font-semibold rounded-lg hover:bg-[#403C36] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Activate Automated Collection Alerts</span>
                </button>
              </form>
            )}
          </div>

          {/* Live Upcoming Drops Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Recent & Upcoming Releases
              </h3>
              <button
                onClick={() => {
                  triggerHaptic('success');
                  onTriggerTestAlert();
                }}
                className="text-[11px] text-[#70826E] hover:underline font-medium"
                title="Send a sample browser test alert to test system responsiveness"
              >
                Send Test Alert
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl p-4 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#2D2A26]">{notif.title}</span>
                    <span className="text-[11px] text-[#70826E] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notif.date}
                    </span>
                  </div>
                  <p className="text-[#5C564E] leading-relaxed">{notif.description}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400">
                    <Tag className="w-3 h-3 text-[#D48B80]" />
                    <span>{notif.category === 'kids-activities' ? "Kids' Activities" : 'Planners & Organization'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
