import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Grid, ShoppingBag, MessageSquare, User } from 'lucide-react';

interface MobileDockProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCart: () => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  currentView,
  onNavigate,
  onOpenCart,
}) => {
  const { cart, unreadNotificationsCount } = useStore();
  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  // If currently in checkout or payment reporting, do not obscure bottom purchase buttons
  if (currentView === 'checkout' || currentView === 'reporte-pago') {
    return null;
  }

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'catalogo', label: 'Catálogo', icon: Grid },
    { id: 'cart', label: 'Carrito', icon: ShoppingBag, isCart: true },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'cuenta', label: 'Cuenta', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B10]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isCart) {
                  onOpenCart();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-all active:scale-95 ${
                isActive ? 'text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''}`} />
                
                {item.isCart && totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}

                {item.id === 'cuenta' && unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
