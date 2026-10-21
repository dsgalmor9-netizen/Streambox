import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Zap, Check, ChevronRight, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

import { BrandLogo } from '../common/BrandLogo';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onInstantBuy,
}) => {
  const { addToCart } = useStore();
  const [selectedModalityId, setSelectedModalityId] = useState(
    product.modalities[0]?.id || ''
  );
  const [addedAnim, setAddedAnim] = useState(false);

  const selectedModality =
    product.modalities.find((m) => m.id === selectedModalityId) ||
    product.modalities[0];

  const isPurchasable =
    product.status === 'ACTIVE' &&
    selectedModality &&
    selectedModality.available &&
    selectedModality.priceCOP !== null &&
    selectedModality.priceStatus !== 'PRICE_PENDING';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPurchasable) return;
    addToCart(product, selectedModalityId, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleInstantBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPurchasable) {
      onInstantBuy(product, selectedModalityId);
    } else {
      onSelect(product);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative rounded-2xl bg-[#14141F] border border-zinc-800/90 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Banner / Brand Visual Header */}
      <div 
        className="relative h-36 w-full p-5 flex flex-col justify-between overflow-hidden"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${product.brandAccent || '#7E22CE'}25 0%, #101018 70%)`
        }}
      >
        {/* Subtle decorative glow */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: product.brandAccent || '#A855F7' }}
        />

        {/* Clean unboxed category kicker */}
        <div className="flex items-center justify-between text-xs text-zinc-400 z-10">
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <span className="uppercase text-[11px] font-semibold text-zinc-400">{product.brand}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-500 truncate max-w-[140px]">{product.subcategory}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {product.visualStatus === 'VERIFIED' && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                VERIFIED
              </span>
            )}
            {product.isFeatured && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 ml-1">
                Destacado
              </span>
            )}
          </div>
        </div>

        {/* Brand Icon Badge with Internet Logo */}
        <div className="flex items-center gap-3.5 z-10 mt-auto">
          <BrandLogo
            brand={product.brand}
            logoUrl={product.logoUrl}
            logoColor={product.logoColor}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white leading-tight group-hover:text-purple-300 transition-colors">
                {product.name}
              </h3>
              {/* Official internet logo badge beside title */}
              <div 
                className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-950/90 border border-white/10 shadow-sm"
                title={`Logo original oficial de ${product.brand}`}
              >
                <BrandLogo
                  brand={product.brand}
                  logoUrl={product.logoUrl}
                  logoColor={product.logoColor}
                  productName={product.name}
                  size="xs"
                />
                <span className="text-[10px] font-mono text-zinc-300 font-semibold">Oficial</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1 mt-1">
              {product.shortDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Modality Selector (Buttons with click handler) */}
        <div className="space-y-1.5 mb-4" onClick={(e) => e.stopPropagation()}>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Modalidad & Duración:</span>
            <span className="text-[10px] text-zinc-500">{product.modalities.length} opciones</span>
          </div>
          
          <div className="space-y-1">
            {product.modalities.map((m) => {
              const isSelected = m.id === selectedModalityId;
              const hasPrice = m.priceCOP !== null && m.priceStatus !== 'PRICE_PENDING';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModalityId(m.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors border text-left ${
                    isSelected
                      ? 'bg-purple-950/50 border-purple-600/70 text-white font-medium shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span className="truncate pr-2">{m.name} ({m.duration})</span>
                  <span className={`font-mono font-semibold shrink-0 ${hasPrice ? 'text-zinc-200' : 'text-amber-400 text-[11px]'}`}>
                    {hasPrice ? `$${m.priceCOP?.toLocaleString('es-CO')} COP` : 'Por verificar'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Actions */}
        <div className="pt-3 border-t border-zinc-800/80">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                {selectedModality?.priceStatus === 'OFFICIAL_REFERENCE'
                  ? 'Tarifa oficial proveedor'
                  : 'Precio StreamBox'}
              </span>

              {isPurchasable ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold font-mono text-white">
                    ${selectedModality.priceCOP?.toLocaleString('es-CO')} COP
                  </span>
                  {selectedModality.originalPriceCOP && selectedModality.originalPriceCOP > (selectedModality.priceCOP || 0) && (
                    <span className="text-xs text-zinc-500 line-through font-mono">
                      ${selectedModality.originalPriceCOP.toLocaleString('es-CO')} COP
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-0.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Precio pendiente de verificar</span>
                </div>
              )}
            </div>

            <div className={`text-[11px] font-medium ${isPurchasable ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {isPurchasable ? 'Entrega Inmediata' : 'Solo Consulta'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!isPurchasable}
              onClick={handleAddToCart}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                !isPurchasable
                  ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-60'
                  : addedAnim
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:text-white cursor-pointer'
              }`}
            >
              {addedAnim ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>¡Agregado!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isPurchasable ? 'Al Carrito' : 'No Disponible'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleInstantBuyClick}
              className={`py-2 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer ${
                isPurchasable
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {isPurchasable ? (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Pagar Ahora</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Ver Detalles</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
