import React, { useState } from 'react';
import { ActivePage } from '../types';
import { ShoppingBag, Bell, Search, Menu, X, Mic, MicOff, Sun, Moon, Bot, Sparkles, User as UserIcon, Heart } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { User } from 'firebase/auth';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  highContrast: boolean;
  onToggleContrast: () => void;
  isVoiceListening: boolean;
  onToggleVoice: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenChat: () => void;
  onOpenStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount,
  highContrast,
  onToggleContrast,
  isVoiceListening,
  onToggleVoice,
  user,
  onOpenAuth,
  onOpenChat,
  onOpenStudio,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: ActivePage) => {
    triggerHaptic('light');
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navLinks: { label: string; page: ActivePage }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Shop All', page: 'shop' },
    { label: 'Planners & Organization', page: 'planners' },
    { label: 'Kids’ Activities', page: 'kids' },
    { label: 'About', page: 'about' },
    { label: 'Contact', page: 'contact' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EFE9E1] transition-colors duration-200" role="banner">
      {/* Skip to Content for Keyboard Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Main Top Bar Contract: 3 Zones with gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6 lg:gap-8">
        
        {/* Zone 1: Brand Wordmark (Single text element in display serif) */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#2D2A26] hover:text-[#70826E] transition-colors whitespace-nowrap shrink-0 text-left focus-visible:ring-2 focus-visible:ring-[#70826E] rounded-sm py-1"
          aria-label="EDSER Home"
        >
          EDSER
        </button>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-[#4A453E]" aria-label="Primary Navigation">
          {navLinks.map((link) => {
            const isActive = activePage === link.page;
            return (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 ${
                  isActive 
                    ? 'border-[#70826E] text-[#2D2A26] font-semibold' 
                    : 'border-transparent hover:text-[#2D2A26] hover:border-[#D48B80]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Interactive Affordances, AI Features & Cart CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* AI Assistant Chat Trigger */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenChat();
            }}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2D2A26] bg-[#EEF2ED] hover:bg-[#E2EBE1] border border-[#D5E0D4] rounded-lg transition-colors flex items-center gap-1.5"
            title="Ask EDSER Gemini Assistant (Multi-turn chat, Search/Maps grounding, Audio transcription)"
          >
            <Bot className="w-4 h-4 text-[#70826E]" />
            <span className="hidden sm:inline">AI Guide</span>
          </button>

          {/* Creative & Science Studio */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenStudio();
            }}
            className="px-2.5 py-1.5 text-xs font-semibold text-[#2D2A26] bg-[#F7EAE7] hover:bg-[#F2DDD9] border border-[#ECCDC7] rounded-lg transition-colors flex items-center gap-1.5"
            title="Veo Video, Lyria Music, Live API Voice & Bioscience Skills"
          >
            <Sparkles className="w-4 h-4 text-[#D48B80]" />
            <span className="hidden md:inline">Creative Studio</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenSearch();
            }}
            className="p-2 text-[#4A453E] hover:text-[#2D2A26] rounded-md hover:bg-[#F3EFEA] transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label="Search templates and printables"
            title="Search templates (Press / to search)"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Launch Notifications Alert */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenNotifications();
            }}
            className="relative p-2 text-[#4A453E] hover:text-[#2D2A26] rounded-md hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label={`Collection Launch Notifications (${unreadNotificationsCount} updates available)`}
            title="Collection Launch Notifications"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D48B80]" aria-hidden="true" />
            )}
          </button>

          {/* Voice Navigation Toggle for Motor Accessibility */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onToggleVoice();
            }}
            className={`p-2 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E] ${
              isVoiceListening
                ? 'bg-[#70826E] text-white ring-2 ring-[#70826E]'
                : 'text-[#4A453E] hover:text-[#2D2A26] hover:bg-[#F3EFEA]'
            }`}
            aria-label={isVoiceListening ? 'Stop voice control navigation' : 'Start voice control navigation'}
            title={isVoiceListening ? 'Voice Navigation Active (Listening...)' : 'Enable Voice Control Navigation'}
          >
            {isVoiceListening ? <Mic className="w-4 h-4 animate-pulse" aria-hidden="true" /> : <MicOff className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleContrast();
            }}
            className="p-2 text-[#4A453E] hover:text-[#2D2A26] rounded-md hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label={highContrast ? 'Switch to warm palette' : 'Switch to high-contrast mode for accessibility'}
            title={highContrast ? 'High Contrast: On' : 'High Contrast Mode'}
          >
            {highContrast ? <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* User Auth Profile */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenAuth();
            }}
            className="p-1.5 rounded-lg border border-[#EFE9E1] hover:border-stone-400 bg-white text-[#2D2A26] flex items-center gap-1.5 text-xs font-medium"
            title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in with Google'}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <UserIcon className="w-4 h-4 text-stone-600" />
            )}
            <span className="hidden lg:inline">{user ? (user.displayName?.split(' ')[0] || 'Account') : 'Sign In'}</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenWishlist();
            }}
            className="relative p-2 text-[#4A453E] hover:text-[#D48B80] rounded-md hover:bg-[#F3EFEA] transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label={`My Wishlist (${wishlistCount} saved items)`}
            title="My Saved Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#D48B80] text-[#D48B80]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D48B80]" aria-hidden="true" />
            )}
          </button>

          {/* Primary Action: Shopping Cart Button */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenCart();
            }}
            className="relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-[#2D2A26] rounded-md hover:bg-[#403C36] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label={`Shopping Cart with ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span className="font-semibold tabular-nums bg-white/20 px-1.5 py-0.5 rounded text-xs ml-0.5" aria-hidden="true">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Hamburger (Visible on small screens) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="xl:hidden p-2 text-[#2D2A26] hover:bg-[#F3EFEA] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#70826E]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Accessible, responsive, generous touch targets) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#FAF8F5] border-b border-[#EFE9E1] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;
              return (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`text-left px-4 py-3 rounded-lg text-base font-medium min-h-[48px] flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#EEF2ED] text-[#2D2A26] font-semibold border-l-2 border-[#70826E]'
                      : 'text-[#4A453E] hover:bg-[#F3EFEA] hover:text-[#2D2A26]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="text-xs text-[#70826E] font-medium">Active</span>}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#EFE9E1] flex flex-col gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                setMobileMenuOpen(false);
                onOpenWishlist();
              }}
              className="text-left px-4 py-2.5 rounded-lg text-sm text-[#4A453E] hover:bg-[#F3EFEA] flex items-center justify-between min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#D48B80] text-[#D48B80]' : 'text-[#D48B80]'}`} />
                <span>Saved Wishlist ({wishlistCount})</span>
              </span>
              {wishlistCount > 0 && (
                <span className="text-xs bg-[#F7EAE7] text-[#D48B80] px-2 py-0.5 rounded font-semibold">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="text-left px-4 py-2.5 rounded-lg text-sm text-[#2D2A26] bg-[#EEF2ED] hover:bg-[#E2EBE1] flex items-center gap-2 min-h-[44px]"
            >
              <Bot className="w-4 h-4 text-[#70826E]" />
              <span>EDSER AI Assistant & Audio Transcription</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setMobileMenuOpen(false);
                onOpenStudio();
              }}
              className="text-left px-4 py-2.5 rounded-lg text-sm text-[#2D2A26] bg-[#F7EAE7] hover:bg-[#F2DDD9] flex items-center gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-[#D48B80]" />
              <span>Creative Studio (Veo, Lyria, Live Voice & Bioscience)</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('light');
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="text-left px-4 py-2.5 rounded-lg text-sm text-[#4A453E] hover:bg-[#F3EFEA] flex items-center gap-2 min-h-[44px]"
            >
              <UserIcon className="w-4 h-4 text-stone-600" />
              <span>{user ? `Account (${user.email})` : 'Sign in with Google'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
