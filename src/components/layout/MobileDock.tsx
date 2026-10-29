import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useSearch } from '../../context/SearchContext';
import { Home, Grid, ShoppingBag, MessageSquare, User, Search } from 'lucide-react';

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
  const { openSearchModal } = useSearch();
  const totalCartItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  // If currently in checkout or payment reporting, do not obscure bottom purchase buttons
  if (currentView === 'checkout' || currentView === 'reporte-pago') {
    return null;
  }

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'catalogo', label: 'Catálogo', icon: Grid },
    { id: 'search', label: 'Buscar', icon: Search, isSearch: true },
    { id: 'cart', label: 'Carrito', icon: ShoppingBag, isCart: true },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'cuenta', label: 'Cuenta', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-white/8 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isSearch) {
                  openSearchModal();
                } else if (item.isCart) {
                  onOpenCart();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg relative transition-all active:scale-95 cursor-pointer ${
                isActive ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`} />
                
                {item.isCart && totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-bold flex items-center justify-center font-mono">
                    {totalCartItems}
                  </span>
                )}

                {item.id === 'cuenta' && unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
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
