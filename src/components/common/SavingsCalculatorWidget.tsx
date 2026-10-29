import React, { useState, useId } from 'react';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Calculator,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface PlatformComparison {
  id: string;
  name: string;
  brand: string;
  officialPriceCOP: number;
  streamboxPriceCOP: number;
  accentColor: string;
}

const COMPARISON_PLATFORMS: PlatformComparison[] = [
  {
    id: 'netflix',
    name: 'Netflix 4K UHD',
    brand: 'Netflix',
    officialPriceCOP: 44900,
    streamboxPriceCOP: 14900,
    accentColor: '#E50914',
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    brand: 'Spotify',
    officialPriceCOP: 18900,
    streamboxPriceCOP: 7900,
    accentColor: '#1DB954',
  },
  {
    id: 'disney',
    name: 'Disney+ Premium',
    brand: 'Disney+',
    officialPriceCOP: 35900,
    streamboxPriceCOP: 12500,
    accentColor: '#0063E5',
  },
  {
    id: 'max',
    name: 'Max Platino 4K',
    brand: 'Max',
    officialPriceCOP: 29900,
    streamboxPriceCOP: 11900,
    accentColor: '#002BE7',
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    brand: 'YouTube',
    officialPriceCOP: 20900,
    streamboxPriceCOP: 8500,
    accentColor: '#FF0000',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    brand: 'Prime Video',
    officialPriceCOP: 22900,
    streamboxPriceCOP: 8900,
    accentColor: '#00A8E1',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll Fan',
    brand: 'Crunchyroll',
    officialPriceCOP: 14900,
    streamboxPriceCOP: 6500,
    accentColor: '#F47521',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    brand: 'ChatGPT',
    officialPriceCOP: 85000,
    streamboxPriceCOP: 28000,
    accentColor: '#10A37F',
  },
];

interface SavingsCalculatorWidgetProps {
  onNavigateToCatalog?: () => void;
}

export const SavingsCalculatorWidget: React.FC<SavingsCalculatorWidgetProps> = ({
  onNavigateToCatalog,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'netflix',
    'spotify',
    'disney',
  ]);
  const [months, setMonths] = useState<number>(12);
  const monthsSliderId = useId();

  const togglePlatform = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectedPlatforms = COMPARISON_PLATFORMS.filter((p) =>
    selectedIds.includes(p.id)
  );

  const monthlyOfficialTotal = selectedPlatforms.reduce(
    (sum, p) => sum + p.officialPriceCOP,
    0
  );
  const monthlyStreamboxTotal = selectedPlatforms.reduce(
    (sum, p) => sum + p.streamboxPriceCOP,
    0
  );

  const monthlyNetSavings = Math.max(0, monthlyOfficialTotal - monthlyStreamboxTotal);
  const totalNetSavings = monthlyNetSavings * months;
  const savingsPercent =
    monthlyOfficialTotal > 0
      ? Math.round((monthlyNetSavings / monthlyOfficialTotal) * 100)
      : 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0d14] border border-white/8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Simulador de Ahorro Inteligente</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Tarifas Oficiales vs. StreamBox Colombia
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Selecciona las suscripciones que usas en tu hogar y calcula tu ahorro neto en pesos colombianos.
          </p>
        </div>

        {/* Selected count pill-less label */}
        <div className="text-right shrink-0">
          <span className="text-xs text-neutral-400 block font-medium">Plataformas seleccionadas:</span>
          <span className="text-lg font-bold font-mono text-amber-400">
            {selectedIds.length} de {COMPARISON_PLATFORMS.length}
          </span>
        </div>
      </div>

      {/* Platforms Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {COMPARISON_PLATFORMS.map((platform) => {
          const isSelected = selectedIds.includes(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 flex flex-col justify-between h-24 ${
                isSelected
                  ? 'bg-white/10 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40'
                  : 'bg-black/40 border-white/6 hover:border-white/15 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <BrandLogo brand={platform.brand} size="xs" />
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-amber-400 text-black' : 'bg-white/10 text-neutral-500'
                  }`}
                >
                  {isSelected ? '✓' : '+'}
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-white truncate">
                  {platform.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                  <span className="line-through text-neutral-500 font-mono">
                    ${(platform.officialPriceCOP / 1000).toFixed(0)}k
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ${(platform.streamboxPriceCOP / 1000).toFixed(0)}k COP
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Slider Projection Horizon (Months) */}
      <div className="p-4 rounded-2xl bg-black/60 border border-white/6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/2">
          <div className="flex justify-between text-xs text-neutral-300 font-medium mb-1.5">
            <label htmlFor={monthsSliderId}>Proyección de Ahorro:</label>
            <span className="font-mono text-amber-400 font-bold">
              {months} {months === 1 ? 'Mes' : 'Meses'}
            </span>
          </div>
          <input
            id={monthsSliderId}
            type="range"
            min="1"
            max="12"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Garantía continua de reposición ante caídas incluida en todas las plataformas.</span>
        </div>
      </div>

      {/* Comparison Calculation Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-br from-black/80 via-[#12121c] to-black/80 border border-white/10">
        {/* Official Price */}
        <div className="space-y-1">
          <span className="text-xs text-neutral-400">Tarifa Oficial Proveedores</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-400 line-through">
            ${(monthlyOfficialTotal * months).toLocaleString('es-CO')} COP
          </div>
          <span className="text-[11px] text-neutral-500 block">
            ${monthlyOfficialTotal.toLocaleString('es-CO')} COP / mes
          </span>
        </div>

        {/* StreamBox Price */}
        <div className="space-y-1">
          <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Tarifa con StreamBox</span>
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
            ${(monthlyStreamboxTotal * months).toLocaleString('es-CO')} COP
          </div>
          <span className="text-[11px] text-neutral-400 block">
            ${monthlyStreamboxTotal.toLocaleString('es-CO')} COP / mes
          </span>
        </div>

        {/* Total Net Savings Highlight */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center sm:text-right flex flex-col justify-center">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            ¡Tu Ahorro Neto ({savingsPercent}% OFF)!
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            +${totalNetSavings.toLocaleString('es-CO')} COP
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5">
            Dinero directo que queda en tu bolsillo
          </span>
        </div>
      </div>

      {/* Bottom CTA */}
      {onNavigateToCatalog && (
        <div className="mt-5 text-center sm:text-right">
          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>ACTIVAR MI COMBO DE SUSCRIPCIONES</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      )}
    </div>
  );
};
