import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { BrandLogo } from '../common/BrandLogo';
import { useToast } from '../common/Toast';
import { WhatsAppDirectModal } from '../checkout/WhatsAppDirectModal';
import { WhatsAppOrderDetails } from '../../lib/whatsappCheckout';
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
  MessageCircle,
  AlertCircle,
  Sparkles,
  Info,
  Heart,
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
  const { addToCart, products, toggleFavorite, isFavorite, addToRecentlyViewed, currentUser } = useStore();
  const { currency, billingPeriod, formatAmount } = useCurrency();
  const { success, info } = useToast();
  const [selectedModalityId, setSelectedModalityId] = useState(
    product?.modalities[0]?.id || ''
  );
  const [added, setAdded] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product.id);
      setSelectedModalityId(product.modalities[0]?.id || '');
    }
  }, [product?.id]);

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

  const formattedPrice = isPurchasable
    ? formatAmount(currentModality.priceCOP)
    : 'Por verificar';

  const handleAddToCart = () => {
    if (!isPurchasable) return;
    addToCart(product, currentModality.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const whatsappPayload: WhatsAppOrderDetails = {
    customerName: currentUser?.name,
    customerEmail: currentUser?.email,
    customerPhone: currentUser?.phone,
    items: [
      {
        productName: product.name,
        brand: product.brand,
        modalityName: currentModality?.name || 'Suscripción',
        duration: billingPeriod === 'ANNUAL' ? '12 Meses (Plan Anual)' : currentModality?.duration || '1 Mes',
        priceText: formattedPrice,
        quantity: 1,
      },
    ],
    subtotalText: formattedPrice,
    totalText: formattedPrice,
    currency,
    billingPeriod,
  };

  // Related products in the same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const platformAccent =
    product.brandAccent ||
    (product.brand.toLowerCase().includes('netflix')
      ? '#E50914'
      : product.brand.toLowerCase().includes('spotify')
      ? '#1DB954'
      : product.brand.toLowerCase().includes('disney')
      ? '#0063e5'
      : product.brand.toLowerCase().includes('max') || product.brand.toLowerCase().includes('hbo')
      ? '#002be7'
      : '#f59e0b');

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-3xl bg-[#0d0d14] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.06)] overflow-hidden z-10 my-8">
          
          {/* Header Visual Bar */}
          <div 
            className="relative p-6 sm:p-8 flex items-start justify-between border-b border-white/8"
            style={{
              background: `radial-gradient(circle at 95% 5%, ${platformAccent}25 0%, #0d0d14 75%)`
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
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1 flex-wrap font-medium">
                  <span className="font-semibold text-neutral-200 uppercase">{product.brand}</span>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span>{product.subcategory}</span>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="text-amber-400 font-mono">{product.region}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {product.name}
                  </h2>
                  <div 
                    className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 shadow-sm"
                    title={`Logo oficial de la página de ${product.brand}`}
                  >
                    <BrandLogo
                      brand={product.brand}
                      logoUrl={product.logoUrl}
                      logoColor={product.logoColor}
                      productName={product.name}
                      size="xs"
                    />
                    <span className="text-xs font-semibold text-neutral-300">Página Oficial</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const addedFav = toggleFavorite(product.id);
                  if (addedFav) success(`${product.name} guardado en tus Favoritos ❤️`);
                  else info(`${product.name} eliminado de tus Favoritos`);
                }}
                title={isFavorite(product.id) ? "Remover de favoritos" : "Guardar en favoritos"}
                aria-label={isFavorite(product.id) ? "Remover de favoritos" : "Guardar en favoritos"}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <Heart className={`w-4 h-4 transition-colors ${isFavorite(product.id) ? 'fill-rose-500 text-rose-500' : 'text-neutral-400 hover:text-rose-400'}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Descripción del Servicio
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Modalidades & Duraciones */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Modalidad y Duración:
                </h4>
                <span className="text-[11px] text-neutral-500 font-mono">{product.modalities.length} modalidades</span>
              </div>

              <div className="space-y-2">
                {product.modalities.map((modality) => {
                  const isSelected = modality.id === (selectedModalityId || product.modalities[0].id);
                  const hasVerifiedPrice = modality.priceCOP !== null && modality.priceStatus !== 'PRICE_PENDING';
                  const modalityPriceFormatted = hasVerifiedPrice ? formatAmount(modality.priceCOP) : 'Por verificar';

                  return (
                    <div
                      key={modality.id}
                      onClick={() => setSelectedModalityId(modality.id)}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'bg-white/10 border-white/20 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/6 text-neutral-300 hover:border-white/12'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-neutral-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{modality.name}</div>
                          <div className="text-xs text-neutral-400 flex items-center gap-3 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>{billingPeriod === 'ANNUAL' ? '12 Meses (Anual -25% dto)' : modality.duration}</span>
                            </span>
                            {modality.quality && (
                              <span className="text-neutral-500 font-mono">· Calidad: {modality.quality}</span>
                            )}
                            {modality.usersAllowed && (
                              <span className="text-neutral-500">· {modality.usersAllowed}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0 pl-7 sm:pl-0">
                        {hasVerifiedPrice ? (
                          <div>
                            <div className="text-base font-bold font-mono text-white">
                              {modalityPriceFormatted}
                            </div>
                            {modality.officialReferencePriceCOP && (
                              <div className="text-[11px] text-neutral-500 font-mono">
                                Oficial: {formatAmount(modality.officialReferencePriceCOP, 'MONTHLY')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-amber-400 font-medium">
                            Precio por consultar
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Specs & Compatibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/8 text-xs">
              <div className="flex items-start gap-2.5">
                <Tv className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-200 block">Compatibilidad:</span>
                  <span className="text-neutral-400">{product.compatibility}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-200 block">Región:</span>
                  <span className="text-neutral-400">{product.region}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-200 block">Método de Entrega:</span>
                  <span className="text-neutral-400">{product.deliveryMethod}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-200 block">Garantía StreamBox:</span>
                  <span className="text-neutral-400">100% activa durante todo el período</span>
                </div>
              </div>
            </div>

            {/* Related Products in Same Category */}
            {relatedProducts.length > 0 && (
              <div className="pt-4 border-t border-white/8">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Otros Servicios en esta Categoría:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedProducts.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => {
                        if (onSelectRelatedProduct) onSelectRelatedProduct(rel);
                      }}
                      className="p-3 rounded-xl bg-black/40 border border-white/8 hover:border-white/20 text-left text-xs transition-colors cursor-pointer active:scale-95"
                    >
                      <div className="font-semibold text-white truncate">{rel.name}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{rel.brand}</div>
                      <div className="text-amber-400 font-mono font-bold mt-2">
                        {rel.modalities[0]?.priceCOP
                          ? formatAmount(rel.modalities[0].priceCOP)
                          : 'Por verificar'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-white/8 bg-black/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-400 block">
                {isPurchasable ? 'Total a Pagar' : 'Estado Comercial'}
              </span>
              <div className="text-xl font-bold font-mono text-white">
                {isPurchasable ? (
                  formattedPrice
                ) : (
                  <span className="text-sm text-amber-400 font-sans">Precio Pendiente de Verificar</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isPurchasable ? (
                <>
                  <button
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Comprar directo por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      added
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Agregado!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-neutral-300" />
                        <span>Al Carrito</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onInstantBuy(product, currentModality.id);
                    }}
                    className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-black" />
                    <span>Pagar Ahora</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToChat) onNavigateToChat();
                  }}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Consultar Disponibilidad en Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppDirectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        orderDetails={whatsappPayload}
      />
    </>
  );
};
