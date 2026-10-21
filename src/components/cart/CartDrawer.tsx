import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useToast } from '../common/Toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotalCOP,
    cartDiscountCOP,
    cartTotalCOP,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useStore();

  const { success: toastSuccess, error: toastError } = useToast();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim() || isApplyingPromo) return;

    setIsApplyingPromo(true);
    try {
      const res = await applyPromoCode(promoInput);
      setPromoMessage({ text: res.message, error: !res.success });
      if (res.success) {
        toastSuccess(res.message);
        setPromoInput('');
      } else {
        toastError(res.message);
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#12121B] border-l border-zinc-800 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Carrito de Compras</h2>
              <span className="text-xs text-zinc-400">({cart.length} productos)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Tu carrito está vacío</h3>
                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                  Explora nuestros servicios digitales y añade tus plataformas favoritas para comenzar.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.modalityId}`}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex gap-3 relative group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {item.productName}
                          </h4>
                          <div 
                            className="shrink-0 p-0.5 rounded bg-zinc-950 border border-white/10 flex items-center justify-center"
                            title="Logo oficial de la página original"
                          >
                            <BrandLogo
                              brand={item.productName}
                              size="xs"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span>{item.modalityName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-cyan-400">{item.duration}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId, item.modalityId)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.modalityId, item.quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold font-mono text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.modalityId, item.quantity + 1)}
                          className="p-1 text-zinc-400 hover:text-white rounded transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price in COP */}
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white">
                          ${(item.priceCOP * item.quantity).toLocaleString('es-CO')} COP
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-zinc-500 font-mono">
                            ${item.priceCOP.toLocaleString('es-CO')} COP c/u
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-[#0E0E16] space-y-4">
              
              {/* Promo Code Input */}
              <div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="font-semibold text-white">{appliedPromo.code}</span>
                        <span className="text-zinc-400 ml-1">
                          ({appliedPromo.type === 'PERCENTAGE' ? `${appliedPromo.value}% OFF` : `-$${appliedPromo.value.toLocaleString('es-CO')} COP`})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Cupón de descuento..."
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {promoMessage && (
                  <p className={`text-[11px] mt-1 ${promoMessage.error ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">
                    ${cartSubtotalCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>

                {cartDiscountCOP > 0 && (
                  <div className="flex justify-between text-purple-400">
                    <span>Descuento aplicado</span>
                    <span className="font-mono">
                      -${cartDiscountCOP.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total a Pagar</span>
                  <span className="font-mono text-cyan-400 text-base">
                    ${cartTotalCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>PAGAR AHORA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
