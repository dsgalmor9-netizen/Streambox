import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
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
    settings,
  } = useStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current user
  const currentUserId = currentUser ? currentUser.id : 'usr-client-demo';
  const relevantMessages = chatMessages.filter(
    (m) => m.userId === currentUserId || m.userId === 'ALL'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [relevantMessages, isBotTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    sendChatMessage(inputMessage.trim());
    setInputMessage('');
  };

  const adminEmail = settings.supportEmail || 'd.s.gal.mor.9@gmail.com';
  const adminPhone = settings.supportPhone || '+57 304 596 7068';
  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="rounded-2xl bg-[#12121B] border border-zinc-800 shadow-2xl flex flex-col h-[780px] overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#161622] flex items-center justify-between">
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

          <div className="text-right text-xs text-zinc-400 hidden sm:block">
            <span className="block font-medium text-emerald-400 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" /> Canal Verificado
            </span>
            <span className="text-[11px] text-zinc-500">Soporte StreamBox Colombia</span>
          </div>
        </div>

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
          {relevantMessages.map((msg) => {
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

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-[#161622] flex gap-2">
          <input
            type="text"
            placeholder="Pregúntale al bot sobre pedidos, pagos Nequi/Daviplata o pide un asesor humano..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
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

        {/* Security & Privacy Footnote */}
        <div className="px-4 py-2 bg-[#0E0E16] border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            🔒 Canal protegido por Google AI Studio. Notificaciones automáticas a {adminEmail} y {adminPhone}.
          </span>
          <span className="font-mono text-zinc-600">Gemini 3.8 Flash • Ley 1581</span>
        </div>
      </div>
    </div>
  );
};
