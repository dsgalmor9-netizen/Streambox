import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, ArrowRight, Loader2, Check } from 'lucide-react';

export interface SavedGoogleAccount {
  email: string;
  name: string;
  avatarColor?: string;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => Promise<void> | void;
}

const DEFAULT_ACCOUNTS: SavedGoogleAccount[] = [
  {
    email: 'd.s.gal.mor.9@gmail.com',
    name: 'Daniel Galindo',
    avatarColor: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
  },
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [accounts, setAccounts] = useState<SavedGoogleAccount[]>(() => {
    try {
      const saved = localStorage.getItem('streambox_google_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure default admin account is present
        if (!parsed.some((a: SavedGoogleAccount) => a.email.toLowerCase() === 'd.s.gal.mor.9@gmail.com')) {
          return [...DEFAULT_ACCOUNTS, ...parsed];
        }
        return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_ACCOUNTS;
  });

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeAccountName, setActiveAccountName] = useState('');

  // Mode: 'LIST' or 'ADD_NEW'
  const [viewMode, setViewMode] = useState<'LIST' | 'ADD_NEW'>('LIST');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setViewMode('LIST');
      setSelectedEmail(null);
      setIsSigningIn(false);
      setError(null);
      setNewEmail('');
      setNewName('');
    }
  }, [isOpen]);

  const handleChooseAccount = async (account: SavedGoogleAccount) => {
    setSelectedEmail(account.email);
    setActiveAccountName(account.name);
    setIsSigningIn(true);
    setError(null);

    // Save/update accounts list order in localStorage
    try {
      const updated = [
        account,
        ...accounts.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase()),
      ];
      setAccounts(updated);
      localStorage.setItem('streambox_google_accounts', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    try {
      // Automatic sign-in with 1 click
      await onSelectAccount(account.email, account.name);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión con Google.');
      setIsSigningIn(false);
      setSelectedEmail(null);
    }
  };

  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Por favor escribe un correo electrónico de Google válido.');
      return;
    }

    const cleanName = newName.trim() || cleanEmail.split('@')[0];
    const newAcc: SavedGoogleAccount = {
      email: cleanEmail,
      name: cleanName,
      avatarColor: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
    };

    // Update list
    const updated = [
      newAcc,
      ...accounts.filter((a) => a.email.toLowerCase() !== cleanEmail),
    ];
    setAccounts(updated);
    try {
      localStorage.setItem('streambox_google_accounts', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    // Immediately trigger 1-click login
    await handleChooseAccount(newAcc);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={isSigningIn ? undefined : onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-[420px] backdrop-blur-2xl bg-[#0E101A]/90 border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,102,255,0.35)] z-10 overflow-hidden text-left font-sans"
      >
        {/* Specular top hairline */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none" />
        {/* Top Google progress bar when signing in */}
        {isSigningIn && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-amber-500 animate-[pulse_1s_infinite] w-full" />
          </div>
        )}

        {/* Close Button */}
        {!isSigningIn && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5 mb-3">
            {/* Authentic Google multicolor SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-xs font-semibold tracking-wide text-zinc-300">
              Acceder con Google
            </span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {viewMode === 'LIST' ? 'Elige una cuenta' : 'Acceder con otra cuenta'}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            para continuar a <strong className="text-white font-semibold">StreamBox Colombia</strong>
          </p>
        </div>

        {/* Signing In Loading Overlay */}
        <AnimatePresence>
          {isSigningIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center space-y-3"
            >
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-white">
                Iniciando sesión con Google...
              </p>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-xs mx-auto">
                {selectedEmail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIST MODE: Instant 1-click accounts */}
        {!isSigningIn && viewMode === 'LIST' && (
          <div className="p-3 divide-y divide-zinc-800/60 max-h-[380px] overflow-y-auto">
            {accounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleChooseAccount(acc)}
                className="w-full p-3 rounded-xl hover:bg-zinc-800/80 active:bg-zinc-800 flex items-center justify-between gap-3 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md ${
                      acc.avatarColor || 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                    }`}
                  >
                    {acc.name ? acc.name.charAt(0).toUpperCase() : acc.email.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate font-mono">
                      {acc.email}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
              </button>
            ))}

            {/* Option: Usar otra cuenta */}
            <button
              type="button"
              onClick={() => {
                setViewMode('ADD_NEW');
                setError(null);
              }}
              className="w-full p-3 rounded-xl hover:bg-zinc-800/80 active:bg-zinc-800 flex items-center gap-3.5 transition-colors text-left cursor-pointer group mt-1"
            >
              <div className="w-10 h-10 rounded-full border border-dashed border-zinc-600 group-hover:border-zinc-400 flex items-center justify-center text-zinc-400 group-hover:text-white shrink-0 transition-colors">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  Usar otra cuenta de Google
                </p>
                <p className="text-[11px] text-zinc-500">
                  Ingresa con cualquier otra cuenta personal
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ADD NEW ACCOUNT MODE: Simple and direct */}
        {!isSigningIn && viewMode === 'ADD_NEW' && (
          <form onSubmit={handleAddNewSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Correo electrónico de Google
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="ejemplo@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Nombre (Opcional)
              </label>
              <input
                type="text"
                placeholder="Tu nombre (ej: Pepito Pérez)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
              >
                Volver a la lista
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </form>
        )}

        {/* Google Privacy & Consent Footer */}
        {!isSigningIn && (
          <div className="p-4 bg-[#12121C] border-t border-zinc-800 text-[10px] text-zinc-500 leading-relaxed">
            Para continuar, Google compartirá tu nombre y dirección de correo electrónico con StreamBox Colombia.
          </div>
        )}
      </motion.div>
    </div>
  );
};
