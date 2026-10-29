import React, { useState, useEffect } from 'react';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import { useStore } from '../../context/StoreContext';
import { useSearch } from '../../context/SearchContext';
import {
  ShoppingBag,
  MessageSquare,
  User,
  Shield,
  Menu,
  X,
  Bell,
  Sparkles,
  LogOut,
  ChevronDown,
  Sliders,
  TrendingDown,
  Heart,
  Settings,
  Search,
} from 'lucide-react';
import { DeveloperPriceAdjusterModal } from '../admin/DeveloperPriceAdjusterModal';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
  onOpenAuth,
}) => {
  const {
    currentUser,
    logout,
    cart,
    unreadNotificationsCount,
  } = useStore();
  const { openSearchModal } = useSearch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPriceAdjusterModalOpen, setIsPriceAdjusterModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // High-performance IntersectionObserver sentinel (> 40px trigger without window.addEventListener('scroll'))
  useEffect(() => {
    let sentinel = document.getElementById('navbar-scroll-sentinel');
    let created = false;
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.id = 'navbar-scroll-sentinel';
      sentinel.style.position = 'absolute';
      sentinel.style.top = '0';
      sentinel.style.left = '0';
      sentinel.style.width = '100%';
      sentinel.style.height = '40px';
      sentinel.style.pointerEvents = 'none';
      sentinel.style.zIndex = '-9999';
      document.body.prepend(sentinel);
      created = true;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // If entry is intersecting, user is at top <= 40px; otherwise > 40px
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (created && sentinel?.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
    };
  }, []);

  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const isAdmin = currentUser && currentUser.role === 'SUPER_ADMIN';

  const navLinks = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'chat', label: 'Mi Chat' },
    { id: 'giveaway', label: 'Sorteo' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter,padding] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled
          ? 'bg-neutral-950/80 backdrop-blur-md border-b border-white/10 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => onNavigate('inicio')}
              className="text-left focus:outline-none transition-transform active:scale-95 cursor-pointer"
            >
              <StreamBoxLogo size="md" />
            </button>
          </div>

          {/* Zone 2: Navigation Links (single line, no wrapping) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`transition-colors whitespace-nowrap py-1 relative hover:text-white cursor-pointer ${
                  currentView === link.id
                    ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
                    : 'text-neutral-400'
                }`}
              >
                {link.label}
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                  currentView.startsWith('admin')
                    ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-white/5 text-amber-300 border border-amber-500/30 hover:bg-white/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Action & User Affordances */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => openSearchModal()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Buscar plataformas y suscripciones (⌘K o /)"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Buscar...</span>
              <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-white/10 text-neutral-400">
                ⌘K
              </kbd>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsPriceAdjusterModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-amber-500/30 bg-white/5 text-amber-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Ajustador de Precios Desarrollador (-6.000 COP / Ajustable)"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Precios Dev (-6k/+)</span>
              </button>
            )}

            {/* Notifications Button */}
            <button
              onClick={() => onNavigate('cuenta-notificaciones')}
              className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#09090b]" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {totalCartItems > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-black bg-amber-400 rounded-full font-mono">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium max-w-[110px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-lg bg-[#15151F] border border-zinc-800 shadow-xl py-1 z-50 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-zinc-800/80">
                      <p className="font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => onNavigate('cuenta')}
                      className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      Mi Cuenta y Pedidos
                    </button>

                    <button
                      onClick={() => onNavigate('cuenta-favoritos')}
                      className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      Mis Favoritos
                    </button>

                    <button
                      onClick={() => onNavigate('cuenta-perfil')}
                      className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-purple-400" />
                      Mi Perfil & Preferencias
                    </button>

                    <button
                      onClick={() => onNavigate('chat')}
                      className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-800/80 hover:text-white flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      Mi Chat & Soporte
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onNavigate('admin')}
                        className="w-full text-left px-3 py-2 text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-purple-400" />
                        Panel de Administración
                      </button>
                    )}

                    <div className="border-t border-zinc-800/80 my-1" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all whitespace-nowrap"
              >
                Ingresar
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0B0B10] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium ${
                currentView === link.id
                  ? 'bg-zinc-800/90 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold text-purple-300 bg-purple-950/40 border border-purple-800/50"
            >
              Panel de Administración
            </button>
          )}

          <div className="pt-2 border-t border-zinc-800">
            <div className="px-2">
              <button
                onClick={() => {
                  setIsPriceAdjusterModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/50 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>🛠️ Ajustar Precios Dev (-6.000 / Ajustable)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Mode Price Adjuster Modal */}
      <DeveloperPriceAdjusterModal
        isOpen={isPriceAdjusterModalOpen}
        onClose={() => setIsPriceAdjusterModalOpen(false)}
      />
    </header>
  );
};
