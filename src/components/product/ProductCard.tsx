import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  ShoppingBag,
  Zap,
  Check,
  ChevronRight,
  Clock,
  ShieldCheck,
  Heart,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useToast } from '../common/Toast';
import { WhatsAppDirectModal } from '../checkout/WhatsAppDirectModal';
import { WhatsAppOrderDetails } from '../../lib/whatsappCheckout';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
  index?: number;
  featuredEditorial?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onInstantBuy,
  index = 0,
  featuredEditorial = false,
}) => {
  const { addToCart, toggleFavorite, isFavorite, currentUser } = useStore();
  const { currency, billingPeriod, formatAmount } = useCurrency();
  const { success, info } = useToast();

  const [selectedModalityId, setSelectedModalityId] = useState(
    product.modalities[0]?.id || ''
  );
  const [addedAnim, setAddedAnim] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Spotlight mouse position tracking
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
  };

  const isFav = isFavorite(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleFavorite(product.id);
    if (added) {
      success(`${product.name} guardado en tus Favoritos ❤️`);
    } else {
      info(`${product.name} eliminado de tus Favoritos`);
    }
  };

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
    success(`${product.name} (${selectedModality?.name || 'Suscripción'}) añadido al carrito.`);
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

  const handleOpenWhatsAppModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWhatsAppModalOpen(true);
  };

  // Determine active platform accent color (Dark Cinema halo)
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
      : product.brand.toLowerCase().includes('youtube')
      ? '#FF0000'
      : product.brand.toLowerCase().includes('canva')
      ? '#00C4CC'
      : product.brand.toLowerCase().includes('chatgpt') || product.brand.toLowerCase().includes('openai')
      ? '#10A37F'
      : '#f59e0b');

  // Pricing calculations according to Currency & Periodicity
  const currentPriceText = isPurchasable
    ? formatAmount(selectedModality.priceCOP)
    : 'Por verificar';

  const originalPriceText =
    selectedModality?.originalPriceCOP &&
    selectedModality.originalPriceCOP > (selectedModality.priceCOP || 0)
      ? formatAmount(selectedModality.originalPriceCOP)
      : null;

  // Stagger entry animation
  const staggerDelay = Math.min(index * 0.05, 0.4);

  // Prepare WhatsApp order payload
  const whatsappPayload: WhatsAppOrderDetails = {
    customerName: currentUser?.name,
    customerEmail: currentUser?.email,
    customerPhone: currentUser?.phone,
    items: [
      {
        productName: product.name,
        brand: product.brand,
        modalityName: selectedModality?.name || 'Suscripción',
        duration: billingPeriod === 'ANNUAL' ? '12 Meses (Plan Anual)' : selectedModality?.duration || '1 Mes',
        priceText: currentPriceText,
        quantity: 1,
      },
    ],
    subtotalText: currentPriceText,
    totalText: currentPriceText,
    currency,
    billingPeriod,
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: staggerDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onSelect(product)}
        whileTap={{ scale: 0.985 }}
        className={`group relative rounded-2xl bg-[#0d0d14] border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer select-none ${
          featuredEditorial ? 'ring-1 ring-amber-500/30' : ''
        }`}
        style={{
          borderColor: isHovered ? `${platformAccent}40` : 'rgba(255, 255, 255, 0.08)',
          boxShadow: isHovered
            ? `0 16px 40px -10px rgba(0, 0, 0, 0.85), 0 0 30px -5px ${platformAccent}35, 0 1px 2px rgba(255,255,255,0.08)`
            : '0 4px 20px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Specular Top Light Gleam */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-30" />

        {/* Dynamic Platform-Colored Spotlight Overlay Following Mouse */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-150"
            style={{
              background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, ${platformAccent}22 0%, rgba(255,255,255,0.05) 35%, transparent 75%)`,
            }}
          />
        )}

        {/* Top Header / Platform Ambient Halo */}
        <div
          className="relative h-36 w-full p-5 flex flex-col justify-between overflow-hidden"
          style={{
            background: `radial-gradient(circle at 85% 15%, ${platformAccent}20 0%, #0d0d14 75%)`,
          }}
        >
          {/* Subtle Platform-Specific Halo in background */}
          <div
            className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-opacity duration-300"
            style={{
              backgroundColor: platformAccent,
              opacity: isHovered ? 0.35 : 0.18,
            }}
          />

          {/* Clean unboxed category kicker & Editorial Micro-badges */}
          <div className="flex items-center justify-between text-xs text-neutral-400 z-10">
            <div className="flex items-center gap-1.5 font-medium tracking-wide">
              <span className="uppercase text-[11px] font-semibold text-neutral-300">
                {product.brand}
              </span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="text-[11px] text-neutral-500 truncate max-w-[130px]">
                {product.subcategory}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {product.isFeatured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 tracking-tight flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  Más Vendido
                </span>
              )}

              {selectedModality?.quality && (
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                  {selectedModality.quality}
                </span>
              )}

              <button
                type="button"
                onClick={handleToggleFavorite}
                title={isFav ? 'Remover de favoritos' : 'Guardar en favoritos'}
                aria-label={isFav ? 'Remover de favoritos' : 'Guardar en favoritos'}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition-all ml-1 cursor-pointer active:scale-95"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFav
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-neutral-400 hover:text-rose-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Brand Icon + Product Title */}
          <div className="flex items-center gap-3.5 z-10 mt-auto">
            <BrandLogo
              brand={product.brand}
              logoUrl={product.logoUrl}
              logoColor={product.logoColor}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-amber-200 transition-colors">
                  {product.name}
                </h3>
                <div
                  className="shrink-0 inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-black/60 border border-white/10 shadow-sm"
                  title={`Logo original oficial de ${product.brand}`}
                >
                  <BrandLogo
                    brand={product.brand}
                    logoUrl={product.logoUrl}
                    logoColor={product.logoColor}
                    productName={product.name}
                    size="xs"
                  />
                  <span className="text-[9px] font-mono text-neutral-300 font-medium">Oficial</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                {product.shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          {/* Modality Selector (Interactive segmented options) */}
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Modalidad:</span>
              <span className="text-[10px] text-neutral-500">
                {product.modalities.length} {product.modalities.length === 1 ? 'opción' : 'opciones'}
              </span>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
              {product.modalities.map((m) => {
                const isSelected = m.id === selectedModalityId;
                const hasPrice = m.priceCOP !== null && m.priceStatus !== 'PRICE_PENDING';
                const formattedModPrice = hasPrice ? formatAmount(m.priceCOP) : 'Por verificar';

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModalityId(m.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors border text-left cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'bg-white/10 border-white/20 text-white font-medium shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-white/10'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {m.name} ({billingPeriod === 'ANNUAL' ? 'Anual' : m.duration})
                    </span>
                    <span
                      className={`font-mono font-semibold shrink-0 ${
                        hasPrice ? 'text-neutral-200' : 'text-amber-400 text-[11px]'
                      }`}
                    >
                      {formattedModPrice}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Guarantee Bar */}
          <div className="pt-3 border-t border-white/8">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                  {billingPeriod === 'ANNUAL'
                    ? 'Tarifa Anual (-25% Dto)'
                    : 'Tarifa StreamBox'}
                </span>

                {isPurchasable ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold font-mono text-white tracking-tight">
                      {currentPriceText}
                    </span>
                    {originalPriceText && (
                      <span className="text-xs text-neutral-500 line-through font-mono">
                        {originalPriceText}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-0.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Precio a consultar</span>
                  </div>
                )}
              </div>

              <div
                className={`text-[11px] font-medium flex items-center gap-1 ${
                  isPurchasable ? 'text-emerald-400' : 'text-neutral-500'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isPurchasable ? 'Entrega Inmediata' : 'Bajo Pedido'}</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-12 gap-2">
              {/* Add to Cart */}
              <button
                type="button"
                disabled={!isPurchasable}
                onClick={handleAddToCart}
                className={`col-span-4 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                  !isPurchasable
                    ? 'bg-white/[0.02] border-white/5 text-neutral-600 cursor-not-allowed opacity-50'
                    : addedAnim
                    ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:text-white cursor-pointer'
                }`}
                title="Agregar al Carrito"
              >
                {addedAnim ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px]">Listo</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-neutral-300" />
                    <span className="text-[11px]">Carrito</span>
                  </>
                )}
              </button>

              {/* Instant WhatsApp Order Button */}
              <button
                type="button"
                disabled={!isPurchasable}
                onClick={handleOpenWhatsAppModal}
                className="col-span-4 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-all cursor-pointer active:scale-95"
                title="Comprar directo por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px]">WhatsApp</span>
              </button>

              {/* Instant Buy / Checkout */}
              <button
                type="button"
                onClick={handleInstantBuyClick}
                className={`col-span-4 py-2 px-2.5 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95 ${
                  isPurchasable
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-300'
                }`}
              >
                {isPurchasable ? (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current text-black" />
                    <span className="text-[11px]">Comprar</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Detalles</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Direct Order Modal */}
      <WhatsAppDirectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        orderDetails={whatsappPayload}
      />
    </>
  );
};
