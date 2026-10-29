import React from 'react';
import { motion } from 'motion/react';
import { useCurrency, CurrencyCode, BillingPeriod } from '../../context/CurrencyContext';
import { DollarSign, Calendar, Sparkles, Check } from 'lucide-react';

interface StoreControlBarProps {
  className?: string;
  compact?: boolean;
}

export const StoreControlBar: React.FC<StoreControlBarProps> = ({
  className = '',
  compact = false,
}) => {
  const {
    currency,
    setCurrency,
    billingPeriod,
    setBillingPeriod,
  } = useCurrency();

  const currencies: { code: CurrencyCode; label: string; flag: string }[] = [
    { code: 'COP', label: 'COP', flag: '🇨🇴' },
    { code: 'USD', label: 'USD', flag: '🇺🇸' },
    { code: 'MXN', label: 'MXN', flag: '🇲🇽' },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-md border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.05)] ${className}`}
    >
      {/* Currency Selector (Zero-pill segmented tabs) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 pl-2 hidden sm:inline">
          Moneda:
        </span>
        <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/6">
          {currencies.map((c) => {
            const isActive = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCurrencyIndicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/15 shadow-sm -z-1"
                  />
                )}
                <span className="mr-1">{c.flag}</span>
                <span className="font-mono">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Periodicity Switcher (Mensual vs Anual con descuento) */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 pl-2 hidden sm:inline">
          Facturación:
        </span>
        <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/6">
          <button
            type="button"
            onClick={() => setBillingPeriod('MONTHLY')}
            className={`relative px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              billingPeriod === 'MONTHLY'
                ? 'text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {billingPeriod === 'MONTHLY' && (
              <motion.div
                layoutId="activePeriodIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-0 rounded-lg bg-white/10 border border-white/15 shadow-sm -z-1"
              />
            )}
            <span>Mensual</span>
          </button>

          <button
            type="button"
            onClick={() => setBillingPeriod('ANNUAL')}
            className={`relative px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              billingPeriod === 'ANNUAL'
                ? 'text-amber-300'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {billingPeriod === 'ANNUAL' && (
              <motion.div
                layoutId="activePeriodIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="absolute inset-0 rounded-lg bg-amber-500/15 border border-amber-500/30 shadow-sm -z-1"
              />
            )}
            <span>Plan Anual</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              -25%
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
