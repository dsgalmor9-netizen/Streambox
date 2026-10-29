import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useSearch } from '../../context/SearchContext';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { StoreControlBar } from '../common/StoreControlBar';
import { ScrollReveal } from '../common/ScrollReveal';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  Layers,
} from 'lucide-react';

interface CatalogViewProps {
  onSelectProduct: (product: Product) => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectProduct,
  onInstantBuy,
}) => {
  const { products, categories, favorites, recentlyViewed } = useStore();
  const { currency, billingPeriod } = useCurrency();
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    clearSearch,
  } = useSearch();

  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED_ONLY' | 'PENDING_ONLY'>('ALL');
  const [durationFilter, setDurationFilter] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME'>('POPULAR');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category check
        const matchesCategory =
          selectedCategory === 'ALL' || p.category === selectedCategory;

        // Search text check
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));

        // Status / verification check
        const isVerifiedPurchasable = p.modalities.some(
          (m) => m.priceCOP !== null && m.priceStatus !== 'PRICE_PENDING' && m.available
        );
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'VERIFIED_ONLY' && isVerifiedPurchasable) ||
          (statusFilter === 'PENDING_ONLY' && !isVerifiedPurchasable);

        // Duration check
        const matchesDuration =
          durationFilter === 'ALL' ||
          p.modalities.some((m) => m.duration.toLowerCase().includes(durationFilter.toLowerCase()));

        // Max price check
        const lowestPrice = Math.min(
          ...p.modalities
            .filter((m) => m.priceCOP !== null && m.priceStatus !== 'PRICE_PENDING')
            .map((m) => m.priceCOP as number)
            .concat(Infinity)
        );
        const matchesMaxPrice =
          maxPrice === '' || (lowestPrice !== Infinity && lowestPrice <= maxPrice);

        const matchesFavorites = !onlyFavorites || favorites.includes(p.id);

        return (
          matchesCategory &&
          matchesQuery &&
          matchesStatus &&
          matchesDuration &&
          matchesMaxPrice &&
          matchesFavorites &&
          p.status !== 'HIDDEN'
        );
      })
      .sort((a, b) => {
        const priceA = a.modalities[0]?.priceCOP || 999999;
        const priceB = b.modalities[0]?.priceCOP || 999999;

        if (sortBy === 'PRICE_ASC') return priceA - priceB;
        if (sortBy === 'PRICE_DESC') return priceB - priceA;
        if (sortBy === 'NAME') return a.name.localeCompare(b.name);
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, searchQuery, selectedCategory, onlyFavorites, favorites, statusFilter, durationFilter, maxPrice, sortBy]);

  const recentProducts = useMemo(() => {
    return recentlyViewed
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 6);
  }, [recentlyViewed, products]);

  const activeFiltersCount =
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (onlyFavorites ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (durationFilter !== 'ALL' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    clearSearch();
    setOnlyFavorites(false);
    setStatusFilter('ALL');
    setDurationFilter('ALL');
    setMaxPrice('');
    setSortBy('POPULAR');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Store Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{categories.length} Categorías Oficiales · {products.length} Servicios Activos</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Catálogo Cinematográfico
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Cuentas completas y perfiles con entrega inmediata. Precios en {currency} {billingPeriod === 'ANNUAL' ? '(con -25% de descuento anual)' : ''}.
          </p>
        </div>

        {/* Dynamic Currency & Periodicity Selector */}
        <StoreControlBar className="w-full md:w-auto" />
      </div>

      {/* Main Search & Quick Controls Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d0d14] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por marca o servicio (Netflix, Spotify, ChatGPT, Max, Canva, Disney+...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Toggle & Sort */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                showFiltersPanel || activeFiltersCount > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-black/60 border-white/8 text-neutral-400 hover:text-white hover:border-white/15'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center font-mono">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5 bg-black/60 border border-white/8 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="POPULAR" className="bg-[#0d0d14]">Más Populares</option>
                <option value="PRICE_ASC" className="bg-[#0d0d14]">Precio: Menor a Mayor</option>
                <option value="PRICE_DESC" className="bg-[#0d0d14]">Precio: Mayor a Menor</option>
                <option value="NAME" className="bg-[#0d0d14]">Alfabético A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFiltersPanel && (
          <div className="pt-4 border-t border-white/6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Status Filter */}
            <div>
              <label className="block text-neutral-400 font-semibold mb-1.5">
                Estado Comercial:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-black/60 border border-white/8 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400/50"
              >
                <option value="ALL">Todos los servicios ({products.length})</option>
                <option value="VERIFIED_ONLY">Solo con Precio Verificado (Comprables)</option>
                <option value="PENDING_ONLY">Pendientes de Verificar (Consultar)</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-neutral-400 font-semibold mb-1.5">
                Duración del Plan:
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full bg-black/60 border border-white/8 rounded-lg p-2 text-white focus:outline-none focus:border-amber-400/50"
              >
                <option value="ALL">Cualquier duración</option>
                <option value="15 Días">15 Días</option>
                <option value="1 Mes">1 Mes (30 días)</option>
                <option value="3 Meses">3 Meses (Trimestral)</option>
                <option value="12 Meses">12 Meses (Anual)</option>
              </select>
            </div>

            {/* Max Price Filter */}
            <div>
              <label className="block text-neutral-400 font-semibold mb-1.5">
                Precio Máximo (COP):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ej: 50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-black/60 border border-white/8 rounded-lg p-2 text-white font-mono"
                />
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-neutral-300 text-[11px] shrink-0 transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills & Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Categorías ({categories.length}):
          </span>
          <span className="text-neutral-500 font-mono">{filteredProducts.length} servicios</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
              selectedCategory === 'ALL'
                ? 'bg-amber-400 text-black font-bold shadow-sm'
                : 'bg-[#0d0d14] border border-white/8 text-neutral-400 hover:text-white'
            }`}
          >
            Todas ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              onlyFavorites
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-[#0d0d14] border border-white/8 text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white text-white' : 'text-rose-400'}`} />
            <span>Mis Favoritos</span>
            <span className={`text-[10px] font-mono px-1 rounded ${onlyFavorites ? 'bg-rose-800 text-rose-200' : 'bg-white/5 text-neutral-400'}`}>
              {favorites.length}
            </span>
          </button>
          
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-white/15 border border-white/25 text-white shadow-sm'
                    : 'bg-[#0d0d14] border border-white/8 text-neutral-400 hover:text-white hover:border-white/15'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#0d0d14] border border-white/8 text-neutral-400">
          <p className="text-base font-bold text-white mb-1">No se encontraron servicios con estos filtros</p>
          <p className="text-xs text-neutral-500 mb-4">
            Intenta cambiar los términos de búsqueda o restablecer los filtros aplicados.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer active:scale-95"
          >
            Ver Todos los Servicios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product, idx) => (
            <ScrollReveal
              key={product.id}
              staggerIndex={idx % 6}
              className="h-full"
            >
              <ProductCard
                product={product}
                index={idx}
                onSelect={onSelectProduct}
                onInstantBuy={onInstantBuy}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Vistos Recientemente Section */}
      {recentProducts.length > 0 && (
        <section aria-label="Servicios vistos recientemente" className="pt-8 mt-12 border-t border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">Vistos Recientemente</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 font-mono">
                {recentProducts.length}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">Historial local</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentProducts.slice(0, 3).map((product, idx) => (
              <ProductCard
                key={`recent-${product.id}`}
                product={product}
                index={idx}
                onSelect={onSelectProduct}
                onInstantBuy={onInstantBuy}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
