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
  X,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CaptchaVerification } from '../common/CaptchaVerification';
import { OtpVerificationCard } from './otp/OtpVerificationCard';

interface LoginViewProps {
  onNavigate: (view: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { loginWithCredentials, loginWithGoogle, register } = useStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY' | 'OTP_VERIFY'>('LOGIN');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('streambox_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return localStorage.getItem('streambox_remember_me') === 'true';
    } catch {
      return true;
    }
  });
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fallback Google Modal (prompts for the user's OWN account, with NO accounts list)
  const [isGoogleCustomModalOpen, setIsGoogleCustomModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!isCaptchaVerified) {
        setError('Por favor espera a que la verificación de seguridad automática finalice.');
        setIsLoading(false);
        return;
      }

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
          setError('Por favor ingresa tu nombre y correo electrónico.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setIsLoading(false);
          return;
        }

        // Open OTP Verification (OTP ANIMATION V15) before finishing registration
        setIsLoading(false);
        setMode('OTP_VERIFY');
      } else if (mode === 'RECOVERY') {
        if (!email.trim()) {
          setError('Por favor ingresa tu correo electrónico.');
          setIsLoading(false);
          return;
        }
        setSuccess('Si la cuenta existe, hemos enviado un enlace de recuperación a tu correo.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error durante la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  // Called when OTP verification succeeds
  const handleOtpVerified = () => {
    const ok = register(name, email, phone);
    if (ok) {
      try {
        if (rememberMe) {
          localStorage.setItem('streambox_remembered_email', email.trim());
        }
      } catch {
        // Ignore
      }
      setSuccess('¡Identidad verificada y cuenta creada con éxito! Redirigiendo a la tienda...');
      setTimeout(() => onNavigate('inicio'), 1000);
    } else {
      setError('Ya existe un usuario con este correo electrónico.');
      setMode('REGISTER');
    }
  };

  // Google Sign-In: triggers popup, or opens prompt for personal Google email if popup blocked
  const handleGoogleSignInClick = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        if (res.role === 'SUPER_ADMIN') {
          onNavigate('admin');
        } else {
          onNavigate('inicio');
        }
      } else if (res.error === 'POPUP_FALLBACK') {
        // In preview sandbox, prompt for user's own Google account
        setIsGoogleCustomModalOpen(true);
      } else {
        setError(res.error || 'No fue posible iniciar sesión con Google.');
      }
    } catch {
      setIsGoogleCustomModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) {
      setError('Por favor ingresa tu correo de Google.');
      return;
    }

    setIsLoading(true);
    setIsGoogleCustomModalOpen(false);

    try {
      const res = await loginWithGoogle(customGoogleEmail, customGoogleName);
      if (res.success) {
        if (res.role === 'SUPER_ADMIN') {
          onNavigate('admin');
        } else {
          onNavigate('inicio');
        }
      } else {
        setError(res.error || 'Error al autenticar con Google.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Render OTP Verification Card (OTP ANIMATION V15) if user is verifying */}
      {mode === 'OTP_VERIFY' ? (
        <div className="w-full z-10">
          <OtpVerificationCard
            email={email}
            targetCode="8045"
            onVerified={handleOtpVerified}
            onCancel={() => setMode('REGISTER')}
            theme="streambox"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#12121B] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 relative"
        >
          <div className="text-center pb-6 border-b border-zinc-800/80">
            <div className="inline-flex justify-center mb-3">
              <StreamBoxLogo size="lg" showSlogan={false} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'LOGIN' && 'Acceso a StreamBox'}
              {mode === 'REGISTER' && 'Crear Nueva Cuenta'}
              {mode === 'RECOVERY' && 'Recuperar Contraseña'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5">
              {mode === 'LOGIN' && 'Ingresa con tu correo personal para acceder a tus pedidos y catálogo'}
              {mode === 'REGISTER' && 'Regístrate con tu correo para comprar suscripciones y licencias'}
              {mode === 'RECOVERY' && 'Ingresa tu correo para recibir instrucciones de restablecimiento'}
            </p>
          </div>

          {/* Security / Architecture Badge */}
          <div className="mt-4 mb-5 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Acceso Individual Seguro:</span> Cada usuario ingresa con su propia cuenta personal de cliente.
            </div>
          </div>

          {/* Google Sign-in Button */}
          {mode !== 'RECOVERY' && (
            <div className="mb-5">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignInClick}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50 shadow-sm hover:border-zinc-500"
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
                <span>{mode === 'LOGIN' ? 'CONTINUAR CON GOOGLE' : 'REGISTRARSE CON GOOGLE'}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#12121B] px-2 text-zinc-500 font-semibold">
                    O con tu correo y contraseña
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre y apellido"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Teléfono Celular (Colombia)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {mode !== 'RECOVERY' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Contraseña
                  </label>
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => setMode('RECOVERY')}
                      className="text-[11px] text-purple-400 hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500/30 cursor-pointer accent-purple-600"
                />
                <span>Recordarme en este dispositivo</span>
              </label>
              {mode === 'LOGIN' && (
                <span className="text-[10px] text-zinc-500">Sesión activa</span>
              )}
            </div>

            {/* Cloudflare Turnstile Automatic Verification */}
            <div className="pt-1 pb-1">
              <CaptchaVerification
                isVerified={isCaptchaVerified}
                onVerify={(valid) => {
                  setIsCaptchaVerified(valid);
                  if (valid) setError(null);
                }}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2 active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : mode === 'LOGIN' ? (
                <>
                  <span>INICIAR SESIÓN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'REGISTER' ? (
                <>
                  <span>CONTINUAR CON EL REGISTRO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>ENVIAR ENLACE</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-zinc-400 border-t border-zinc-800/80 pt-4">
            {mode === 'LOGIN' ? (
              <p>
                ¿No tienes una cuenta de cliente?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('REGISTER');
                    setError(null);
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
                  }}
                  className="text-purple-400 font-semibold hover:underline cursor-pointer"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Google Prompt Modal for Custom Personal Account (NO accounts list) */}
      {isGoogleCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsGoogleCustomModalOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-[#161622] border border-zinc-700/80 rounded-2xl shadow-2xl p-6 z-10 overflow-hidden text-left"
          >
            <button
              onClick={() => setIsGoogleCustomModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-white shadow-md mx-auto mb-2 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </div>
              <h3 className="text-base font-bold text-white">Acceso con Google</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Ingresa con tu correo personal de Google:
              </p>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tu Nombre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pepito Pérez"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tu Correo Google
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold transition-all cursor-pointer shadow-md mt-2"
              >
                INGRESAR CON ESTE CORREO
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
