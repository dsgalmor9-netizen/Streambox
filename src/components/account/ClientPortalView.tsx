import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, PaymentRequest, Ticket, RefundReason, RefundStatus, RefundRequest, Product } from '../../types';
import {
  User,
  ShoppingBag,
  CreditCard,
  Zap,
  RefreshCw,
  MessageSquare,
  LifeBuoy,
  Bell,
  LogOut,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Send,
  FileText,
  ChevronRight,
  ExternalLink,
  Scale,
  Sparkles,
  Share2,
  Gift,
  Printer,
  Smartphone,
  PhoneCall,
  Heart,
  Settings,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { InvoiceModal } from '../common/InvoiceModal';
import { ProductCard } from '../product/ProductCard';
import { useToast } from '../common/Toast';
import { buildWhatsAppUrl, getCustomerSupportWhatsApp } from '../../lib/whatsapp';
import { PaymentHistoryWidget } from './PaymentHistoryWidget';
import { RecentPurchasesCard } from './RecentPurchasesCard';

interface ClientPortalViewProps {
  initialTab?: string;
  onNavigate: (view: string) => void;
  onSelectOrderForChat?: (orderId: string) => void;
  onSelectProduct?: (product: Product) => void;
  onInstantBuy?: (product: Product, modalityId: string) => void;
}

// 4-Step Order Tracking Timeline Component
const OrderTrackingTimeline: React.FC<{ order: Order }> = ({ order }) => {
  let currentStep = 1;
  if (order.orderStatus === 'ENTREGADO') {
    currentStep = 4;
  } else if (order.paymentStatus === 'PAGO_CONFIRMADO') {
    currentStep = 3;
  } else if (order.paymentStatus === 'PAGO_REPORTADO') {
    currentStep = 2;
  }

  const steps = [
    {
      num: 1,
      label: '1. Pedido Creado',
      desc: 'Registrado en sistema',
      date: new Date(order.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
      done: true,
      current: currentStep === 1,
    },
    {
      num: 2,
      label: '2. Pago Reportado',
      desc: order.paymentStatus === 'PENDIENTE' ? 'Pendiente comprobante' : `${order.paymentMethod}`,
      date: order.paymentStatus !== 'PENDIENTE' ? 'Reportado' : undefined,
      done: currentStep >= 2,
      current: currentStep === 2,
    },
    {
      num: 3,
      label: '3. Verificación Admin',
      desc: order.paymentStatus === 'PAGO_CONFIRMADO' ? 'Super Admin aprobado' : 'Validando transferencia',
      date: order.confirmedAt ? new Date(order.confirmedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : undefined,
      done: currentStep >= 3,
      current: currentStep === 3,
    },
    {
      num: 4,
      label: '4. Entregado',
      desc: order.orderStatus === 'ENTREGADO' ? 'Credenciales entregadas' : 'En aprovisionamiento',
      date: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : undefined,
      done: currentStep === 4,
      current: currentStep === 4,
    },
  ];

  return (
    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 my-3">
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-2.5">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>Seguimiento de Estado del Pedido:</span>
        </div>
        <span className="font-mono text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
          Paso {currentStep} de 4
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((st) => (
          <div
            key={st.num}
            className={`p-2.5 rounded-lg border transition-all ${
              st.done
                ? 'bg-purple-950/30 border-purple-800/60 text-white'
                : st.current
                ? 'bg-cyan-950/30 border-cyan-500/70 text-cyan-200 ring-1 ring-cyan-500/30'
                : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-500'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  st.done
                    ? 'bg-emerald-500 text-black'
                    : st.current
                    ? 'bg-cyan-400 text-black animate-pulse'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {st.done ? '✓' : st.num}
              </span>
              <span className="text-xs font-bold truncate">{st.label}</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">{st.desc}</p>
            {st.date && (
              <span className="text-[9px] text-zinc-500 mt-1 block font-mono">{st.date}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  initialTab = 'pedidos',
  onNavigate,
  onSelectOrderForChat,
  onSelectProduct,
  onInstantBuy,
}) => {
  const {
    currentUser,
    logout,
    orders,
    paymentRequests,
    tickets,
    createTicket,
    replyTicket,
    notifications,
    markNotificationAsRead,
    renewService,
    refundRequests,
    createRefundRequest,
    settings,
    favorites,
    products,
    updateUserProfile,
    toggleFavorite,
  } = useStore();

  const { success: toastSuccess, info: toastInfo } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // New ticket state
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('SOPORTE_TECNICO');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Refund & claim modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundReason, setRefundReason] = useState<RefundReason>('SERVICE_MALFUNCTION');
  const [refundTitle, setRefundTitle] = useState('');
  const [refundDescription, setRefundDescription] = useState('');
  const [refundIncidentDate, setRefundIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [refundContact, setRefundContact] = useState<'EMAIL' | 'WHATSAPP' | 'CHAT_INTERNO'>('WHATSAPP');
  const [selectedRefundDetail, setSelectedRefundDetail] = useState<RefundRequest | null>(null);

  // Filter user data
  const userRefunds = refundRequests.filter(
    (r) => r.userId === (currentUser ? currentUser.id : 'usr-client-demo')
  );
  const userOrders = orders.filter(
    (o) => o.userId === (currentUser ? currentUser.id : 'usr-client-demo')
  );

  const userPayments = paymentRequests.filter(
    (p) => p.userId === (currentUser ? currentUser.id : 'usr-client-demo')
  );

  const userTickets = tickets.filter(
    (t) => t.userId === (currentUser ? currentUser.id : 'usr-client-demo')
  );

  const userNotifications = notifications.filter(
    (n) => currentUser ? n.userId === currentUser.id : true
  );

  const userFavoriteProducts = products.filter((p) => favorites.includes(p.id));

  // Profile and Preferences Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [prefWhatsapp, setPrefWhatsapp] = useState(currentUser?.preferences?.whatsappNotifications ?? true);
  const [prefEmail, setPrefEmail] = useState(currentUser?.preferences?.emailNotifications ?? true);
  const [prefPromos, setPrefPromos] = useState(currentUser?.preferences?.promotionsAlerts ?? true);
  const [prefPayment, setPrefPayment] = useState<'NEQUI' | 'DAVIPLATA'>(currentUser?.preferences?.preferredPaymentMethod || 'NEQUI');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    updateUserProfile({
      name: profileName,
      phone: profilePhone,
      preferences: {
        whatsappNotifications: prefWhatsapp,
        emailNotifications: prefEmail,
        promotionsAlerts: prefPromos,
        preferredPaymentMethod: prefPayment,
      },
    });
    setTimeout(() => {
      setIsSavingProfile(false);
      toastSuccess('¡Tus datos y preferencias han sido actualizados exitosamente!');
    }, 300);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleRenew = (orderId: string) => {
    const res = renewService(orderId, 'NEQUI');
    if (res) {
      alert(`¡Solicitud de renovación creada #${res.paymentRequest.id}! Ve a Mis Pagos para reportar tu transferencia.`);
      setActiveTab('pagos');
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    createTicket(newTicketSubject.trim(), newTicketCategory, newTicketMessage.trim());
    setNewTicketSubject('');
    setNewTicketMessage('');
    setShowNewTicketModal(false);
  };

  const handleReplyTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !ticketReplyText.trim()) return;

    replyTicket(selectedTicketId, ticketReplyText.trim(), false);
    setTicketReplyText('');
  };

  const activeTicket = userTickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Profile Summary */}
      <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-xl font-bold text-white uppercase shadow-lg">
            {currentUser ? currentUser.name.charAt(0) : 'C'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {currentUser ? currentUser.name : 'Carlos Mendoza'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
              <span>{currentUser ? currentUser.email : 'carlos.cliente@gmail.com'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-mono">Rol: {currentUser ? currentUser.role : 'CLIENTE'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('inicio');
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'pedidos'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Mis Pedidos ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pagos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'pagos'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mis Pagos ({userPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('servicios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'servicios'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Mis Servicios & Renovaciones</span>
        </button>

        <button
          onClick={() => setActiveTab('referidos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'referidos'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Referidos & Puntos ({currentUser?.rewardPoints || 0} pts)</span>
        </button>

        <button
          onClick={() => setActiveTab('reembolsos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'reembolsos'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reclamaciones & Reembolsos ({userRefunds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'tickets'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Tickets de Soporte ({userTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'notificaciones'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notificaciones ({userNotifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favoritos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'favoritos'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'favoritos' ? 'fill-white' : 'text-rose-400'}`} />
          <span>Mis Favoritos ({userFavoriteProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'perfil'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Settings className="w-4 h-4 text-purple-400" />
          <span>Mi Perfil & Preferencias</span>
        </button>

        <button
          onClick={() => onNavigate('chat')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 transition-colors ml-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Abrir Mi Chat</span>
        </button>
      </div>

      {/* TAB CONTENT: PEDIDOS */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          {/* Glassmorphism Recent Purchases Card consuming Firebase Firestore */}
          <RecentPurchasesCard
            onSelectOrderForInvoice={(order) => setSelectedOrderForInvoice(order)}
            onNavigateToCatalog={() => onNavigate('catalogo')}
            onNavigateToChat={() => onNavigate('chat')}
          />

          {userOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Todavía no tienes pedidos</h3>
              <p className="text-xs text-zinc-500 mb-6">
                Elige cualquiera de nuestros servicios digitales y disfruta de entretenimiento sin límites.
              </p>
              <button
                onClick={() => onNavigate('catalogo')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">{order.id}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-xs text-zinc-400">
                        {new Date(order.createdAt).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Método de pago: <span className="font-semibold text-zinc-300">{order.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      order.paymentStatus === 'PAGO_CONFIRMADO'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : order.paymentStatus === 'PAGO_REPORTADO'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : order.paymentStatus === 'PAGO_RECHAZADO'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {order.paymentStatus}
                    </span>

                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      order.orderStatus === 'ENTREGADO'
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Interactive 4-Step Order Tracking Timeline */}
                <OrderTrackingTimeline order={order} />

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="text-zinc-200 flex items-center gap-2">
                        <BrandLogo
                          brand={item.productName}
                          size="xs"
                        />
                        <span className="font-semibold text-white">{item.productName}</span>
                        <span className="text-zinc-400 ml-1">({item.modalityName} · {item.duration})</span>
                      </div>
                      <span className="font-mono font-semibold text-white">
                        ${(item.priceCOP * item.quantity).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivered Credentials Box if active */}
                {order.credentialsDelivered && (
                  <div className="p-4 rounded-xl bg-zinc-950/90 border border-cyan-900/60 text-xs space-y-2">
                    <div className="flex items-center justify-between text-cyan-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Credenciales y Acceso Entregado</span>
                      </div>
                      <button
                        onClick={() => handleCopy(order.credentialsDelivered!, `cred-${order.id}`)}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                      >
                        {copiedKey === `cred-${order.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar credenciales</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-900 font-mono text-zinc-200 text-xs select-all">
                      {order.credentialsDelivered}
                    </div>

                    {order.deliveryInstructions && (
                      <p className="text-[11px] text-zinc-400 whitespace-pre-line">
                        {order.deliveryInstructions}
                      </p>
                    )}
                  </div>
                )}

                {/* Expiration & Renewal Alert Box */}
                {order.orderStatus === 'ENTREGADO' && order.expiresAt && (() => {
                  const daysRemaining = Math.ceil(
                    (new Date(order.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const expiryFormatted = new Date(order.expiresAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  if (daysRemaining <= 0) {
                    return (
                      <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-rose-300">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            <strong>Servicio Vencido:</strong> Finalizó el {expiryFormatted}. Renueva ahora para reactivar tus credenciales inmediatamente.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRenew(order.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renovar Servicio Ahora</span>
                        </button>
                      </div>
                    );
                  }

                  if (daysRemaining <= 3) {
                    return (
                      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-pulse">
                        <div className="flex items-center gap-2 text-amber-200">
                          <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                          <span>
                            <strong>¡Alerta de Vencimiento!</strong> Tu suscripción vence en <strong>{daysRemaining === 1 ? 'menos de 24 horas' : `${daysRemaining} días`}</strong> ({expiryFormatted}).
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRenew(order.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renovar Antes de Corte</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[11px] text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Garantía y servicio activo hasta el {expiryFormatted} ({daysRemaining} días restantes)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRenew(order.id)}
                        className="text-purple-400 hover:text-purple-300 font-semibold underline"
                      >
                        Renovación anticipada
                      </button>
                    </div>
                  );
                })()}

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 text-xs">
                  <span className="text-zinc-400">
                    Total: <strong className="font-mono text-white">${order.totalCOP.toLocaleString('es-CO')} COP</strong>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-400" />
                      <span>Factura / Recibo PDF</span>
                    </button>

                    <a
                      href={buildWhatsAppUrl(
                        settings.supportPhone || '3045967068',
                        getCustomerSupportWhatsApp(order.id, order.userEmail)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 flex items-center gap-1.5 font-semibold cursor-pointer transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Soporte</span>
                    </a>

                    <button
                      onClick={() => onNavigate('chat')}
                      className="text-cyan-400 hover:underline flex items-center gap-1 ml-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ver en Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: PAGOS (PaymentHistoryWidget with Cinema Glass styling) */}
      {activeTab === 'pagos' && (
        <PaymentHistoryWidget
          payments={userPayments}
          orders={userOrders}
          onSelectOrderForInvoice={(order) => setSelectedOrderForInvoice(order)}
          onNavigateToChat={() => onNavigate('chat')}
        />
      )}

      {/* TAB CONTENT: SERVICIOS & RENOVACIONES */}
      {activeTab === 'servicios' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between">
            <span>¿Se acerca tu fecha de vencimiento? Renueva con 1 solo clic para no perder tu perfil ni historial.</span>
          </div>

          {userOrders.filter((o) => o.orderStatus === 'ENTREGADO').length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
              <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No tienes servicios activos</h3>
              <p className="text-xs text-zinc-500">
                Tus suscripciones activas y fechas de vencimiento aparecerán aquí una vez entregadas.
              </p>
            </div>
          ) : (
            userOrders
              .filter((o) => o.orderStatus === 'ENTREGADO')
              .map((order) => {
                const item = order.items[0];
                const expires = order.expiresAt
                  ? new Date(order.expiresAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '30 días desde entrega';

                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        {item && (
                          <BrandLogo
                            brand={item.productName}
                            size="xs"
                          />
                        )}
                        <h4 className="text-base font-bold text-white">{item?.productName}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                          ACTIVO
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Modalidad: {item?.modalityName} · Duración: {item?.duration}
                      </div>
                      <div className="text-xs text-amber-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Fecha de Vencimiento: {expires}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRenew(order.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-95 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renovar Servicio</span>
                    </button>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* TAB CONTENT: PROGRAMA DE REFERIDOS & PUNTOS */}
      {activeTab === 'referidos' && (() => {
        const referralCode = currentUser?.referralCode || `SB-REF-${(currentUser?.name || 'VIP').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
        const referralLink = `${window.location.origin}/?ref=${referralCode}`;
        const userPoints = currentUser?.rewardPoints ?? 1500;
        const pointsValueCOP = userPoints * 10; // 1 punto = $10 COP

        const whatsappShareMsg = `¡Hola! Te recomiendo comprar tus cuentas de streaming (Netflix, Spotify, HBO Max, YouTube, etc.) en StreamBox Colombia 🎬🇨🇴.

Tienen entrega inmediata por chat y garantía total.
Usa mi código de descuento: *${referralCode}* para recibir 10% OFF en tu primera compra:
👉 ${referralLink}`;

        return (
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#161329] to-indigo-950/80 border border-purple-600/50 relative overflow-hidden shadow-xl">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Programa de Recompensas StreamBox VIP</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Invita a tus amigos y gana meses de streaming gratis
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                  Por cada amigo que realice su primera compra con tu enlace, él recibe <strong className="text-purple-300">10% de descuento inmediato</strong> y tú recibes <strong className="text-amber-300">500 puntos ($5.000 COP)</strong> acumulables para pagar tus propias suscripciones.
                </p>
              </div>

              {/* Referral Code Box */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 text-xs space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">
                    Tu Código Único de Referido:
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-purple-800/60 font-mono text-base font-extrabold text-purple-300">
                    <span>{referralCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(referralCode, 'ref-code')}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                    >
                      {copiedKey === 'ref-code' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 text-xs space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 block uppercase tracking-wider">
                    Tus Puntos Acumulados:
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-amber-800/60">
                    <div>
                      <span className="font-mono text-xl font-extrabold text-amber-400">
                        {userPoints.toLocaleString('es-CO')}
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-1">Puntos</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      ≈ ${pointsValueCOP.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Actions */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href={buildWhatsAppUrl('', whatsappShareMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir con Amigos en WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(referralLink, 'ref-link')}
                  className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                  <span>{copiedKey === 'ref-link' ? '¡Enlace Copiado!' : 'Copiar Enlace Directo'}</span>
                </button>
              </div>
            </div>

            {/* How it works grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800 text-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 font-bold font-mono">
                  1
                </div>
                <h4 className="font-bold text-white text-sm">Comparte tu enlace</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Envía tu enlace o código a tus amigos por WhatsApp, grupos o redes sociales.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800 text-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 font-bold font-mono">
                  2
                </div>
                <h4 className="font-bold text-white text-sm">Ellos ahorran 10%</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Tu amigo obtiene descuento en su primer pedido de cualquier cuenta o pantalla streaming.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800 text-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-300 font-bold font-mono">
                  3
                </div>
                <h4 className="font-bold text-white text-sm">Ganas saldo para compras</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Acumula 500 puntos por cada amigo y redímelos directamente al momento de pagar o renovar.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB CONTENT: TICKETS DE SOPORTE */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Tickets de Atención Técnica</h3>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Ticket</span>
            </button>
          </div>

          {userTickets.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
              <LifeBuoy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No tienes tickets abiertos</h3>
              <p className="text-xs text-zinc-500">
                Si presentas alguna novedad con tu cuenta o credenciales, abre un ticket y te responderemos inmediatamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Ticket list */}
              <div className="md:col-span-5 space-y-2">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedTicketId === ticket.id
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ticket.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : ticket.status === 'OPEN'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h5 className="font-semibold truncate">{ticket.subject}</h5>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {new Date(ticket.createdAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ticket message thread */}
              <div className="md:col-span-7">
                {activeTicket ? (
                  <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 flex flex-col h-[400px]">
                    <div className="pb-3 border-b border-zinc-800 mb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{activeTicket.subject}</h4>
                        <span className="text-xs text-cyan-400 font-mono">{activeTicket.id}</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">Categoría: {activeTicket.category}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                      {activeTicket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl text-xs max-w-[85%] ${
                            m.sender === 'USER'
                              ? 'ml-auto bg-purple-950/60 border border-purple-800/60 text-purple-100'
                              : 'mr-auto bg-zinc-900 border border-zinc-800 text-zinc-200'
                          }`}
                        >
                          <div className="font-semibold text-[10px] mb-1 opacity-70">
                            {m.senderName}
                          </div>
                          <p>{m.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply form */}
                    <form onSubmit={handleReplyTicketSubmit} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe tu respuesta..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center p-8 rounded-2xl bg-[#14141F] border border-zinc-800 text-xs text-zinc-500 text-center">
                    Selecciona un ticket a la izquierda para ver su conversación.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* New Ticket Modal */}
          {showNewTicketModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Nuevo Ticket de Soporte</h3>
                
                <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Asunto de la Consulta
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ayuda para ingresar mi PIN en Netflix"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="SOPORTE_TECNICO">Soporte Técnico / Credenciales</option>
                      <option value="PAGOS_FACTURACION">Pagos & Comprobantes</option>
                      <option value="RENOVACIONES">Renovación de Servicio</option>
                      <option value="OTRO">Otra Consulta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Descripción del Problema
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Explícanos con detalle para ayudarte lo más rápido posible..."
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTicketModal(false)}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white"
                    >
                      Crear Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REEMBOLSOS & RECLAMACIONES (Ley 1480 de 2011) */}
      {activeTab === 'reembolsos' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Mis Reclamaciones y Solicitudes de Reembolso
                </h3>
              </div>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Procedimiento legal y transparente conforme al Estatuto del Consumidor (Ley 1480 de 2011). Toda solicitud es evaluada con trazabilidad auditable y sin cláusulas abusivas de exclusión.
              </p>
            </div>

            <button
              onClick={() => {
                if (userOrders.length > 0) setRefundOrderId(userOrders[0].id);
                setShowRefundModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Radicar Reclamación</span>
            </button>
          </div>

          {/* List of Claims */}
          {userRefunds.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400 space-y-3">
              <RefreshCw className="w-12 h-12 text-zinc-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No tienes reclamaciones activas</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Si experimentas una falla técnica, retraso en la entrega, pago duplicado o deseas ejercer tu derecho de retracto, puedes radicar tu solicitud aquí con total respaldo.
              </p>
              <button
                onClick={() => onNavigate('terminos')}
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold hover:underline"
              >
                <span>Consultar Política de Reembolsos y Retracto</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userRefunds.map((refund) => {
                const statusConfig: Record<RefundStatus, { label: string; bg: string; text: string; border: string }> = {
                  SUBMITTED: { label: 'Recibida', bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' },
                  UNDER_REVIEW: { label: 'En Revisión Técnica', bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800' },
                  NEED_MORE_INFO: { label: 'Requiere Información', bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-800' },
                  APPROVED: { label: 'Reembolso Aprobado', bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800' },
                  REJECTED: { label: 'Rechazada con Justificación', bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-800' },
                  REFUND_PROCESSING: { label: 'Devolución en Trámite Bancario', bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800' },
                  REFUNDED: { label: 'Reintegro Confirmado', bg: 'bg-emerald-900', text: 'text-emerald-200', border: 'border-emerald-600' },
                  CLOSED: { label: 'Caso Finalizado', bg: 'bg-zinc-900', text: 'text-zinc-500', border: 'border-zinc-800' },
                };

                const currentConfig = statusConfig[refund.status] || statusConfig.SUBMITTED;

                return (
                  <div
                    key={refund.id}
                    className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800/90 hover:border-purple-500/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">{refund.id}</span>
                          <span className="text-zinc-500 text-xs">·</span>
                          <span className="text-zinc-400 text-xs font-mono">Orden: {refund.orderId}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{refund.reasonTitle}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border}`}
                        >
                          {currentConfig.label}
                        </span>
                        <span className="font-mono font-bold text-xs text-white">
                          ${refund.requestedAmountCOP.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 space-y-2">
                      <p className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                        <strong className="text-zinc-400 block mb-1">Descripción del Incidente:</strong>
                        {refund.reasonDescription}
                      </p>

                      {refund.adminNotes && (
                        <div className="bg-purple-950/30 p-3 rounded-xl border border-purple-900/50 text-purple-200">
                          <strong className="text-purple-300 block mb-1">Respuesta del Equipo StreamBox:</strong>
                          {refund.adminNotes}
                        </div>
                      )}

                      {refund.resolutionOffer && (
                        <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50 text-emerald-200">
                          <strong className="text-emerald-300 block mb-1">Solución Aplicada:</strong>
                          {refund.resolutionOffer}
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                          Trazabilidad del Caso ({refund.history.length} eventos):
                        </span>
                        <div className="space-y-1.5 pl-2 border-l border-zinc-800">
                          {refund.history.map((h, idx) => (
                            <div key={idx} className="text-[11px] text-zinc-400 flex items-start gap-2">
                              <span className="text-zinc-500 font-mono shrink-0">
                                {new Date(h.date).toLocaleDateString('es-CO')}
                              </span>
                              <span>·</span>
                              <span className="text-zinc-300 font-semibold">{h.actor}:</span>
                              <span>{h.note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Claim Modal */}
          {showRefundModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowRefundModal(false)}
              />

              <div className="relative w-full max-w-xl bg-[#14141F] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Radicar Reclamación / Solicitud de Reembolso
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-zinc-500 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!refundOrderId) {
                      alert('Debes seleccionar un pedido para radicar tu reclamación.');
                      return;
                    }
                    if (!refundTitle.trim() || !refundDescription.trim()) {
                      alert('Por favor describe los detalles de la situación.');
                      return;
                    }

                    const res = createRefundRequest(
                      refundOrderId,
                      refundReason,
                      refundTitle.trim(),
                      refundDescription.trim(),
                      refundIncidentDate,
                      refundContact
                    );

                    if (res.success) {
                      setShowRefundModal(false);
                      setRefundTitle('');
                      setRefundDescription('');
                    } else {
                      alert(res.message);
                    }
                  }}
                  className="space-y-4 text-xs"
                >
                  {/* Order Selector */}
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">
                      Pedido Relacionado: *
                    </label>
                    {userOrders.length === 0 ? (
                      <p className="text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/60">
                        No tienes pedidos registrados aún para radicar una reclamación.
                      </p>
                    ) : (
                      <select
                        value={refundOrderId}
                        onChange={(e) => setRefundOrderId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                        required
                      >
                        {userOrders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.id} — {o.items.map((i) => i.productName).join(', ')} (${o.totalCOP.toLocaleString('es-CO')} COP)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Reason Category */}
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">
                      Causal / Tipo de Situación: *
                    </label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="SERVICE_MALFUNCTION">Falla técnica / Interrupción durante la garantía</option>
                      <option value="ACTIVATION_FAILURE">Activación fallida o datos incompatibles</option>
                      <option value="DUPLICATE_PAYMENT">Pago duplicado en Nequi / Daviplata</option>
                      <option value="UNREGISTERED_PAYMENT">Transferencia realizada pero orden no registrada</option>
                      <option value="DELIVERY_TIMEOUT">Servicio no entregado en el plazo acordado</option>
                      <option value="WRONG_PRODUCT">Producto o modalidad diferente a la comprada</option>
                      <option value="LEGAL_RETRACTO">Ejercicio de Derecho de Retracto (Art. 47 Ley 1480)</option>
                      <option value="INCORRECT_CHARGE">Cobro o valor incorrecto verificado</option>
                      <option value="OTHER">Otro motivo justificado</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">
                      Título Breve de la Solicitud: *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Caída de perfil en Disney+ o Error en código de activación"
                      value={refundTitle}
                      onChange={(e) => setRefundTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">
                      Descripción Detallada de los Hechos: *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explica detalladamente qué ocurrió, qué mensaje de error apareció o la causa de tu solicitud..."
                      value={refundDescription}
                      onChange={(e) => setRefundDescription(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">
                        Fecha del Incidente:
                      </label>
                      <input
                        type="date"
                        value={refundIncidentDate}
                        onChange={(e) => setRefundIncidentDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-semibold mb-1">
                        Medio de Contacto Preferido:
                      </label>
                      <select
                        value={refundContact}
                        onChange={(e) => setRefundContact(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white"
                      >
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">Correo Electrónico</option>
                        <option value="CHAT_INTERNO">Chat en Plataforma</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Notice (Section 5 Requirement) */}
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200 text-[11px] leading-relaxed flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Blindaje de Seguridad:</strong> Por tu tranquilidad, nunca solicites ni envíes contraseñas bancarias personales, claves de tarjetas ni códigos OTP de autenticación.
                    </span>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowRefundModal(false)}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={userOrders.length === 0}
                      className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white disabled:opacity-50 cursor-pointer"
                    >
                      Radicar Solicitud Oficial
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: NOTIFICACIONES */}
      {activeTab === 'notificaciones' && (
        <div className="space-y-3">
          {userNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
              <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No tienes notificaciones</h3>
              <p className="text-xs text-zinc-500">
                Aquí recibirás avisos en tiempo real sobre tus pagos, entregas y promociones.
              </p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs cursor-pointer transition-colors ${
                  notif.read
                    ? 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400'
                    : 'bg-purple-950/20 border-purple-800/60 text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white">{notif.title}</h5>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {new Date(notif.createdAt).toLocaleTimeString('es-CO')}
                  </span>
                </div>

                {notif.linkTab && (
                  <button
                    onClick={() => {
                      if (notif.linkTab === 'chat') onNavigate('chat');
                      else if (notif.linkTab) setActiveTab(notif.linkTab);
                    }}
                    className="text-xs text-cyan-400 font-semibold hover:underline shrink-0"
                  >
                    Ver detalles
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: FAVORITOS */}
      {activeTab === 'favoritos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Mis Servicios Favoritos</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Servicios y plataformas que has guardado para acceso rápido y compras recurrentes.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {userFavoriteProducts.length} guardados
            </span>
          </div>

          {userFavoriteProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#14141F] border border-zinc-800 text-zinc-400">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Aún no tienes favoritos</h3>
              <p className="text-xs text-zinc-500 mb-6 max-w-md mx-auto">
                Haz clic en el corazón de cualquier servicio del catálogo para guardarlo aquí y comprarlo con un solo clic cuando lo necesites.
              </p>
              <button
                onClick={() => onNavigate('catalogo')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer"
              >
                Explorar Todo el Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFavoriteProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct || (() => onNavigate('catalogo'))}
                  onInstantBuy={onInstantBuy || (() => onNavigate('catalogo'))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PERFIL & PREFERENCIAS */}
      {activeTab === 'perfil' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Mi Perfil & Preferencias</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Administra tus datos de contacto en Colombia, canales de entrega y preferencias de compra.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Profile & Notification Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300">
                  Información Personal & Contacto
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Tu nombre completo"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Correo Electrónico (Principal)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificado
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Celular / WhatsApp (Colombia +57)
                    </label>
                    <div className="flex gap-2">
                      <span className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 font-mono">
                        +57
                      </span>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="Ej: 3045967068"
                        maxLength={10}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Indispensable para entrega automática de credenciales de streaming y soporte por WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-800/80 pt-5 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-300">
                    Preferencias de Notificaciones & Pagos
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={prefWhatsapp}
                        onChange={(e) => setPrefWhatsapp(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Alertas de Entrega y Renovación por WhatsApp
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Recibe confirmación inmediata de pago y accesos por WhatsApp cuando tu pedido sea procesado.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={prefEmail}
                        onChange={(e) => setPrefEmail(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Comprobantes y Facturas por Correo Electrónico
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Envío automático de recibo digital PDF y registro de garantía Ley 1480.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={prefPromos}
                        onChange={(e) => setPrefPromos(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Cupones y Promociones Exclusivas
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Códigos de descuento para renovaciones anticipadas y lanzamientos de nuevas plataformas.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Método de Pago Preferido:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPrefPayment('NEQUI')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                          prefPayment === 'NEQUI'
                            ? 'bg-purple-950/80 border-purple-500 text-white shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                        <span>Nequi (3045967068)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrefPayment('DAVIPLATA')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                          prefPayment === 'DAVIPLATA'
                            ? 'bg-purple-950/80 border-purple-500 text-white shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>Daviplata (3114139187)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Guardando...' : 'Guardar Datos y Preferencias'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Col: Loyalty Balance & Account Status */}
            <div className="space-y-6">
              {/* Loyalty Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C1635] via-[#141424] to-[#0F172A] border border-purple-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Programa StreamBox Rewards</span>
                  </div>
                  <Gift className="w-5 h-5 text-purple-400" />
                </div>

                <div>
                  <span className="text-xs text-zinc-400">Saldo de Puntos:</span>
                  <div className="text-3xl font-extrabold font-mono text-white mt-1">
                    {currentUser?.rewardPoints?.toLocaleString('es-CO') || '1.000'}{' '}
                    <span className="text-amber-400 text-sm font-normal">pts</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Equivalente a ${(currentUser?.rewardPoints || 1000).toLocaleString('es-CO')} COP aplicable en cupones de renovación.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5 text-xs">
                  <span className="text-zinc-400 font-semibold block text-[11px]">Tu Código de Referidos:</span>
                  <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 rounded-lg font-mono text-amber-300 font-bold">
                    <span>{currentUser?.referralCode || 'SB-REF-VIP'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentUser?.referralCode || 'SB-REF-VIP', 'ref-code')}
                      className="text-zinc-400 hover:text-white"
                      title="Copiar código"
                    >
                      {copiedKey === 'ref-code' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Comparte este código con tus amigos. Ambos recibirán 1.000 puntos en su primera compra.
                  </p>
                </div>
              </div>

              {/* Security & Account State */}
              <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-200 font-bold pb-2 border-b border-zinc-800">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Seguridad de la Cuenta</span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 py-1">
                  <span>Rol en la plataforma:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold text-[11px]">
                    {currentUser?.role || 'CLIENTE'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 py-1">
                  <span>Sesión segura:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Activa
                  </span>
                </div>

                <div className="flex justify-between items-center text-zinc-400 py-1">
                  <span>Registro:</span>
                  <span className="font-mono text-zinc-300 text-[11px]">
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString('es-CO')
                      : 'Octubre 2026'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Factura Oficial PDF */}
      <InvoiceModal
        order={selectedOrderForInvoice}
        settings={settings}
        isOpen={Boolean(selectedOrderForInvoice)}
        onClose={() => setSelectedOrderForInvoice(null)}
      />
    </div>
  );
};
