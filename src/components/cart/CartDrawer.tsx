import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useToast } from '../common/Toast';
import { WhatsAppDirectModal } from '../checkout/WhatsAppDirectModal';
import { WhatsAppOrderDetails } from '../../lib/whatsappCheckout';

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
    currentUser,
  } = useStore();

  const { currency, billingPeriod, formatAmount } = useCurrency();
  const { success: toastSuccess, error: toastError } = useToast();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  if (!isOpen) return null;

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

  const whatsappPayload: WhatsAppOrderDetails = {
    customerName: currentUser?.name,
    customerEmail: currentUser?.email,
    customerPhone: currentUser?.phone,
    items: cart.map((i) => ({
      productName: i.productName,
      brand: i.brand,
      modalityName: i.modalityName,
      duration: i.duration,
      priceText: `${formatAmount(i.priceCOP)} c/u`,
      quantity: i.quantity,
    })),
    subtotalText: formatAmount(cartSubtotalCOP),
    discountText: cartDiscountCOP > 0 ? formatAmount(cartDiscountCOP) : undefined,
    totalText: formatAmount(cartTotalCOP),
    currency,
    billingPeriod,
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#0d0d14] border-l border-white/10 flex flex-col shadow-2xl">
            
            {/* Header */}
            <div className="p-6 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Carrito de Compras</h2>
                  <span className="text-xs text-neutral-400 font-mono">({cart.length} productos en {currency})</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-neutral-500 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Tu carrito está vacío</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mb-6">
                    Explora nuestros servicios de streaming y añade tus suscripciones favoritas para comenzar.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.modalityId}`}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/8 flex gap-3 relative group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {item.productName}
                            </h4>
                            <div 
                              className="shrink-0 p-0.5 rounded bg-black/60 border border-white/10 flex items-center justify-center"
                              title="Logo oficial"
                            >
                              <BrandLogo
                                brand={item.productName}
                                size="xs"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                            <span>{item.modalityName}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-400">{item.duration}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId, item.modalityId)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors p-1 cursor-pointer active:scale-95"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-black/60 border border-white/8 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.modalityId, item.quantity - 1)}
                            className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.modalityId, item.quantity + 1)}
                            className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-white">
                            {formatAmount(item.priceCOP * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-neutral-500 font-mono">
                              {formatAmount(item.priceCOP)} c/u
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
              <div className="p-6 border-t border-white/8 bg-black/40 space-y-4">
                
                {/* Promo Code Input */}
                <div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-semibold text-white">{appliedPromo.code}</span>
                          <span className="text-neutral-400 ml-1">
                            ({appliedPromo.type === 'PERCENTAGE' ? `${appliedPromo.value}% OFF` : `-${formatAmount(appliedPromo.value)}`})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
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
                        className="flex-1 bg-black/60 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 uppercase"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95"
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
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-neutral-200">
                      {formatAmount(cartSubtotalCOP)}
                    </span>
                  </div>

                  {cartDiscountCOP > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Descuento aplicado</span>
                      <span className="font-mono">
                        -{formatAmount(cartDiscountCOP)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/8">
                    <span>Total a Pagar</span>
                    <span className="font-mono text-emerald-400 text-base">
                      {formatAmount(cartTotalCOP)}
                    </span>
                  </div>
                </div>

                {/* Checkout Actions */}
                <div className="space-y-2 pt-1">
                  {/* WhatsApp Direct Order */}
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-black bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,211,102,0.25)]"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>FINALIZAR POR WHATSAPP</span>
                  </button>

                  {/* Standard Checkout */}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceedToCheckout();
                    }}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.98]"
                  >
                    <span>PAGAR CON NEQUI / DAVIPLATA / BINANCE</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppDirectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        orderDetails={whatsappPayload}
      />
    </>
  );
};
