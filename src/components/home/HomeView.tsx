import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import { ProductCard } from '../product/ProductCard';
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
  const { products, categories, settings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const featuredProducts = products.filter((p) => p.isFeatured || p.isPopular);
  const filteredProducts =
    selectedCategory === 'ALL'
      ? featuredProducts
      : products.filter((p) => p.category === selectedCategory);

  const faqs = [
    {
      q: '¿Cómo funciona el proceso de pago por Nequi o Daviplata?',
      a: 'Al finalizar tu pedido, te mostramos el número oficial de Nequi (304 596 7068) o Daviplata (311 413 9187). Realizas la transferencia desde tu app bancaria y reportas el número de referencia en el formulario. Nuestro equipo lo valida y recibes tus credenciales de inmediato en Mi Chat.',
    },
    {
      q: '¿Los precios están en Pesos Colombianos?',
      a: 'Sí, todos los precios mostrados están en COP (Pesos Colombianos) netos, sin costos ocultos ni cobros recurrentes sorpresa en tu tarjeta.',
    },
    {
      q: '¿Cuánto tiempo tarda la entrega del servicio?',
      a: 'Una vez reportado tu pago, nuestro equipo administrativo lo valida en un lapso de 5 a 15 minutos y despacha tus datos de acceso directamente a tu chat privado en la plataforma.',
    },
    {
      q: '¿Qué garantía tienen las cuentas y perfiles?',
      a: 'Ofrecemos 100% de garantía y soporte técnico durante la totalidad del tiempo contratado (1 mes, 3 meses, 12 meses). Si presentas algún inconveniente, lo resolvemos de inmediato.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient neon radial gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-purple-700/25 via-fuchsia-600/20 to-cyan-500/20 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Logo Showcase */}
          <div className="flex justify-center mb-8">
            <StreamBoxLogo size="xl" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Tus Plataformas Favoritas con{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Entrega Inmediata
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mt-6 leading-relaxed">
            Streaming de películas en 4K, música Hi-Fi, Inteligencia Artificial, licencias de diseño y software. Pagos manuales verificados con Nequi y Daviplata en Colombia.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => onNavigate('catalogo')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 group cursor-pointer transition-all"
            >
              <span>EXPLORAR CATÁLOGO COMPLETO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Consultar Asistente StreamBot</span>
            </button>
          </div>

          {/* Trust Value Props (Zero-Pill Discipline) */}
          <div className="mt-14 pt-8 border-t border-zinc-800/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-zinc-400">
            <div className="flex flex-col items-center">
              <Zap className="w-5 h-5 text-cyan-400 mb-1.5" />
              <span className="font-semibold text-white">Entrega en Minutos</span>
              <span className="text-[11px] text-zinc-500">Por chat privado</span>
            </div>

            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
              <span className="font-semibold text-white">Garantía Activa</span>
              <span className="text-[11px] text-zinc-500">Durante todo tu período</span>
            </div>

            <div className="flex flex-col items-center">
              <Smartphone className="w-5 h-5 text-fuchsia-400 mb-1.5" />
              <span className="font-semibold text-white">Nequi & Daviplata</span>
              <span className="text-[11px] text-zinc-500">Transferencia en Colombia</span>
            </div>

            <div className="flex flex-col items-center">
              <Sparkles className="w-5 h-5 text-amber-400 mb-1.5" />
              <span className="font-semibold text-white">Precios Mayoristas</span>
              <span className="text-[11px] text-zinc-500">En Pesos COP</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES & PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Servicios Más Populares
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Selecciona tu modalidad, adquiere con precio en COP y recibe tus datos al confirmar el pago
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Todos los Destacados
            </button>
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
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

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('catalogo')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white transition-colors"
          >
            <span>VER TODOS LOS SERVICIOS ({products.length})</span>
            <ChevronRight className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </section>

      {/* HOW IT WORKS: COLOMBIAN MANUAL FLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#12121C] border border-zinc-800/90 relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Proceso Transparente
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ¿Cómo Comprar en StreamBox?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Sin suscripciones automáticas en tarjetas de crédito. Control total de tus pagos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center font-bold text-purple-300 font-mono text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white">Elige tu Servicio</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Selecciona la plataforma y duración deseada (1 mes, 3 meses, 12 meses, perfil privado o cuenta completa).
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-300 font-mono text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white">Transfiere y Reporta</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Envía el monto a Nequi ({settings.nequiNumber}) o Daviplata ({settings.daviplataNumber}) e ingresa tu código de referencia.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-300 font-mono text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white">Recibe en Mi Chat</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tras confirmar tu comprobante en 5-15 min, el sistema te entrega las credenciales y la garantía en tu chat personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GIVEAWAY HIGHLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#151522] to-cyan-950/70 border border-purple-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-400 shrink-0">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Campaña Activa StreamBox
              </span>
              <h3 className="text-lg font-bold text-white">
                Sorteo Oficial de 1 Año Completo en Streaming
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">
                Participa gratis con tu usuario registrado. Registro criptográfico transparente.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('giveaway')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-xs font-bold text-white shadow-md shrink-0 cursor-pointer"
          >
            Participar en el Sorteo
          </button>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Preguntas Frecuentes</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Resolvemos tus dudas sobre compras, garantías y métodos de pago
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#14141F] border border-zinc-800/80 text-xs"
            >
              <h4 className="font-bold text-white text-sm flex items-start gap-2.5 mb-2">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-zinc-400 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
