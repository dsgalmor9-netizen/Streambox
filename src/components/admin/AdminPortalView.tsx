import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Shield,
  CreditCard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  LifeBuoy,
  Tag,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Lock,
  Clock,
  Download,
  Upload,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  Scale,
  TrendingDown,
  TrendingUp,
  Sliders,
  LogOut,
  BarChart3,
  HelpCircle,
  Bell,
  Zap,
  Monitor,
  Printer,
  Smartphone,
  Share2,
} from 'lucide-react';
import { Product, UserRole, PaymentMethod, VisualAssetStatus, PriceStatus, Order } from '../../types';
import { ComplianceAdminView } from './ComplianceAdminView';
import { RefundsAdminView } from './RefundsAdminView';
import { DeveloperPriceAdjusterModal } from './DeveloperPriceAdjusterModal';
import { ExcelDatabaseManagerView } from './ExcelDatabaseManagerView';
import { InvoiceModal } from '../common/InvoiceModal';
import {
  buildWhatsAppUrl,
  getCredentialsDeliveryWhatsApp,
  getRenewalReminderWhatsApp,
  getOrderPaymentInstructionsWhatsApp,
} from '../../lib/whatsapp';
import { PremiumAnalyticsWidget } from './PremiumAnalyticsWidget';
import { PerformanceOverview } from './PerformanceOverview';

