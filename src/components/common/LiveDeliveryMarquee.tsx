import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface DeliveryItem {
  name: string;
  action: string;
  service: string;
  timeAgo: string;
  color: string;
}

const DEFAULT_DELIVERIES: DeliveryItem[] = [
  { name: 'Carlos M.', action: 'activó', service: 'Netflix 4K UHD', timeAgo: 'hace 2 min', color: '#E50914' },
  { name: 'Sofía R.', action: 'renovó', service: 'Spotify Premium Familiar', timeAgo: 'hace 5 min', color: '#1DB954' },
  { name: 'Valentina T.', action: 'activó', service: 'Disney+ Premium', timeAgo: 'hace 7 min', color: '#0063E5' },
  { name: 'Andrés P.', action: 'activó', service: 'Max Platino 4K', timeAgo: 'hace 9 min', color: '#002BE7' },
  { name: 'Diego G.', action: 'renovó', service: 'YouTube Premium', timeAgo: 'hace 12 min', color: '#FF0000' },
  { name: 'Camila V.', action: 'activó', service: 'Prime Video', timeAgo: 'hace 14 min', color: '#00A8E1' },
  { name: 'Juan D.', action: 'activó', service: 'Crunchyroll Mega Fan', timeAgo: 'hace 18 min', color: '#F47521' },
  { name: 'Mateo L.', action: 'renovó', service: 'ChatGPT Plus Team', timeAgo: 'hace 22 min', color: '#10A37F' },
];

export const LiveDeliveryMarquee: React.FC = () => {
  // Duplicate array for seamless infinite looping
  const duplicatedList = [...DEFAULT_DELIVERIES, ...DEFAULT_DELIVERIES];

  return (
    <div
      className="w-full bg-[#0d0d14]/90 border-y border-white/6 py-2.5 overflow-hidden select-none backdrop-blur-md relative z-20 group"
      aria-label="Entregas y activaciones en vivo"
    >
      {/* Left/Right gradient shadows for soft fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center">
        {/* Static Prefix Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-4 pr-3 shrink-0 text-xs font-semibold text-neutral-300 border-r border-white/10 z-20 bg-[#0d0d14]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="uppercase tracking-wider text-[11px] font-bold text-amber-400">
            En Vivo
          </span>
          <span className="text-neutral-500 font-mono text-[10px]">
            (3 cuentas entregadas en los últimos 10 min)
          </span>
        </div>

        {/* Scrolling Track */}
        <div className="overflow-hidden flex-1">
          <div className="animate-marquee items-center gap-8 text-xs text-neutral-300">
            {duplicatedList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 whitespace-nowrap shrink-0">
                <span className="font-semibold text-white">{item.name}</span>
                <span className="text-neutral-400">{item.action}</span>
                <span
                  className="font-bold text-[11px] px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${item.color}15`,
                    borderColor: `${item.color}40`,
                    color: item.color === '#E50914' ? '#FF5B65' : item.color,
                  }}
                >
                  {item.service}
                </span>
                <span className="text-neutral-500 text-[10px] font-mono">{item.timeAgo}</span>
                <span className="text-neutral-600 mx-2" aria-hidden="true">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
