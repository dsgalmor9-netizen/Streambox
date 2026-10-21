import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, Product } from '../../types';
import {
  ShieldCheck,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  FileText,
  Clock,
  AlertCircle,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface CheckoutViewProps {
  instantProduct?: { product: Product; modalityId: string } | null;
  onNavigate: (view: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  instantProduct,
  onNavigate,
}) => {
  const {
    cart,
    cartSubtotalCOP,
    cartDiscountCOP,
    cartTotalCOP,
    createOrderFromCart,
    createInstantOrder,
    reportPayment,
    settings,
    currentUser,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('NEQUI');
  const [createdPayRequestId, setCreatedPayRequestId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Form states for reporting payment
  const [referenceNumber, setReferenceNumber] = useState('');
  const [phoneOrigin, setPhoneOrigin] = useState(currentUser?.phone || '');
  const [voucherNote, setVoucherNote] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isReportedSuccess, setIsReportedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  // Determine items and total
  const isInstant = Boolean(instantProduct);
  const instantModality = instantProduct
    ? instantProduct.product.modalities.find((m) => m.id === instantProduct.modalityId) || instantProduct.product.modalities[0]
    : null;

  // Calculate instant discount if coupon applied
  const instantSubtotal = isInstant ? (instantModality?.priceCOP || 0) : cartSubtotalCOP;
  let instantDiscount = 0;
  if (isInstant && appliedPromo) {
    if (appliedPromo.type === 'PERCENTAGE') {
      instantDiscount = Math.round((instantSubtotal * appliedPromo.value) / 100);
    } else {
      instantDiscount = appliedPromo.value;
    }
    if (instantDiscount > instantSubtotal) instantDiscount = instantSubtotal;
  }

  const finalDiscountCOP = isInstant ? instantDiscount : cartDiscountCOP;
  const totalAmountCOP = isInstant
    ? Math.max(0, instantSubtotal - instantDiscount)
    : cartTotalCOP;

  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim() || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    try {
      const res = await applyPromoCode(couponInput.trim());
      if (res.success) {
        setCouponFeedback({ text: res.message, isError: false });
        setCouponInput('');
      } else {
        setCouponFeedback({ text: res.message, isError: true });
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const activeNumber = paymentMethod === 'NEQUI' ? settings.nequiNumber : settings.daviplataNumber;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Generate order if not generated yet
  const handleGeneratePaymentOrder = () => {
    if (isInstant && instantProduct) {
      const res = createInstantOrder(instantProduct.product, instantProduct.modalityId, paymentMethod);
      setCreatedOrderId(res.order.id);
      setCreatedPayRequestId(res.paymentRequest.id);
    } else {
      if (cart.length === 0) return;
      const res = createOrderFromCart(paymentMethod);
      setCreatedOrderId(res.order.id);
      setCreatedPayRequestId(res.paymentRequest.id);
    }
  };

  const handleReportPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!referenceNumber.trim()) {
      setErrorMsg('Por favor ingresa el número de referencia del comprobante.');
      return;
    }

    if (!phoneOrigin.trim()) {
      setErrorMsg('Por favor ingresa el número desde el cual transferiste.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Debes aceptar los Términos de Servicio y la Política de Reembolsos para continuar.');
      return;
    }

    // If order was not initialized yet, create it on the fly
    let targetPayReqId = createdPayRequestId;
    if (!targetPayReqId) {
      if (isInstant && instantProduct) {
        const res = createInstantOrder(instantProduct.product, instantProduct.modalityId, paymentMethod);
        setCreatedOrderId(res.order.id);
        targetPayReqId = res.paymentRequest.id;
        setCreatedPayRequestId(targetPayReqId);
      } else {
        const res = createOrderFromCart(paymentMethod);
        setCreatedOrderId(res.order.id);
        targetPayReqId = res.paymentRequest.id;
        setCreatedPayRequestId(targetPayReqId);
      }
    }

    const success = reportPayment(
      targetPayReqId,
      referenceNumber.trim(),
      phoneOrigin.trim(),
      voucherNote.trim()
    );

    if (success) {
      setIsReportedSuccess(true);
    } else {
      setErrorMsg('Hubo un problema al registrar el reporte. Inténtalo nuevamente.');
    }
  };

  // If payment was reported, show mandatory prompt message (Section 11.4)
  if (isReportedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-[#14141F] border border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
          {/* Neon check badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            ¡PAGO REPORTADO CORRECTAMENTE!
          </h2>

          <p className="text-sm text-zinc-300 max-w-lg mx-auto mb-4 leading-relaxed">
            Tu pago fue enviado para verificación.
          </p>

          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 max-w-md mx-auto mb-8 text-left space-y-2">
            <p className="font-semibold text-white">
              Ahora debes ir a <span className="text-cyan-400 font-bold">Mi chat → Mensajes</span> para recibir las instrucciones correspondientes a tu pedido.
            </p>
            <p className="text-zinc-400">
              El pedido se entregará por el chat después de que el pago sea verificado por nuestro equipo administrativo.
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-500">ID Pedido: {createdOrderId}</span>
              <span className="text-emerald-400 font-semibold">Ref: {referenceNumber}</span>
            </div>
          </div>

          {/* Action buttons (Section 11.4) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>IR A MI CHAT</span>
            </button>

            <button
              onClick={() => onNavigate('cuenta-pedidos')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>VER MI PEDIDO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Finalizar Compra & Pago Manual
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Transfiere con seguridad desde Nequi o Daviplata en Colombia y reporta tu comprobante para entrega inmediata.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Payment Instructions & Details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Method Selection (Nequi vs Daviplata) */}
          <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              1. Selecciona tu Método de Pago
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('NEQUI')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'NEQUI'
                    ? 'bg-fuchsia-950/30 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                  NQ
                </div>
                <span className="text-sm font-bold text-white">Nequi Colombia</span>
                <span className="text-[11px] text-zinc-400 font-mono">304 596 7068</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DAVIPLATA')}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'DAVIPLATA'
                    ? 'bg-rose-950/30 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
                  DP
                </div>
                <span className="text-sm font-bold text-white">Daviplata</span>
                <span className="text-[11px] text-zinc-400 font-mono">311 413 9187</span>
              </button>
            </div>
          </div>

          {/* Transfer Box with Copyable fields */}
          <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                2. Realiza la Transferencia
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Verificación en 5-15 min</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
              {/* Account Number */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-500 uppercase">
                    Número {paymentMethod}:
                  </div>
                  <div className="text-lg font-bold font-mono text-white tracking-wider">
                    {activeNumber}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(activeNumber, 'number')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedField === 'number' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Exact Total to transfer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                <div>
                  <div className="text-[11px] text-zinc-500 uppercase">
                    Valor exacto a transferir:
                  </div>
                  <div className="text-xl font-extrabold font-mono text-cyan-400">
                    ${totalAmountCOP.toLocaleString('es-CO')} COP
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(totalAmountCOP.toString(), 'amount')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar valor</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-400 space-y-1 pl-1">
              <p>• Abre tu aplicación de {paymentMethod} en tu teléfono.</p>
              <p>• Envía el monto exacto al número indicado.</p>
              <p>• Toma nota del código de aprobación o referencia de tu recibo.</p>
            </div>
          </div>

          {/* Step 3: Payment Reporting Form */}
          <div className="p-6 rounded-2xl bg-[#14141F] border border-purple-900/40">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">
              3. Reportar Comprobante de Pago
            </h3>

            <form onSubmit={handleReportPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Número de Referencia o Aprobación <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: M12345678 o Ref Nequi"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Número de Celular que Realizó el Envío <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 315 123 4567"
                  value={phoneOrigin}
                  onChange={(e) => setPhoneOrigin(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nota u Hora del Pago (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Enviado a las 4:35 pm"
                  value={voucherNote}
                  onChange={(e) => setVoucherNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Consent & Compliance Checkboxes (Ley 1480 y Ley 1581) */}
              <div className="space-y-2.5 pt-3 border-t border-zinc-800/80 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 bg-zinc-950 border-zinc-700 mt-0.5 cursor-pointer"
                  />
                  <span>
                    He leído y acepto los{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('terminos')}
                      className="text-purple-400 hover:underline font-semibold"
                    >
                      Términos de Servicio
                    </button>{' '}
                    y la{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('terminos')}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Política de Reembolsos y Retracto (Ley 1480)
                    </button>
                    . <span className="text-rose-400">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-zinc-400">
                  <input
                    type="checkbox"
                    checked={acceptMarketing}
                    onChange={(e) => setAcceptMarketing(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 bg-zinc-950 border-zinc-700 mt-0.5 cursor-pointer"
                  />
                  <span>
                    Autorizo de forma voluntaria e informada a StreamBox para enviarme novedades y promociones conforme a la{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('privacidad')}
                      className="text-emerald-400 hover:underline"
                    >
                      Política de Protección de Datos (Ley 1581)
                    </button>{' '}
                    (Opcional, no requerida para comprar).
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>REPORTAR PAGO REALIZADO</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 sticky top-28 space-y-5">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-zinc-800">
              Resumen del Pedido
            </h3>

            {/* Itemized List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {isInstant && instantProduct && instantModality ? (
                <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BrandLogo
                      brand={instantProduct.product.brand}
                      logoUrl={instantProduct.product.logoUrl}
                      logoColor={instantProduct.product.logoColor}
                      size="xs"
                    />
                    <div className="min-w-0">
                      <h5 className="font-semibold text-white truncate">{instantProduct.product.name}</h5>
                      <p className="text-zinc-400 mt-0.5">{instantModality.name} · {instantModality.duration}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-white shrink-0 ml-2">
                    ${(instantModality.priceCOP || 0).toLocaleString('es-CO')} COP
                  </span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.modalityId}`}
                    className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 flex justify-between items-center text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BrandLogo
                        brand={item.productName}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <h5 className="font-semibold text-white truncate max-w-[170px]">
                          {item.productName}
                        </h5>
                        <p className="text-zinc-400 mt-0.5">
                          {item.modalityName} ({item.quantity}x)
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white shrink-0 ml-2">
                      ${(item.priceCOP * item.quantity).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Coupon & Discount Code Section */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                ¿Tienes un Cupón de Descuento?
              </label>

              {appliedPromo ? (
                <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-purple-300 uppercase">
                      {appliedPromo.code}
                    </span>
                    <span className="text-zinc-400 block text-[11px]">
                      {appliedPromo.type === 'PERCENTAGE'
                        ? `${appliedPromo.value}% de descuento aplicado`
                        : `$${appliedPromo.value.toLocaleString('es-CO')} COP de descuento`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold underline cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: STREAMBOX10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder-zinc-500 font-mono focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>

                  {couponFeedback && (
                    <p className={`text-[11px] ${couponFeedback.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {couponFeedback.text}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <span>Sugeridos:</span>
                    <button
                      type="button"
                      onClick={() => {
                        applyPromoCode('STREAMBOX10');
                        setCouponFeedback({ text: '¡Cupón STREAMBOX10 aplicado! (10% OFF)', isError: false });
                      }}
                      className="underline hover:text-purple-400 font-mono cursor-pointer"
                    >
                      STREAMBOX10
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        applyPromoCode('BIENVENIDO5K');
                        setCouponFeedback({ text: '¡Cupón BIENVENIDO5K aplicado! ($5.000 COP OFF)', isError: false });
                      }}
                      className="underline hover:text-purple-400 font-mono cursor-pointer"
                    >
                      BIENVENIDO5K
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs pt-3 border-t border-zinc-800">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">
                  ${instantSubtotal.toLocaleString('es-CO')} COP
                </span>
              </div>

              {finalDiscountCOP > 0 && (
                <div className="flex justify-between text-purple-400 font-semibold">
                  <span>Descuento {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                  <span className="font-mono">
                    -${finalDiscountCOP.toLocaleString('es-CO')} COP
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-zinc-800">
                <span>Total a Pagar</span>
                <span className="font-mono text-cyan-400">
                  ${totalAmountCOP.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {/* Security Trust badge */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-300 block">Proceso Seguro Verificado</span>
                <span>Tu pago es auditado en tiempo real. Al confirmarse, recibes tus credenciales y garantía en el chat privado.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
