import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
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
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { WhatsAppDirectModal } from './WhatsAppDirectModal';
import { WhatsAppOrderDetails } from '../../lib/whatsappCheckout';
import {
  validateColombianPhone,
  formatColombianPhoneLive,
  validatePaymentReference,
} from '../../lib/validationRules';
import { TwoStepEmailVerificationModal } from '../common/TwoStepEmailVerificationModal';

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

  const { currency, billingPeriod, formatAmount } = useCurrency();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('NEQUI');
  const [createdPayRequestId, setCreatedPayRequestId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Form states for reporting payment
  const [referenceNumber, setReferenceNumber] = useState('');
  const [phoneOrigin, setPhoneOrigin] = useState(
    currentUser?.phone ? formatColombianPhoneLive(currentUser.phone) : ''
  );
  const [voucherNote, setVoucherNote] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isReportedSuccess, setIsReportedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Strict Validation States (Colombia standard & anti-garbage rules)
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [refTouched, setRefTouched] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [shakeTarget, setShakeTarget] = useState<'phone' | 'reference' | 'terms' | null>(null);

  // 2-Step OTP Modal State
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(currentUser?.email));

  const triggerShake = (target: 'phone' | 'reference' | 'terms') => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 350);
  };

  // Live status evaluations
  const phoneValidation = validateColombianPhone(phoneOrigin);
  const refValidation = validatePaymentReference(referenceNumber);
  const isFormCompliant = phoneValidation.isValid && refValidation.isValid && acceptTerms;

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatColombianPhoneLive(e.target.value);
    setPhoneOrigin(formatted);
    if (phoneTouched) {
      const validation = validateColombianPhone(formatted);
      setPhoneError(validation.isValid ? null : validation.errorMessage || null);
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    const validation = validateColombianPhone(phoneOrigin);
    if (!validation.isValid) {
      setPhoneError(validation.errorMessage || 'Ingresa un número móvil válido de Colombia (10 dígitos que empiece por 3).');
      triggerShake('phone');
    } else {
      setPhoneError(null);
    }
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toUpperCase().replace(/\s/g, '');
    setReferenceNumber(cleaned);
    if (refTouched) {
      const validation = validatePaymentReference(cleaned);
      setRefError(validation.isValid ? null : validation.errorMessage || null);
    }
  };

  const handleReferenceBlur = () => {
    setRefTouched(true);
    const validation = validatePaymentReference(referenceNumber);
    if (!validation.isValid) {
      setRefError(validation.errorMessage || 'La referencia de pago debe tener entre 6 y 18 caracteres alfanuméricos (letras y números sin espacios).');
      triggerShake('reference');
    } else {
      setRefError(null);
    }
  };

  const handleReportPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Reference
    setRefTouched(true);
    const refVal = validatePaymentReference(referenceNumber);
    if (!refVal.isValid) {
      setRefError(refVal.errorMessage || 'La referencia de pago debe tener entre 6 y 18 caracteres alfanuméricos (letras y números sin espacios).');
      triggerShake('reference');
      setErrorMsg(refVal.errorMessage || 'Verifica la referencia de pago.');
      return;
    }

    // Validate Phone
    setPhoneTouched(true);
    const phoneVal = validateColombianPhone(phoneOrigin);
    if (!phoneVal.isValid) {
      setPhoneError(phoneVal.errorMessage || 'Ingresa un número móvil válido de Colombia (10 dígitos que empiece por 3).');
      triggerShake('phone');
      setErrorMsg(phoneVal.errorMessage || 'Verifica el número de celular colombiano.');
      return;
    }

    if (!acceptTerms) {
      triggerShake('terms');
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
      refVal.cleanReference,
      phoneVal.cleanDigits,
      voucherNote.trim()
    );

    if (success) {
      setIsReportedSuccess(true);
    } else {
      setErrorMsg('Hubo un problema al registrar el reporte. Inténtalo nuevamente.');
    }
  };

  // Prepare structured WhatsApp order payload
  const whatsappPayload: WhatsAppOrderDetails = {
    customerName: currentUser?.name,
    customerEmail: currentUser?.email,
    customerPhone: phoneOrigin || currentUser?.phone,
    items: isInstant && instantProduct && instantModality
      ? [
          {
            productName: instantProduct.product.name,
            brand: instantProduct.product.brand,
            modalityName: instantModality.name,
            duration: instantModality.duration,
            priceText: formatAmount(instantModality.priceCOP),
            quantity: 1,
          },
        ]
      : cart.map((i) => ({
          productName: i.productName,
          brand: i.brand,
          modalityName: i.modalityName,
          duration: i.duration,
          priceText: `${formatAmount(i.priceCOP)} c/u`,
          quantity: i.quantity,
        })),
    subtotalText: formatAmount(instantSubtotal),
    discountText: finalDiscountCOP > 0 ? formatAmount(finalDiscountCOP) : undefined,
    totalText: formatAmount(totalAmountCOP),
    currency,
    billingPeriod,
    orderId: createdOrderId || undefined,
  };

  // If payment was reported, show mandatory confirmation view
  if (isReportedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0d0d14] border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            ¡PAGO REPORTADO CORRECTAMENTE!
          </h2>

          <p className="text-sm text-neutral-300 max-w-lg mx-auto mb-4 leading-relaxed">
            Tu comprobante fue enviado para verificación por nuestro equipo de soporte.
          </p>

          <div className="p-4 rounded-xl bg-black/60 border border-white/8 text-xs text-neutral-300 max-w-md mx-auto mb-8 text-left space-y-2">
            <p className="font-semibold text-white">
              Ahora debes ir a <span className="text-amber-400 font-bold">Mi chat → Mensajes</span> para recibir las instrucciones de activación.
            </p>
            <p className="text-neutral-400">
              El servicio se entregará por el chat privado en un lapso estimado de 5 a 15 minutos.
            </p>
            <div className="pt-2 border-t border-white/8 flex items-center justify-between font-mono text-[11px]">
              <span className="text-neutral-500">ID Pedido: {createdOrderId}</span>
              <span className="text-emerald-400 font-semibold">Ref: {referenceNumber}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-black" />
              <span>IR A MI CHAT</span>
            </button>

            <button
              onClick={() => onNavigate('cuenta-pedidos')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-neutral-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>VER MI PEDIDO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transacción Segura en Colombia</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Finalizar Compra & Checkout
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Transfiere desde Nequi, Daviplata o Bancolombia, o finaliza con asistencia directa por WhatsApp.
          </p>
        </div>

        {/* WhatsApp Direct Banner */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#25D366]/15 via-[#25D366]/10 to-transparent border border-[#25D366]/30 shadow-[0_4px_25px_rgba(37,211,102,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                ¿Prefieres pagar y recibir por WhatsApp?
              </h3>
              <p className="text-xs text-neutral-300">
                Atención personalizada con asesor oficial de StreamBox Colombia en línea.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(37,211,102,0.3)] shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>FINALIZAR POR WHATSAPP</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Payment Instructions & Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Method Selection (Nequi vs Daviplata) */}
            <div className="p-6 rounded-2xl bg-[#0d0d14] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                1. Selecciona tu Método de Pago Manual
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NEQUI')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    paymentMethod === 'NEQUI'
                      ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.25)]'
                      : 'bg-black/40 border-white/6 hover:border-white/12'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                    NQ
                  </div>
                  <span className="text-sm font-bold text-white">Nequi Colombia</span>
                  <span className="text-[11px] text-neutral-400 font-mono">304 596 7068</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('DAVIPLATA')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    paymentMethod === 'DAVIPLATA'
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                      : 'bg-black/40 border-white/6 hover:border-white/12'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-sm">
                    DP
                  </div>
                  <span className="text-sm font-bold text-white">Daviplata</span>
                  <span className="text-[11px] text-neutral-400 font-mono">311 413 9187</span>
                </button>
              </div>
            </div>

            {/* Transfer Box with Copyable fields */}
            <div className="p-6 rounded-2xl bg-[#0d0d14] border border-white/8 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  2. Realiza la Transferencia
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verificación en 5-15 min</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/8 space-y-3">
                {/* Account Number */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-500 uppercase">
                      Número {paymentMethod}:
                    </div>
                    <div className="text-lg font-bold font-mono text-white tracking-wider">
                      {activeNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeNumber, 'number')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
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
                <div className="flex items-center justify-between pt-3 border-t border-white/6">
                  <div>
                    <div className="text-[11px] text-neutral-500 uppercase">
                      Valor exacto a transferir:
                    </div>
                    <div className="text-xl font-extrabold font-mono text-emerald-400">
                      ${totalAmountCOP.toLocaleString('es-CO')} COP
                    </div>
                    {currency !== 'COP' && (
                      <span className="text-xs text-neutral-400 font-mono">
                        ≈ {formatAmount(totalAmountCOP)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(totalAmountCOP.toString(), 'amount')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
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

              <div className="text-xs text-neutral-400 space-y-1 pl-1">
                <p>• Abre tu aplicación de {paymentMethod} en tu teléfono celular.</p>
                <p>• Envía el valor exacto al número oficial indicado.</p>
                <p>• Guarda el comprobante con el número de aprobación o referencia.</p>
              </div>
            </div>

            {/* Step 3: Payment Reporting Form with Strict Colombian Validations */}
            <div className="p-6 rounded-2xl bg-[#0d0d14] border border-white/8 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  3. Reportar Comprobante de Pago
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Auditoría Colombia 🇨🇴
                </span>
              </div>

              <form onSubmit={handleReportPaymentSubmit} className="space-y-4">
                {/* Reference Input */}
                <div className={shakeTarget === 'reference' ? 'animate-shake' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Número de Referencia o Aprobación <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">6 a 18 caracteres</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ej: M12849102 o REF-994"
                      value={referenceNumber}
                      onChange={handleReferenceChange}
                      onBlur={handleReferenceBlur}
                      maxLength={18}
                      className={`w-full bg-black/60 border rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        refError
                          ? 'border-rose-500/80 bg-rose-500/5'
                          : refValidation.isValid
                          ? 'border-emerald-500/60 bg-emerald-500/5'
                          : 'border-white/10 focus:border-amber-400'
                      }`}
                    />
                    {refValidation.isValid && (
                      <Check className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {refError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{refError}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Solo letras y números reales de tu comprobante. Se prohíben datos de prueba.
                  </p>
                </div>

                {/* Colombian Phone Input */}
                <div className={shakeTarget === 'phone' ? 'animate-shake' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Celular / WhatsApp que transfirió <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">10 dígitos (inicia por 3)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="300 123 4567"
                      value={phoneOrigin}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      maxLength={14}
                      className={`w-full bg-black/60 border rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        phoneError
                          ? 'border-rose-500/80 bg-rose-500/5'
                          : phoneValidation.isValid
                          ? 'border-emerald-500/60 bg-emerald-500/5'
                          : 'border-white/10 focus:border-amber-400'
                      }`}
                    />
                    {phoneValidation.isValid && (
                      <Check className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  {phoneError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Número de Colombia para validar contra el extracto de {paymentMethod}.
                  </p>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Nota u Hora del Pago (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Enviado a las 4:35 pm desde cuenta Bancolombia"
                    value={voucherNote}
                    onChange={(e) => setVoucherNote(e.target.value)}
                    className="w-full bg-black/60 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 2-Step OTP Email Verification Badge */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/8 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-200">
                        {isEmailVerified ? 'Correo Verificado en 2 Pasos' : 'Verificación de Correo (OTP)'}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {isEmailVerified
                          ? `${currentUser?.email || 'Autenticación en 2 pasos activa'}`
                          : 'Valida tu código de 6 dígitos para entrega inmediata'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEmailOtpModalOpen(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all ${
                      isEmailVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {isEmailVerified ? 'Verificado ✓' : 'Validar OTP'}
                  </button>
                </div>

                {/* Consent & Compliance Checkboxes */}
                <div className={`space-y-2.5 pt-3 border-t border-white/8 text-xs ${shakeTarget === 'terms' ? 'animate-shake' : ''}`}>
                  <label className="flex items-start gap-2.5 cursor-pointer text-neutral-300">
                    <input
                      type="checkbox"
                      required
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-black/60 border-neutral-700 mt-0.5 cursor-pointer"
                    />
                    <span>
                      He leído y acepto los{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('terminos')}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Términos de Servicio
                      </button>{' '}
                      y la{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('reembolsos')}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        Política de Reembolsos y Retracto (Ley 1480)
                      </button>
                      . <span className="text-rose-400">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-neutral-400">
                    <input
                      type="checkbox"
                      checked={acceptMarketing}
                      onChange={(e) => setAcceptMarketing(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 bg-black/60 border-neutral-700 mt-0.5 cursor-pointer"
                    />
                    <span>
                      Autorizo a StreamBox para enviarme novedades y soporte conforme a la{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('privacidad')}
                        className="text-amber-400 hover:underline"
                      >
                        Política de Protección de Datos (Ley 1581)
                      </button>{' '}
                      (Opcional).
                    </span>
                  </label>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormCompliant}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>REPORTAR PAGO MANUAL</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-[#0d0d14] border border-white/8 sticky top-28 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <h3 className="text-sm font-bold text-white pb-3 border-b border-white/8">
                Resumen del Pedido
              </h3>

              {/* Itemized List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {isInstant && instantProduct && instantModality ? (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/6 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BrandLogo
                        brand={instantProduct.product.brand}
                        logoUrl={instantProduct.product.logoUrl}
                        logoColor={instantProduct.product.logoColor}
                        size="xs"
                      />
                      <div className="min-w-0">
                        <h5 className="font-semibold text-white truncate">{instantProduct.product.name}</h5>
                        <p className="text-neutral-400 mt-0.5">{instantModality.name} · {instantModality.duration}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white shrink-0 ml-2">
                      {formatAmount(instantModality.priceCOP)}
                    </span>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.modalityId}`}
                      className="p-3 rounded-xl bg-black/40 border border-white/6 flex justify-between items-center text-xs"
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
                          <p className="text-neutral-400 mt-0.5">
                            {item.modalityName} ({item.quantity}x)
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0 ml-2">
                        {formatAmount(item.priceCOP * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon & Discount Code Section */}
              <div className="pt-3 border-t border-white/8 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300">
                  ¿Tienes un Cupón de Descuento?
                </label>

                {appliedPromo ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-300 uppercase">
                        {appliedPromo.code}
                      </span>
                      <span className="text-neutral-400 block text-[11px]">
                        {appliedPromo.type === 'PERCENTAGE'
                          ? `${appliedPromo.value}% de descuento aplicado`
                          : `${formatAmount(appliedPromo.value)} de descuento`}
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
                        className="flex-1 bg-black/60 border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white uppercase placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors active:scale-95"
                      >
                        Aplicar
                      </button>
                    </div>

                    {couponFeedback && (
                      <p className={`text-[11px] ${couponFeedback.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {couponFeedback.text}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                      <span>Sugeridos:</span>
                      <button
                        type="button"
                        onClick={() => {
                          applyPromoCode('STREAMBOX10');
                          setCouponFeedback({ text: '¡Cupón STREAMBOX10 aplicado! (10% OFF)', isError: false });
                        }}
                        className="underline hover:text-amber-400 font-mono cursor-pointer"
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
                        className="underline hover:text-amber-400 font-mono cursor-pointer"
                      >
                        BIENVENIDO5K
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Calculations */}
              <div className="space-y-2 text-xs pt-3 border-t border-white/8">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-200">
                    {formatAmount(instantSubtotal)}
                  </span>
                </div>

                {finalDiscountCOP > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Descuento {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                    <span className="font-mono">
                      -{formatAmount(finalDiscountCOP)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/8">
                  <span>Total a Pagar</span>
                  <span className="font-mono text-emerald-400">
                    {formatAmount(totalAmountCOP)}
                  </span>
                </div>
              </div>

              {/* Security Trust badge */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/8 text-[11px] text-neutral-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-200 block">Proceso Seguro Verificado</span>
                  <span>Al reportar tu pago, un asesor despacha tus datos de acceso en Mi Chat y por WhatsApp en 5 a 15 minutos.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Direct Modal */}
      <WhatsAppDirectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        orderDetails={whatsappPayload}
      />

      {/* Two-Step Email OTP Verification Modal */}
      <TwoStepEmailVerificationModal
        isOpen={isEmailOtpModalOpen}
        onClose={() => setIsEmailOtpModalOpen(false)}
        initialEmail={currentUser?.email || ''}
        onVerified={() => {
          setIsEmailVerified(true);
        }}
      />
    </>
  );
};
