import React, { useState } from 'react';
import { Copy, Check, QrCode, Smartphone, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface PaymentChannel {
  id: string;
  name: string;
  badge: string;
  accountNumber: string;
  accountType: string;
  holder: string;
  accentColor: string;
  iconBg: string;
  instructions: string;
}

export const PaymentMethodsQuickCopy: React.FC<{ onNavigateToCheckout?: () => void }> = ({
  onNavigateToCheckout,
}) => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<string>('nequi');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const channels: PaymentChannel[] = [
    {
      id: 'nequi',
      name: 'Nequi Colombia',
      badge: 'NQ',
      accountNumber: settings.nequiNumber || '304 596 7068',
      accountType: 'Cuenta Digital Nequi',
      holder: 'StreamBox Colombia S.A.S.',
      accentColor: '#D946EF',
      iconBg: 'bg-fuchsia-600',
      instructions: 'Abre tu App Nequi → Envía al número indicado → Toma captura del comprobante.',
    },
    {
      id: 'daviplata',
      name: 'Daviplata',
      badge: 'DP',
      accountNumber: settings.daviplataNumber || '311 413 9187',
      accountType: 'Daviplata Davivienda',
      holder: 'StreamBox Colombia Oficial',
      accentColor: '#F43F5E',
      iconBg: 'bg-rose-600',
      instructions: 'Abre Daviplata → Pasar plata a otro Daviplata → Guarda el número de autorización.',
    },
    {
      id: 'bancolombia',
      name: 'Bancolombia',
      badge: 'BC',
      accountNumber: '912-849102-33',
      accountType: 'Cuenta de Ahorros Bancolombia',
      holder: 'StreamBox Pagos Colombia',
      accentColor: '#FBBF24',
      iconBg: 'bg-amber-500',
      instructions: 'Transferencia gratuita desde App Bancolombia a la cuenta de ahorros indicada.',
    },
    {
      id: 'binance',
      name: 'Binance USDT',
      badge: 'BN',
      accountNumber: '78291044',
      accountType: 'Binance Pay ID (Cero comisiones)',
      holder: 'StreamBox Official Global',
      accentColor: '#F0B90B',
      iconBg: 'bg-yellow-500',
      instructions: 'Envía vía Binance Pay usando el Pay ID oficial sin comisión de red (USDT).',
    },
    {
      id: 'pse',
      name: 'Transfiya / PSE',
      badge: 'TF',
      accountNumber: settings.nequiNumber || '304 596 7068',
      accountType: 'Llave Móvil Transfiya',
      holder: 'Cualquier banco colombiano (Interbancario)',
      accentColor: '#06B6D4',
      iconBg: 'bg-cyan-600',
      instructions: 'Envía desde cualquier banco por Transfiya ingresando el número de celular oficial.',
    },
  ];

  const activeChannel = channels.find((c) => c.id === activeTab) || channels[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0d14] border border-white/8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-1">
            Canales de Transferencia Oficiales
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Selector de Método de Pago Visual
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Copia el número de cuenta o llave de pago con un solo toque y transfiere con cero comisiones.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Verificación en 5-15 min</span>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {channels.map((ch) => {
          const isActive = ch.id === activeTab;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveTab(ch.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 border ${
                isActive
                  ? 'bg-white/10 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-black/40 text-neutral-400 hover:text-white border-white/6 hover:border-white/12'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg ${ch.iconBg} flex items-center justify-center text-white text-[10px] font-mono font-extrabold`}
              >
                {ch.badge}
              </span>
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Channel Display Box with Rapid Haptic Copy */}
      <div className="p-5 sm:p-6 rounded-2xl bg-black/70 border border-white/8 relative overflow-hidden space-y-4">
        {/* Subtle accent corner glow */}
        <div
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-[60px] pointer-events-none opacity-25"
          style={{ backgroundColor: activeChannel.accentColor }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
              {activeChannel.accountType}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-wider">
              {activeChannel.accountNumber}
            </div>
            <div className="text-xs text-neutral-400">
              Titular registrado: <strong className="text-neutral-200">{activeChannel.holder}</strong>
            </div>
          </div>

          {/* Copy Button with visual feedback */}
          <button
            type="button"
            onClick={() => handleCopy(activeChannel.accountNumber, activeChannel.id)}
            className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md ${
              copiedKey === activeChannel.id
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            }`}
          >
            {copiedKey === activeChannel.id ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡COPIADO!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPIAR NÚMERO</span>
              </>
            )}
          </button>
        </div>

        {/* Step Guide */}
        <div className="pt-3 border-t border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
          <p className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{activeChannel.instructions}</span>
          </p>

          {onNavigateToCheckout && (
            <button
              type="button"
              onClick={onNavigateToCheckout}
              className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer text-left sm:text-right shrink-0"
            >
              Reportar mi pago ahora →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
