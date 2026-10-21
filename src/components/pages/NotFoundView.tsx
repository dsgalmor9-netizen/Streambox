import React from 'react';
import { Home, Grid, ArrowLeft, MessageSquare } from 'lucide-react';

interface NotFoundViewProps {
  onNavigate: (view: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Futuristic 404 Glow Display */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 blur-3xl opacity-30 -z-10" />
          <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            404 — PÁGINA NO ENCONTRADA
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Parece que esta página se perdió en el universo digital. Puedes volver al inicio o explorar el catálogo de StreamBox.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('inicio')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>VOLVER AL INICIO</span>
          </button>

          <button
            onClick={() => onNavigate('catalogo')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>EXPLORAR CATÁLOGO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
