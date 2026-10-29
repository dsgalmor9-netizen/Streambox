import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileDock } from './components/layout/MobileDock';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { HomeView } from './components/home/HomeView';
import { CatalogView } from './components/catalog/CatalogView';
import { CheckoutView } from './components/checkout/CheckoutView';
import { ClientPortalView } from './components/account/ClientPortalView';
import { ChatView } from './components/chat/ChatView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { GiveawayView } from './components/giveaway/GiveawayView';
import { NotFoundView } from './components/pages/NotFoundView';
import { LegalView } from './components/pages/LegalView';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';
import { Product } from './types';
import { AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { ToastProvider } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { settings, currentUser, isAuthLoading } = useStore();

  const [currentView, setCurrentView] = useState<string>('inicio');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [instantCheckoutProduct, setInstantCheckoutProduct] = useState<{
    product: Product;
    modalityId: string;
  } | null>(null);

  // URL route synchronization, Mandatory Auth Gateway & Hard Protection of /admin
  useEffect(() => {
    if (isAuthLoading) return;

    const rawPath = window.location.pathname.replace(/^\//, '').toLowerCase();
    const targetRoute = rawPath || 'inicio';

    // Requirement: Before accessing the store website, user MUST login or register.
    if (!currentUser) {
      if (rawPath === 'register' || rawPath === 'registro') {
        setCurrentView('register');
        return;
      }
      setCurrentView('login');
      if (rawPath && rawPath !== 'login') {
        window.history.replaceState(null, '', '/login');
      }
      return;
    }

    if (targetRoute === 'admin' || targetRoute.startsWith('admin-')) {
      if (currentUser?.role === 'SUPER_ADMIN') {
        setCurrentView('admin');
        setAccessDeniedMessage(null);
      } else {
        // Hard Protection: Non-superadmin is denied and redirected to /inicio
        setAccessDeniedMessage(
          'Acceso denegado: El área /admin está restringida exclusivamente a administradores con Custom Claim SUPER_ADMIN verificado en Firebase Authentication.'
        );
        setCurrentView('inicio');
        window.history.replaceState(null, '', '/inicio');
      }
    } else if (targetRoute === 'login') {
      if (currentUser?.role === 'SUPER_ADMIN') {
        setCurrentView('admin');
        window.history.replaceState(null, '', '/admin');
      } else {
        setCurrentView('inicio');
        window.history.replaceState(null, '', '/inicio');
      }
    } else {
      setCurrentView(targetRoute);
    }

    const handlePopState = () => {
      if (!currentUser) {
        setCurrentView('login');
        return;
      }
      const p = window.location.pathname.replace(/^\//, '').toLowerCase() || 'inicio';
      if (p === 'admin' || p.startsWith('admin-')) {
        if (currentUser?.role === 'SUPER_ADMIN') {
          setCurrentView('admin');
        } else {
          setCurrentView('inicio');
        }
      } else {
        setCurrentView(p);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthLoading, currentUser]);

  const handleInstantBuy = (product: Product, modalityId: string) => {
    setInstantCheckoutProduct({ product, modalityId });
    handleNavigate('checkout');
  };

  const handleProceedFromCartToCheckout = () => {
    setInstantCheckoutProduct(null);
    handleNavigate('checkout');
  };

  const handleNavigate = (view: string) => {
    setAccessDeniedMessage(null);

    // If user is not authenticated, keep in login/register
    if (!currentUser && view !== 'login' && view !== 'register' && view !== 'registro') {
      setCurrentView('login');
      window.history.pushState(null, '', '/login');
      return;
    }

    // Hard Protection on navigation to /admin
    if (view === 'admin' || view.startsWith('admin')) {
      if (currentUser?.role !== 'SUPER_ADMIN') {
        setAccessDeniedMessage(
          'Acceso denegado: No cuentas con el Custom Claim SUPER_ADMIN en Firebase Authentication.'
        );
        setCurrentView('inicio');
        window.history.pushState(null, '', '/inicio');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const routePath = view === 'inicio' ? '/' : `/${view}`;
    window.history.pushState(null, '', routePath);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine role before rendering interface to prevent flashes
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs font-mono text-neutral-400">
            Verificando autenticación y permisos de seguridad...
          </span>
        </div>
      </div>
    );
  }

  const isSuperAdminView = currentView.startsWith('admin') && currentUser?.role === 'SUPER_ADMIN';

  // Dedicated Admin Interface Layout (Without normal store navigation as requested in Section 6)
  if (isSuperAdminView) {
    return (
      <div className="min-h-screen bg-[#09090b] text-[#F3F4F6] selection:bg-amber-500 selection:text-black">
        <AdminPortalView
          initialSubTab={currentView.replace('admin-', '') || 'dashboard'}
          onNavigate={handleNavigate}
        />
      </div>
    );
  }

  // Pure Authentication Gateway View (No store navigation, no navbar, no catalog links while registering or logging in)
  if (!currentUser || currentView === 'login') {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-[#09090b] text-[#F3F4F6] selection:bg-amber-500 selection:text-black">
        {accessDeniedMessage && (
          <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 z-50">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{accessDeniedMessage}</span>
            <button
              onClick={() => setAccessDeniedMessage(null)}
              className="ml-3 underline hover:text-white text-[11px] font-bold"
            >
              Cerrar
            </button>
          </div>
        )}
        <LoginView onNavigate={handleNavigate} />
      </div>
    );
  }

  // Client Store Interface Layout (Only accessible AFTER authenticated)
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#F3F4F6] selection:bg-amber-500 selection:text-black">
      {/* Access Denied Security Notice */}
      {accessDeniedMessage && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 z-50">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{accessDeniedMessage}</span>
          <button
            onClick={() => setAccessDeniedMessage(null)}
            className="ml-3 underline hover:text-white text-[11px] font-bold"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Maintenance Mode Alert if active */}
      {settings.maintenanceMode && (
        <div className="bg-amber-950 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>La tienda está en modo mantenimiento temporal. Las compras se reanudarán en breve.</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => handleNavigate('login')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'inicio' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectProduct={(p) => setSelectedProductDetail(p)}
            onInstantBuy={handleInstantBuy}
          />
        )}

        {currentView === 'login' && (
          <LoginView onNavigate={handleNavigate} />
        )}

        {(currentView === 'register' || currentView === 'registro') && (
          <RegisterView onNavigate={handleNavigate} />
        )}

        {currentView === 'catalogo' && (
          <CatalogView
            onSelectProduct={(p) => setSelectedProductDetail(p)}
            onInstantBuy={handleInstantBuy}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutView
            instantProduct={instantCheckoutProduct}
            onNavigate={handleNavigate}
          />
        )}

        {(currentView === 'cuenta' || currentView.startsWith('cuenta-')) && (
          <ClientPortalView
            initialTab={
              currentView === 'cuenta-pedidos'
                ? 'pedidos'
                : currentView === 'cuenta-pagos'
                ? 'pagos'
                : currentView === 'cuenta-reembolsos'
                ? 'reembolsos'
                : currentView === 'cuenta-notificaciones'
                ? 'notificaciones'
                : currentView === 'cuenta-favoritos'
                ? 'favoritos'
                : currentView === 'cuenta-perfil'
                ? 'perfil'
                : 'pedidos'
            }
            onNavigate={handleNavigate}
            onSelectProduct={(p) => setSelectedProductDetail(p)}
            onInstantBuy={handleInstantBuy}
          />
        )}

        {currentView === 'chat' && <ChatView />}

        {currentView === 'giveaway' && (
          <GiveawayView onOpenAuth={() => handleNavigate('login')} />
        )}

        {currentView === 'terminos' && (
          <LegalView type="terminos" onNavigate={handleNavigate} />
        )}

        {currentView === 'privacidad' && (
          <LegalView type="privacidad" onNavigate={handleNavigate} />
        )}

        {currentView === 'reembolsos' && (
          <LegalView type="reembolsos" onNavigate={handleNavigate} />
        )}

        {currentView === 'cookies' && (
          <LegalView type="cookies" onNavigate={handleNavigate} />
        )}

        {currentView === '404' && (
          <NotFoundView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Dock Navigation */}
      <MobileDock
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedFromCartToCheckout}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onInstantBuy={handleInstantBuy}
      />

      {/* Global Search Modal with Real-Time Filtering */}
      <GlobalSearchModal
        onSelectProduct={(p) => setSelectedProductDetail(p)}
        onInstantBuy={handleInstantBuy}
        onNavigateToCatalog={() => handleNavigate('catalogo')}
      />

      {/* Cookie & Privacy Consent Banner (Ley 1581) */}
      <CookieConsentBanner onOpenPreferences={() => handleNavigate('cookies')} />
    </div>
  );
};

import { CurrencyProvider } from './context/CurrencyContext';
import { SearchProvider } from './context/SearchContext';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

export default function App() {
  return (
    <StoreProvider>
      <CurrencyProvider>
        <SearchProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SearchProvider>
      </CurrencyProvider>
    </StoreProvider>
  );
}
