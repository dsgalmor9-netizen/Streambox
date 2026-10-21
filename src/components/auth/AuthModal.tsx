import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StreamBoxLogo } from '../common/StreamBoxLogo';
import { X, Lock, Mail, User, Phone, CheckCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useStore();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'LOGIN') {
      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico.');
        return;
      }
      const ok = login(email);
      if (ok) {
        onClose();
      } else {
        setError('No encontramos una cuenta con ese correo. Puedes registrarte en 10 segundos.');
      }
    } else if (mode === 'REGISTER') {
      if (!name.trim() || !email.trim()) {
        setError('Por favor completa tu nombre y correo electrónico.');
        return;
      }
      const ok = register(name, email, phone);
      if (ok) {
        onClose();
      } else {
        setError('Ya existe un usuario registrado con este correo electrónico.');
      }
    } else if (mode === 'RECOVERY') {
      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico.');
        return;
      }
      setSuccess('Si la cuenta existe, hemos enviado un enlace de restablecimiento a tu correo.');
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    login(quickEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#12121B] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <StreamBoxLogo size="sm" showSlogan={false} />
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 mb-6 text-center">
          <h3 className="text-xl font-bold text-white">
            {mode === 'LOGIN' && 'Bienvenido a StreamBox'}
            {mode === 'REGISTER' && 'Crea tu Cuenta'}
            {mode === 'RECOVERY' && 'Recuperar Contraseña'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'LOGIN' && 'Ingresa para consultar tus pedidos y comprar servicios'}
            {mode === 'REGISTER' && 'Accede a precios mayoristas y entrega inmediata'}
            {mode === 'RECOVERY' && 'Te ayudamos a recuperar el acceso a tu cuenta'}
          </p>
        </div>


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
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded p-0.5 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-purple-400" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all cursor-pointer mt-2"
          >
            {mode === 'LOGIN' && 'Iniciar Sesión'}
            {mode === 'REGISTER' && 'Completar Registro'}
            {mode === 'RECOVERY' && 'Enviar Instrucciones'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          {mode === 'LOGIN' ? (
            <p>
              ¿No tienes cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setError(null);
                }}
                className="text-cyan-400 font-semibold hover:underline"
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
                className="text-purple-400 font-semibold hover:underline"
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
