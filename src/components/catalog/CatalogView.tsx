import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CatalogViewProps {
  onSelectProduct: (product: Product) => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectProduct,
  onInstantBuy,
}) => {
  const { products, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
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

        return (
          matchesCategory &&
          matchesQuery &&
          matchesStatus &&
          matchesDuration &&
          matchesMaxPrice &&
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
  }, [products, searchQuery, selectedCategory, statusFilter, durationFilter, maxPrice, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (durationFilter !== 'ALL' ? 1 : 0) +
    (maxPrice !== '' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setStatusFilter('ALL');
    setDurationFilter('ALL');
    setMaxPrice('');
    setSortBy('POPULAR');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-purple-400 font-mono mb-1">
          <Sparkles className="w-4 h-4" />
          <span>{categories.length} Categorías Oficiales · {products.length} Servicios Catalogados</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Catálogo Completo StreamBox
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Streaming, música, IA, herramientas para creadores, ofimática y software con precios verificados en COP.
        </p>
      </div>

      {/* Main Search & Quick Controls Toolbar */}
      <div className="p-4 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por marca o servicio (Netflix, Spotify, ChatGPT, Canva, NordVPN...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Toggle & Sort */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                showFiltersPanel || activeFiltersCount > 0
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="POPULAR" className="bg-zinc-900">Más Populares</option>
                <option value="PRICE_ASC" className="bg-zinc-900">Precio: Menor a Mayor</option>
                <option value="PRICE_DESC" className="bg-zinc-900">Precio: Mayor a Menor</option>
                <option value="NAME" className="bg-zinc-900">Alfabético A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Filters Panel */}
        {showFiltersPanel && (
          <div className="pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Status Filter */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">
                Estado Comercial:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">Todos los servicios ({products.length})</option>
                <option value="VERIFIED_ONLY">Solo con Precio Verificado (Comprables)</option>
                <option value="PENDING_ONLY">Pendientes de Verificar (Consultar)</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">
                Duración del Plan:
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
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
              <label className="block text-zinc-400 font-semibold mb-1.5">
                Precio Máximo (COP):
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ej: 50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono"
                />
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] shrink-0"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 17 Categories Visual Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Explorar por Categoría ({categories.length}):
          </span>
          <span className="text-zinc-500">{filteredProducts.length} servicios encontrados</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Todas las Categorías ({products.length})
          </button>
          
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-purple-800 text-purple-200' : 'bg-zinc-800 text-zinc-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
          <p className="text-base font-bold text-white mb-1">No se encontraron servicios con estos filtros</p>
          <p className="text-xs text-zinc-500 mb-4">
            Intenta cambiar los términos de búsqueda o restablecer los filtros aplicados.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
          >
            Ver Todos los Servicios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onInstantBuy={onInstantBuy}
            />
          ))}
        </div>
      )}
    </div>
  );
};
