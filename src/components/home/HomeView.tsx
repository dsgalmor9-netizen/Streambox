import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Product } from '../../types';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import { ProductCard } from '../product/ProductCard';
import { BrandLogo } from '../common/BrandLogo';
import { StoreControlBar } from '../common/StoreControlBar';
import { ScrollReveal } from '../common/ScrollReveal';
import { WhatsAppDirectModal } from '../checkout/WhatsAppDirectModal';
import { WhatsAppOrderDetails } from '../../lib/whatsappCheckout';
import { LiveDeliveryMarquee } from '../common/LiveDeliveryMarquee';
import { SavingsCalculatorWidget } from '../common/SavingsCalculatorWidget';
import { TactileFaqAccordion } from '../common/TactileFaqAccordion';
import { PaymentMethodsQuickCopy } from '../common/PaymentMethodsQuickCopy';
import {
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  Tv,
  Headphones,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Gift,
  MessageCircle,
  Play,
  Film,
  Flame,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onInstantBuy: (product: Product, modalityId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectProduct,
  onInstantBuy,
}) => {
  const { products, categories, currentUser } = useStore();
  const { currency, billingPeriod, formatAmount } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [marqueeWhatsAppPayload, setMarqueeWhatsAppPayload] = useState<WhatsAppOrderDetails | null>(null);

  // Marquee flagship flagship service (Netflix 4K UHD or first featured product)
  const flagshipProduct =
    products.find((p) => p.slug.includes('netflix') || p.brand.toLowerCase() === 'netflix') ||
    products[0];

  const flagshipModality = flagshipProduct?.modalities[0];
  const flagshipPriceText = flagshipModality?.priceCOP
    ? formatAmount(flagshipModality.priceCOP)
    : 'Ver precio';

  const featuredProducts = products.filter((p) => p.isFeatured || p.isPopular);
  const filteredProducts =
    selectedCategory === 'ALL'
      ? featuredProducts
      : products.filter((p) => p.category === selectedCategory);

  const handleOpenFlagshipWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!flagshipProduct || !flagshipModality) return;

    setMarqueeWhatsAppPayload({
      customerName: currentUser?.name,
      customerEmail: currentUser?.email,
      customerPhone: currentUser?.phone,
      items: [
        {
          productName: flagshipProduct.name,
          brand: flagshipProduct.brand,
          modalityName: flagshipModality.name,
          duration: billingPeriod === 'ANNUAL' ? '12 Meses (Plan Anual -25% dto)' : flagshipModality.duration,
          priceText: flagshipPriceText,
          quantity: 1,
        },
      ],
      subtotalText: flagshipPriceText,
      totalText: flagshipPriceText,
      currency,
      billingPeriod,
    });
    setIsWhatsAppModalOpen(true);
  };

  const faqs = [
    {
      q: '¿Cómo funciona la entrega inmediata?',
      a: 'Una vez transferido por Nequi, Daviplata, Bancolombia o Binance, nuestro equipo verifica tu comprobante en 5 a 15 minutos y despacha tus credenciales directamente a tu chat privado en la plataforma o por WhatsApp.',
    },
    {
      q: '¿Qué garantía tienen las cuentas y suscripciones?',
      a: 'Ofrecemos 100% de garantía y soporte técnico durante todo el tiempo contratado. En caso de caída de sesión o actualización del proveedor, te restablecemos el acceso sin costo adicional.',
    },
    {
      q: '¿Puedo pagar en Dólares (USD) o Pesos Mexicanos (MXN)?',
      a: 'Sí. A través de Binance Pay (USDT) o pasarela internacional puedes realizar tu pago en la divisa que prefieras utilizando nuestro conversor en tiempo real.',
    },
    {
      q: '¿Qué ventajas tiene el Plan Anual?',
      a: 'El Plan Anual incluye un 25% de descuento directo garantizado sobre la tarifa mensual, lo que equivale a recibir más de 2 meses gratis de tu suscripción favorita.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. LIVE MARQUEE / TICKER DE ENTREGAS EN TIEMPO REAL */}
      <LiveDeliveryMarquee />

      {/* CINEMATIC HERO SECTION (EDITORIAL ASYMMETRIC) */}
      <section className="relative pt-4 pb-16 md:pt-8 md:pb-24 overflow-hidden">
        {/* Dark Cinema Background Lighting: Deep obsidian + Warm Amber & Platform Crimson Halos */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-600/10 via-rose-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-gradient-to-bl from-blue-600/10 via-cyan-500/8 to-transparent blur-[150px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Asymmetric 2-Column Editorial Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Kerning, Value Proposition & Store Controls */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Micro-Kicker (Zero-Pill discipline) */}
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  Plataformas Premium
                </span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-neutral-400">Entrega Inmediata</span>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-emerald-400">Garantía 100%</span>
              </div>

              {/* Main Headline with Tight Kerning */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] text-balance">
                Cine, Música y Streaming con{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                  Sensación Cinematográfica
                </span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed text-pretty">
                Acceso directo a Netflix 4K UHD, Spotify, Disney+, Max, ChatGPT y licencias digitales oficiales. Pagos verificados en Colombia con Nequi, Daviplata, Bancolombia y Binance.
              </p>

              {/* Dynamic Currency & Billing Periodicity Switcher */}
              <div className="pt-2 max-w-xl">
                <StoreControlBar />
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('catalogo')}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98] transition-all"
                >
                  <span>EXPLORAR CATÁLOGO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('chat')}
                  className="px-6 py-3.5 rounded-xl font-semibold text-sm text-neutral-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Asistente StreamBot</span>
                </button>
              </div>

              {/* Adjacent Evidence Markers */}
              <div className="pt-6 border-t border-white/8 grid grid-cols-3 gap-4 text-xs text-neutral-400">
                <div>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>5 a 15 min</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Despacho verificado</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Garantía Total</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Soporte continuo</span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Sin Tarjeta</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Nequi / Daviplata</span>
                </div>
              </div>
            </div>

            {/* Right Column: Asymmetric Marquee Flagship Showcase */}
            {flagshipProduct && (
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelectProduct(flagshipProduct)}
                  className="group relative rounded-3xl bg-[#0e0e16] border border-white/10 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_1px_2px_rgba(255,255,255,0.06)] hover:border-amber-500/40 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Cinematic Halo */}
                  <div className="absolute -top-16 -right-16 w-52 h-52 bg-rose-600/20 rounded-full blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity" />

                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-tight">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>FLAGSHIP INSIGNIA</span>
                    </div>

                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                      4K UHD · Dolby Atmos
                    </span>
                  </div>

                  {/* Brand & Title */}
                  <div className="flex items-start gap-4 mb-6">
                    <BrandLogo
                      brand={flagshipProduct.brand}
                      logoUrl={flagshipProduct.logoUrl}
                      logoColor={flagshipProduct.logoColor}
                      size="lg"
                    />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 block">
                        {flagshipProduct.brand} Oficial
                      </span>
                      <h3 className="text-2xl font-black text-white tracking-tight leading-tight mt-0.5 group-hover:text-amber-200 transition-colors">
                        {flagshipProduct.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {flagshipProduct.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Modality & Pricing Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 mb-6 space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>Modalidad Activa:</span>
                      <span className="font-semibold text-white">
                        {flagshipModality?.name} ({billingPeriod === 'ANNUAL' ? 'Plan Anual' : flagshipModality?.duration})
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                          {billingPeriod === 'ANNUAL' ? 'Tarifa con -25% Ahorro:' : 'Tarifa Oficial StreamBox:'}
                        </span>
                        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                          {flagshipPriceText}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Entrega Inmediata
                        </span>
                        <span className="text-[10px] text-neutral-500">Stock disponible</span>
                      </div>
                    </div>
                  </div>

                  {/* Marquee Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleOpenFlagshipWhatsApp}
                      className="py-3 px-3 rounded-xl font-bold text-xs text-black bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.25)] cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Comprar por WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (flagshipModality) {
                          onInstantBuy(flagshipProduct, flagshipModality.id);
                        }
                      }}
                      className="py-3 px-3 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                    >
                      <Zap className="w-4 h-4 fill-current text-black" />
                      <span>Pagar Directo</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES COLLECTION & ASYMMETRIC GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Colección Destacada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Suscripciones Activas & Populares
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Cuentas completas y perfiles individuales con soporte garantizado en Colombia. Precios convertidos en vivo a {currency}.
            </p>
          </div>

          {/* Category Filter Controls (Segmented buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 p-1 rounded-xl bg-[#0d0d14] border border-white/6">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                selectedCategory === 'ALL'
                  ? 'bg-white/10 text-white shadow-sm border border-white/15'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos los Destacados
            </button>
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-white/10 text-white shadow-sm border border-white/15'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Staggered Spotlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.slice(0, 6).map((product, idx) => (
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

        {/* View All Button */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-neutral-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-all cursor-pointer active:scale-95 inline-flex items-center gap-2"
          >
            <span>Ver Catálogo Completo ({products.length} Servicios)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. SIMULADOR DE AHORRO DINÁMICO (Comparador Oficial vs StreamBox) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SavingsCalculatorWidget onNavigateToCatalog={() => onNavigate('catalogo')} />
        </ScrollReveal>
      </section>

      {/* 5. SELECTOR DE MÉTODO DE PAGO VISUAL CON COPIADO RÁPIDO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <PaymentMethodsQuickCopy onNavigateToCheckout={() => onNavigate('checkout')} />
        </ScrollReveal>
      </section>

      {/* 4. FAQ TÁCTIL CON ACORDEÓN FLUIDO */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-1">
              Resolución Inmediata
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Preguntas Frecuentes
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Garantías, renovación de perfiles y soporte humano en Colombia sin interrupciones.
            </p>
          </div>

          <TactileFaqAccordion />
        </ScrollReveal>
      </section>

      {/* WhatsApp Flagship Order Modal */}
      <WhatsAppDirectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        orderDetails={marqueeWhatsAppPayload}
      />
    </div>
  );
};
