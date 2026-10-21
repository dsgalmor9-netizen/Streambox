import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Gift,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Ticket as TicketIcon,
  Sparkles,
  Infinity as InfinityIcon,
  Lock,
  Users,
} from 'lucide-react';

interface GiveawayViewProps {
  onOpenAuth: () => void;
}

export const GiveawayView: React.FC<GiveawayViewProps> = ({ onOpenAuth }) => {
  const { giveaways, currentUser, enterGiveaway, toggleGiveawayUnlimitedTickets } = useStore();
  const [feedback, setFeedback] = useState<{
    msg: string;
    error?: boolean;
    ticketNumber?: number;
    ticketCode?: string;
  } | null>(null);

  const activeCampaign = giveaways.find((g) => g.status === 'ACTIVE') || giveaways[0];

  // User's registered tickets in this campaign
  const userTickets = activeCampaign?.participants?.filter(
    (p) => currentUser && (p.userId === currentUser.id || p.userEmail === currentUser.email)
  ) || [];

  const hasParticipated = userTickets.length > 0;
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleParticipate = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const res = enterGiveaway(activeCampaign.id);
    setFeedback({
      msg: res.message,
      error: !res.success,
      ticketNumber: res.ticketNumber,
      ticketCode: res.ticketCode,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-xs font-semibold mb-4">
          <Gift className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sorteos Oficiales StreamBox</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Participa por Suscripciones Anuales
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          Asignación transparente de turnos y números oficiales con trazabilidad por cuenta.
        </p>
      </div>

      {activeCampaign ? (
        <div className="p-6 sm:p-10 rounded-3xl bg-[#14141F] border border-purple-900/50 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle neon glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Campaign info & Admin Toggle for Unlimited Clicks Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                Campaña Activa
              </span>
              <div className="flex items-center gap-1.5 font-mono text-zinc-300 text-xs">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Finaliza: {new Date(activeCampaign.endDate).toLocaleDateString('es-CO')}</span>
              </div>
            </div>

            {/* Mode Indicator & Super Admin Toggle */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-semibold border ${
                activeCampaign.allowUnlimitedTickets
                  ? 'bg-amber-950/60 border-amber-700/60 text-amber-300'
                  : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
              }`}>
                {activeCampaign.allowUnlimitedTickets ? (
                  <>
                    <InfinityIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Modo Clics Infinitos Habilitado</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Regla Estricta: 1 Clic / 1 Ticket por Cuenta</span>
                  </>
                )}
              </span>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => toggleGiveawayUnlimitedTickets(activeCampaign.id)}
                  title="Cambiar entre modo 1 solo clic o clics infinitos"
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {activeCampaign.allowUnlimitedTickets ? 'Forzar 1 Ticket Único' : 'Permitir Clics Infinitos'}
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeCampaign.title}
            </h2>

            <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
              {activeCampaign.description}
            </p>
          </div>

          {/* Prize Callout Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/90 border border-purple-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Premio Oficial:</span>
                <div className="text-base sm:text-lg font-bold text-white font-mono">{activeCampaign.prize}</div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Turnos Asignados</span>
              <span className="text-xl font-extrabold text-cyan-400 font-mono">#{activeCampaign.entriesCount}</span>
            </div>
          </div>

          {/* My Tickets Banner (if user already participated) */}
          {currentUser && userTickets.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-cyan-950/60 border border-purple-600/50 shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-bold text-white">
                    {userTickets.length === 1 ? 'Tu Turno y Ticket Oficial:' : `Tienes ${userTickets.length} Tickets Acumulados:`}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {currentUser.email}
                </span>
              </div>

              {/* Badges of user's tickets */}
              <div className="flex flex-wrap gap-2.5">
                {userTickets.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-black/70 border border-cyan-500/50 px-3.5 py-1.5 rounded-xl text-white font-mono text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-zinc-400">Turno:</span>
                    <strong className="text-cyan-300 font-extrabold text-sm">#{t.ticketNumber}</strong>
                    <span className="text-zinc-500 text-[10px]">({t.ticketCode})</span>
                  </div>
                ))}
              </div>

              {!activeCampaign.allowUnlimitedTickets && (
                <p className="text-[11px] text-emerald-400 mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Tu cupo único está asegurado. No se admiten registros repetidos para mantener la equidad del sorteo.</span>
                </p>
              )}
            </div>
          )}

          {/* Rules & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Reglas Oficiales y Transparencia:</span>
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {activeCampaign.allowUnlimitedTickets
                    ? 'Modo de prueba infinito: Puedes generar cuantos tickets desees haciendo clic repetidamente.'
                    : '1 solo clic / 1 ticket por persona y cuenta: Garantía de oportunidad equitativa para toda la comunidad.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>El sistema genera un código de ticket único (Turno #{activeCampaign.entriesCount + 1}) con sello de tiempo inmutable.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>El ganador será seleccionado aleatoriamente por registro criptográfico y contactado por chat interno y correo.</span>
              </div>
            </div>
          </div>

          {/* Action Zone: Register / Click */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Users className="w-4 h-4 text-zinc-500" />
              <span>
                Total turnos registrados:{' '}
                <strong className="font-mono text-cyan-400 text-sm font-bold">#{activeCampaign.entriesCount}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleParticipate}
              disabled={Boolean(currentUser && hasParticipated && !activeCampaign.allowUnlimitedTickets)}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2 ${
                currentUser && hasParticipated && !activeCampaign.allowUnlimitedTickets
                  ? 'bg-zinc-800/80 text-zinc-400 border border-zinc-700 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)] active:scale-95'
              }`}
            >
              <TicketIcon className="w-4 h-4" />
              {!currentUser
                ? 'INICIAR SESIÓN PARA PARTICIPAR'
                : hasParticipated && !activeCampaign.allowUnlimitedTickets
                ? `YA TIENES TU TICKET (#${userTickets[0]?.ticketNumber})`
                : hasParticipated && activeCampaign.allowUnlimitedTickets
                ? 'GENERAR OTRO TICKET (CLIC INFINITO)'
                : 'PARTICIPAR (OBTENER MI TURNO / TICKET)'}
            </button>
          </div>

          {/* Feedback & Assigned Ticket Display */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                feedback.error
                  ? 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                  : 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{feedback.msg}</span>
              </div>

              {feedback.ticketNumber && (
                <div className="flex items-center gap-2 shrink-0 bg-black/60 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-white font-mono">
                  <span className="text-zinc-400 text-[11px]">Tu Turno Oficial:</span>
                  <strong className="text-cyan-300 font-bold text-sm">#{feedback.ticketNumber}</strong>
                  <span className="text-zinc-500 text-[10px]">({feedback.ticketCode})</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
          <p className="text-base font-bold text-white mb-1">No hay sorteos activos en este momento</p>
          <p className="text-xs text-zinc-500">
            Mantente atento a nuestras notificaciones en Mi Chat para la próxima campaña.
          </p>
        </div>
      )}
    </div>
  );
};

