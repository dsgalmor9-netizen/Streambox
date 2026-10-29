import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials, register, loginWithGoogle, sendPasswordReset } = useStore();
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPasswordsMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        if (!email.trim() || !password.trim()) {
          setError('Por favor ingresa tu correo electrónico y tu contraseña.');
          setIsLoading(false);
          return;
        }

        const res = await loginWithCredentials(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Credenciales incorrectas. Verifica tus datos.');
        }
      } else if (mode === 'REGISTER') {
        if (!name.trim() || !email.trim()) {
          setError('Por favor ingresa tu nombre completo y correo.');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          setIsLoading(false);
          return;
        }

        if (!agreeTerms) {
          setError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
          setIsLoading(false);
          return;
        }

        const ok = register(name, email, phone, password);
        if (ok) {
          setSuccess('¡Cuenta creada exitosamente! Bienvenido a StreamBox.');
          setTimeout(() => onClose(), 400);
        } else {
          setError('No fue posible completar el registro. Verifica los datos.');
        }
      } else if (mode === 'RECOVERY') {
        if (!email.trim() || !email.includes('@')) {
          setError('Por favor ingresa un correo electrónico válido.');
          setIsLoading(false);
          return;
        }

        const res = await sendPasswordReset(email);
        setSuccess(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Error durante la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (selectedEmail: string, selectedName: string) => {
    setError(null);
    try {
      const res = await loginWithGoogle(selectedEmail, selectedName);
      if (res.success) {
        setIsGoogleChooserOpen(false);
        onClose();
      } else {
        setError(res.error || 'Error al iniciar sesión con Google.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-md backdrop-blur-2xl bg-[#0E101A]/85 border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,102,255,0.3)] p-6 sm:p-8 z-10 overflow-hidden"
      >
        {/* Specular hairline top glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

        {/* Ambient Corner Reflection */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <StreamBoxLogo size="sm" showSlogan={false} />
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 mb-5 text-center">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>
              {mode === 'LOGIN' && 'Bienvenido a StreamBox'}
              {mode === 'REGISTER' && 'Crea tu Cuenta'}
              {mode === 'RECOVERY' && 'Recuperar Contraseña'}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'LOGIN' && 'Ingresa para consultar tus pedidos y servicios'}
            {mode === 'REGISTER' && 'Accede a precios mayoristas y entrega inmediata'}
            {mode === 'RECOVERY' && 'Te ayudamos a recuperar el acceso a tu cuenta'}
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        {mode !== 'RECOVERY' && (
          <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/10 rounded-xl mb-4 relative">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
                setSuccess(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'LOGIN' ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
                setSuccess(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'REGISTER' ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Google 1-Click Button */}
        {mode !== 'RECOVERY' && (
          <div className="mb-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsGoogleChooserOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-black/40 hover:bg-white/[0.06] text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:border-cyan-400/50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{mode === 'LOGIN' ? 'Continuar con Google' : 'Registrarse con Google'}</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0E101A] px-2 text-zinc-500 font-semibold">
                  O con tus datos
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nombre Completo
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3 top-3 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre y apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3 top-3 transition-colors" />
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Teléfono / WhatsApp (Opcional)
              </label>
              <div className="relative group">
                <Phone className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3 top-3 transition-colors" />
                <input
                  type="tel"
                  placeholder="300 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                />
              </div>
            </div>
          )}

          {mode !== 'RECOVERY' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  Contraseña
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPasswordRecoveryOpen(true);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3 top-3 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl pl-9 pr-11 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>

              {mode === 'REGISTER' && (
                <PasswordStrengthMeter password={password} />
              )}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative group">
                <KeyRound className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3 top-3 transition-colors pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-black/45 border rounded-xl pl-9 pr-11 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all ${
                    isPasswordMismatch
                      ? 'border-rose-500/80 focus:border-rose-500'
                      : isPasswordsMatching
                      ? 'border-emerald-500/80 focus:border-emerald-500'
                      : 'border-white/10 focus:border-cyan-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
                  title={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
                  aria-pressed={showConfirmPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                  {isPasswordsMatching ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Las contraseñas coinciden
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Las contraseñas aún no coinciden
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-zinc-400 hover:text-zinc-300">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500 shrink-0"
                />
                <span className="leading-tight text-[10px]">
                  Acepto los Términos del Servicio y la Política de Tratamiento de Datos (Ley 1581).
                </span>
              </label>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (mode === 'REGISTER' && (!agreeTerms || isPasswordMismatch))}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Procesando...</span>
              </>
            ) : mode === 'LOGIN' ? (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'REGISTER' ? (
              <>
                <span>Crear Cuenta</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Enviar Instrucciones</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-zinc-400 border-t border-white/10 pt-3">
          {mode === 'RECOVERY' ? (
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
                setSuccess(null);
              }}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              ← Volver al inicio de sesión
            </button>
          ) : mode === 'LOGIN' ? (
            <p>
              ¿No tienes cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                Inicia sesión
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* Google Account Chooser */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />

      {/* Password Recovery Modal */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryOpen}
        onClose={() => setIsPasswordRecoveryOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};
