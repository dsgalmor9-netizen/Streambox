import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  User,
  Phone,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';
import { PasswordStrengthMeter, evaluatePasswordStrength } from './PasswordStrengthMeter';
import {
  validateColombianPhone,
  formatColombianPhoneLive,
  validateStrictEmail,
} from '../../lib/validationRules';

interface RegisterViewProps {
  onNavigate: (view: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { register, loginWithGoogle } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Google Account Chooser Modal (authentic 1-click Google Sign-In)
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

  // Real-time validations
  const isPasswordsMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const strengthResult = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!name.trim()) {
        setError('Por favor ingresa tu nombre completo.');
        setIsLoading(false);
        return;
      }

      // Strict Email Validation
      const emailValidation = validateStrictEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.errorMessage || 'Ingresa un correo electrónico válido.');
        setIsLoading(false);
        return;
      }

      // Strict Colombian Phone validation if provided
      if (phone.trim()) {
        const phoneValidation = validateColombianPhone(phone);
        if (!phoneValidation.isValid) {
          setError(phoneValidation.errorMessage || 'Ingresa un número móvil válido de Colombia (10 dígitos que empiece por 3).');
          setIsLoading(false);
          return;
        }
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden. Por favor verifícalas.');
        setIsLoading(false);
        return;
      }

      if (!agreeTerms) {
        setError('Debes aceptar los Términos de Servicio y la Política de Privacidad.');
        setIsLoading(false);
        return;
      }

      const cleanPhone = phone.trim() ? validateColombianPhone(phone).cleanDigits : '';
      const ok = register(name.trim(), emailValidation.cleanEmail, cleanPhone, password);
      if (ok) {
        try {
          if (rememberMe) {
            localStorage.setItem('streambox_remembered_email', email.trim());
            localStorage.setItem('streambox_remember_me', 'true');
          }
        } catch {
          // Ignore
        }

        setSuccess('¡Cuenta creada exitosamente! Bienvenido a StreamBox Colombia 🇨🇴.');
        setTimeout(() => {
          const normalized = email.trim().toLowerCase();
          if (normalized === 'd.s.gal.mor.9@gmail.com') {
            onNavigate('admin');
          } else {
            onNavigate('inicio');
          }
        }, 350);
      } else {
        setError('No fue posible completar el registro. Verifica los datos.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error durante el registro.');
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
        if (res.role === 'SUPER_ADMIN') {
          onNavigate('admin');
        } else {
          onNavigate('inicio');
        }
      } else {
        setError(res.error || 'Error al iniciar sesión con Google.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con Google.');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#0A0A12] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Curves & Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Central Glassmorphism V3 Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[460px] relative z-10 backdrop-blur-2xl bg-[#0E101A]/75 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,102,255,0.25)] overflow-hidden"
      >
        {/* Specular hairline top glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

        {/* Brand Lockup */}
        <div className="text-center pb-5 relative">
          <div className="inline-flex justify-center mb-3 transition-transform hover:scale-105 duration-300">
            <StreamBoxLogo size="lg" showSlogan={false} />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Crear Cuenta</span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </h2>

          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Regístrate para comprar suscripciones y cuentas premium con precios mayoristas en Colombia.
          </p>
        </div>

        {/* Google 1-Click Button */}
        <div className="mb-5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setIsGoogleChooserOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-black/40 hover:bg-white/[0.06] text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 hover:border-cyan-400/50 shadow-sm group active:scale-[0.99]"
          >
            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-200" viewBox="0 0 24 24">
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
            <span>Registrarse con Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#0E101A] px-3 text-zinc-500 font-semibold tracking-wider">
                O completa el formulario
              </span>
            </div>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nombre Completo
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Tu nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors pointer-events-none" />
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Teléfono / WhatsApp (Opcional)
            </label>
            <div className="relative group">
              <Phone className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors pointer-events-none" />
              <input
                type="tel"
                placeholder="300 123 4567"
                value={phone}
                onChange={(e) => setPhone(formatColombianPhoneLive(e.target.value))}
                maxLength={14}
                className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Password Field with PasswordStrengthMeter */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative group">
              <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-12 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>

            {/* PASSWORD STRENGTH METER (Weak, Fair, Strong color-coded bars) */}
            <PasswordStrengthMeter password={password} showTips={true} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Confirmar Contraseña
            </label>
            <div className="relative group">
              <KeyRound className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-black/45 border rounded-xl pl-10 pr-12 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner ${
                  isPasswordMismatch
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : isPasswordsMatching
                    ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-white/10 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
                title={showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'}
                aria-pressed={showConfirmPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
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

          {/* Terms and Conditions Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-zinc-400 hover:text-zinc-300">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500 shrink-0"
              />
              <span className="leading-tight text-[11px]">
                Acepto los{' '}
                <span className="text-cyan-400 underline font-medium">Términos del Servicio</span>{' '}
                y la{' '}
                <span className="text-cyan-400 underline font-medium">Política de Tratamiento de Datos (Ley 1581)</span>.
              </span>
            </label>
          </div>

          {/* Feedback messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{success}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !agreeTerms || isPasswordMismatch}
            className="w-full py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-2 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Creando cuenta segura...</span>
              </>
            ) : (
              <>
                <span>COMPLETAR REGISTRO</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Link back to Login */}
        <div className="mt-6 text-center text-xs text-zinc-400 border-t border-white/10 pt-4">
          <p>
            ¿Ya tienes una cuenta registrada?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline-offset-2 hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

        {/* Security / Privacy Assurance */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Cifrado TLS 256-bit
          </span>
          <span>StreamBox Colombia · 2026</span>
        </div>
      </motion.div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
};
