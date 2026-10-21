import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  X,
  ShieldCheck,
  Check,
  ShoppingBag,
  Zap,
  Clock,
  Tv,
  Globe,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
  onNavigateToChat?: () => void;
  onSelectRelatedProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantBuy,
  onNavigateToChat,
  onSelectRelatedProduct,
}) => {
  const { addToCart, products } = useStore();
  const [selectedModalityId, setSelectedModalityId] = useState(
    product?.modalities[0]?.id || ''
  );
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentModality =
    product.modalities.find((m) => m.id === selectedModalityId) ||
    product.modalities[0];

  const isPurchasable =
    product.status === 'ACTIVE' &&
    currentModality &&
    currentModality.available &&
    currentModality.priceCOP !== null &&
    currentModality.priceStatus !== 'PRICE_PENDING';

  const handleAddToCart = () => {
    if (!isPurchasable) return;
    addToCart(product, currentModality.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Related products in the same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-[#12121B] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        
        {/* Header Visual Bar */}
        <div 
          className="relative p-6 sm:p-8 flex items-start justify-between border-b border-zinc-800/80"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${product.brandAccent || '#7E22CE'}30 0%, #0E0E16 80%)`
          }}
        >
          <div className="flex items-center gap-4">
            <BrandLogo
              brand={product.brand}
              logoUrl={product.logoUrl}
              logoColor={product.logoColor}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1 flex-wrap">
                <span className="font-semibold text-zinc-300 uppercase">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.subcategory}</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-400 font-mono">{product.region}</span>
                {product.visualStatus && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    product.visualStatus === 'VERIFIED'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {product.visualStatus}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {product.name}
                </h2>
                <div 
                  className="shrink-0 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 shadow-sm"
                  title={`Logo oficial de la página de ${product.brand}`}
                >
                  <BrandLogo
                    brand={product.brand}
                    logoUrl={product.logoUrl}
                    logoColor={product.logoColor}
                    productName={product.name}
                    size="xs"
                  />
                  <span className="text-xs font-semibold text-zinc-300">Página Oficial</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Descripción del Servicio
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Modalidades & Duraciones */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Selecciona tu Modalidad y Duración:
              </h4>
              <span className="text-[11px] text-zinc-500">{product.modalities.length} modalidades registradas</span>
            </div>

            <div className="space-y-2">
              {product.modalities.map((modality) => {
                const isSelected = modality.id === (selectedModalityId || product.modalities[0].id);
                const hasVerifiedPrice = modality.priceCOP !== null && modality.priceStatus !== 'PRICE_PENDING';

                return (
                  <div
                    key={modality.id}
                    onClick={() => setSelectedModalityId(modality.id)}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-purple-400 bg-purple-500' : 'border-zinc-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{modality.name}</div>
                        <div className="text-xs text-zinc-400 flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Duración: {modality.duration}</span>
                          </span>
                          {modality.quality && (
                            <span className="text-zinc-500">· Calidad: {modality.quality}</span>
                          )}
                          {modality.usersAllowed && (
                            <span className="text-zinc-500">· {modality.usersAllowed}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 pl-7 sm:pl-0">
                      {hasVerifiedPrice ? (
                        <div>
                          <div className="text-base font-bold font-mono text-cyan-400">
                            ${modality.priceCOP?.toLocaleString('es-CO')} COP
                          </div>
                          {modality.officialReferencePriceCOP && (
                            <div className="text-[11px] text-zinc-500 font-mono">
                              Tarifa oficial: ${modality.officialReferencePriceCOP.toLocaleString('es-CO')} COP
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-400 font-medium">
                          Precio pendiente de verificar
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Transparency & Verification Info */}
          {product.verificationSource && (
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-300 block">Fuente y Verificación Comercial:</span>
                <span>{product.verificationSource} · Consultado el {product.verifiedDate || 'Octubre 2026'}.</span>
              </div>
            </div>
          )}

          {/* Technical Specs & Compatibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
            <div className="flex items-start gap-2.5">
              <Tv className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200 block">Compatibilidad:</span>
                <span className="text-zinc-400">{product.compatibility}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200 block">Región:</span>
                <span className="text-zinc-400">{product.region}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200 block">Método de Entrega:</span>
                <span className="text-zinc-400">{product.deliveryMethod}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-200 block">Garantía StreamBox:</span>
                <span className="text-zinc-400">100% activa durante todo el período</span>
              </div>
            </div>
          </div>

          {/* FAQ if available */}
          {product.faq && product.faq.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Preguntas sobre este Servicio:
              </h4>
              <div className="space-y-2 text-xs">
                {product.faq.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="font-bold text-white block mb-1">¿{item.q}?</span>
                    <span className="text-zinc-400">{item.a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Conditions summary */}
          <div className="text-[11px] text-zinc-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
            <p>{product.terms}</p>
          </div>

          {/* Related Products in Same Category */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-zinc-800/80">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Otros Servicios en esta Categoría:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedProducts.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => {
                      if (onSelectRelatedProduct) onSelectRelatedProduct(rel);
                    }}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 text-left text-xs transition-colors"
                  >
                    <div className="font-semibold text-white truncate">{rel.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{rel.brand}</div>
                    <div className="text-cyan-400 font-mono font-bold mt-2">
                      {rel.modalities[0]?.priceCOP
                        ? `$${rel.modalities[0].priceCOP.toLocaleString('es-CO')} COP`
                        : 'Por verificar'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-zinc-800 bg-[#0E0E16] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-zinc-400 block">
              {isPurchasable ? 'Total a Pagar' : 'Estado Comercial'}
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {isPurchasable ? (
                `$${currentModality.priceCOP?.toLocaleString('es-CO')} COP`
              ) : (
                <span className="text-sm text-amber-400 font-sans">Precio Pendiente de Verificar</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isPurchasable ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    added
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200 hover:text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>¡Agregado!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-purple-400" />
                      <span>Agregar al Carrito</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onInstantBuy(product, currentModality.id);
                  }}
                  className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Pagar Ahora</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateToChat) onNavigateToChat();
                }}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Consultar Disponibilidad en Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
