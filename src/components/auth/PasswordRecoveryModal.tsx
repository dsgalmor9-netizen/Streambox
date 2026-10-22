import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../common/Toast';
import { StreamBoxLogo } from '../common/StreamBoxLogo';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
}) => {
  const { sendPasswordReset } = useStore();
  const toast = useToast();

  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initialEmail if modal opens with pre-filled email from login view
  React.useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setIsLoading(false);
      setIsSent(false);
      setError(null);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      toast.error('Por favor escribe una dirección de correo válida.', 'Correo Inválido');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await sendPasswordReset(cleanEmail);

      if (res.success) {
        setIsSent(true);
        toast.success(
          `Hemos enviado las instrucciones a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
          'Enlace de Recuperación Enviado'
        );
      } else {
        setError(res.message);
        toast.error(res.message, 'No se pudo enviar el enlace');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Error de conexión con el servicio de autenticación.';
      setError(errMsg);
      toast.error(errMsg, 'Error de Recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-[440px] backdrop-blur-2xl bg-[#0E101A]/90 border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,102,255,0.35)] p-6 sm:p-8 z-10 overflow-hidden text-left font-sans"
      >
        {/* Specular hairline top glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent pointer-events-none" />

        {/* Ambient Corner Reflection */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar: Brand + Close button */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <StreamBoxLogo size="sm" showSlogan={false} />
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Icon + Titles */}
        <div className="mt-4 mb-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Recuperar Contraseña</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </h3>

          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-sm mx-auto">
            Ingresa el correo electrónico asociado a tu cuenta de StreamBox. Te enviaremos un enlace oficial de Firebase para restablecer tu contraseña.
          </p>
        </div>

        {/* Success Confirmation View */}
        {isSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 py-2 text-center"
          >
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex flex-col items-center gap-2.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="font-bold text-sm text-white mb-1">¡Correo enviado con éxito!</p>
                <p className="text-zinc-300 leading-relaxed">
                  Hemos enviado las instrucciones a{' '}
                  <strong className="text-cyan-300 font-mono">{email}</strong>. Por favor revisa tu bandeja de entrada o carpeta de spam.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md transition-all cursor-pointer"
            >
              Entendido, volver a Iniciar Sesión
            </button>
          </motion.div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Correo Electrónico Registrado
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
                />
              </div>
            </div>

            {/* In-modal Error Feedback */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Enviando enlace seguro...</span>
                  </>
                ) : (
                  <>
                    <span>ENVIAR ENLACE DE RECUPERACIÓN</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Cancelar y regresar
              </button>
            </div>
          </form>
        )}

        {/* Security badge footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Protegido con Firebase Authentication
          </span>
          <span>StreamBox Colombia</span>
        </div>
      </motion.div>
    </div>
  );
};