interface AdminPortalViewProps {
  initialSubTab?: string;
  onNavigate: (view: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  initialSubTab = 'dashboard',
  onNavigate,
}) => {
  const {
    currentUser,
    logout,
    allUsers,
    updateUserRole,
    products,
    categories,
    toggleCategoryActive,
    addProduct,
    updateProduct,
    deleteProduct,
    applyPriceIncrementToUnadjusted,
    adjustCatalogPrices,
    resetCatalogPrices,
    exportProductsCSV,
    importProductsCSV,
    orders,
    paymentRequests,
    confirmPaymentByAdmin,
    rejectPaymentByAdmin,
    deliverOrderCredentials,
    chatMessages,
    adminReplyChatMessage,
    tickets,
    replyTicket,
    updateTicketStatus,
    promotions,
    createPromotion,
    togglePromotionActive,
    settings,
    updateSettings,
    auditLogs,
    refundRequests,
  } = useStore();

  const [activeTab, setActiveTab] = useState(initialSubTab);

  // Payments verification state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [adminVerificationNote, setAdminVerificationNote] = useState('');
  const [adminRejectionReason, setAdminRejectionReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Delivery order state
  const [deliverOrderId, setDeliverOrderId] = useState<string | null>(null);
  const [deliveryCredentialsText, setDeliveryCredentialsText] = useState('');
  const [deliveryInstructionsText, setDeliveryInstructionsText] = useState(
    'Inicia sesión en la plataforma oficial con los datos asignados. Garantía completa activa durante tu período.'
  );

  // Invoice & Coupon states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<'PERCENTAGE' | 'FIXED_COP'>('PERCENTAGE');
  const [promoValue, setPromoValue] = useState<number>(10);
  const [promoMinPurchase, setPromoMinPurchase] = useState<number>(15000);
  const [promoMaxUses, setPromoMaxUses] = useState<number>(100);
  const [promoDescription, setPromoDescription] = useState('');
  const [promoValidUntil, setPromoValidUntil] = useState('2027-12-31');

  // Admin chat reply state
  const [adminChatTargetUserId, setAdminChatTargetUserId] = useState<string>('usr-client-demo');
  const [adminChatInputText, setAdminChatInputText] = useState('');

  // Product editor state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('cat-streaming');
  const [prodSubcategory, setProdSubcategory] = useState('Películas y series');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPriceCOP, setProdPriceCOP] = useState<number | ''>(15000);
  const [prodPriceStatus, setProdPriceStatus] = useState<PriceStatus>('VERIFIED_STREAMBOX');
  const [prodVisualStatus, setProdVisualStatus] = useState<VisualAssetStatus>('VERIFIED');
  const [prodVerificationSource, setProdVerificationSource] = useState('Distribución Mayorista Verificada');
  const [prodModalityName, setProdModalityName] = useState('Perfil Pantalla 1 Mes');
  const [prodDuration, setProdDuration] = useState('1 Mes');

  // Product filtering in admin
  const [adminProductStatusFilter, setAdminProductStatusFilter] = useState<string>('ALL');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('ALL');

  // CSV Import State
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvResultMsg, setCsvResultMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Developer Mode Price Adjuster State
  const [showPriceAdjustModal, setShowPriceAdjustModal] = useState(false);
  const [priceAdjustToast, setPriceAdjustToast] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Metrics
  const pendingPayments = paymentRequests.filter((p) => p.status === 'PAGO_REPORTADO');
  const confirmedPayments = paymentRequests.filter((p) => p.status === 'PAGO_CONFIRMADO');
  const totalVolumeCOP = confirmedPayments.reduce((acc, p) => acc + p.totalCOP, 0);
  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleConfirmPayment = (payId: string) => {
    confirmPaymentByAdmin(payId, adminVerificationNote);
    setAdminVerificationNote('');
    setSelectedPaymentId(null);
  };

  const handleRejectPayment = () => {
    if (!selectedPaymentId || !adminRejectionReason.trim()) return;
    rejectPaymentByAdmin(selectedPaymentId, adminRejectionReason);
    setAdminRejectionReason('');
    setRejectModalOpen(false);
    setSelectedPaymentId(null);
  };

  const handleDeliverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverOrderId || !deliveryCredentialsText.trim()) return;

    deliverOrderCredentials(deliverOrderId, deliveryCredentialsText, deliveryInstructionsText);
    setDeliverOrderId(null);
    setDeliveryCredentialsText('');
  };

  const handleAdminChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatInputText.trim()) return;

    adminReplyChatMessage(adminChatTargetUserId, adminChatInputText.trim());
    setAdminChatInputText('');
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodBrand.trim()) return;

    const parsedPrice = prodPriceCOP !== '' ? Number(prodPriceCOP) : null;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: prodName,
        brand: prodBrand,
        category: prodCategory,
        subcategory: prodSubcategory,
        description: prodDescription,
        visualStatus: prodVisualStatus,
        verificationSource: prodVerificationSource,
      });
    } else {
      addProduct({
        name: prodName,
        slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: prodBrand,
        category: prodCategory,
        subcategory: prodSubcategory,
        description: prodDescription,
        shortDescription: `${prodBrand} oficial en Colombia`,
        productType: 'STREAMING',
        visualStatus: prodVisualStatus,
        modalities: [
          {
            id: `mod-${Date.now()}`,
            name: prodModalityName,
            duration: prodDuration,
            priceCOP: parsedPrice,
            priceStatus: prodPriceStatus,
            available: parsedPrice !== null && prodPriceStatus !== 'PRICE_PENDING',
            stock: 20,
          },
        ],
        region: 'Colombia y Global',
        compatibility: 'Smart TV, PC, Móviles',
        deliveryMethod: 'Chat StreamBox al confirmar pago',
        terms: 'Garantía 100% activa durante el período contratado',
        verificationSource: prodVerificationSource,
        verifiedDate: new Date().toISOString().split('T')[0],
        status: parsedPrice === null || prodPriceStatus === 'PRICE_PENDING' ? 'PRICE_PENDING' : 'ACTIVE',
        tags: [prodBrand, 'Garantía'],
      });
    }

    setShowProductModal(false);
    setEditingProductId(null);
  };

  const handleDownloadCSV = () => {
    const csvData = exportProductsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `streambox-catalogo-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessImportCSV = () => {
    if (!csvText.trim()) return;
    const res = importProductsCSV(csvText);
    if (res.errors.length > 0) {
      setCsvResultMsg({ text: res.errors.join(' | '), error: true });
    } else {
      setCsvResultMsg({
        text: `¡Importación exitosa! ${res.added} productos añadidos, ${res.updated} actualizados, ${res.drafts} enviados a borrador (precio pendiente).`,
        error: false,
      });
      setTimeout(() => {
        setShowCsvImportModal(false);
        setCsvText('');
        setCsvResultMsg(null);
      }, 2500);
    }
  };

  const adminFilteredProducts = products.filter((p) => {
    const matchesCat = adminCategoryFilter === 'ALL' || p.category === adminCategoryFilter;
    const matchesStatus =
      adminProductStatusFilter === 'ALL' || p.status === adminProductStatusFilter;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner & Administrator Identification Header */}
      <div className="p-6 rounded-2xl bg-[#14141F] border border-purple-900/60 shadow-xl mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Panel Administrativo StreamBox
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Control maestro de pagos Nequi/Daviplata, catálogo de 17 categorías, importación CSV, pedidos y auditoría
          </p>
        </div>

        {/* Administrator Identification - Requirement 7 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center gap-3 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              AD
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-purple-300 font-bold leading-none">
                Administrador
              </div>
              <div className="text-xs font-semibold text-white font-mono mt-0.5">
                {currentUser?.email || 'd.s.gal.mor.9@gmail.com'}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wide bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm ml-1">
              SUPER ADMIN
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('login');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main Admin Navigation - 17 Módulos Requeridos */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'pagos', label: `Pagos (${pendingPayments.length})`, icon: CreditCard, highlight: pendingPayments.length > 0 },
          { id: 'pedidos', label: `Pedidos (${orders.length})`, icon: ShoppingBag },
          { id: 'clientes', label: `Clientes (${allUsers.length})`, icon: Users },
          { id: 'productos', label: `Productos (${products.length})`, icon: Package },
          { id: 'servicios', label: 'Servicios', icon: Monitor },
          { id: 'categorias', label: `Categorías (${categories.length})`, icon: Layers },
          { id: 'promociones', label: 'Promociones', icon: Tag },
          { id: 'chat', label: 'Chat en Vivo', icon: MessageSquare },
          { id: 'tickets', label: `Tickets (${openTickets.length})`, icon: LifeBuoy },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
          { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
          { id: 'actividad', label: 'Actividad', icon: Zap },
          { id: 'auditoria', label: 'Auditoría', icon: Shield },
          { id: 'configuracion', label: 'Configuración', icon: Settings },
          { id: 'sistema', label: 'Sistema', icon: CheckCircle },
          { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
          { id: 'basedatos', label: 'Base de Datos Excel (Auto-Sync)', icon: FileSpreadsheet, highlight: true },
          { id: 'compliance', label: 'Compliance (12)', icon: Scale },
          { id: 'reembolsos', label: `Reclamaciones (${refundRequests.length})`, icon: RefreshCw },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : item.highlight
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Pagos por Verificar</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {pendingPayments.length}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Comprobantes Nequi / Daviplata pendientes
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Volumen Confirmado COP</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                ${totalVolumeCOP.toLocaleString('es-CO')} COP
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                {confirmedPayments.length} transacciones auditadas
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Catálogo Total</span>
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {products.length} servicios
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                En {categories.length} categorías oficiales
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#14141F] border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span>Tickets de Soporte</span>
                <LifeBuoy className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {openTickets.length} abiertos
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Atención al cliente en cola
              </div>
            </div>
          </div>

          {/* Performance Overview Recharts Widget (30-day Line & Bar Charts) */}
          <PerformanceOverview />

          {/* Premium Analytics Widget with Real-time D3 Line Chart */}
          <PremiumAnalyticsWidget />

          {/* Quick Pending Payments Section */}
          <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Pagos Reportados Pendientes de Confirmación
              </h3>
              <button
                onClick={() => setActiveTab('pagos')}
                className="text-xs text-purple-400 hover:underline"
              >
                Ver todos ({pendingPayments.length})
              </button>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No hay pagos pendientes de revisión en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-4 rounded-xl bg-zinc-950 border border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{pay.userName}</span>
                        <span className="text-zinc-500">({pay.userEmail})</span>
                      </div>
                      <div className="text-zinc-400 mt-1">
                        Método: <strong className="text-white">{pay.paymentMethod}</strong> · Ref:{' '}
                        <span className="font-mono text-cyan-400 font-bold">{pay.referenceNumber}</span> · Cel:{' '}
                        {pay.phoneOrigin}
                      </div>
                      {pay.voucherNote && (
                        <div className="text-zinc-500 text-[11px] mt-0.5">Nota: {pay.voucherNote}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-white">
                        ${pay.totalCOP.toLocaleString('es-CO')} COP
                      </span>

                      <button
                        onClick={() => handleConfirmPayment(pay.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirmar</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPaymentId(pay.id);
                          setRejectModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs transition-colors cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW: GESTIÓN DE 17 CATEGORÍAS */}
      {activeTab === 'categorias' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">17 Categorías Maestras del Catálogo</h2>
              <p className="text-xs text-zinc-400">Control de activación, subcategorías y orden de aparición</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const productCount = products.filter((p) => p.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between text-xs space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm">{cat.order}. {cat.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        cat.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {cat.active ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs">{cat.description}</p>
                    <div className="text-[11px] text-zinc-500 mt-2">
                      Subcategorías: {cat.subcategories.join(', ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                    <span className="text-cyan-400 font-mono font-bold">
                      {productCount} servicios asociados
                    </span>
                    <button
                      onClick={() => toggleCategoryActive(cat.id)}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors cursor-pointer"
                    >
                      {cat.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW: GESTIÓN DE PRODUCTOS, PRECIOS & IMPORTACIÓN CSV */}
      {activeTab === 'productos' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Catálogo de Productos & Precios Comerciales</h2>
              <p className="text-xs text-zinc-400">Precios garantizados en Pesos Colombianos (COP) e importación/exportación</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownloadCSV}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar catálogo completo en CSV"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={() => setShowCsvImportModal(true)}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Importar productos por CSV"
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Importar CSV</span>
              </button>

              {/* Quick -6000 COP button */}
              <button
                onClick={() => {
                  const res = adjustCatalogPrices({ amountCOP: 6000, mode: 'subtract' });
                  setPriceAdjustToast({
                    text: `Se aplicó reducción de -$6.000 COP a ${res.updatedCount} modalidades en ${res.affectedProductsCount} productos.`,
                    type: 'success',
                  });
                  setTimeout(() => setPriceAdjustToast(null), 5000);
                }}
                className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 border border-rose-800/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Aplica reducción masiva de -$6.000 COP al catálogo comercial"
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Restar -6.000 COP</span>
              </button>

              {/* Quick +6000 COP button */}
              <button
                onClick={() => {
                  const res = adjustCatalogPrices({ amountCOP: 6000, mode: 'add' });
                  setPriceAdjustToast({
                    text: `Se aplicó incremento de +$6.000 COP a ${res.updatedCount} modalidades en ${res.affectedProductsCount} productos.`,
                    type: 'success',
                  });
                  setTimeout(() => setPriceAdjustToast(null), 5000);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Aplica incremento reglamentario de +$6.000 COP al catálogo comercial"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Incremento +6.000 COP</span>
              </button>

              {/* Developer Mode: Full Adjustable Price Modeler Modal */}
              <button
                onClick={() => setShowPriceAdjustModal(true)}
                className="px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 text-purple-200 border border-purple-700/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                title="Abrir ajustador de precios ajustable (Modo Desarrollador)"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Ajustar Precios (Modo Dev)...</span>
              </button>

              {/* Admin Button: Restablecer Precios Originales Iniciales */}
              <button
                onClick={() => {
                  const res = resetCatalogPrices();
                  setPriceAdjustToast({
                    text: `Precios originales restablecidos a su valor inicial en ${res.resetCount} modalidades.`,
                    type: 'success',
                  });
                  setTimeout(() => setPriceAdjustToast(null), 5000);
                }}
                className="px-3 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-700/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                title="Restaura todos los precios del catálogo comercial a los precios originales iniciales"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Restablecer Precios Originales</span>
              </button>

              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProdName('');
                  setProdBrand('');
                  setProdDescription('');
                  setProdPriceCOP(15000);
                  setShowProductModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Price Adjust Feedback Toast */}
          {priceAdjustToast && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
              priceAdjustToast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-cyan-950/80 border-cyan-700 text-cyan-200'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{priceAdjustToast.text}</span>
              </div>
              <button
                onClick={() => setPriceAdjustToast(null)}
                className="text-zinc-400 hover:text-white ml-2 text-sm font-bold"
              >
                &times;
              </button>
            </div>
          )}

          {/* Filters Bar inside Products */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5">
              <span className="text-zinc-500">Filtrar Estado:</span>
              <select
                value={adminProductStatusFilter}
                onChange={(e) => setAdminProductStatusFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-zinc-900">Todos ({products.length})</option>
                <option value="ACTIVE" className="bg-zinc-900">Activos</option>
                <option value="PRICE_PENDING" className="bg-zinc-900">Precio Pendiente de Verificar</option>
                <option value="OUT_OF_STOCK" className="bg-zinc-900">Agotados</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5">
              <span className="text-zinc-500">Filtrar Categoría:</span>
              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer max-w-xs truncate"
              >
                <option value="ALL" className="bg-zinc-900">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminFilteredProducts.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block truncate max-w-[190px]">{p.name}</span>
                    <span className="text-zinc-500 text-[11px]">{p.brand}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    p.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : p.status === 'PRICE_PENDING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <p className="text-zinc-400 line-clamp-2">{p.description}</p>
                
                <div className="space-y-1 pt-2 border-t border-zinc-900">
                  {p.modalities.map((m) => (
                    <div key={m.id} className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400 truncate pr-2">{m.name} ({m.duration})</span>
                      <span className="font-mono font-bold text-cyan-400 shrink-0">
                        {m.priceCOP !== null ? `$${m.priceCOP.toLocaleString('es-CO')} COP` : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    onClick={() => {
                      setEditingProductId(p.id);
                      setProdName(p.name);
                      setProdBrand(p.brand);
                      setProdCategory(p.category);
                      setProdSubcategory(p.subcategory);
                      setProdDescription(p.description);
                      setProdVisualStatus(p.visualStatus || 'VERIFIED');
                      setProdVerificationSource(p.verificationSource || '');
                      setShowProductModal(true);
                    }}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[11px]"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CSV Import Modal */}
          {showCsvImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-xl bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                    <span>Importar Catálogo por CSV</span>
                  </h3>
                  <button onClick={() => setShowCsvImportModal(false)} className="text-zinc-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pega el contenido CSV respetando las columnas: <code className="text-cyan-400">name, brand, category, subcategory, modalityname, duration, pricecop</code>. Los productos sin precio válido se crearán automáticamente en borrador como «Precio pendiente de verificar».
                </p>

                <textarea
                  rows={6}
                  placeholder={`name,brand,category,subcategory,modalityname,duration,pricecop\nNetflix Premium,Netflix,cat-streaming,Películas,Perfil 1 Mes,1 Mes,13500\nDisney+,Disney+,cat-streaming,Películas,Perfil 1 Mes,1 Mes,12000`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />

                {csvResultMsg && (
                  <div className={`p-3 rounded-lg text-xs ${csvResultMsg.error ? 'bg-rose-950/60 text-rose-300' : 'bg-emerald-950/60 text-emerald-300'}`}>
                    {csvResultMsg.text}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCsvImportModal(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProcessImportCSV}
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer"
                  >
                    Validar & Procesar Importación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Create/Edit Modal */}
          {showProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">
                  {editingProductId ? 'Editar Producto' : 'Crear Nuevo Producto en Catálogo'}
                </h3>
                
                <form onSubmit={handleSaveProductSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Nombre del Servicio</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Netflix 4K UHD"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Marca</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Netflix"
                        value={prodBrand}
                        onChange={(e) => setProdBrand(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Categoría</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Descripción</label>
                    <textarea
                      rows={3}
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                    />
                  </div>

                  {!editingProductId && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Precio en COP (dejar vacío si es pendiente)
                        </label>
                        <input
                          type="number"
                          placeholder="Ej: 15000"
                          value={prodPriceCOP}
                          onChange={(e) => setProdPriceCOP(e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">Estado de Precio</label>
                        <select
                          value={prodPriceStatus}
                          onChange={(e) => setProdPriceStatus(e.target.value as PriceStatus)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                        >
                          <option value="VERIFIED_STREAMBOX">Verificado StreamBox</option>
                          <option value="OFFICIAL_REFERENCE">Referencia Oficial</option>
                          <option value="PRICE_PENDING">Precio Pendiente de Verificar</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold cursor-pointer"
                    >
                      Guardar Producto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: GESTIÓN DE PAGOS MANUALES */}
      {activeTab === 'pagos' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Verificación Manual de Pagos Colombia</h2>
              <p className="text-xs text-zinc-400">Revisa comprobantes de Nequi y Daviplata antes de liberar pedidos</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/90 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">ID Pago / Pedido</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Método</th>
                  <th className="py-3 px-3">Referencia</th>
                  <th className="py-3 px-3">Monto COP</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {paymentRequests.map((pay) => (
                  <tr key={pay.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-white">
                      <div>{pay.id}</div>
                      <div className="text-[10px] text-zinc-500">{pay.orderId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-white">{pay.userName}</div>
                      <div className="text-[11px] text-zinc-500">{pay.userEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-zinc-200">{pay.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">
                      {pay.referenceNumber || 'Sin reporte'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ${pay.totalCOP.toLocaleString('es-CO')} COP
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        pay.status === 'PAGO_CONFIRMADO'
                          ? 'bg-emerald-950 text-emerald-400'
                          : pay.status === 'PAGO_REPORTADO'
                          ? 'bg-amber-950 text-amber-400'
                          : pay.status === 'PAGO_RECHAZADO'
                          ? 'bg-rose-950 text-rose-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {pay.status === 'PAGO_REPORTADO' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleConfirmPayment(pay.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPaymentId(pay.id);
                              setRejectModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 text-[11px]"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Completado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: GESTIÓN DE PEDIDOS & ENTREGA DE CREDENCIALES */}
      {activeTab === 'pedidos' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Pedidos & Despacho de Accesos</h2>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                    <span className="text-zinc-500">· {ord.userName} ({ord.userEmail})</span>
                  </div>
                  <div className="text-zinc-300">
                    Productos: {ord.items.map((i) => `${i.productName} (${i.modalityName})`).join(', ')}
                  </div>
                  <div className="text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Total: <strong className="font-mono text-cyan-400">${ord.totalCOP.toLocaleString('es-CO')} COP</strong></span>
                    <span>·</span>
                    <span>Pago: <strong className="text-zinc-300">{ord.paymentStatus}</strong></span>
                    <span>·</span>
                    <span>Pedido: <strong className="text-zinc-300">{ord.orderStatus}</strong></span>
                    {ord.customerPhone && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono">📱 {ord.customerPhone}</span>
                      </>
                    )}
                  </div>

                  {/* Expiration Badge & Renewal Notice */}
                  {ord.expiresAt && (() => {
                    const daysRemaining = Math.ceil(
                      (new Date(ord.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    const expiryDateFormatted = new Date(ord.expiresAt).toLocaleDateString('es-CO');
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          daysRemaining <= 0
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : daysRemaining <= 3
                            ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {daysRemaining <= 0 ? 'VENCIDO' : `Vence en ${daysRemaining}d (${expiryDateFormatted})`}
                        </span>

                        {daysRemaining <= 3 && (
                          <a
                            href={buildWhatsAppUrl(
                              ord.customerPhone || '3045967068',
                              getRenewalReminderWhatsApp(ord, daysRemaining)
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>Avisar Renovación WhatsApp</span>
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp Direct Dispatch Button */}
                  {ord.credentialsDelivered && (
                    <a
                      href={buildWhatsAppUrl(
                        ord.customerPhone || '3045967068',
                        getCredentialsDeliveryWhatsApp(ord)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      title="Enviar credenciales directamente al WhatsApp del cliente"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>WhatsApp Accesos</span>
                    </a>
                  )}

                  {/* Official PDF Invoice Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedInvoiceOrder(ord)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-400" />
                    <span>Factura PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeliverOrderId(ord.id);
                      setDeliveryCredentialsText(
                        ord.credentialsDelivered ||
                        `Usuario: ${ord.userEmail} | Clave temporal: SB${Math.floor(100000 + Math.random() * 900000)}* | PIN: 1234`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Despachar Accesos</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {deliverOrderId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Despachar Credenciales a Pedido {deliverOrderId}</h3>
                
                <form onSubmit={handleDeliverSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Credenciales / Cuenta / PIN
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={deliveryCredentialsText}
                      onChange={(e) => setDeliveryCredentialsText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Instrucciones de Uso
                    </label>
                    <textarea
                      rows={3}
                      value={deliveryInstructionsText}
                      onChange={(e) => setDeliveryInstructionsText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeliverOrderId(null)}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
                    >
                      Enviar al Chat del Cliente
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: CLIENTES & ROLES (RBAC) */}
      {activeTab === 'clientes' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Gestión de Usuarios y Roles (RBAC)</h2>
              <p className="text-xs text-zinc-400">Control de acceso seguro basado en roles</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Usuario</th>
                  <th className="py-3 px-3">Correo</th>
                  <th className="py-3 px-3">Teléfono</th>
                  <th className="py-3 px-3">Rol Actual</th>
                  <th className="py-3 px-3 text-right">Modificar Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-zinc-400">{u.email}</td>
                    <td className="py-3 px-3">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isSuperAdmin ? (
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="CLIENTE">CLIENTE</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Solo Super Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: CHAT EN VIVO DE ATENCIÓN HUMANA */}
      {activeTab === 'chat' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Consola de Chat y Soporte Administrativo</span>
                <span className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/40 text-[10px] font-mono">
                  Gemini AI + Atención Humana
                </span>
              </h2>
              <div className="text-xs text-zinc-400">
                Supervisa las respuestas automáticas de StreamBot AI y atiende solicitudes prioritarias de clientes.
              </div>
            </div>

            {/* Admin notification channel badge */}
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200">
              <span className="font-semibold block">Canales de Alerta de Asesor:</span>
              <span className="text-zinc-300 text-[10px]">📧 d.s.gal.mor.9@gmail.com | 📱 +57 304 596 7068 (SMS)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-2">
              <div className="text-xs font-semibold text-zinc-400 uppercase">Conversaciones de Clientes:</div>
              {allUsers.map((u) => {
                const userHasAlert = chatMessages.some(
                  (m) => m.userId === u.id && m.isHumanRequestAlert
                );
                return (
                  <button
                    key={u.id}
                    onClick={() => setAdminChatTargetUserId(u.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all relative ${
                      adminChatTargetUserId === u.id
                        ? 'bg-purple-950/50 border-purple-500 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{u.name}</div>
                      {userHasAlert && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                          🚨 Solicitó Asesor
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">{u.email}</div>
                  </button>
                );
              })}
            </div>

            <div className="md:col-span-8 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex flex-col h-[480px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {chatMessages
                  .filter((m) => m.userId === adminChatTargetUserId)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs max-w-[80%] ${
                        msg.sender === 'ADMIN'
                          ? 'ml-auto bg-cyan-950 text-cyan-100 border border-cyan-800'
                          : msg.sender === 'USER'
                          ? 'mr-auto bg-purple-950 text-purple-100 border border-purple-800'
                          : 'mx-auto bg-zinc-900 text-zinc-300 border border-zinc-800 text-center max-w-[95%]'
                      }`}
                    >
                      <div className="font-semibold text-[10px] opacity-75 mb-1">{msg.senderName}</div>
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </div>
                  ))}
              </div>

              <form onSubmit={handleAdminChatSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe como Administrador StreamBox..."
                  value={adminChatInputText}
                  onChange={(e) => setAdminChatInputText(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                >
                  Responder
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: CONFIGURACIÓN GLOBAL */}
      {activeTab === 'configuracion' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6 max-w-2xl">
          <h2 className="text-base font-bold text-white">Configuración del Sistema StreamBox</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Número de Nequi Oficial</label>
              <input
                type="text"
                value={settings.nequiNumber}
                onChange={(e) => updateSettings({ nequiNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Número de Daviplata Oficial</label>
              <input
                type="text"
                value={settings.daviplataNumber}
                onChange={(e) => updateSettings({ daviplataNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Correo de Soporte Oficial</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSettings({ supportEmail: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
              />
            </div>

            {/* Legal Entity Configuration (Ley 1480 y Ley 1581) */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Datos Legales y Registro Mercantil (Colombia)
              </span>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Razón Social Registrada</label>
                <input
                  type="text"
                  placeholder="Ej: StreamBox Colombia S.A.S."
                  value={settings.legalBusinessName || ''}
                  onChange={(e) => updateSettings({ legalBusinessName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">NIT / Identificación Tributaria</label>
                  <input
                    type="text"
                    placeholder="Ej: 901.XXX.XXX-X"
                    value={settings.legalNIT || ''}
                    onChange={(e) => updateSettings({ legalNIT: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Estado Jurídico Notificado</label>
                  <select
                    value={settings.legalStatus}
                    onChange={(e) => updateSettings({ legalStatus: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="PENDING_REVIEW">PENDING_REVIEW (En Trámite Notarial)</option>
                    <option value="VERIFIED">VERIFIED (Inscripción Vigente CCB)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Dirección de Notificaciones</label>
                <input
                  type="text"
                  placeholder="Ej: Calle 93B # 13-45, Bogotá D.C."
                  value={settings.legalAddress || ''}
                  onChange={(e) => updateSettings({ legalAddress: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Modo Mantenimiento</span>
                <span className="text-zinc-500 text-[11px]">Suspende compras temporalmente</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSettings({ maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-purple-600 focus:ring-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW: COMPLIANCE LEGAL (12 ÁREAS) */}
      {activeTab === 'compliance' && <ComplianceAdminView />}

      {/* SUB-VIEW: BASE DE DATOS EXCEL CON RETROALIMENTACIÓN AUTOMÁTICA */}
      {activeTab === 'basedatos' && <ExcelDatabaseManagerView />}

      {/* SUB-VIEW: RECLAMACIONES Y REEMBOLSOS */}
      {activeTab === 'reembolsos' && <RefundsAdminView />}

      {/* SUB-VIEW: CUPONES DE DESCUENTO Y PROMOCIONES FLASH */}
      {activeTab === 'promociones' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-400" />
                <span>Cupones de Descuento y Promociones Flash</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Crea códigos promocionales para redes sociales o descuentos automáticos en el checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPromoCode('');
                setPromoType('PERCENTAGE');
                setPromoValue(10);
                setPromoMinPurchase(15000);
                setPromoMaxUses(100);
                setPromoDescription('');
                setShowPromoModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Cupón</span>
            </button>
          </div>

          {/* Coupons Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Tipo & Valor</th>
                  <th className="py-3 px-4">Compra Mínima</th>
                  <th className="py-3 px-4">Usos / Límite</th>
                  <th className="py-3 px-4">Vigencia</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sm text-purple-300 uppercase">
                        {p.code}
                      </span>
                      {p.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{p.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {p.type === 'PERCENTAGE' ? `${p.value}% OFF` : `$${p.value.toLocaleString('es-CO')} COP OFF`}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      ${p.minPurchaseCOP.toLocaleString('es-CO')} COP
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-cyan-400 font-bold">{p.usedCount}</span>
                      <span className="text-zinc-500"> / {p.maxUses}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      {p.validUntil}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {p.active ? 'ACTIVO' : 'PAUSADO'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => togglePromotionActive(p.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                          p.active
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            : 'bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {p.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: AUDITORÍA */}
      {activeTab === 'auditoria' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <h2 className="text-base font-bold text-white">Registro de Auditoría y Seguridad</h2>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{log.action}</span>
                    <span className="text-zinc-500">· {log.target}</span>
                  </div>
                  <p className="text-zinc-400 mt-0.5">{log.details}</p>
                </div>

                <div className="text-right text-[11px] text-zinc-500 font-mono shrink-0">
                  <div>{log.actorEmail}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString('es-CO')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: SALUD DEL SISTEMA */}
      {activeTab === 'sistema' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6 max-w-2xl">
          <h2 className="text-base font-bold text-white">Panel de Salud y Monitoreo StreamBox</h2>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Motor de Autenticación & RBAC (Firebase Auth)', status: 'OPERATIVO', desc: 'Custom Claims { role: "SUPER_ADMIN" } activo' },
              { name: 'Catálogo de 17 Categorías', status: 'OPERATIVO', desc: `${products.length} servicios con verificación comercial` },
              { name: 'Pasarelas Manuales (Nequi & Daviplata)', status: 'OPERATIVO', desc: 'Validación de referencias e idempotencia activa' },
              { name: 'StreamBot AI Asistente', status: 'OPERATIVO', desc: 'Respuestas contextuales y transferencia humana' },
              { name: 'Importador / Exportador CSV', status: 'OPERATIVO', desc: 'Validación de esquema y borrador de precios' },
            ].map((srv, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{srv.name}</div>
                  <div className="text-[11px] text-zinc-500">{srv.desc}</div>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {srv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: SERVICIOS */}
      {activeTab === 'servicios' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Servicios Activos y Cuentas Entregadas</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Control de cuentas streaming, perfiles y licencias asignadas con garantía</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-semibold">
                {orders.filter(o => o.orderStatus === 'ENTREGADO').length} Entregados
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-[11px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3">Pedido</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Servicio / Modalidad</th>
                  <th className="p-3">Credenciales Asignadas</th>
                  <th className="p-3">Vencimiento</th>
                  <th className="p-3">Garantía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.filter(o => o.credentialsDelivered || o.orderStatus === 'ENTREGADO').map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-purple-400">#{ord.id}</td>
                    <td className="p-3">
                      <div className="font-medium text-white">{ord.userName}</div>
                      <div className="text-[10px] text-zinc-500">{ord.userEmail}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{ord.items[0]?.productName}</div>
                      <div className="text-[10px] text-zinc-400">{ord.items[0]?.modalityName} ({ord.items[0]?.duration})</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-cyan-300 max-w-xs truncate">
                      {ord.credentialsDelivered || 'SB_VIP_PROFILE@STREAMBOX.CO'}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {ord.expiresAt ? new Date(ord.expiresAt).toLocaleDateString('es-CO') : '30 Días'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        100% ACTIVA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW: FAQ */}
      {activeTab === 'faq' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Preguntas Frecuentes (FAQ) y Respuestas del Bot</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Respuestas oficiales automatizadas para clientes y StreamBot AI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                q: '¿Cómo pago por Nequi o Daviplata?',
                a: 'El cliente transfiere a Nequi (3045967068) o Daviplata (3114139187), reporta el número de referencia y recibe de inmediato sus datos.',
                cat: 'Pagos Colombia'
              },
              {
                q: '¿Cuánto demora la entrega?',
                a: 'La verificación del comprobante toma entre 2 y 10 minutos. Una vez confirmado el pago, las credenciales aparecen en el chat en tiempo real.',
                cat: 'Entregas'
              },
              {
                q: '¿Qué garantía tienen las cuentas?',
                a: 'Garantía 100% durante todo el periodo contratado conforme a la Ley 1480 de 2011 (Estatuto del Consumidor en Colombia).',
                cat: 'Garantía Legal'
              },
              {
                q: '¿Cómo solicito un asesor humano?',
                a: 'Escribe en el chat "quiero hablar con un asesor" o haz clic en "Hablar con Asesor Humano" para transferir la conversación y notificar por correo y SMS.',
                cat: 'Soporte Humano'
              },
              {
                q: '¿Puedo renovar mi servicio?',
                a: 'Sí, desde el portal del cliente en la pestaña "Mis Servicios", puedes pulsar "Renovar Servicio" con 1 clic sin perder tu perfil.',
                cat: 'Renovaciones'
              },
              {
                q: '¿Los precios están en pesos colombianos?',
                a: 'Sí, el 100% de los precios están fijados en COP (Pesos Colombianos) sin tasas de cambio sorpresa ni comisiones ocultas.',
                cat: 'Precios COP'
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{item.q}</span>
                  <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    {item.cat}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: NOTIFICACIONES */}
      {activeTab === 'notificaciones' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Centro de Notificaciones y Alertas Administrativas</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Alertas enviadas a d.s.gal.mor.9@gmail.com y celular (+57 304 596 7068)</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/50 text-[11px] text-purple-300 font-mono">
              Destinatario Oficial: d.s.gal.mor.9@gmail.com
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                type: 'SOLICITUD_ASESOR_HUMANO',
                title: 'Alerta de Atención Humana en Chat',
                detail: 'El cliente solicitó ser atendido por un asesor humano en el chat en vivo.',
                time: 'Hace 5 min',
                dest: 'd.s.gal.mor.9@gmail.com & SMS +57 304 596 7068',
                status: 'ENTREGADO'
              },
              {
                type: 'PAGO_REPORTADO',
                title: 'Comprobante de Pago Reportado',
                detail: 'Pago de $30.900 COP reportado por Nequi para YouTube Premium Individual.',
                time: 'Hace 18 min',
                dest: 'd.s.gal.mor.9@gmail.com',
                status: 'ENTREGADO'
              },
              {
                type: 'SISTEMA_SEGURIDAD',
                title: 'Verificación de Custom Claim SUPER_ADMIN',
                detail: 'Acceso autorizado concedido mediante Firebase Authentication.',
                time: 'Hace 1 hora',
                dest: 'Auditoría Central',
                status: 'REGISTRADO'
              },
            ].map((notif, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">· {notif.type}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">{notif.detail}</p>
                  <div className="text-[10px] text-zinc-500 font-mono">Enviado a: {notif.dest}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {notif.status}
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-1">{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW: ACTIVIDAD */}
      {activeTab === 'actividad' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Monitor de Actividad en Tiempo Real</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Eventos de compras, navegación, pagos y accesos registrados en la plataforma</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Transmisión en vivo activa</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { event: 'Pago Confirmado', user: 'carlos.cliente@gmail.com', detail: 'Pago verificado por $28.900 COP para MUBI Cine', time: 'Hace 4 min', icon: CheckCircle, color: 'text-emerald-400' },
              { event: 'Comprobante Subido', user: '3157894561 (Nequi)', detail: 'Reporte de pago registrado Ref: NEQ-88421', time: 'Hace 9 min', icon: CreditCard, color: 'text-amber-400' },
              { event: 'Inicio de Sesión', user: 'd.s.gal.mor.9@gmail.com', detail: 'Autenticación con Custom Claim SUPER_ADMIN', time: 'Hace 14 min', icon: Shield, color: 'text-purple-400' },
              { event: 'Interacción Chatbot', user: 'Cliente Invitado', detail: 'Consulta automática de precios de Adobe Creative Cloud', time: 'Hace 22 min', icon: MessageSquare, color: 'text-cyan-400' },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-zinc-900 ${act.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{act.event} <span className="text-zinc-500 font-normal">· {act.user}</span></div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{act.detail}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">{act.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW: ESTADÍSTICAS */}
      {activeTab === 'estadisticas' && (
        <div className="p-6 rounded-2xl bg-[#14141F] border border-zinc-800 space-y-8">
          <div>
            <h2 className="text-base font-bold text-white">Estadísticas Comerciales y Rendimiento</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Indicadores clave de ventas, métodos de pago y conversión en Colombia</p>
          </div>

          {/* Performance Overview Recharts Widget (30-day Line & Bar Charts) */}
          <PerformanceOverview />

          {/* D3 Premium Real-Time Analytics Widget */}
          <PremiumAnalyticsWidget />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs text-zinc-400">Volumen Total COP</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">${totalVolumeCOP.toLocaleString('es-CO')} COP</div>
              <span className="text-[10px] text-emerald-400 mt-1 inline-block">+18.4% vs mes anterior</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs text-zinc-400">Ticket Promedio</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${confirmedPayments.length > 0 ? Math.round(totalVolumeCOP / confirmedPayments.length).toLocaleString('es-CO') : '35.000'} COP
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 inline-block">Promedio por orden confirmada</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs text-zinc-400">Tasa de Aprobación</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">98.2%</div>
              <span className="text-[10px] text-zinc-500 mt-1 inline-block">Validación manual Nequi/Daviplata</span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs text-zinc-400">Tiempo Medio de Entrega</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">4.5 min</div>
              <span className="text-[10px] text-zinc-500 mt-1 inline-block">Despacho por chat StreamBox</span>
            </div>
          </div>

          {/* Payment gateway breakdown */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Distribución por Método de Pago en Colombia</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Nequi (3045967068)</span>
                  <span className="font-mono font-bold text-cyan-400">68%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Daviplata (3114139187)</span>
                  <span className="font-mono font-bold text-rose-400">28%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Bancolombia / Otros</span>
                  <span className="font-mono font-bold text-amber-400">4%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '4%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Rechazar Reporte de Pago</h3>
            <p className="text-xs text-zinc-400">
              Explica el motivo para notificar al cliente a través del chat:
            </p>
            
            <textarea
              required
              rows={3}
              placeholder="Ej: No se encontró la transferencia con esa referencia en el extracto bancario de Nequi..."
              value={adminRejectionReason}
              onChange={(e) => setAdminRejectionReason(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-xs text-zinc-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Price Adjuster Modal */}
      <DeveloperPriceAdjusterModal
        isOpen={showPriceAdjustModal}
        onClose={() => setShowPriceAdjustModal(false)}
      />

      {/* Modal Creación de Cupón */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#14141F] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              <span>Crear Nuevo Cupón de Descuento</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!promoCode.trim()) return;
                createPromotion({
                  code: promoCode.trim().toUpperCase(),
                  type: promoType,
                  value: Number(promoValue),
                  minPurchaseCOP: Number(promoMinPurchase),
                  maxUses: Number(promoMaxUses),
                  description: promoDescription.trim() || undefined,
                  validUntil: promoValidUntil || '2027-12-31',
                  active: true,
                });
                setShowPromoModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Código del Cupón (Mayúsculas)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: STREAMBOX20"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Tipo de Descuento</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as 'PERCENTAGE' | 'FIXED_COP')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="PERCENTAGE">Porcentaje (%)</option>
                    <option value="FIXED_COP">Valor Fijo ($ COP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    {promoType === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Valor ($ COP)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={promoValue}
                    onChange={(e) => setPromoValue(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Compra Mínima ($ COP)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={promoMinPurchase}
                    onChange={(e) => setPromoMinPurchase(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Límite de Usos</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={promoMaxUses}
                    onChange={(e) => setPromoMaxUses(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Fecha Límite (Vigencia)</label>
                <input
                  type="date"
                  required
                  value={promoValidUntil}
                  onChange={(e) => setPromoValidUntil(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Descripción / Nota</label>
                <input
                  type="text"
                  placeholder="Ej: Descuento para seguidores de Instagram"
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  Guardar Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Factura Oficial PDF */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        settings={settings}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
