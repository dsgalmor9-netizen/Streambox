import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Sliders,
  X,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface DeveloperPriceAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'add' | 'subtract';
  initialAmount?: number;
}

export const DeveloperPriceAdjusterModal: React.FC<DeveloperPriceAdjusterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'subtract',
  initialAmount = 6000,
}) => {
  const { products, categories, adjustCatalogPrices, resetCatalogPrices } = useStore();

  const [mode, setMode] = useState<'add' | 'subtract'>(initialMode);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [targetScope, setTargetScope] = useState<'all' | 'streambox' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [minFloorCOP, setMinFloorCOP] = useState<number>(1000);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Presets available for fast single-click action
  const PRESET_AMOUNTS = [1000, 2000, 3000, 5000, 6000, 10000, 15000, 20000];

  // Calculate live impact unconditionally so hook order is invariant
  const affectedItems = useMemo(() => {
    if (!isOpen) {
      return { modalitiesCount: 0, samplePreview: [] };
    }
    let modalitiesCount = 0;
    const samplePreview: Array<{
      productName: string;
      brand: string;
      modalityName: string;
      currentPrice: number;
      newPrice: number;
    }> = [];

    products.forEach((p) => {
      if (targetScope === 'category' && selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return;
      }

      p.modalities.forEach((m) => {
        if (m.priceCOP === null || m.priceStatus === 'PRICE_PENDING') return;
        if (targetScope === 'streambox' && m.priceStatus !== 'VERIFIED_STREAMBOX') return;

        modalitiesCount++;

        const delta = mode === 'add' ? amount : -amount;
        const simulatedPrice = Math.max(minFloorCOP, m.priceCOP + delta);

        if (samplePreview.length < 5) {
          samplePreview.push({
            productName: p.name,
            brand: p.brand,
            modalityName: m.name,
            currentPrice: m.priceCOP,
            newPrice: simulatedPrice,
          });
        }
      });
    });

    return { modalitiesCount, samplePreview };
  }, [isOpen, products, mode, amount, targetScope, selectedCategory, minFloorCOP]);

  const handleApply = () => {
    if (isNaN(amount) || amount <= 0) {
      setFeedback({ type: 'error', message: 'Ingresa un monto numérico mayor a 0 COP.' });
      return;
    }

    const res = adjustCatalogPrices({
      amountCOP: amount,
      mode,
      category: targetScope === 'category' ? selectedCategory : 'ALL',
      targetScope: targetScope === 'streambox' ? 'streambox' : 'all',
      minFloorCOP,
    });

    const sign = mode === 'add' ? '+' : '-';
    setFeedback({
      type: 'success',
      message: `¡Ajuste aplicado con éxito! Se modificaron ${res.updatedCount} modalidades (${sign}$${amount.toLocaleString('es-CO')} COP) en ${res.affectedProductsCount} productos.`,
    });
  };

  const handleReset = () => {
    const res = resetCatalogPrices();
    setFeedback({
      type: 'info',
      message: `Se restablecieron los precios originales en ${res.resetCount} modalidades del catálogo comercial.`,
    });
  };

  const handleQuickPreset = (presetAmount: number, presetMode: 'add' | 'subtract') => {
    setAmount(presetAmount);
    setMode(presetMode);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-[#12121C] border border-purple-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-purple-950/60 to-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Ajustador de Precios (Modo Desarrollador)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                  Dev & Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Aumenta, reduce o personaliza cualquier valor (ej. -6.000 COP) de forma masiva o selectiva.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Status Feedback Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-red-950/60 border-red-700/60 text-red-200'
                  : 'bg-cyan-950/60 border-cyan-700/60 text-cyan-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{feedback.message}</div>
              <button
                onClick={() => setFeedback(null)}
                className="text-zinc-400 hover:text-white ml-2"
              >
                &times;
              </button>
            </div>
          )}

          {/* Direct Quick Actions: -6000 and +6000 requested */}
          <div>
            <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span>Atajos Rápidos de un Clic</span>
              <span className="text-[11px] text-zinc-500">Haz clic para cargar valor instantáneo</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset(6000, 'subtract')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'subtract' && amount === 6000
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-rose-700 hover:text-rose-300'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Restar -6.000 COP</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset(6000, 'add')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'add' && amount === 6000
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-emerald-700 hover:text-emerald-300'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sumar +6.000 COP</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset(3000, 'subtract')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'subtract' && amount === 3000
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>-3.000 COP</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset(10000, 'subtract')}
                className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'subtract' && amount === 10000
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>-10.000 COP</span>
              </button>
            </div>
          </div>

          {/* Operation Direction: Subtract vs Add */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('subtract')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'subtract'
                    ? 'bg-gradient-to-r from-rose-950/80 to-purple-950/60 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>Disminuir Precios (Restar -)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('add')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'add'
                    ? 'bg-gradient-to-r from-emerald-950/80 to-purple-950/60 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Aumentar Precios (Sumar +)</span>
              </button>
            </div>
          </div>

          {/* Adjustable Value Controls */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>Valor Ajustable en Pesos Colombianos (COP)</span>
              </label>
              <span className="text-sm font-extrabold font-mono text-purple-300">
                {mode === 'add' ? '+' : '-'}${amount.toLocaleString('es-CO')} COP
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                  {mode === 'add' ? '+' : '-'} $
                </span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="6000"
                  className="w-full pl-9 pr-14 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold text-base focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                  COP
                </span>
              </div>

              {/* Step buttons */}
              <button
                type="button"
                onClick={() => setAmount((prev) => Math.max(500, prev - 1000))}
                className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 cursor-pointer transition-colors"
                title="Bajar 1.000 COP"
              >
                -1.000
              </button>
              <button
                type="button"
                onClick={() => setAmount((prev) => prev + 1000)}
                className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 cursor-pointer transition-colors"
                title="Subir 1.000 COP"
              >
                +1.000
              </button>
            </div>

            {/* Chip preset pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-zinc-400 mr-1">Chips rápidos:</span>
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    amount === val
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  ${(val / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Scope Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Alcance del Ajuste
              </label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">Todo el Catálogo ({products.length} productos)</option>
                <option value="streambox">Solo Modalidades StreamBox</option>
                <option value="category">Filtrar por Categoría Específica</option>
              </select>
            </div>

            {targetScope === 'category' ? (
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Seleccionar Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Piso Mínimo de Seguridad (COP)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={minFloorCOP}
                    onChange={(e) => setMinFloorCOP(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                    No baja de este valor
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Live Impact Preview */}
          <div className="p-3.5 rounded-xl bg-[#0E0E17] border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulación en Vivo del Cambio:</span>
              </span>
              <span className="text-cyan-300 font-mono font-bold">
                {affectedItems.modalitiesCount} modalidades impactadas
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {affectedItems.samplePreview.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <BrandLogo brand={item.brand} productName={item.productName} size="xs" />
                    <span className="font-medium text-white truncate">{item.productName}</span>
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">({item.modalityName})</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-zinc-500 line-through text-[11px]">
                      ${item.currentPrice.toLocaleString('es-CO')}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-600" />
                    <span
                      className={`font-bold ${
                        mode === 'add' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ${item.newPrice.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-[#0E0E17] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Restablece las modalidades a sus precios originales base"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Restablecer a Original</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                mode === 'subtract'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              {mode === 'subtract' ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  <span>Aplicar Reducción (-${amount.toLocaleString('es-CO')} COP)</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Aplicar Incremento (+${amount.toLocaleString('es-CO')} COP)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
