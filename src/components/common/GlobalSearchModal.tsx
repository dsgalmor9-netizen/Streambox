import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearch } from '../../context/SearchContext';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Product } from '../../types';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CornerDownLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface GlobalSearchModalProps {
  onSelectProduct: (product: Product) => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
  onNavigateToCatalog: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onSelectProduct,
  onInstantBuy,
  onNavigateToCatalog,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isSearchModalOpen,
    closeSearchModal,
    searchResults,
    totalMatchesCount,
    clearSearch,
  } = useSearch();

  const { categories } = useStore();
  const { formatAmount } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchModalOpen]);

  // Global keydown: Cmd+K or / opens search, Escape closes search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSearchModalOpen) {
          closeSearchModal();
        } else {
          inputRef.current?.focus();
        }
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  if (!isSearchModalOpen) return null;

  const handleSelectProduct = (product: Product) => {
    closeSearchModal();
    onSelectProduct(product);
  };

  const handleViewAllInCatalog = () => {
    closeSearchModal();
    onNavigateToCatalog();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-20 overflow-y-auto">
        {/* Backdrop with dark cinema blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={closeSearchModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-2xl bg-[#0d0d14] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_1px_2px_rgba(255,255,255,0.06)] overflow-hidden z-10 my-4"
        >
          {/* Ambient Platform Glow */}
          <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-1" />

          {/* Search Bar Input */}
          <div className="p-4 sm:p-5 border-b border-white/8 flex items-center gap-3">
            <Search className="w-5 h-5 text-amber-400 shrink-0" />
            
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, marca o servicio (ej. Netflix, Spotify, ChatGPT, Max, Canva...)"
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/8 text-[11px] font-mono text-neutral-400">
              <span>ESC</span>
            </div>

            <button
              type="button"
              onClick={closeSearchModal}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs Filter */}
          <div className="px-4 py-2.5 bg-black/40 border-b border-white/6 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider shrink-0 mr-1 hidden sm:inline">
              Categoría:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-400 text-black shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
            >
              Todas ({totalMatchesCount})
            </button>
            {categories.slice(0, 6).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-amber-400 text-black shadow-sm font-bold'
                      : 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="p-3 sm:p-4 max-h-[55vh] overflow-y-auto space-y-2">
            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-neutral-500 mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  No se encontraron resultados
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Intenta buscar con otro término o selecciona "Todas" en las categorías.
                </p>
              </div>
            ) : (
              searchResults.slice(0, 10).map((product) => {
                const firstModality = product.modalities[0];
                const priceText = firstModality?.priceCOP
                  ? formatAmount(firstModality.priceCOP)
                  : 'Por verificar';

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/6 hover:border-amber-400/30 flex items-center justify-between gap-3 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BrandLogo
                        brand={product.brand}
                        logoUrl={product.logoUrl}
                        logoColor={product.logoColor}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-400 shrink-0">
                            {product.brand}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span className="text-neutral-500">{product.subcategory}</span>
                          <span aria-hidden="true" className="text-neutral-600">·</span>
                          <span className="text-emerald-400 font-medium">Entrega inmediata</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">
                          {priceText}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {firstModality?.name || 'Suscripción'}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-amber-400 group-hover:text-black flex items-center justify-center text-neutral-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Navigation */}
          {searchResults.length > 0 && (
            <div className="p-3.5 sm:p-4 border-t border-white/8 bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-neutral-400 font-mono">
                {searchResults.length} {searchResults.length === 1 ? 'servicio coincidente' : 'servicios coincidentes'}
              </span>

              <button
                type="button"
                onClick={handleViewAllInCatalog}
                className="w-full sm:w-auto px-4 py-2 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              >
                <span>VER TODOS EN CATÁLOGO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
