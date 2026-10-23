import React from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOutUser } from '../firebase';
import { X, LogIn, LogOut, ShieldCheck, Download, Bookmark, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onOpenLibrary: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenLibrary,
}) => {
  React.useEffect(() => {
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

  const handleSignIn = async () => {
    triggerHaptic('medium');
    try {
      await signInWithGoogle();
      triggerHaptic('success');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic('light');
    try {
      await signOutUser();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#EFE9E1] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EEF2ED] text-[#70826E] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 id="auth-modal-title" className="font-serif font-bold text-xl text-[#2D2A26]">
              {user ? 'My Account & Library' : 'Sign in to EDSER'}
            </h2>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 bg-[#FFFDF9] border border-[#EFE9E1] rounded-xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border border-stone-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#70826E] text-white flex items-center justify-center font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-serif font-bold text-sm text-[#2D2A26] block truncate">
                  {user.displayName || 'EDSER Explorer'}
                </span>
                <span className="text-xs text-stone-500 truncate block">
                  {user.email}
                </span>
                <span className="text-[11px] text-[#70826E] font-medium flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  Synced with Firestore
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                  onOpenLibrary();
                }}
                className="w-full py-2.5 px-4 bg-[#FFFDF9] border border-[#EFE9E1] hover:border-[#70826E] text-xs font-semibold text-[#2D2A26] rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#70826E]" />
                <span>View My Purchased Downloads & Keys</span>
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
              Sign in with your Google account to sync your digital purchases, download keys, and saved templates securely across devices using Firebase.
            </p>

            <button
              onClick={handleSignIn}
              className="w-full min-h-[48px] py-3 px-4 bg-[#2D2A26] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#403C36] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#70826E]">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Protected by Firebase Authentication & Firestore Security Rules</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
