/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActivePage, CartItem, Product, Order, CollectionNotification } from './types';
import { PRODUCTS, INITIAL_NOTIFICATIONS } from './data/products';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { FaqView } from './views/FaqView';
import { PoliciesView } from './views/PoliciesView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { NotificationModal } from './components/NotificationModal';
import { SearchBarModal } from './components/SearchBarModal';
import { VoiceNavOverlay } from './components/VoiceNavOverlay';
import { AuthModal } from './components/AuthModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { CreativeStudioModal } from './components/CreativeStudioModal';
import { UserLibraryModal } from './components/UserLibraryModal';
import { WishlistModal } from './components/WishlistModal';
import { voiceService, VoiceCommandResult } from './utils/speech';
import { triggerHaptic } from './utils/haptics';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './utils/firestoreError';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('edser_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('edser_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<CollectionNotification[]>(INITIAL_NOTIFICATIONS);
  const [unreadNotifCount, setUnreadNotifCount] = useState(1);

  // Modals State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Accessibility State
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('edser_high_contrast') === 'true';
    } catch {
      return false;
    }
  });
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState('');
  const [lastVoiceMessage, setLastVoiceMessage] = useState('');

  // Listen to Firebase Auth state and sync with Firestore User Profile
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. Initial Profile Upsert
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid),
            {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e) {
          console.warn('Firestore user profile sync notice:', e);
        }

        // 2. Real-time listener on user's Firestore document (for wishlist & preferences)
        unsubscribeSnapshot = onSnapshot(
          doc(db, 'users', currentUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (Array.isArray(data.wishlist)) {
                setWishlistIds(data.wishlist);
                try {
                  localStorage.setItem('edser_wishlist', JSON.stringify(data.wishlist));
                } catch {
                  // Ignore
                }
              }
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          }
        );
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('edser_cart', JSON.stringify(cart));
    } catch {
      // Storage full or unavailable
    }
  }, [cart]);

  // Persist wishlist locally as fallback
  useEffect(() => {
    try {
      localStorage.setItem('edser_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // Storage full or unavailable
    }
  }, [wishlistIds]);

  // Apply high contrast mode class to body
  useEffect(() => {
    try {
      if (highContrast) {
        document.body.classList.add('high-contrast-mode');
        localStorage.setItem('edser_high_contrast', 'true');
      } else {
        document.body.classList.remove('high-contrast-mode');
        localStorage.setItem('edser_high_contrast', 'false');
      }
    } catch {
      // Ignore
    }
  }, [highContrast]);

  // Wishlist toggle handler storing preferences in Firestore user profile
  const handleToggleWishlist = async (productId: string) => {
    triggerHaptic('medium');
    const isCurrentlySaved = wishlistIds.includes(productId);
    const updated = isCurrentlySaved
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(updated);

    // Save directly to Firestore User Profile if authenticated
    if (user) {
      const path = `users/${user.uid}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            wishlist: updated,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  };

  // Voice Navigation setup
  const handleVoiceCommand = useCallback((result: VoiceCommandResult) => {
    setLastVoiceCommand(result.transcript);
    setLastVoiceMessage(result.message);

    const text = result.transcript.toLowerCase();

    if (text.includes('wishlist') || text.includes('saved') || text.includes('favorite')) {
      setIsWishlistOpen(true);
    } else if (text.includes('chat') || text.includes('assistant') || text.includes('ai')) {
      setIsChatOpen(true);
    } else if (text.includes('studio') || text.includes('creative') || text.includes('video') || text.includes('music') || text.includes('science')) {
      setIsStudioOpen(true);
    } else if (result.commandType === 'navigate' && result.target) {
      setActivePage(result.target as ActivePage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (result.commandType === 'cart') {
      setIsCartOpen(true);
    } else if (result.commandType === 'contrast') {
      setHighContrast((prev) => !prev);
    } else if (result.commandType === 'close') {
      setSelectedProduct(null);
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      setIsSearchOpen(false);
      setIsNotifOpen(false);
      setIsAuthOpen(false);
      setIsChatOpen(false);
      setIsStudioOpen(false);
      setIsLibraryOpen(false);
      setIsWishlistOpen(false);
    } else if (result.commandType === 'search') {
      setSearchInitialQuery(result.target || '');
      setIsSearchOpen(true);
    } else if (result.commandType === 'notification') {
      setIsNotifOpen(true);
    }
  }, []);

  useEffect(() => {
    voiceService.setCallbacks(
      handleVoiceCommand,
      (listening) => setIsVoiceListening(listening)
    );
  }, [handleVoiceCommand]);

  // Global keyboard shortcuts (e.g., '/' to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === '/') {
        e.preventDefault();
        triggerHaptic('light');
        setSearchInitialQuery('');
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleInstantBuy = (product: Product) => {
    handleAddToCart(product);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (_order: Order) => {
    // Handled in CheckoutModal with Firestore persistence
  };

  const handleTriggerTestAlert = () => {
    const newAlert: CollectionNotification = {
      id: `alert-${Date.now()}`,
      title: 'Spring Botanical Habit & Garden Planner',
      date: 'Just Dropped!',
      category: 'planners-organization',
      description: 'A new 24-page printable plant care, seasonal gardening, and wellness tracking kit is now live.',
      status: 'just-launched'
    };
    setNotifications((prev) => [newAlert, ...prev]);
    setUnreadNotifCount((prev) => prev + 1);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartProductIds = cart.map((item) => item.product.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2D2A26] transition-colors selection:bg-[#E8A598]/30">
      
      {/* Header Contract */}
      <Header
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => {
          setSearchInitialQuery('');
          setIsSearchOpen(true);
        }}
        onOpenNotifications={() => {
          setIsNotifOpen(true);
          setUnreadNotifCount(0);
        }}
        unreadNotificationsCount={unreadNotifCount}
        highContrast={highContrast}
        onToggleContrast={() => setHighContrast(!highContrast)}
        isVoiceListening={isVoiceListening}
        onToggleVoice={() => voiceService.toggleListening()}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {activePage === 'home' && (
          <HomeView
            products={PRODUCTS}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenNotifications={() => setIsNotifOpen(true)}
          />
        )}

        {activePage === 'shop' && (
          <ShopView
            products={PRODUCTS}
            initialCategory="all"
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activePage === 'planners' && (
          <ShopView
            products={PRODUCTS}
            initialCategory="planners-organization"
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activePage === 'kids' && (
          <ShopView
            products={PRODUCTS}
            initialCategory="kids-activities"
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            cartProductIds={cartProductIds}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {activePage === 'about' && (
          <AboutView
            onShopClick={() => {
              setActivePage('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'contact' && <ContactView />}

        {activePage === 'faq' && <FaqView />}

        {activePage === 'policies' && <PoliciesView />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      {/* Modals & Slide-Out Panels */}
      
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isInCart={selectedProduct ? cartProductIds.includes(selectedProduct.id) : false}
        onInstantBuy={handleInstantBuy}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Wishlist Drawer / Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        allProducts={PRODUCTS}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        cartProductIds={cartProductIds}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Checkout Modal with Real Sample Delivery Package and Firestore Save */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCompleted={handleOrderCompleted}
        onClearCart={() => setCart([])}
      />

      {/* Search Bar Modal (Fast keyboard discovery) */}
      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={PRODUCTS}
        onSelectProduct={(p) => setSelectedProduct(p)}
        initialQuery={searchInitialQuery}
      />

      {/* Collection Drop Launch Notification System */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* Voice-Controlled Navigation Overlay (Accessibility Cues) */}
      <VoiceNavOverlay
        isListening={isVoiceListening}
        onToggleListening={() => voiceService.toggleListening()}
        lastCommand={lastVoiceCommand}
        lastMessage={lastVoiceMessage}
      />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      {/* Gemini AI Assistant Modal (Multi-turn Chat, Search/Maps Grounding, Audio Transcription) */}
      <GeminiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Creative & Science Studio Modal (Veo, Lyria, Live Voice, DeepMind Science) */}
      <CreativeStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />

      {/* User Library Modal (Firestore Orders & Lifetime Download Keys) */}
      <UserLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        user={user}
      />

    </div>
  );
}
