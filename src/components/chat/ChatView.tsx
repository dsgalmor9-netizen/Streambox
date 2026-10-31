import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChatMessage } from '../../types';
import {
  Send,
  Bot,
  User,
  ShieldAlert,
  Sparkles,
  Headphones,
  Package,
  CreditCard,
  Calendar,
  PhoneCall,
  Mail,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  X,
  History,
  Download,
  HardDrive,
  Clock,
  FileText,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    currentUser,
    chatMessages,
    chatMode,
    isBotTyping,
    sendChatMessage,
    handleChatbotAction,
    requestHumanSupport,
    resetUserChat,
    settings,
  } = useStore();

  const currentUserId = currentUser ? currentUser.id : 'usr-client-demo';
  const sessionHistoryKey = `sb_chat_session_history_${currentUserId}`;
  const sessionDraftKey = `sb_chat_session_draft_${currentUserId}`;
  const sessionMetaKey = `sb_chat_session_meta_${currentUserId}`;

  // Session message history directly initialized from localStorage to persist across section navigation
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(sessionHistoryKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading chat session history from localStorage:', e);
    }
    return chatMessages.filter(
      (m) => m.userId === currentUserId || m.userId === 'ALL'
    );
  });

  // Persistent input message draft saved in localStorage across section navigation
  const [inputMessage, setInputMessage] = useState<string>(() => {
    try {
      return localStorage.getItem(sessionDraftKey) || '';
    } catch {
      return '';
    }
  });

  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(() => {
    try {
      const draft = localStorage.getItem(sessionDraftKey);
      return !!draft && draft.trim().length > 0;
    } catch {
      return false;
    }
  });

  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>(() => {
    try {
      const meta = localStorage.getItem(sessionMetaKey);
      if (meta) {
        const parsed = JSON.parse(meta);
        return parsed.lastSavedAt || new Date().toISOString();
      }
    } catch {}
    return new Date().toISOString();
  });

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetToast, setResetToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize store messages with session storage in localStorage
  useEffect(() => {
    const relevantFromStore = chatMessages.filter(
      (m) => m.userId === currentUserId || m.userId === 'ALL'
    );

    // Merge ensuring no duplicate message IDs and chronological ordering
    const map = new Map<string, ChatMessage>();
    sessionMessages.forEach((m) => map.set(m.id, m));
    relevantFromStore.forEach((m) => map.set(m.id, m));
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    setSessionMessages(merged);

    // Persist session history immediately to localStorage
    try {
      localStorage.setItem(sessionHistoryKey, JSON.stringify(merged));
      const now = new Date().toISOString();
      setLastSavedTimestamp(now);
      localStorage.setItem(
        sessionMetaKey,
        JSON.stringify({
          userId: currentUserId,
          messageCount: merged.length,
          lastSavedAt: now,
          sessionStartedAt: merged[0]?.timestamp || now,
        })
      );
    } catch (e) {
      console.warn('Error saving chat session history to localStorage:', e);
    }
  }, [chatMessages, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages, isBotTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMessage(val);
    try {
      if (val.trim()) {
        localStorage.setItem(sessionDraftKey, val);
      } else {
        localStorage.removeItem(sessionDraftKey);
        setHasRestoredDraft(false);
      }
    } catch (err) {
      console.warn('Error saving draft to localStorage:', err);
    }
  };

  const handleClearDraft = () => {
    setInputMessage('');
    setHasRestoredDraft(false);
    try {
      localStorage.removeItem(sessionDraftKey);
    } catch {}
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const toSend = inputMessage.trim();
    setInputMessage('');
    setHasRestoredDraft(false);
    try {
      localStorage.removeItem(sessionDraftKey);
    } catch {}

    sendChatMessage(toSend);
  };

  const handleConfirmReset = () => {
    try {
      localStorage.removeItem(sessionHistoryKey);
      localStorage.removeItem(sessionDraftKey);
      localStorage.removeItem(sessionMetaKey);
    } catch {}

    resetUserChat(currentUserId);

    const freshMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      userId: currentUserId,
      sender: 'BOT',
      senderName: 'StreamBot AI',
      content: '¡Hola! He reiniciado la conversación en vivo. Soy StreamBot AI, tu asistente virtual con Gemini 3.8 Flash. ¿En qué puedo ayudarte hoy?\n\nPuedes consultar el estado de tu pedido, verificar tus pagos por Nequi/Daviplata o solicitar atención con un asesor humano en cualquier momento.',
      timestamp: new Date().toISOString(),
    };

    setSessionMessages([freshMsg]);
    try {
      localStorage.setItem(sessionHistoryKey, JSON.stringify([freshMsg]));
    } catch {}

    setInputMessage('');
    setHasRestoredDraft(false);
    setShowResetConfirmModal(false);
    setResetToast('¡Historial de sesión reiniciado con éxito! Se ha iniciado una nueva conversación limpia.');
    setTimeout(() => setResetToast(null), 4000);
  };

  const handleDownloadTranscript = () => {
    const textLines = sessionMessages.map((m) => {
      const time = new Date(m.timestamp).toLocaleString('es-CO');
      return `[${time}] ${m.senderName} (${m.sender}):\n${m.content}\n`;
    });
    const header = `HISTORIAL DE SESIÓN DE CHAT - STREAMBOX COLOMBIA\nUsuario: ${currentUser?.name || 'Cliente'} (${currentUser?.email || 'N/A'})\nGenerado: ${new Date().toLocaleString('es-CO')}\nTotal mensajes guardados: ${sessionMessages.length}\n${'='.repeat(60)}\n\n`;
    const fullText = header + textLines.join('\n----------------------------------------\n\n');

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_chat_streambox_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const adminEmail = settings.supportEmail || 'd.s.gal.mor.9@gmail.com';
  const adminPhone = settings.supportPhone || '+57 304 596 7068';
  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="rounded-2xl bg-[#12121B] border border-zinc-800 shadow-2xl flex flex-col h-[780px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#161622] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                {chatMode === 'HUMAN_ACTIVE' || chatMode === 'WAITING_ADMIN' ? (
                  <Headphones className="w-5 h-5 text-amber-300" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#12121B] ${
                chatMode === 'HUMAN_ACTIVE'
                  ? 'bg-emerald-400'
                  : chatMode === 'WAITING_ADMIN'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-cyan-400'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {chatMode === 'HUMAN_ACTIVE'
                    ? 'Atención Humana en Vivo'
                    : chatMode === 'WAITING_ADMIN'
                    ? 'Esperando Asesor Humano (Alerta Enviada)'
                    : 'StreamBot AI (Gemini Automático)'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  chatMode === 'WAITING_ADMIN'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {chatMode === 'WAITING_ADMIN' ? 'ALERTA EMAIL + SMS ACTIVA' : chatMode}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Respuestas automáticas inteligentes con Gemini 3.8 Flash • Transferencia humana con alerta por correo y celular
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Session History Indicator & Inspector Pill */}
            <button
              type="button"
              onClick={() => setShowSessionModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 hover:border-cyan-500/70 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Ver detalles del historial de sesión guardado en localStorage"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Historial Sesión:</span>
              <span className="font-mono font-bold text-cyan-200">{sessionMessages.length} msgs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* Button: Reiniciar Chat en Vivo para Usuarios */}
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Reiniciar chat en vivo y comenzar una nueva sesión limpia"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reiniciar Chat</span>
            </button>

            <div className="text-right text-xs text-zinc-400 hidden xl:block">
              <span className="block font-medium text-emerald-400 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" /> Canal Verificado
              </span>
              <span className="text-[11px] text-zinc-500">Soporte StreamBox Colombia</span>
            </div>
          </div>
        </div>

        {/* Reset Feedback Notification Toast Banner */}
        {resetToast && (
          <div className="px-4 py-2.5 bg-emerald-950/70 border-b border-emerald-800/80 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{resetToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setResetToast(null)}
              className="text-emerald-400 hover:text-white text-xs cursor-pointer font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Informative Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-cyan-950/30 border-b border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              <strong>Chat con IA Automatizado:</strong> Pregunta precios, modalidades o dudas. Si deseas un asesor humano, solicítalo y se notificará por correo y SMS.
            </span>
          </div>
          <button
            onClick={() => requestHumanSupport('Solicitud manual desde cabecera')}
            className="text-[10px] text-purple-300 hover:text-white underline font-semibold shrink-0 ml-2 cursor-pointer"
          >
            Llamar Asesor Humano
          </button>
        </div>

        {/* Quick Tool Actions Bar */}
        <div className="px-4 py-2.5 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Accesos Rápidos:
          </span>

          {/* Quick Action: Reiniciar Chat */}
          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 hover:text-white transition-all shrink-0 cursor-pointer font-bold shadow-sm active:scale-95"
            title="Reiniciar chat en vivo a su estado inicial"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>REINICIAR CHAT</span>
          </button>

          <button
            type="button"
            onClick={() => handleChatbotAction('MI_PEDIDO')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>MI PEDIDO</span>
          </button>

          <button
            type="button"
            onClick={() => handleChatbotAction('MI_PAGO')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>MI PAGO</span>
          </button>

          <button
            type="button"
            onClick={() => handleChatbotAction('MI_VENCIMIENTO')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>MI VENCIMIENTO</span>
          </button>

          <button
            type="button"
            onClick={() => sendChatMessage('¿Cuáles son los precios en COP de MUBI, YouTube, Apple Music, PlayStation Plus y Google Gemini?')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRECIOS COP</span>
          </button>

          <button
            type="button"
            onClick={() => requestHumanSupport('El usuario presionó el botón directo de asesor humano')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-200 hover:text-white transition-colors shrink-0 cursor-pointer font-bold shadow-sm"
          >
            <Headphones className="w-3.5 h-3.5 text-rose-400" />
            <span>HABLAR CON ASESOR (EMAIL & SMS)</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Visual Session Storage Indicator */}
          <div className="flex items-center justify-center my-1">
            <div className="px-3.5 py-1.5 rounded-full bg-black/60 border border-white/8 text-[11px] text-zinc-400 font-mono flex items-center gap-2 shadow-sm">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Historial de sesión sincronizado con almacenamiento local</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-emerald-400 font-medium hidden sm:inline flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 inline" /> Activo
              </span>
            </div>
          </div>

          {sessionMessages.map((msg) => {
            const isUser = msg.sender === 'USER';
            const isSystem = msg.sender === 'SYSTEM';
            const isAdmin = msg.sender === 'ADMIN';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold shadow ${
                    isUser
                      ? 'bg-purple-600 text-white'
                      : isSystem
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-700/60'
                      : isAdmin
                      ? 'bg-gradient-to-tr from-cyan-600 to-purple-600 text-white'
                      : 'bg-zinc-800 text-cyan-400 border border-zinc-700'
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : isAdmin ? (
                    <Headphones className="w-4 h-4" />
                  ) : isSystem ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md rounded-tr-none'
                      : isSystem
                      ? 'bg-amber-950/50 border border-amber-800/70 text-amber-100 rounded-tl-none shadow-lg'
                      : isAdmin
                      ? 'bg-cyan-950/50 border border-cyan-700/70 text-cyan-50 rounded-tl-none shadow-md'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 mb-1.5 font-medium">
                    <span className="flex items-center gap-1">
                      {msg.senderName}
                      {msg.sender === 'BOT' && (
                        <span className="bg-purple-900/50 text-purple-300 text-[9px] px-1.5 py-0.2 rounded border border-purple-700/40 font-mono">
                          Gemini 3.8 Flash
                        </span>
                      )}
                    </span>
                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="whitespace-pre-line font-normal">
                    {msg.content}
                  </div>

                  {/* SPECIAL CARD: Human Support Request Confirmation with direct links */}
                  {msg.isHumanRequestAlert && (
                    <div className="mt-3.5 pt-3 border-t border-amber-800/60 space-y-2.5">
                      <div className="p-2.5 rounded-xl bg-amber-900/30 border border-amber-700/50 text-[11px] text-amber-200 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Alerta despachada correctamente:</strong>
                          <p className="mt-0.5 text-zinc-300">
                            • Correo enviado a: <span className="font-mono text-amber-300 font-semibold">{msg.adminNotifiedEmail || adminEmail}</span>
                          </p>
                          <p className="text-zinc-300">
                            • SMS enviado al celular: <span className="font-mono text-amber-300 font-semibold">{msg.adminNotifiedPhone || adminPhone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold text-zinc-300">
                        O contáctanos directamente con un solo clic:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Hola StreamBox Colombia, solicito atención de un asesor humano para mi cuenta (${currentUser?.name || 'Cliente'}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>

                        {/* SMS Direct Button */}
                        <a
                          href={`sms:${adminPhone}?body=${encodeURIComponent(
                            `Hola StreamBox, solicito soporte humano de inmediato para mi usuario (${currentUser?.name || 'Cliente'}).`
                          )}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition-colors shadow"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>SMS al Móvil</span>
                        </a>

                        {/* Email Direct Button */}
                        <a
                          href={`mailto:${adminEmail}?subject=${encodeURIComponent(
                            'Solicitud de Atención Humana - StreamBox Colombia'
                          )}&body=${encodeURIComponent(
                            `Hola equipo de soporte de StreamBox,\n\nSolicito atención humana para mi usuario: ${
                              currentUser?.name || 'Cliente'
                            } (${currentUser?.email || 'N/A'}).\n\nGracias.`
                          )}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs transition-colors shadow"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Enviar Correo</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isBotTyping && (
            <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] mr-auto items-center animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-cyan-400 border border-zinc-700 flex items-center justify-center text-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-zinc-900/90 border border-purple-800/50 text-zinc-200 text-xs flex items-center gap-2 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                <span className="text-zinc-300 font-medium">StreamBot AI está respondiendo...</span>
                <div className="flex gap-1 ml-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Draft Recovery */}
        <div className="border-t border-zinc-800 bg-[#161622]">
          {hasRestoredDraft && inputMessage && (
            <div className="px-4 py-1.5 bg-purple-950/40 border-b border-purple-800/40 text-[11px] text-purple-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Borrador recuperado automáticamente de tu sesión anterior</span>
              </span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-purple-400 hover:text-white underline text-[10px] cursor-pointer"
              >
                Descartar
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="p-4 flex gap-2">
            <input
              type="text"
              placeholder="Pregúntale al bot sobre pedidos, pagos Nequi/Daviplata o pide un asesor humano..."
              value={inputMessage}
              onChange={handleInputChange}
              disabled={isBotTyping}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isBotTyping || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>

        {/* Security & Privacy Footnote */}
        <div className="px-4 py-2 bg-[#0E0E16] border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            🔒 Canal protegido por Google AI Studio. Notificaciones automáticas a {adminEmail} y {adminPhone}.
          </span>
          <span className="font-mono text-zinc-600">Gemini 3.8 Flash • Ley 1581</span>
        </div>
      </div>

      {/* Modal: Detalles del Historial de Sesión en Vivo (localStorage) */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#14141F] border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Historial de Sesión en Vivo
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Almacenamiento persistente en navegador (localStorage)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/6 space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Mensajes guardados:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {sessionMessages.length} mensajes
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Última sincronización:</span>
                  <span className="font-mono text-cyan-300">
                    {new Date(lastSavedTimestamp).toLocaleTimeString('es-CO')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Persistencia entre secciones:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] text-zinc-300 leading-relaxed">
                ℹ️ <strong>Navegación fluida:</strong> Puedes cambiar de pestaña hacia <em>Catálogo</em>, <em>Inicio</em> o <em>Mi Cuenta</em> y al regresar tus mensajes seguirán intactos. Si dejaste un borrador escrito a medias, también será restaurado.
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleDownloadTranscript}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar copia de tu conversación en formato texto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar (.TXT)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reiniciar Chat en Vivo */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#14141F] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Background ambient amber halo */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                ¿Reiniciar Chat en Vivo?
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Esta acción limpiará los mensajes de tu conversación actual y reiniciará la sesión con <strong>StreamBot AI</strong> desde cero.
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/6 text-[11px] text-zinc-400 space-y-1 mt-2">
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tus datos permanecen seguros</span>
                </div>
                <p>Tus pedidos confirmados, pagos y accesos a streaming no se verán afectados y continúan en tu portal.</p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sí, Reiniciar Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
