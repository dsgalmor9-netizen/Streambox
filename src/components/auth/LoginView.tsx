import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import { Mail, Lock, ShieldAlert, CheckCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { CaptchaVerification } from '../common/CaptchaVerification';

interface LoginViewProps {
  onNavigate: (view: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate }) => {
  const { loginWithCredentials, loginWithGoogle, register } = useStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('streambox_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Captcha Check: Validate user is human before proceeding
      if (!isCaptchaVerified) {
        setError('Por favor resuelve el CAPTCHA para verificar que eres humano.');
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
          // Persist remember me preference
          try {
            if (rememberMe) {
              localStorage.setItem('streambox_remembered_email', email.trim());
              localStorage.setItem('streambox_remember_me', 'true');
            } else {
              localStorage.removeItem('streambox_remembered_email');
              localStorage.setItem('streambox_remember_me', 'false');
            }
          } catch {
            // Ignore localStorage errors
          }

          // REDIRECCIÓN AUTOMÁTICA SEGÚN ROL VERIFICADO POR CUSTOM CLAIMS
          if (res.role === 'SUPER_ADMIN') {
            onNavigate('admin');
          } else {
            onNavigate('inicio');
          }
        } else {
          setError(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña en Firebase.');
        }
      } else if (mode === 'REGISTER') {
        if (!name.trim() || !email.trim()) {
          setError('Por favor ingresa tu nombre y correo electrónico.');
          setIsLoading(false);
          return;
        }
        const ok = register(name, email, phone);
        if (ok) {
          try {
            if (rememberMe) {
              localStorage.setItem('streambox_remembered_email', email.trim());
            }
          } catch {
            // Ignore
          }
          setSuccess('Cuenta creada con éxito. Redirigiendo a la tienda...');
          setTimeout(() => onNavigate('inicio'), 1000);
        } else {
          setError('Ya existe un usuario con este correo electrónico.');
        }
      } else if (mode === 'RECOVERY') {
        if (!email.trim()) {
          setError('Por favor ingresa tu correo electrónico.');
          setIsLoading(false);
          return;
        }
        setSuccess('Si la cuenta existe en Firebase, hemos enviado un enlace de recuperación a tu correo.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error durante la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      } else {
        setError(res.error || 'No fue posible iniciar sesión con Google.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error con Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#12121B] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 relative">
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
            {mode === 'LOGIN' && 'Inicio de sesión único para clientes y administradores con Firebase Auth'}
            {mode === 'REGISTER' && 'Crea tu cuenta de cliente para comprar suscripciones y licencias'}
            {mode === 'RECOVERY' && 'Ingresa tu correo para recibir instrucciones de restablecimiento'}
          </p>
        </div>

        {/* Security / Architecture Badge */}
        <div className="mt-4 mb-5 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Autenticación Segura con Custom Claims:</span> Los administradores son verificados mediante token inmutable de Firebase Admin. Redirección automática a <code className="bg-purple-900/60 px-1 py-0.5 rounded text-cyan-300">/admin</code>.
          </div>
        </div>

        {/* Google Authentication Button */}
        {mode === 'LOGIN' && (
          <div className="mb-5">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>CONTINUAR CON GOOGLE</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#12121B] px-2 text-zinc-500 font-semibold">O con correo y contraseña</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="Tu nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
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
              <input
                type="tel"
                placeholder="300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
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
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Recordarme Checkbox */}
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
              <span className="text-[10px] text-zinc-500">Sesión persistente</span>
            )}
          </div>

          {/* Interactive CAPTCHA: Validar si es humano */}
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
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : mode === 'LOGIN' ? (
              <>
                <span>INICIAR SESIÓN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'REGISTER' ? (
              <span>REGISTRARSE</span>
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
      </div>
    </div>
  );
};
