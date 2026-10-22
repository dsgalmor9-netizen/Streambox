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
  Sparkles,
  KeyRound,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';
import { PasswordStrengthMeter, evaluatePasswordStrength } from './PasswordStrengthMeter';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';

interface LoginViewProps {
  onNavigate: (view: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { loginWithCredentials, loginWithGoogle, register, sendPasswordReset } = useStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('streambox_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('streambox_remember_me') === 'true';
    } catch {
      return true;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Google Account Chooser Modal (authentic 1-click Google Sign-In)
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

  // Real-time validations
  const isPasswordsMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordScore = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions

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
          try {
            if (rememberMe) {
              localStorage.setItem('streambox_remembered_email', email.trim());
              localStorage.setItem('streambox_remember_me', 'true');
            } else {
              localStorage.removeItem('streambox_remembered_email');
              localStorage.setItem('streambox_remember_me', 'false');
            }
          } catch {
            // Ignore
          }

          if (res.role === 'SUPER_ADMIN') {
            onNavigate('admin');
          } else {
            onNavigate('inicio');
          }
        } else {
          setError(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        }
      } else if (mode === 'REGISTER') {
        if (!name.trim() || !email.trim()) {
          setError('Por favor ingresa tu nombre completo y correo electrónico.');
          setIsLoading(false);
          return;
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
          setError('Debes aceptar los Términos de Servicio y la Política de Privacidad para registrarte.');
          setIsLoading(false);
          return;
        }

        // Register user immediately and securely
        const ok = register(name, email, phone, password);
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
          return;
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

  // Google Sign-In: Opens authentic Google Account Chooser with 1-click login
  const handleGoogleSignInClick = () => {
    setError(null);
    setIsGoogleChooserOpen(true);
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
      {/* =========================================================================
          FUTURISTIC BACKGROUND: LUMINOUS CYAN & ELECTRIC BLUE GLOW CURVES
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Ambient radial glows */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />

        {/* Dynamic Curved Vector Lines (Glassmorphism V3 Cyber Waves) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60 transition-opacity duration-1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
        >
          <defs>
            <linearGradient id="cyberGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="cyberGradBlue" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing Top-Right to Bottom-Left Curve */}
          <path
            d="M -100,200 C 350,120 700,550 1540,250"
            fill="none"
            stroke="url(#cyberGradCyan)"
            strokeWidth="2.5"
            filter="url(#glowFilter)"
            className="animate-pulse"
          />

          {/* Luminous Secondary Sweep Curve */}
          <path
            d="M -50,650 C 450,450 900,850 1500,450"
            fill="none"
            stroke="url(#cyberGradBlue)"
            strokeWidth="2"
            filter="url(#glowFilter)"
          />

          {/* Subtle Cyber Grid Accent */}
          <g stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1">
            <line x1="0" y1="225" x2="1440" y2="225" />
            <line x1="0" y1="450" x2="1440" y2="450" />
            <line x1="0" y1="675" x2="1440" y2="675" />
            <line x1="360" y1="0" x2="360" y2="900" />
            <line x1="720" y1="0" x2="720" y2="900" />
            <line x1="1080" y1="0" x2="1080" y2="900" />
          </g>
        </svg>
      </div>

      {/* =========================================================================
          CENTRAL GLASSMORPHISM V3 PANEL
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[460px] relative z-10 backdrop-blur-2xl bg-[#0E101A]/75 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,102,255,0.25)] overflow-hidden"
      >
        {/* Specular hairline top glow highlight */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />

        {/* Ambient Corner Reflection */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header / Brand Lockup */}
        <div className="text-center pb-5 relative">
          <div className="inline-flex justify-center mb-3 transition-transform hover:scale-105 duration-300">
            <StreamBoxLogo size="lg" showSlogan={false} />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>
              {mode === 'LOGIN' && 'Iniciar Sesión'}
              {mode === 'REGISTER' && 'Crear Cuenta'}
              {mode === 'RECOVERY' && 'Recuperar Contraseña'}
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </h2>

          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {mode === 'LOGIN' && 'Accede a tus suscripciones digitales con entrega inmediata y garantía.'}
            {mode === 'REGISTER' && 'Regístrate para comprar cuentas con precios mayoristas en Colombia.'}
            {mode === 'RECOVERY' && 'Ingresa tu correo para recibir instrucciones seguras de restablecimiento.'}
          </p>
        </div>

        {/* Segmented Mode Switcher (Tab pills) */}
        {mode !== 'RECOVERY' && (
          <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/10 rounded-2xl mb-6 relative">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
                setSuccess(null);
              }}
              className={`relative py-2 text-xs font-bold rounded-xl transition-all cursor-pointer z-10 flex items-center justify-center gap-1.5 ${
                mode === 'LOGIN' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode === 'LOGIN' && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-cyan-600/90 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Ingresar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
                setSuccess(null);
              }}
              className={`relative py-2 text-xs font-bold rounded-xl transition-all cursor-pointer z-10 flex items-center justify-center gap-1.5 ${
                mode === 'REGISTER' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode === 'REGISTER' && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-cyan-600/90 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Crear Cuenta</span>
            </button>
          </div>
        )}

        {/* Google 1-Click Button */}
        {mode !== 'RECOVERY' && (
          <div className="mb-5">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignInClick}
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
              <span>{mode === 'LOGIN' ? 'Continuar con Google' : 'Registrarse con Google'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0E101A] px-3 text-zinc-500 font-semibold tracking-wider">
                  O con tus datos
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Form Content */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'REGISTER' ? 12 : -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'REGISTER' ? -12 : 12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* REGISTER: Full Name */}
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
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
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* REGISTER: Phone (Optional) */}
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Teléfono / WhatsApp (Opcional)
                </label>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type="tel"
                    placeholder="300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Password Field (for Login and Register) */}
            {mode !== 'RECOVERY' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Contraseña
                  </label>
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess(null);
                        setIsPasswordRecoveryOpen(true);
                      }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>

                <div className="relative group">
                  <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/45 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                {/* Real-time Password Strength Meter in Registration */}
                {mode === 'REGISTER' && (
                  <PasswordStrengthMeter password={password} />
                )}
              </div>
            )}

            {/* REGISTER: Confirm Password */}
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative group">
                  <KeyRound className="w-4 h-4 text-zinc-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-black/45 border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner ${
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
                    aria-pressed={showConfirmPassword}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                {/* Validation message */}
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

            {/* Terms and Conditions Checkbox (Mandatory for Registration) */}
            {mode === 'REGISTER' && (
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
            )}

            {/* LOGIN: Remember Me */}
            {mode === 'LOGIN' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-400 hover:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer accent-cyan-500"
                  />
                  <span>Recordar mi sesión</span>
                </label>
                <span className="text-[10px] text-zinc-500">Dispositivo seguro</span>
              </div>
            )}

            {/* Error Message */}
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

            {/* Success Message */}
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

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (mode === 'REGISTER' && (!agreeTerms || isPasswordMismatch))}
              className="w-full py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] mt-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando...</span>
                </>
              ) : mode === 'LOGIN' ? (
                <>
                  <span>INICIAR SESIÓN</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : mode === 'REGISTER' ? (
                <>
                  <span>COMPLETAR REGISTRO</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <span>ENVIAR ENLACE DE RECUPERACIÓN</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Footer Navigation / Recovery Back Button */}
        <div className="mt-6 text-center text-xs text-zinc-400 border-t border-white/10 pt-4">
          {mode === 'RECOVERY' ? (
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
                setSuccess(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              ← Volver al inicio de sesión
            </button>
          ) : mode === 'LOGIN' ? (
            <p>
              ¿No tienes una cuenta de cliente?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline-offset-2 hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline-offset-2 hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          )}
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

      {/* =========================================================================
          AUTHENTIC GOOGLE ACCOUNT CHOOSER MODAL (1-CLICK SIGN-IN)
         ========================================================================= */}
      <GoogleAccountChooserModal
        isOpen={isGoogleChooserOpen}
        onClose={() => setIsGoogleChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />

      {/* =========================================================================
          DEDICATED PASSWORD RECOVERY MODAL (FIREBASE AUTH + TOAST FEEDBACK)
         ========================================================================= */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryOpen}
        onClose={() => setIsPasswordRecoveryOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};
