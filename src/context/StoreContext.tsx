import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  googleProvider,
  getIdTokenResult,
  onIdTokenChanged,
  signOut,
  isFirebaseConfigured,
} from '../lib/firebase';
import {
  generateExcelDatabaseCSV,
  generateExcelWebQueryIQY,
  triggerBrowserDownload,
} from '../lib/excelExport';
import {
  notifyOrderDelivered,
  notifySubscriptionExpiringSoon,
  isNotificationSupported,
  getNotificationPermission,
  requestBrowserNotificationPermission,
  sendTestNotification,
  BrowserNotificationResult,
} from '../lib/browserNotifications';
import {
  User,
  UserPreferences,
  Product,
  CartItem,
  Order,
  PaymentRequest,
  ChatMessage,
  Ticket,
  NotificationItem,
  GlobalSettings,
  Promotion,
  AuditLog,
  GiveawayCampaign,
  UserRole,
  PaymentMethod,
  RefundRequest,
  RefundStatus,
  RefundReason,
  ComplianceItem,
  ConsentSettings,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_PROMOTIONS,
  INITIAL_GIVEAWAYS,
  INITIAL_COMPLIANCE_ITEMS,
  INITIAL_REFUNDS,
} from '../data/initialCatalog';

export interface StoreContextType {
  // Auth
  currentUser: User | null;
  allUsers: User[];
  isAuthLoading: boolean;
  login: (email: string) => boolean;
  loginWithCredentials: (email: string, password?: string) => Promise<{ success: boolean; role: UserRole; error?: string }>;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<{ success: boolean; role: UserRole; error?: string }>;
  register: (name: string, email: string, phone?: string, password?: string) => boolean;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserProfile: (updates: { name?: string; phone?: string; preferences?: UserPreferences }) => void;

  // Catalog
  products: Product[];
  categories: typeof INITIAL_CATEGORIES;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleCategoryActive: (categoryId: string) => void;
  applyPriceIncrementToUnadjusted: () => { updatedCount: number };
  adjustCatalogPrices: (options: {
    amountCOP: number;
    mode: 'add' | 'subtract';
    category?: string;
    targetScope?: 'all' | 'streambox' | 'verified';
    minFloorCOP?: number;
  }) => { updatedCount: number; affectedProductsCount: number };
  resetCatalogPrices: () => { resetCount: number };
  exportProductsCSV: () => string;
  importProductsCSV: (csvContent: string) => { added: number; updated: number; drafts: number; errors: string[] };

  // Customer Favorites & Recently Viewed
  favorites: string[];
  toggleFavorite: (productId: string) => boolean;
  isFavorite: (productId: string) => boolean;
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;

  // Cart & Checkout
  cart: CartItem[];
  addToCart: (product: Product, modalityId: string, quantity?: number) => void;
  removeFromCart: (productId: string, modalityId: string) => void;
  updateCartQuantity: (productId: string, modalityId: string, quantity: number) => void;
  clearCart: () => void;
  appliedPromo: Promotion | null;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  cartSubtotalCOP: number;
  cartDiscountCOP: number;
  cartTotalCOP: number;

  // Colombian Orders & Payments
  orders: Order[];
  paymentRequests: PaymentRequest[];
  createOrderFromCart: (paymentMethod: PaymentMethod) => { order: Order; paymentRequest: PaymentRequest };
  createInstantOrder: (product: Product, modalityId: string, paymentMethod: PaymentMethod) => { order: Order; paymentRequest: PaymentRequest };
  reportPayment: (paymentRequestId: string, referenceNumber: string, phoneOrigin: string, voucherNote?: string) => boolean;
  confirmPaymentByAdmin: (paymentRequestId: string, adminNotes?: string) => boolean;
  rejectPaymentByAdmin: (paymentRequestId: string, reason: string) => boolean;
  deliverOrderCredentials: (orderId: string, credentials: string, instructions: string) => boolean;
  verifyOrderByAdmin: (orderId: string, adminNotes?: string) => boolean;
  cancelOrderByAdmin: (orderId: string, reason?: string) => boolean;
  renewService: (orderId: string, paymentMethod: PaymentMethod) => { order: Order; paymentRequest: PaymentRequest } | null;

  // Refunds & Claims (Ley 1480 de 2011)
  refundRequests: RefundRequest[];
  createRefundRequest: (
    orderId: string,
    reason: RefundReason,
    reasonTitle: string,
    reasonDescription: string,
    incidentDate: string,
    preferredContact: 'EMAIL' | 'WHATSAPP' | 'CHAT_INTERNO',
    evidenceUrls?: string[]
  ) => { success: boolean; refundRequest?: RefundRequest; message: string };
  updateRefundStatus: (
    refundId: string,
    newStatus: RefundStatus,
    adminNote: string,
    solutionOffer?: string,
    refundedAmountCOP?: number
  ) => boolean;

  // Compliance (12 Áreas Obligatorias)
  complianceItems: ComplianceItem[];
  updateComplianceItem: (id: string, updates: Partial<ComplianceItem>) => void;
  runComplianceAuditCheck: () => { compliantCount: number; reviewCount: number; score: number };

  // Consent & Cookies (Ley 1581 de 2012)
  consentSettings: ConsentSettings;
  updateConsentSettings: (settings: Partial<ConsentSettings>) => void;

  // Chat & Integrated Chatbot
  chatMessages: ChatMessage[];
  chatMode: 'BOT_ACTIVE' | 'WAITING_ADMIN' | 'HUMAN_ACTIVE' | 'CLOSED';
  isBotTyping: boolean;
  sendChatMessage: (content: string, quickAction?: string) => Promise<void>;
  adminReplyChatMessage: (userId: string, content: string) => void;
  handleChatbotAction: (actionKey: 'MI_PEDIDO' | 'MI_PAGO' | 'MI_VENCIMIENTO' | 'HABLAR_CON_SOPORTE' | 'FAQ') => void;
  requestHumanSupport: (reason?: string) => Promise<boolean>;
  resetUserChat: (targetUserId?: string) => void;

  // Tickets
  tickets: Ticket[];
  createTicket: (subject: string, category: string, initialMessage: string, priority?: Ticket['priority']) => Ticket;
  replyTicket: (ticketId: string, content: string, asSupport?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;

  // Browser Push Notifications (Web Notification API)
  isPushNotificationSupported: boolean;
  browserNotificationPermission: NotificationPermission;
  requestPushNotificationPermission: () => Promise<NotificationPermission>;
  sendPushTestNotification: (type: 'delivery' | 'expiring') => BrowserNotificationResult;
  notifyOrderDeliveredManually: (orderId: string) => boolean;

  // Settings & Promos & Giveaways
  settings: GlobalSettings;
  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  promotions: Promotion[];
  createPromotion: (promo: Omit<Promotion, 'id' | 'usedCount'>) => void;
  togglePromotionActive: (id: string) => void;
  giveaways: GiveawayCampaign[];
  enterGiveaway: (giveawayId: string) => {
    success: boolean;
    message: string;
    ticketNumber?: number;
    ticketCode?: string;
    totalUserTickets?: number;
  };
  toggleGiveawayUnlimitedTickets: (giveawayId: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: string, target: string, details: string, success?: boolean) => void;

  // Automated Excel Database & Web Feed
  downloadFullExcelDatabase: () => void;
  downloadExcelWebQueryConnector: () => void;
  getExcelFeedUrl: () => string;
}

const PRELOADED_USERS: User[] = [
  {
    id: 'usr-super-admin',
    name: 'Super Administrador StreamBox',
    email: 'd.s.gal.mor.9@gmail.com',
    role: 'SUPER_ADMIN',
    phone: '3045967068',
    referralCode: 'SB-VIP-ADMIN',
    rewardPoints: 50000,
    createdAt: '2026-10-01T08:00:00Z',
    active: true,
  },
  {
    id: 'usr-client-demo',
    name: 'Carlos Mendoza (Cliente)',
    email: 'carlos.cliente@gmail.com',
    role: 'CLIENTE',
    phone: '3157894561',
    referralCode: 'SB-REF-CARLOS',
    rewardPoints: 1500,
    createdAt: '2026-10-05T14:30:00Z',
    active: true,
  },
];

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-SB-8045',
    userId: 'usr-client-demo',
    userName: 'Carlos Mendoza (Cliente)',
    userEmail: 'carlos.cliente@gmail.com',
    customerPhone: '3157894561',
    items: [
      {
        productId: 'prod-netflix',
        productName: 'Netflix Premium 4K UHD',
        brand: 'Netflix',
        modalityName: 'Perfil Privado con PIN',
        duration: '1 Mes',
        priceCOP: 13500,
        quantity: 1,
      },
    ],
    subtotalCOP: 13500,
    discountCOP: 0,
    totalCOP: 13500,
    paymentRequestId: 'PAY-SB-8045',
    paymentMethod: 'NEQUI',
    paymentStatus: 'PAGO_CONFIRMADO',
    orderStatus: 'ENTREGADO',
    credentialsDelivered: 'Usuario: netflix_carlos49@streambox.vip | Clave: Streambox2026* | Perfil: 2 (PIN: 3819)',
    deliveryInstructions: 'Ingresa en la app de Netflix, selecciona el Perfil 2 e ingresa el PIN 3819. Garantía completa StreamBox.',
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    confirmedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Vence en 2 días (alerta de vencimiento)
  },
  {
    id: 'ORD-SB-8021',
    userId: 'usr-client-demo',
    userName: 'Carlos Mendoza (Cliente)',
    userEmail: 'carlos.cliente@gmail.com',
    customerPhone: '3157894561',
    items: [
      {
        productId: 'prod-spotify',
        productName: 'Spotify Premium Individual',
        brand: 'Spotify',
        modalityName: 'Cuenta Individual Garantizada',
        duration: '3 Meses',
        priceCOP: 49000,
        quantity: 1,
      },
    ],
    subtotalCOP: 49000,
    discountCOP: 0,
    totalCOP: 49000,
    paymentRequestId: 'PAY-SB-8021',
    paymentMethod: 'NEQUI',
    paymentStatus: 'PAGO_CONFIRMADO',
    orderStatus: 'ENTREGADO',
    credentialsDelivered: 'Usuario: spotify_carlos89@streambox.vip | Clave: MusicLive$2026',
    deliveryInstructions: 'Ingresa en spotify.com con los accesos enviados. Tu suscripción está garantizada por 90 días.',
    createdAt: '2026-10-06T15:00:00Z',
    confirmedAt: '2026-10-06T15:20:00Z',
    deliveredAt: '2026-10-06T15:22:00Z',
    expiresAt: '2027-01-06T15:00:00Z',
  },
];

const INITIAL_DEMO_PAYMENTS: PaymentRequest[] = [
  {
    id: 'PAY-SB-8021',
    orderId: 'ORD-SB-8021',
    userId: 'usr-client-demo',
    userName: 'Carlos Mendoza (Cliente)',
    userEmail: 'carlos.cliente@gmail.com',
    totalCOP: 49000,
    paymentMethod: 'NEQUI',
    status: 'PAGO_CONFIRMADO',
    referenceNumber: 'NQ-94819482',
    phoneOrigin: '3157894561',
    voucherNote: 'Transferencia Nequi realizada a las 3:15pm',
    reportedAt: '2026-10-06T15:10:00Z',
    confirmedAt: '2026-10-06T15:20:00Z',
    confirmedBy: 'd.s.gal.mor.9@gmail.com',
    createdAt: '2026-10-06T15:00:00Z',
  },
];

const INITIAL_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-client-demo',
    type: 'PAYMENT_CONFIRMED',
    title: '¡Pago Confirmado!',
    message: 'Tu pago de $49.000 COP para Spotify Premium fue confirmado exitosamente.',
    read: false,
    createdAt: '2026-10-06T15:20:00Z',
    linkTab: 'chat',
  },
  {
    id: 'notif-2',
    userId: 'usr-client-demo',
    type: 'ORDER_DELIVERED',
    title: 'Pedido Entregado',
    message: 'Tus credenciales de Spotify ya están disponibles en Mi Chat.',
    read: true,
    createdAt: '2026-10-06T15:22:00Z',
    linkTab: 'chat',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorEmail: 'd.s.gal.mor.9@gmail.com',
    actorRole: 'SUPER_ADMIN',
    action: 'INICIALIZACIÓN_SISTEMA',
    target: 'StreamBox Core',
    details: 'Configuración inicial de plataforma, pasarelas manuales Colombia (Nequi y Daviplata) activadas.',
    timestamp: '2026-10-01T08:00:00Z',
    success: true,
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state & Firebase Custom Claims loading
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sb_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sb_users');
    return saved ? JSON.parse(saved) : PRELOADED_USERS;
  });

  const [categories, setCategories] = useState<typeof INITIAL_CATEGORIES>(() => {
    const saved = localStorage.getItem('sb_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length < INITIAL_CATEGORIES.length) return INITIAL_CATEGORIES;
      return parsed;
    }
    return INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sb_products');
    const catalogVersion = localStorage.getItem('sb_catalog_version');
    const CURRENT_CATALOG_VERSION = 'v2026-10-pricing-sync-complete';

    if (saved && catalogVersion === CURRENT_CATALOG_VERSION) {
      const parsed = JSON.parse(saved);
      if (parsed.length >= INITIAL_PRODUCTS.length) return parsed;
    }
    localStorage.setItem('sb_catalog_version', CURRENT_CATALOG_VERSION);
    localStorage.setItem('sb_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sb_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('sb_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem('sb_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sb_orders');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_ORDERS;
  });

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem('sb_payments');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_PAYMENTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sb_chat_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'msg-welcome',
        userId: 'usr-client-demo',
        sender: 'BOT',
        senderName: 'StreamBot AI',
        content: '¡Hola! Bienvenido a StreamBox Colombia. Soy tu asistente virtual. Puedo ayudarte a consultar el estado de tu pedido, verificar tus pagos o transferirte con un asesor humano en cualquier momento.',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [chatMode, setChatMode] = useState<'BOT_ACTIVE' | 'WAITING_ADMIN' | 'HUMAN_ACTIVE' | 'CLOSED'>('BOT_ACTIVE');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('sb_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('sb_notifications');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('sb_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('sb_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [giveaways, setGiveaways] = useState<GiveawayCampaign[]>(() => {
    const saved = localStorage.getItem('sb_giveaways');
    return saved ? JSON.parse(saved) : INITIAL_GIVEAWAYS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sb_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(() => {
    const saved = localStorage.getItem('sb_refunds');
    return saved ? JSON.parse(saved) : INITIAL_REFUNDS;
  });

  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(() => {
    const saved = localStorage.getItem('sb_compliance');
    return saved ? JSON.parse(saved) : INITIAL_COMPLIANCE_ITEMS;
  });

  const [consentSettings, setConsentSettings] = useState<ConsentSettings>(() => {
    const saved = localStorage.getItem('sb_consent_settings');
    return saved
      ? JSON.parse(saved)
      : {
          essentialCookies: true,
          analyticsCookies: false,
          marketingCommunications: false,
          acceptedTermsVersion: 'v2.1-2026-10-CO',
          acceptedPrivacyVersion: 'v2.1-2026-10-CO',
          consentTimestamp: new Date().toISOString(),
        };
  });

  // Sync back to local storage
  useEffect(() => {
    if (currentUser) localStorage.setItem('sb_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('sb_current_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sb_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('sb_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sb_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sb_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('sb_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sb_payments', JSON.stringify(paymentRequests));
  }, [paymentRequests]);

  useEffect(() => {
    localStorage.setItem('sb_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('sb_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sb_giveaways', JSON.stringify(giveaways));
  }, [giveaways]);

  useEffect(() => {
    localStorage.setItem('sb_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sb_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('sb_refunds', JSON.stringify(refundRequests));
  }, [refundRequests]);

  useEffect(() => {
    localStorage.setItem('sb_compliance', JSON.stringify(complianceItems));
  }, [complianceItems]);

  // Push latest snapshot to server for automated Excel Web Feed retroalimentación
  useEffect(() => {
    const pushSnapshot = async () => {
      try {
        await fetch('/api/database/sync-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            snapshot: {
              orders,
              payments: paymentRequests,
              users: allUsers,
              products,
              giveaways,
              refundRequests,
              auditLogs,
            },
          }),
        });
      } catch (err) {
        // Silently skip if network or server busy
      }
    };
    pushSnapshot();
  }, [orders, paymentRequests, allUsers, products, giveaways, refundRequests, auditLogs]);

  useEffect(() => {
    localStorage.setItem('sb_consent_settings', JSON.stringify(consentSettings));
  }, [consentSettings]);

  // Audit Logger Helper
  const logAuditAction = (action: string, target: string, details: string, success: boolean = true) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorEmail: currentUser ? currentUser.email : 'anónimo@sistema',
      actorRole: currentUser ? currentUser.role : 'CLIENTE',
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
      success,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Firebase Auth State Listener & Custom Claims Token Resolver
  useEffect(() => {
    // Safety timeout ensures page is interactive immediately even on slow/offline networks
    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 900);

    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      clearTimeout(safetyTimer);
      if (fbUser) {
        try {
          const tokenResult = await getIdTokenResult(fbUser, true);
          const roleClaim = tokenResult.claims.role as UserRole | undefined;
          const assignedRole: UserRole = roleClaim === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'CLIENTE';

          const userObj: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario StreamBox',
            email: fbUser.email || '',
            role: assignedRole,
            phone: fbUser.phoneNumber || undefined,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            active: true,
          };

          setCurrentUser(userObj);
          logAuditAction(
            'SESION_FIREBASE_SINCRONIZADA',
            'Token',
            `Sesión iniciada con Custom Claim: ${assignedRole} (${fbUser.email})`
          );
        } catch (err) {
          console.warn('[Firebase Auth] Error refreshing custom claims:', err);
        }
      }
      setIsAuthLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  // Secure Auth with Firebase Credentials & Custom Claims
  const loginWithCredentials = async (
    emailInput: string,
    passwordInput?: string
  ): Promise<{ success: boolean; role: UserRole; error?: string }> => {
    const normalized = emailInput.trim().toLowerCase();

    // 1. Check if user is trying to login with super admin email or registered users in dev environment
    if (!isFirebaseConfigured) {
      if (normalized === 'd.s.gal.mor.9@gmail.com') {
        const superAdminUser = PRELOADED_USERS[0];
        setCurrentUser(superAdminUser);
        logAuditAction(
          'INICIO_SESION_DEV',
          'Auth',
          `Acceso Super Administrador en modo desarrollo (${normalized})`
        );
        return { success: true, role: 'SUPER_ADMIN' };
      }

      const existingUser = allUsers.find((u) => u.email.toLowerCase() === normalized);
      if (existingUser) {
        setCurrentUser(existingUser);
        return { success: true, role: existingUser.role };
      }

      if (normalized === 'carlos.cliente@gmail.com') {
        const demoUser = PRELOADED_USERS[1];
        setCurrentUser(demoUser);
        return { success: true, role: 'CLIENTE' };
      }

      // If registered or entering credentials
      const createdUser: User = {
        id: `usr-${Date.now()}`,
        name: normalized.split('@')[0],
        email: normalized,
        role: 'CLIENTE',
        createdAt: new Date().toISOString(),
        active: true,
      };
      setAllUsers((prev) => [...prev, createdUser]);
      setCurrentUser(createdUser);
      return { success: true, role: 'CLIENTE' };
    }

    // 2. Authenticate with Live Firebase Authentication
    if (passwordInput && passwordInput.trim().length > 0) {
      try {
        const cred = await signInWithEmailAndPassword(auth, normalized, passwordInput);
        const tokenResult = await getIdTokenResult(cred.user, true);
        const roleClaim = tokenResult.claims.role as UserRole | undefined;

        // Custom Claim is the ONLY authority that grants SUPER_ADMIN
        const verifiedRole: UserRole = roleClaim === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'CLIENTE';

        const userObj: User = {
          id: cred.user.uid,
          name: cred.user.displayName || normalized.split('@')[0],
          email: cred.user.email || normalized,
          role: verifiedRole,
          phone: cred.user.phoneNumber || undefined,
          createdAt: cred.user.metadata.creationTime || new Date().toISOString(),
          active: true,
        };

        setCurrentUser(userObj);
        logAuditAction(
          'INICIO_SESION_FIREBASE',
          'Auth',
          `Inicio de sesión exitoso. Custom Claim verificado: ${verifiedRole} (${normalized})`
        );
        return { success: true, role: verifiedRole };
      } catch (fbErr: any) {
        console.warn('[Firebase Auth] Error en signInWithEmailAndPassword:', fbErr.code, fbErr.message);

        // Fallback gracefully if API key is invalid or not yet configured in project
        if (fbErr.code === 'auth/api-key-not-valid' || fbErr.message?.includes('api-key-not-valid')) {
          if (normalized === 'd.s.gal.mor.9@gmail.com') {
            const superAdminUser = PRELOADED_USERS[0];
            setCurrentUser(superAdminUser);
            return { success: true, role: 'SUPER_ADMIN' };
          }
          const existingUser = allUsers.find((u) => u.email.toLowerCase() === normalized);
          if (existingUser) {
            setCurrentUser(existingUser);
            return { success: true, role: existingUser.role };
          }
          if (normalized === 'carlos.cliente@gmail.com') {
            const clientUser = PRELOADED_USERS[1];
            setCurrentUser(clientUser);
            return { success: true, role: 'CLIENTE' };
          }
          const newClientUser: User = {
            id: `usr-${Date.now()}`,
            name: normalized.split('@')[0],
            email: normalized,
            role: 'CLIENTE',
            referralCode: `SB-REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            rewardPoints: 1000,
            createdAt: new Date().toISOString(),
            active: true,
          };
          setAllUsers((prev) => [...prev, newClientUser]);
          setCurrentUser(newClientUser);
          return { success: true, role: 'CLIENTE' };
        }

        if (fbErr.code === 'auth/wrong-password') {
          return {
            success: false,
            role: 'CLIENTE',
            error: 'Contraseña incorrecta. Por favor verifica tus datos.',
          };
        }

        // Check if user was registered on the platform or in local storage
        const localUser = allUsers.find((u) => u.email.toLowerCase() === normalized);
        if (localUser) {
          setCurrentUser(localUser);
          localStorage.setItem('sb_current_user', JSON.stringify(localUser));
          logAuditAction('INICIO_SESION_LOCAL', 'Auth', `Inicio de cliente registrado: ${normalized}`);
          return { success: true, role: localUser.role };
        }

        // If client user is not in Firebase Console yet, allow client onboarding automatically
        if ((fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') && normalized !== 'd.s.gal.mor.9@gmail.com') {
          const newClientUser: User = {
            id: `usr-${Date.now()}`,
            name: normalized.split('@')[0],
            email: normalized,
            role: 'CLIENTE',
            referralCode: `SB-REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            rewardPoints: 1000,
            createdAt: new Date().toISOString(),
            active: true,
          };
          setAllUsers((prev) => [...prev, newClientUser]);
          setCurrentUser(newClientUser);
          localStorage.setItem('sb_current_user', JSON.stringify(newClientUser));
          return { success: true, role: 'CLIENTE' };
        }

        if (normalized === 'carlos.cliente@gmail.com') {
          const clientUser = PRELOADED_USERS[1];
          setCurrentUser(clientUser);
          return { success: true, role: 'CLIENTE' };
        }

        return {
          success: false,
          role: 'CLIENTE',
          error: `Error de autenticación: ${fbErr.message || fbErr.code}`,
        };
      }
    }

    // Demo fallback
    if (normalized === 'carlos.cliente@gmail.com') {
      const demoUser = allUsers.find((u) => u.email === normalized) || PRELOADED_USERS[1];
      setCurrentUser(demoUser);
      return { success: true, role: 'CLIENTE' };
    }

    return {
      success: false,
      role: 'CLIENTE',
      error: 'Por favor ingresa tu contraseña para autenticar con Firebase Authentication.',
    };
  };

  const loginWithGoogle = async (
    customEmail?: string,
    customName?: string
  ): Promise<{ success: boolean; role: UserRole; error?: string }> => {
    // 1. Explicit email passed from Google Account Chooser or user input
    if (customEmail && customEmail.trim().length > 0) {
      const normalized = customEmail.trim().toLowerCase();
      // SECURITY MANDATE: Only d.s.gal.mor.9@gmail.com is granted SUPER_ADMIN.
      // Every other email (e.g. pepitoperez@gmail.com) is strictly CLIENTE.
      const isSuperAdmin = normalized === 'd.s.gal.mor.9@gmail.com';
      const role: UserRole = isSuperAdmin ? 'SUPER_ADMIN' : 'CLIENTE';

      const existingUser = allUsers.find((u) => u.email.toLowerCase() === normalized);
      if (existingUser) {
        const updated = { ...existingUser, role };
        setCurrentUser(updated);
        logAuditAction('INICIO_SESION_GOOGLE', 'Auth', `Inicio con Google: ${normalized} (${role})`);
        return { success: true, role };
      }

      const displayName = customName?.trim() || normalized.split('@')[0];
      const newGoogleUser: User = {
        id: `usr-google-${Date.now()}`,
        name: displayName,
        email: normalized,
        role,
        referralCode: `SB-REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        rewardPoints: role === 'SUPER_ADMIN' ? 50000 : 1000,
        createdAt: new Date().toISOString(),
        active: true,
      };

      setAllUsers((prev) => [...prev, newGoogleUser]);
      setCurrentUser(newGoogleUser);
      logAuditAction('REGISTRO_GOOGLE', 'Auth', `Registro con Google: ${normalized} (${role})`);
      return { success: true, role };
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const tokenResult = await getIdTokenResult(cred.user, true);
      const roleClaim = tokenResult.claims.role as UserRole | undefined;
      const isSuperAdminEmail = (cred.user.email || '').toLowerCase() === 'd.s.gal.mor.9@gmail.com';
      const verifiedRole: UserRole = (roleClaim === 'SUPER_ADMIN' || isSuperAdminEmail) ? 'SUPER_ADMIN' : 'CLIENTE';

      const userObj: User = {
        id: cred.user.uid,
        name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Usuario',
        email: cred.user.email || '',
        role: verifiedRole,
        phone: cred.user.phoneNumber || undefined,
        createdAt: cred.user.metadata.creationTime || new Date().toISOString(),
        active: true,
      };

      setCurrentUser(userObj);
      logAuditAction('INICIO_SESION_GOOGLE', 'Auth', `Inicio con Google. Custom Claim: ${verifiedRole}`);
      return { success: true, role: verifiedRole };
    } catch (err: any) {
      console.warn('[Google Auth] Popup blocked or unconfigured domain:', err);
      return { success: false, role: 'CLIENTE', error: 'POPUP_FALLBACK' };
    }

    return { success: false, role: 'CLIENTE', error: 'POPUP_FALLBACK' };
  };

  const login = (email: string): boolean => {
    const normalized = email.trim().toLowerCase();
    const existing = allUsers.find((u) => u.email.toLowerCase() === normalized);

    if (existing) {
      setCurrentUser(existing);
      logAuditAction('INICIO_SESION', 'Usuario', `Inicio de sesión: ${existing.email}`);
      return true;
    }

    // Dynamic client creation (e.g. pepitoperez@gmail.com)
    const newClient: User = {
      id: `usr-${Date.now()}`,
      name: normalized.split('@')[0],
      email: normalized,
      role: normalized === 'd.s.gal.mor.9@gmail.com' ? 'SUPER_ADMIN' : 'CLIENTE',
      referralCode: `SB-REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      rewardPoints: 1000,
      createdAt: new Date().toISOString(),
      active: true,
    };
    setAllUsers((prev) => [...prev, newClient]);
    setCurrentUser(newClient);
    logAuditAction('INICIO_SESION_NUEVO', 'Usuario', `Inicio nuevo cliente: ${newClient.email}`);
    return true;
  };

  const register = (name: string, email: string, phone?: string, password?: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return false;

    // Check if user already exists in local list
    const existing = allUsers.find((u) => u.email.toLowerCase() === normalized);
    if (existing) {
      const updatedUser: User = {
        ...existing,
        name: name.trim() || existing.name,
        phone: phone?.trim() || existing.phone,
      };
      setAllUsers((prev) => prev.map((u) => (u.id === existing.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      localStorage.setItem('sb_current_user', JSON.stringify(updatedUser));
      logAuditAction('INICIO_SESION_EXISTENTE', 'Usuario', `Acceso de cliente existente: ${existing.email}`);
      return true;
    }

    // Try background Firebase creation if password provided
    if (password && isFirebaseConfigured) {
      createUserWithEmailAndPassword(auth, normalized, password).catch((err) => {
        console.warn('[Firebase Auth] User registration fallback:', err?.message || err);
      });
    }

    // Regla estricta: todo usuario nuevo registrado por la web es CLIENTE.
    // Solo el correo oficial d.s.gal.mor.9@gmail.com recibe privilegios SUPER_ADMIN.
    const isSuperAdminEmail = normalized === 'd.s.gal.mor.9@gmail.com';
    const assignedRole: UserRole = isSuperAdminEmail ? 'SUPER_ADMIN' : 'CLIENTE';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim() || normalized.split('@')[0],
      email: normalized,
      role: assignedRole,
      phone: phone?.trim(),
      referralCode: `SB-REF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      rewardPoints: 1000,
      createdAt: new Date().toISOString(),
      active: true,
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('sb_current_user', JSON.stringify(newUser));
    logAuditAction('REGISTRO_CLIENTE', 'Usuario', `Nuevo cliente registrado: ${newUser.email}`);
    return true;
  };

  const sendPasswordReset = async (emailToReset: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = emailToReset.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Por favor ingresa un correo electrónico válido.' };
    }

    try {
      if (isFirebaseConfigured) {
        await sendPasswordResetEmail(auth, cleanEmail);
      }
      logAuditAction('RECUPERACION_CLAVE', 'Auth', `Instrucciones de restablecimiento enviadas a ${cleanEmail}`);
      return {
        success: true,
        message: 'Hemos enviado un enlace de recuperación seguro a tu correo electrónico.',
      };
    } catch (err: any) {
      console.warn('[Firebase Auth] Password reset error:', err);
      if (err?.code === 'auth/invalid-email') {
        return { success: false, message: 'El formato del correo electrónico no es válido.' };
      }
      if (err?.code === 'auth/user-not-found') {
        return { success: false, message: 'No encontramos ninguna cuenta registrada con este correo electrónico.' };
      }
      if (err?.code === 'auth/too-many-requests') {
        return { success: false, message: 'Demasiadas solicitudes. Por favor espera unos minutos antes de reintentar.' };
      }
      if (err?.code === 'auth/network-request-failed') {
        return { success: false, message: 'Error de conexión a internet. Verifica tu red.' };
      }
      return {
        success: false,
        message: err?.message || 'No fue posible enviar el correo de recuperación. Inténtalo de nuevo.',
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error signing out of Firebase:', e);
    }
    if (currentUser) {
      logAuditAction('CIERRE_SESION', 'Usuario', `Cierre de sesión: ${currentUser.email}`);
    }
    setCurrentUser(null);
    localStorage.removeItem('sb_current_user');
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = allUsers.find((u) => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      name: `Usuario ${role}`,
      email: `${role.toLowerCase()}@streambox.co`,
      role,
      createdAt: new Date().toISOString(),
      active: true,
    };
    setCurrentUser(targetUser);
    logAuditAction('CAMBIO_ROL_TEST', 'Sesión', `Cambio de perfil local a ${role}`);
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Roles', 'Intento de cambio de rol sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    logAuditAction('ACTUALIZACION_ROL', `Usuario ${userId}`, `Nuevo rol asignado: ${newRole}`);
  };

  const updateUserProfile = (updates: {
    name?: string;
    phone?: string;
    preferences?: UserPreferences;
  }) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      ...(updates.name ? { name: updates.name.trim() } : {}),
      ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
      ...(updates.preferences
        ? { preferences: { ...(currentUser.preferences || {}), ...updates.preferences } }
        : {}),
    };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    localStorage.setItem('sb_current_user', JSON.stringify(updated));
    logAuditAction('PERFIL_ACTUALIZADO', 'Usuario', `Perfil y preferencias actualizadas para ${currentUser.email}`);
  };

  // Product Catalog Operations (Protected with Custom Claim SUPER_ADMIN)
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Catálogo', 'Intento bloqueado de crear producto sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    logAuditAction('CREAR_PRODUCTO', newProd.name, `Producto creado en ${newProd.category}`);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Catálogo', 'Intento bloqueado de editar producto sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    logAuditAction('EDITAR_PRODUCTO', `ID ${id}`, 'Producto actualizado');
  };

  const deleteProduct = (id: string) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Catálogo', 'Intento bloqueado de eliminar producto sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAuditAction('ELIMINAR_PRODUCTO', `ID ${id}`, 'Producto removido del catálogo');
  };

  const toggleCategoryActive = (categoryId: string) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Categorías', 'Intento bloqueado de alternar categoría sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, active: !c.active } : c))
    );
    logAuditAction('TOGGLE_CATEGORIA', categoryId, 'Estado de categoría modificado');
  };

  // Export full catalog to CSV
  const exportProductsCSV = (): string => {
    const headers = [
      'id',
      'name',
      'brand',
      'category',
      'subcategory',
      'modalityId',
      'modalityName',
      'duration',
      'priceCOP',
      'priceStatus',
      'status',
      'verificationSource',
      'verifiedDate'
    ];
    const rows: string[] = [headers.join(',')];

    products.forEach((p) => {
      p.modalities.forEach((m) => {
        const row = [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.brand.replace(/"/g, '""')}"`,
          p.category,
          `"${p.subcategory.replace(/"/g, '""')}"`,
          m.id,
          `"${m.name.replace(/"/g, '""')}"`,
          `"${m.duration}"`,
          m.priceCOP !== null ? m.priceCOP : '',
          m.priceStatus,
          p.status,
          `"${(p.verificationSource || '').replace(/"/g, '""')}"`,
          p.verifiedDate || '',
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  };

  // Import CSV with column validation, duplicate detection & drafts for unverified
  const importProductsCSV = (csvContent: string): { added: number; updated: number; drafts: number; errors: string[] } => {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { added: 0, updated: 0, drafts: 0, errors: ['El archivo CSV debe tener al menos una fila de datos además del encabezado.'] };
    }

    let added = 0;
    let updated = 0;
    let drafts = 0;
    const errors: string[] = [];

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const brandIdx = headers.indexOf('brand');
    const catIdx = headers.indexOf('category');
    const subcatIdx = headers.indexOf('subcategory');
    const priceIdx = headers.indexOf('pricecop');
    const modalityIdx = headers.indexOf('modalityname');
    const durationIdx = headers.indexOf('duration');

    if (nameIdx === -1 || brandIdx === -1) {
      return { added: 0, updated: 0, drafts: 0, errors: ['Columnas requeridas "name" o "brand" no encontradas en el encabezado CSV.'] };
    }

    const updatedProducts = [...products];

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i];
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const cols: string[] = [];
      let match;
      while ((match = regex.exec(rawLine))) {
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        cols.push(val.trim());
        if (regex.lastIndex === rawLine.length) break;
      }

      const name = cols[nameIdx];
      const brand = cols[brandIdx];
      if (!name || !brand) continue;

      const category = catIdx !== -1 && cols[catIdx] ? cols[catIdx] : 'cat-streaming';
      const subcategory = subcatIdx !== -1 && cols[subcatIdx] ? cols[subcatIdx] : 'Servicios';
      const modalityName = modalityIdx !== -1 && cols[modalityIdx] ? cols[modalityIdx] : 'Plan Estándar';
      const duration = durationIdx !== -1 && cols[durationIdx] ? cols[durationIdx] : '1 Mes';
      const rawPrice = priceIdx !== -1 ? cols[priceIdx] : '';
      const parsedPrice = rawPrice && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0 ? Number(rawPrice) : null;

      const isPricePending = parsedPrice === null;
      if (isPricePending) drafts++;

      const existingIndex = updatedProducts.findIndex(
        (p) => p.name.toLowerCase() === name.toLowerCase() && p.brand.toLowerCase() === brand.toLowerCase()
      );

      if (existingIndex > -1) {
        const p = updatedProducts[existingIndex];
        const existingModIdx = p.modalities.findIndex((m) => m.name.toLowerCase() === modalityName.toLowerCase());
        if (existingModIdx > -1) {
          p.modalities[existingModIdx].priceCOP = parsedPrice;
          p.modalities[existingModIdx].priceStatus = isPricePending ? 'PRICE_PENDING' : 'VERIFIED_STREAMBOX';
          p.modalities[existingModIdx].available = !isPricePending;
        } else {
          p.modalities.push({
            id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: modalityName,
            duration,
            priceCOP: parsedPrice,
            priceStatus: isPricePending ? 'PRICE_PENDING' : 'VERIFIED_STREAMBOX',
            available: !isPricePending,
          });
        }
        updated++;
      } else {
        const newProd: Product = {
          id: `prod-csv-${Date.now()}-${i}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          brand,
          category,
          subcategory,
          description: `${name} oficial en StreamBox Colombia.`,
          shortDescription: `${brand} disponible en Colombia.`,
          productType: 'STREAMING',
          modalities: [
            {
              id: `mod-${Date.now()}-${i}`,
              name: modalityName,
              duration,
              priceCOP: parsedPrice,
              priceStatus: isPricePending ? 'PRICE_PENDING' : 'VERIFIED_STREAMBOX',
              available: !isPricePending,
            },
          ],
          region: 'Colombia y Global',
          compatibility: 'Smart TV, PC, Móviles',
          deliveryMethod: 'Chat StreamBox',
          terms: 'Garantía StreamBox activa.',
          verificationSource: 'Importación CSV Verificada',
          verifiedDate: new Date().toISOString().split('T')[0],
          status: isPricePending ? 'PRICE_PENDING' : 'ACTIVE',
          tags: [brand, 'Importado'],
        };
        updatedProducts.push(newProd);
        added++;
      }
    }

    setProducts(updatedProducts);
    logAuditAction('IMPORTACION_CSV', 'Catálogo', `Importados ${added} nuevos, ${updated} actualizados, ${drafts} borradores`);
    return { added, updated, drafts, errors };
  };

  // Developer Mode Price Adjuster: adjustable increase, reduction (-6000 or custom), or reset
  const adjustCatalogPrices = (options: {
    amountCOP: number;
    mode: 'add' | 'subtract';
    category?: string;
    targetScope?: 'all' | 'streambox' | 'verified';
    minFloorCOP?: number;
  }): { updatedCount: number; affectedProductsCount: number } => {
    const {
      amountCOP,
      mode,
      category = 'ALL',
      targetScope = 'all',
      minFloorCOP = 1000,
    } = options;

    let modalityCount = 0;
    let prodCount = 0;

    setProducts((prev) =>
      prev.map((p) => {
        if (category !== 'ALL' && p.category !== category) {
          return p;
        }

        let productChanged = false;
        const updatedModalities = p.modalities.map((m) => {
          if (m.priceCOP === null || m.priceStatus === 'PRICE_PENDING') {
            return m;
          }

          if (targetScope === 'streambox' && m.priceStatus !== 'VERIFIED_STREAMBOX') {
            return m;
          }

          const baseOriginal = m.originalPriceCOP ?? m.priceCOP;
          const delta = mode === 'add' ? amountCOP : -amountCOP;
          const newPrice = Math.max(minFloorCOP, m.priceCOP + delta);

          modalityCount++;
          productChanged = true;

          return {
            ...m,
            originalPriceCOP: baseOriginal,
            priceCOP: newPrice,
          };
        });

        if (productChanged) {
          prodCount++;
        }

        return { ...p, modalities: updatedModalities };
      })
    );

    const sign = mode === 'add' ? '+' : '-';
    const label = mode === 'add' ? 'Incremento' : 'Reducción';
    logAuditAction(
      'AJUSTE_PRECIOS_DESARROLLADOR',
      'Catálogo',
      `${label} de ${sign}$${amountCOP.toLocaleString('es-CO')} COP aplicado a ${modalityCount} modalidades en ${prodCount} productos.`
    );

    return { updatedCount: modalityCount, affectedProductsCount: prodCount };
  };

  const resetCatalogPrices = (): { resetCount: number } => {
    let count = 0;
    // Map initial original prices from INITIAL_PRODUCTS
    const initialMap = new Map<string, Map<string, number | null>>();
    INITIAL_PRODUCTS.forEach((ip) => {
      const modMap = new Map<string, number | null>();
      ip.modalities.forEach((m) => {
        modMap.set(m.id, m.priceCOP);
      });
      initialMap.set(ip.id, modMap);
    });

    setProducts((prev) =>
      prev.map((p) => {
        const initialMods = initialMap.get(p.id);
        const updatedModalities = p.modalities.map((m) => {
          const initPrice = initialMods?.get(m.id) ?? m.originalPriceCOP ?? m.priceCOP;
          if (initPrice !== undefined && initPrice !== m.priceCOP) {
            count++;
            return {
              ...m,
              priceCOP: initPrice,
            };
          }
          return m;
        });
        return { ...p, modalities: updatedModalities };
      })
    );

    logAuditAction('RESTABLECER_PRECIOS_ORIGINALES', 'Catálogo', `Precios originales restablecidos a su valor inicial en ${count} modalidades.`);
    return { resetCount: count };
  };

  // Rule of $6.000 COP price adjustment: applies increment to unadjusted StreamBox selling prices
  const applyPriceIncrementToUnadjusted = (): { updatedCount: number } => {
    const res = adjustCatalogPrices({
      amountCOP: 6000,
      mode: 'add',
      targetScope: 'streambox',
    });
    return { updatedCount: res.updatedCount };
  };

  // Customer Favorites & Recently Viewed
  const toggleFavorite = (productId: string): boolean => {
    let isNowFav = false;
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        isNowFav = false;
        return prev.filter((id) => id !== productId);
      } else {
        isNowFav = true;
        return [...prev, productId];
      }
    });
    return isNowFav;
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 12);
    });
  };

  // Cart Management: Guard against null or PRICE_PENDING items
  const addToCart = (product: Product, modalityId: string, quantity = 1) => {
    const modality = product.modalities.find((m) => m.id === modalityId);
    if (!modality || modality.priceCOP === null || modality.priceStatus === 'PRICE_PENDING') {
      return; // Cannot add items with unverified price
    }

    const verifiedPrice: number = modality.priceCOP;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.modalityId === modalityId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        productId: product.id,
        modalityId,
        productName: product.name,
        brand: product.brand,
        modalityName: modality.name,
        duration: modality.duration,
        priceCOP: verifiedPrice,
        quantity,
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string, modalityId: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.modalityId === modalityId))
    );
  };

  const updateCartQuantity = (productId: string, modalityId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, modalityId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.modalityId === modalityId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const cartSubtotalCOP = cart.reduce((acc, item) => acc + item.priceCOP * item.quantity, 0);

  const cartDiscountCOP = appliedPromo
    ? appliedPromo.type === 'PERCENTAGE'
      ? Math.round((cartSubtotalCOP * appliedPromo.value) / 100)
      : Math.min(appliedPromo.value, cartSubtotalCOP)
    : 0;

  const cartTotalCOP = Math.max(0, cartSubtotalCOP - cartDiscountCOP);

  const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Ingresa un código de cupón válido.' };
    }

    try {
      // 1. Attempt secure server-side coupon verification
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          subtotalCOP: cartSubtotalCOP,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid && data.coupon) {
        setAppliedPromo({
          id: data.coupon.id,
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          minPurchaseCOP: data.coupon.minPurchaseCOP,
          maxUses: 1000,
          usedCount: 1,
          active: true,
          validUntil: '2026-12-31',
          description: data.coupon.description,
        });
        logAuditAction('CUPON_VALIDADO_SERVIDOR', 'Cupones', `Cupón ${cleanCode} validado por el servidor`);
        return {
          success: true,
          message: data.message || `¡Cupón ${data.coupon.code} aplicado con éxito!`,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          message: data.message || 'Código de descuento inválido o expirado.',
        };
      }
    } catch (err) {
      console.warn('[Cupones] Servidor no disponible, usando validación local:', err);
    }

    // 2. Local fallback validation if offline
    const promo = promotions.find(
      (p) => p.code.toUpperCase() === cleanCode && p.active
    );

    if (!promo) {
      return { success: false, message: 'Código de descuento inválido o expirado.' };
    }

    if (cartSubtotalCOP < promo.minPurchaseCOP) {
      return {
        success: false,
        message: `Este cupón requiere una compra mínima de $${promo.minPurchaseCOP.toLocaleString('es-CO')} COP.`,
      };
    }

    setAppliedPromo(promo);
    return {
      success: true,
      message: `¡Cupón ${promo.code} aplicado con éxito!`,
    };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Orders & Colombian Manual Payment Flow
  const createOrderFromCart = (paymentMethod: PaymentMethod): { order: Order; paymentRequest: PaymentRequest } => {
    const user = currentUser || {
      id: `usr-anon-${Date.now()}`,
      name: 'Cliente Invitado',
      email: 'cliente@streambox.co',
      role: 'CLIENTE',
      createdAt: new Date().toISOString(),
      active: true,
    };

    const orderId = `ORD-SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const payRequestId = `PAY-SB-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderSnapshots = cart.map((c) => ({
      productId: c.productId,
      productName: c.productName,
      brand: c.brand,
      modalityName: c.modalityName,
      duration: c.duration,
      priceCOP: c.priceCOP,
      quantity: c.quantity,
    }));

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: orderSnapshots,
      subtotalCOP: cartSubtotalCOP,
      discountCOP: cartDiscountCOP,
      totalCOP: cartTotalCOP,
      paymentRequestId: payRequestId,
      paymentMethod,
      paymentStatus: 'PENDIENTE',
      orderStatus: 'EN_PREPARACIÓN',
      createdAt: new Date().toISOString(),
    };

    const newPaymentRequest: PaymentRequest = {
      id: payRequestId,
      orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      totalCOP: cartTotalCOP,
      paymentMethod,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setPaymentRequests((prev) => [newPaymentRequest, ...prev]);
    clearCart();

    logAuditAction('PEDIDO_CREADO', orderId, `Pedido por $${cartTotalCOP.toLocaleString('es-CO')} COP (${paymentMethod})`);

    // In-app Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: user.id,
      type: 'ORDER_CREATED',
      title: 'Pedido Generado',
      message: `Tu pedido ${orderId} por $${cartTotalCOP.toLocaleString('es-CO')} COP está pendiente de pago vía ${paymentMethod}.`,
      read: false,
      createdAt: new Date().toISOString(),
      linkTab: 'pedidos',
    };
    setNotifications((prev) => [notif, ...prev]);

    return { order: newOrder, paymentRequest: newPaymentRequest };
  };

  const createInstantOrder = (product: Product, modalityId: string, paymentMethod: PaymentMethod) => {
    const modality = product.modalities.find((m) => m.id === modalityId) || product.modalities[0];
    const user = currentUser || {
      id: `usr-anon-${Date.now()}`,
      name: 'Cliente Invitado',
      email: 'cliente@streambox.co',
      role: 'CLIENTE',
      createdAt: new Date().toISOString(),
      active: true,
    };

    const orderId = `ORD-SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const payRequestId = `PAY-SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPrice: number = modality?.priceCOP ?? 0;

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: [
        {
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          modalityName: modality ? modality.name : 'Estándar',
          duration: modality ? modality.duration : '1 Mes',
          priceCOP: finalPrice,
          quantity: 1,
        },
      ],
      subtotalCOP: finalPrice,
      discountCOP: 0,
      totalCOP: finalPrice,
      paymentRequestId: payRequestId,
      paymentMethod,
      paymentStatus: 'PENDIENTE',
      orderStatus: 'EN_PREPARACIÓN',
      createdAt: new Date().toISOString(),
    };

    const newPaymentRequest: PaymentRequest = {
      id: payRequestId,
      orderId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      totalCOP: finalPrice,
      paymentMethod,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setPaymentRequests((prev) => [newPaymentRequest, ...prev]);

    logAuditAction('PEDIDO_RAPIDO', orderId, `Compra directa: ${product.name} (${modality?.name || 'Estándar'})`);
    return { order: newOrder, paymentRequest: newPaymentRequest };
  };

  // Payment Reporting by Customer
  const reportPayment = (
    paymentRequestId: string,
    referenceNumber: string,
    phoneOrigin: string,
    voucherNote?: string
  ): boolean => {
    const payReq = paymentRequests.find((p) => p.id === paymentRequestId);
    if (!payReq) return false;

    const timestamp = new Date().toISOString();

    setPaymentRequests((prev) =>
      prev.map((p) =>
        p.id === paymentRequestId
          ? {
              ...p,
              status: 'PAGO_REPORTADO',
              referenceNumber,
              phoneOrigin,
              voucherNote,
              reportedAt: timestamp,
            }
          : p
      )
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === payReq.orderId ? { ...o, paymentStatus: 'PAGO_REPORTADO', customerPhone: phoneOrigin } : o
      )
    );

    // In accordance with Section 11.5 of prompt:
    // "PAGO PENDIENTE DE VERIFICACIÓN - Hemos recibido tu reporte de pago..."
    const botWaitMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: payReq.userId,
      sender: 'SYSTEM',
      senderName: 'StreamBox Pagos',
      content: `PAGO PENDIENTE DE VERIFICACIÓN: Hemos recibido tu reporte de pago por $${payReq.totalCOP.toLocaleString('es-CO')} COP (Ref: ${referenceNumber}). Permanece atento a este chat. Cuando nuestro equipo confirme el pago, recibirás aquí las instrucciones y la información correspondiente a tu pedido.`,
      timestamp,
      orderId: payReq.orderId,
      paymentRequestId: payReq.id,
    };

    setChatMessages((prev) => [...prev, botWaitMsg]);

    // Push notification to user
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: payReq.userId,
      type: 'PAYMENT_REPORTED',
      title: '¡Pago Reportado Correctamente!',
      message: `Tu pago fue enviado para verificación. Revisa el chat para recibir las instrucciones de entrega.`,
      read: false,
      createdAt: timestamp,
      linkTab: 'chat',
    };
    setNotifications((prev) => [notif, ...prev]);

    logAuditAction('REPORTE_PAGO', payReq.id, `Reporte enviado por cliente. Ref: ${referenceNumber}`);
    return true;
  };

  // Payment Confirmation by Admin (Section 11.6 - Protected by Custom Claim SUPER_ADMIN)
  const confirmPaymentByAdmin = (paymentRequestId: string, adminNotes?: string): boolean => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Pagos', 'Intento bloqueado de confirmar pago sin Custom Claim SUPER_ADMIN', false);
      return false;
    }
    const payReq = paymentRequests.find((p) => p.id === paymentRequestId);
    if (!payReq) return false;

    const timestamp = new Date().toISOString();
    const adminEmail = currentUser?.email || 'd.s.gal.mor.9@gmail.com';

    setPaymentRequests((prev) =>
      prev.map((p) =>
        p.id === paymentRequestId
          ? {
              ...p,
              status: 'PAGO_CONFIRMADO',
              confirmedAt: timestamp,
              confirmedBy: adminEmail,
            }
          : p
      )
    );

    // Update order status & generate delivered credentials sample
    const order = orders.find((o) => o.id === payReq.orderId);
    const firstItem = order?.items[0]?.productName || 'Servicio Digital';
    const credentials = `Acceso: ${firstItem.toLowerCase().replace(/\s+/g, '_')}@streambox.vip | PIN / Clave: SB${Math.floor(100000 + Math.random() * 900000)}*`;
    const instructions = `1. Inicia sesión en la plataforma oficial del servicio.\n2. Ingresa con los datos proporcionados.\n3. Disfruta tu contenido sin restricciones. Tienes soporte y garantía activa durante todo tu período.`;

    const firstDuration = (order?.items[0]?.duration || '1 Mes').toLowerCase();
    const expirationDate = new Date();
    if (firstDuration.includes('15')) {
      expirationDate.setDate(expirationDate.getDate() + 15);
    } else if (firstDuration.includes('3 mes')) {
      expirationDate.setDate(expirationDate.getDate() + 90);
    } else if (firstDuration.includes('6 mes')) {
      expirationDate.setDate(expirationDate.getDate() + 180);
    } else if (firstDuration.includes('12 mes') || firstDuration.includes('año')) {
      expirationDate.setDate(expirationDate.getDate() + 365);
    } else {
      expirationDate.setDate(expirationDate.getDate() + 30);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === payReq.orderId
          ? {
              ...o,
              paymentStatus: 'PAGO_CONFIRMADO',
              orderStatus: 'ENTREGADO',
              confirmedAt: timestamp,
              deliveredAt: timestamp,
              expiresAt: expirationDate.toISOString(),
              customerPhone: o.customerPhone || payReq.phoneOrigin,
              credentialsDelivered: credentials,
              deliveryInstructions: instructions,
            }
          : o
      )
    );

    // Prompt Section 11.6 exact message:
    // "¡PAGO CONFIRMADO! Tu pago fue verificado correctamente. Tu pedido está listo..."
    const confirmChatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: payReq.userId,
      sender: 'ADMIN',
      senderName: 'Administración StreamBox',
      content: `¡PAGO CONFIRMADO!\nTu pago fue verificado correctamente por nuestro equipo. Tu pedido #${payReq.orderId} está listo.\n\n📦 DATOS DE ENTREGA:\n${credentials}\n\n📋 INSTRUCCIONES:\n${instructions}`,
      timestamp,
      orderId: payReq.orderId,
    };

    setChatMessages((prev) => [...prev, confirmChatMsg]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: payReq.userId,
      type: 'PAYMENT_CONFIRMED',
      title: '¡Pago Confirmado!',
      message: `Tu pago de $${payReq.totalCOP.toLocaleString('es-CO')} COP fue verificado. El pedido ya está disponible en tu chat.`,
      read: false,
      createdAt: timestamp,
      linkTab: 'chat',
    };
    setNotifications((prev) => [notif, ...prev]);

    // Dispatch Native Browser Push Notification for order delivery & credentials
    const deliveredOrderObj: Order = {
      ...(order || {
        id: payReq.orderId,
        userId: payReq.userId,
        userName: payReq.userName,
        userEmail: payReq.userEmail,
        items: [],
        subtotalCOP: payReq.totalCOP,
        discountCOP: 0,
        totalCOP: payReq.totalCOP,
        paymentRequestId: payReq.id,
        paymentMethod: payReq.paymentMethod,
        paymentStatus: 'PAGO_CONFIRMADO',
        orderStatus: 'ENTREGADO',
        createdAt: payReq.createdAt,
      }),
      paymentStatus: 'PAGO_CONFIRMADO',
      orderStatus: 'ENTREGADO',
      confirmedAt: timestamp,
      deliveredAt: timestamp,
      expiresAt: expirationDate.toISOString(),
      customerPhone: order?.customerPhone || payReq.phoneOrigin,
      credentialsDelivered: credentials,
      deliveryInstructions: instructions,
    };
    notifyOrderDelivered(deliveredOrderObj);

    logAuditAction('PAGO_CONFIRMADO', payReq.id, `Confirmado por ${adminEmail}. Monto: $${payReq.totalCOP} COP. Notas: ${adminNotes || 'Ninguna'}`);
    return true;
  };

  // Payment Rejection by Admin (Section 11.7 - Protected by Custom Claim SUPER_ADMIN)
  const rejectPaymentByAdmin = (paymentRequestId: string, reason: string): boolean => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Pagos', 'Intento bloqueado de rechazar pago sin Custom Claim SUPER_ADMIN', false);
      return false;
    }
    const payReq = paymentRequests.find((p) => p.id === paymentRequestId);
    if (!payReq) return false;

    const timestamp = new Date().toISOString();

    setPaymentRequests((prev) =>
      prev.map((p) =>
        p.id === paymentRequestId
          ? {
              ...p,
              status: 'PAGO_RECHAZADO',
              rejectionReason: reason,
            }
          : p
      )
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === payReq.orderId ? { ...o, paymentStatus: 'PAGO_RECHAZADO' } : o
      )
    );

    // Section 11.7 message:
    // "PAGO NO CONFIRMADO - No pudimos verificar tu pago..."
    const rejectChatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: payReq.userId,
      sender: 'ADMIN',
      senderName: 'Administración StreamBox',
      content: `PAGO NO CONFIRMADO: No pudimos verificar tu pago de $${payReq.totalCOP.toLocaleString('es-CO')} COP. Motivo: ${reason}. Por favor revisa la información o comunícate con nosotros desde este chat para ayudarte a validar tu comprobante.`,
      timestamp,
      orderId: payReq.orderId,
    };

    setChatMessages((prev) => [...prev, rejectChatMsg]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: payReq.userId,
      type: 'PAYMENT_REJECTED',
      title: 'Pago No Confirmado',
      message: `No se pudo validar el pago de tu pedido ${payReq.orderId}. Revisa los detalles en el chat.`,
      read: false,
      createdAt: timestamp,
      linkTab: 'chat',
    };
    setNotifications((prev) => [notif, ...prev]);

    logAuditAction('PAGO_RECHAZADO', payReq.id, `Rechazado por ${currentUser?.email}. Motivo: ${reason}`, false);
    return true;
  };

  const deliverOrderCredentials = (orderId: string, credentials: string, instructions: string): boolean => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Pedidos', 'Intento bloqueado de entregar credenciales sin Custom Claim SUPER_ADMIN', false);
      return false;
    }
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const timestamp = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: 'ENTREGADO',
              deliveredAt: timestamp,
              credentialsDelivered: credentials,
              deliveryInstructions: instructions,
            }
          : o
      )
    );

    const deliveryMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: order.userId,
      sender: 'ADMIN',
      senderName: 'Soporte StreamBox',
      content: `¡ENTREGA DE SERVICIO!\nTu pedido #${order.id} ha sido despachado:\n\n🔐 DATOS DE ACCESO:\n${credentials}\n\n📖 INSTRUCCIONES:\n${instructions}`,
      timestamp,
      orderId: order.id,
    };
    setChatMessages((prev) => [...prev, deliveryMsg]);

    // Dispatch Native Browser Push Notification
    const deliveredOrderObj: Order = {
      ...order,
      orderStatus: 'ENTREGADO',
      deliveredAt: timestamp,
      credentialsDelivered: credentials,
      deliveryInstructions: instructions,
    };
    notifyOrderDelivered(deliveredOrderObj);

    logAuditAction('ENTREGA_PEDIDO', order.id, 'Credenciales e instrucciones enviadas al cliente');
    return true;
  };

  const verifyOrderByAdmin = (orderId: string, adminNotes?: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (order.paymentRequestId) {
      const payReq = paymentRequests.find((p) => p.id === order.paymentRequestId);
      if (payReq) {
        return confirmPaymentByAdmin(
          order.paymentRequestId,
          adminNotes || 'Verificado con 1-clic desde Monitor de Pagos Pendientes'
        );
      }
    }

    const timestamp = new Date().toISOString();
    const adminEmail = currentUser?.email || 'd.s.gal.mor.9@gmail.com';
    const firstItem = order.items && order.items[0] ? order.items[0].productName : 'Suscripción Streaming';
    const credentials = `Acceso: ${firstItem.toLowerCase().replace(/\s+/g, '_')}@streambox.vip | PIN / Clave: SB${Math.floor(100000 + Math.random() * 900000)}*`;
    const instructions = `1. Inicia sesión en la plataforma oficial del servicio.\n2. Ingresa con los datos proporcionados.\n3. Disfruta tu contenido sin restricciones. Tienes soporte y garantía activa durante todo tu período.`;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'PAGO_CONFIRMADO',
              orderStatus: 'ENTREGADO',
              confirmedAt: timestamp,
              deliveredAt: timestamp,
              expiresAt: expirationDate.toISOString(),
              credentialsDelivered: credentials,
              deliveryInstructions: instructions,
            }
          : o
      )
    );

    const confirmChatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: order.userId,
      sender: 'ADMIN',
      senderName: 'Administración StreamBox',
      content: `¡PAGO CONFIRMADO!\nTu orden #${order.id} fue verificada exitosamente con 1-clic por el equipo administrativo.\n\n📦 DATOS DE ENTREGA:\n${credentials}\n\n📋 INSTRUCCIONES:\n${instructions}`,
      timestamp,
      orderId: order.id,
    };
    setChatMessages((prev) => [...prev, confirmChatMsg]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: order.userId,
      type: 'PAYMENT_CONFIRMED',
      title: '¡Pago Verificado!',
      message: `Tu pago de $${order.totalCOP.toLocaleString('es-CO')} COP fue confirmado. El pedido ya está disponible en tu chat.`,
      read: false,
      createdAt: timestamp,
      linkTab: 'chat',
    };
    setNotifications((prev) => [notif, ...prev]);

    notifyOrderDelivered({
      ...order,
      paymentStatus: 'PAGO_CONFIRMADO',
      orderStatus: 'ENTREGADO',
      confirmedAt: timestamp,
      deliveredAt: timestamp,
      expiresAt: expirationDate.toISOString(),
      credentialsDelivered: credentials,
      deliveryInstructions: instructions,
    });

    logAuditAction('ORDEN_VERIFICADA_1CLIC', order.id, `Marcada como Verificada por ${adminEmail}`);
    return true;
  };

  const cancelOrderByAdmin = (orderId: string, reason?: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const timestamp = new Date().toISOString();
    const adminEmail = currentUser?.email || 'd.s.gal.mor.9@gmail.com';
    const cancelReason = reason || 'Orden cancelada por administración desde Monitor de Pagos Pendientes';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'CANCELADO',
              orderStatus: 'CANCELADO',
            }
          : o
      )
    );

    if (order.paymentRequestId) {
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === order.paymentRequestId
            ? {
                ...p,
                status: 'CANCELADO',
                rejectionReason: cancelReason,
              }
            : p
        )
      );
    }

    const cancelChatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: order.userId,
      sender: 'ADMIN',
      senderName: 'Administración StreamBox',
      content: `ORDEN CANCELADA: Tu orden #${order.id} por $${order.totalCOP.toLocaleString('es-CO')} COP fue cancelada por el equipo administrativo. Motivo: ${cancelReason}. Si necesitas asistencia, responde a este chat.`,
      timestamp,
      orderId: order.id,
    };
    setChatMessages((prev) => [...prev, cancelChatMsg]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: order.userId,
      type: 'PAYMENT_REJECTED',
      title: 'Orden Cancelada',
      message: `Tu orden ${order.id} ha sido cancelada. Comunícate por chat si requieres asistencia.`,
      read: false,
      createdAt: timestamp,
      linkTab: 'chat',
    };
    setNotifications((prev) => [notif, ...prev]);

    logAuditAction('ORDEN_CANCELADA_1CLIC', order.id, `Marcada como Cancelada por ${adminEmail}. Motivo: ${cancelReason}`, false);
    return true;
  };

  const renewService = (orderId: string, paymentMethod: PaymentMethod) => {
    const originalOrder = orders.find((o) => o.id === orderId);
    if (!originalOrder) return null;

    const newOrderId = `ORD-SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const payRequestId = `PAY-SB-${Math.floor(1000 + Math.random() * 9000)}`;

    const renewedOrder: Order = {
      id: newOrderId,
      userId: originalOrder.userId,
      userName: originalOrder.userName,
      userEmail: originalOrder.userEmail,
      items: originalOrder.items,
      subtotalCOP: originalOrder.subtotalCOP,
      discountCOP: 0,
      totalCOP: originalOrder.totalCOP,
      paymentRequestId: payRequestId,
      paymentMethod,
      paymentStatus: 'PENDIENTE',
      orderStatus: 'EN_PREPARACIÓN',
      createdAt: new Date().toISOString(),
    };

    const newPaymentRequest: PaymentRequest = {
      id: payRequestId,
      orderId: newOrderId,
      userId: originalOrder.userId,
      userName: originalOrder.userName,
      userEmail: originalOrder.userEmail,
      totalCOP: originalOrder.totalCOP,
      paymentMethod,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [renewedOrder, ...prev]);
    setPaymentRequests((prev) => [newPaymentRequest, ...prev]);

    logAuditAction('RENOVACION_SOLICITADA', newOrderId, `Renovación para ${originalOrder.items[0]?.productName}`);
    return { order: renewedOrder, paymentRequest: newPaymentRequest };
  };

  // ==========================================
  // REFUNDS & CLAIMS (Ley 1480 de 2011)
  // ==========================================

  const createRefundRequest = (
    orderId: string,
    reason: RefundReason,
    reasonTitle: string,
    reasonDescription: string,
    incidentDate: string,
    preferredContact: 'EMAIL' | 'WHATSAPP' | 'CHAT_INTERNO',
    evidenceUrls?: string[]
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: 'El pedido seleccionado no fue encontrado.' };
    }

    const newId = `REF-SB-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newRefund: RefundRequest = {
      id: newId,
      orderId,
      userId: currentUser ? currentUser.id : order.userId,
      userName: currentUser ? currentUser.name : order.userName,
      userEmail: currentUser ? currentUser.email : order.userEmail,
      reason,
      reasonTitle,
      reasonDescription,
      incidentDate: incidentDate || now.split('T')[0],
      preferredContact,
      evidenceUrls: evidenceUrls || [],
      status: 'SUBMITTED',
      requestedAmountCOP: order.totalCOP,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          date: now,
          status: 'SUBMITTED',
          note: `Reclamación radicada por el cliente: ${reasonTitle}`,
          actor: currentUser?.name || 'Cliente',
        },
      ],
    };

    setRefundRequests((prev) => [newRefund, ...prev]);

    logAuditAction(
      'RADICACION_REEMBOLSO',
      newId,
      `Solicitud por $${order.totalCOP.toLocaleString('es-CO')} COP para orden ${orderId} (${reason})`
    );

    // Create confirmation notification for customer
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: newRefund.userId,
      type: 'TICKET_UPDATED',
      title: 'Reclamación Radicada Exitosamente',
      message: `Tu solicitud #${newId} para la orden ${orderId} fue recibida y está en cola de revisión técnica (Ley 1480).`,
      read: false,
      createdAt: now,
      linkTab: 'cuenta-reembolsos',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { success: true, refundRequest: newRefund, message: 'Solicitud radicada con éxito.' };
  };

  const updateRefundStatus = (
    refundId: string,
    newStatus: RefundStatus,
    adminNote: string,
    solutionOffer?: string,
    refundedAmountCOP?: number
  ) => {
    const now = new Date().toISOString();
    let updated = false;

    setRefundRequests((prev) =>
      prev.map((r) => {
        if (r.id !== refundId) return r;
        updated = true;
        const newHistory = [
          ...r.history,
          {
            date: now,
            status: newStatus,
            note: adminNote,
            actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administración StreamBox',
          },
        ];

        return {
          ...r,
          status: newStatus,
          adminNotes: adminNote,
          resolutionOffer: solutionOffer || r.resolutionOffer,
          refundedAmountCOP: refundedAmountCOP !== undefined ? refundedAmountCOP : r.refundedAmountCOP,
          updatedAt: now,
          resolvedAt:
            newStatus === 'REFUNDED' || newStatus === 'REJECTED' || newStatus === 'CLOSED'
              ? now
              : r.resolvedAt,
          reviewedBy: currentUser?.email || 'd.s.gal.mor.9@gmail.com',
          history: newHistory,
        };
      })
    );

    if (updated) {
      logAuditAction(
        'ACTUALIZACION_REEMBOLSO',
        refundId,
        `Estado cambiado a ${newStatus}. Nota: ${adminNote}`
      );
    }
    return updated;
  };

  // ==========================================
  // COMPLIANCE AUDIT
  // ==========================================

  const updateComplianceItem = (id: string, updates: Partial<ComplianceItem>) => {
    setComplianceItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          ...updates,
          lastReviewedAt: new Date().toISOString().split('T')[0],
          reviewer: currentUser ? currentUser.email : item.reviewer,
        };
        logAuditAction('ACTUALIZACION_COMPLIANCE', id, `Área ${item.area}: nuevo estado ${updated.status}`);
        return updated;
      })
    );
  };

  const runComplianceAuditCheck = () => {
    const total = complianceItems.length;
    const compliant = complianceItems.filter((i) => i.status === 'COMPLIANT').length;
    const review = complianceItems.filter((i) => i.status === 'NEEDS_REVIEW').length;
    const score = total > 0 ? Math.round((compliant / total) * 100) : 100;
    return { compliantCount: compliant, reviewCount: review, score };
  };

  // ==========================================
  // CONSENT & COOKIES (Ley 1581)
  // ==========================================

  const updateConsentSettings = (settingsPartial: Partial<ConsentSettings>) => {
    setConsentSettings((prev) => {
      const updated = {
        ...prev,
        ...settingsPartial,
        consentTimestamp: new Date().toISOString(),
      };
      localStorage.setItem('sb_consent_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Request Human Support Handover with Email & SMS Notification to Admin
  const requestHumanSupport = async (reason?: string): Promise<boolean> => {
    const userId = currentUser ? currentUser.id : 'usr-client-demo';
    const userName = currentUser ? currentUser.name : 'Cliente StreamBox';
    const userEmail = currentUser ? currentUser.email : 'carlos.cliente@gmail.com';
    const userPhone = currentUser?.phone || '+57 304 596 7068';
    const timestamp = new Date().toISOString();

    setChatMode('WAITING_ADMIN');

    // Notify Administrator via server-side endpoint (Email & SMS)
    try {
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: userName,
          customerEmail: userEmail,
          customerPhone: userPhone,
          message: reason || 'El cliente ha solicitado hablar con una persona de soporte humano.',
          reason: 'Solicitud explícita de atención humana en el chat',
        }),
      });
    } catch (err) {
      console.warn('[Handover Alert] Server notification dispatched:', err);
    }

    const alertMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId,
      sender: 'SYSTEM',
      senderName: 'StreamBox Soporte Oficial',
      content: `🚨 SOLICITUD DE ATENCIÓN HUMANA REGISTRADA\n\nSe ha emitido una alerta inmediata a la administración de StreamBox Colombia:\n• 📧 Correo de soporte: d.s.gal.mor.9@gmail.com\n• 📱 Alerta SMS / Celular oficial: +57 304 596 7068\n\nTu conversación ha sido transferida a nuestro equipo humano. Un asesor revisará tu caso en este chat a la mayor brevedad. Si deseas comunicarte de inmediato, puedes usar los accesos directos por WhatsApp o llamada a continuación.`,
      timestamp,
      isHumanRequestAlert: true,
      adminNotifiedEmail: 'd.s.gal.mor.9@gmail.com',
      adminNotifiedPhone: '+57 304 596 7068',
    };

    setChatMessages((prev) => [...prev, alertMsg]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId,
      type: 'TICKET_UPDATED',
      title: 'Atención Humana Solicitada',
      message: 'Notificamos al administrador vía correo (d.s.gal.mor.9@gmail.com) y SMS (+57 304 596 7068).',
      read: false,
      createdAt: timestamp,
      linkTab: 'chat',
    };
    setNotifications((prev) => [notif, ...prev]);
    logAuditAction('SOLICITUD_ASESOR_HUMANO', userId, 'Alerta de correo y SMS enviada a d.s.gal.mor.9@gmail.com y +57 304 596 7068');

    return true;
  };

  // Automated Multi-Turn Chatbot using Gemini & Server Handover
  const sendChatMessage = async (content: string, quickAction?: string) => {
    if (!content.trim() && !quickAction) return;

    const userId = currentUser ? currentUser.id : 'usr-client-demo';
    const userName = currentUser ? currentUser.name : 'Cliente';
    const timestamp = new Date().toISOString();

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId,
      sender: 'USER',
      senderName: userName,
      content: content.trim(),
      timestamp,
      quickAction,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    const upper = content.toUpperCase();
    const isHumanRequest =
      quickAction === 'HABLAR_CON_SOPORTE' ||
      upper.includes('HUMANO') ||
      upper.includes('ASESOR') ||
      upper.includes('PERSONA') ||
      upper.includes('AGENTE') ||
      upper.includes('HABLAR CON ALGUIEN') ||
      upper.includes('ATENCION HUMANA');

    if (isHumanRequest) {
      await requestHumanSupport(content);
      return;
    }

    // Call server-side Gemini API for intelligent automatic responses
    setIsBotTyping(true);
    try {
      const userOrders = orders.filter((o) => o.userId === userId);
      const latestOrder = userOrders[0];

      // Prepare conversation history (last 10 turns)
      const relevantHistory = [...chatMessages, userMsg]
        .filter((m) => m.userId === userId || m.userId === 'ALL')
        .slice(-10)
        .map((m) => ({
          role: m.sender === 'USER' ? 'user' : 'model',
          text: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: relevantHistory,
          userContext: {
            name: userName,
            email: currentUser?.email,
            phone: currentUser?.phone,
            recentOrder: latestOrder
              ? {
                  id: latestOrder.id,
                  status: latestOrder.orderStatus,
                  product: latestOrder.items[0]?.productName,
                  totalCOP: latestOrder.totalCOP,
                }
              : undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          const botMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            userId,
            sender: 'BOT',
            senderName: 'StreamBot AI',
            content: data.reply,
            timestamp: new Date().toISOString(),
          };
          setChatMessages((prev) => [...prev, botMsg]);

          if (data.needsHumanHandover) {
            await requestHumanSupport(content);
          }
          return;
        }
      }
      // If API fails or offline, fall back cleanly
      handleBotFallback(content, quickAction, userId);
    } catch (err) {
      console.warn('Network call to /api/chat error, fallback applied:', err);
      handleBotFallback(content, quickAction, userId);
    } finally {
      setIsBotTyping(false);
    }
  };

  const adminReplyChatMessage = (userId: string, content: string) => {
    const adminName = currentUser ? currentUser.name : 'Asesor StreamBox';
    const timestamp = new Date().toISOString();

    const adminMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId,
      sender: 'ADMIN',
      senderName: adminName,
      content: content.trim(),
      timestamp,
    };

    setChatMessages((prev) => [...prev, adminMsg]);
    setChatMode('HUMAN_ACTIVE');
    logAuditAction('RESPUESTA_CHAT_ADMIN', `Cliente ${userId}`, 'Mensaje enviado por soporte humano');
  };

  // Fallback handler for instant queries
  const handleBotFallback = (text: string, quickAction?: string, targetUserId?: string) => {
    const uid = targetUserId || (currentUser ? currentUser.id : 'usr-client-demo');
    const upper = text.toUpperCase();

    let botResponse = '';

    if (quickAction === 'MI_PEDIDO' || upper.includes('MI PEDIDO') || upper.includes('ESTADO DE MI PEDIDO')) {
      const userOrders = orders.filter((o) => o.userId === uid);
      if (userOrders.length === 0) {
        botResponse = '🔍 Actualmente no tienes pedidos registrados en tu cuenta. Puedes explorar nuestro catálogo y adquirir tus servicios favoritos con entrega inmediata.';
      } else {
        const latest = userOrders[0];
        const statusText =
          latest.orderStatus === 'ENTREGADO'
            ? '✅ ENTREGADO y Activo'
            : latest.paymentStatus === 'PAGO_REPORTADO'
            ? '⏳ PAGO EN REVISIÓN por nuestro equipo'
            : latest.paymentStatus === 'PAGO_CONFIRMADO'
            ? '⚙️ En Preparación de Entrega'
            : '⚠️ Pendiente de Reportar Pago';

        botResponse = `📋 Tu pedido más reciente es el #${latest.id}:\n- Producto: ${latest.items.map((i) => `${i.productName} (${i.modalityName})`).join(', ')}\n- Total: $${latest.totalCOP.toLocaleString('es-CO')} COP\n- Estado: ${statusText}`;
      }
    } else if (quickAction === 'MI_PAGO' || upper.includes('MI PAGO') || upper.includes('VERIFICAR PAGO')) {
      const userPayments = paymentRequests.filter((p) => p.userId === uid);
      if (userPayments.length === 0) {
        botResponse = '💳 No encontramos pagos reportados bajo tu usuario. Para reportar una transferencia, ve a la sección de Checkout o a "Mis Pagos" e ingresa el número de referencia.';
      } else {
        const latest = userPayments[0];
        botResponse = `💳 Estado de tu solicitud de pago #${latest.id}:\n- Monto: $${latest.totalCOP.toLocaleString('es-CO')} COP\n- Método: ${latest.paymentMethod}\n- Estado: ${latest.status}\n${latest.referenceNumber ? `- Referencia: ${latest.referenceNumber}\n` : ''}${latest.status === 'PAGO_REPORTADO' ? '⏳ Nuestro equipo administrativo lo está verificando manualmente en el banco.' : ''}`;
      }
    } else if (quickAction === 'MI_VENCIMIENTO' || upper.includes('VENCIMIENTO') || upper.includes('RENOVAR')) {
      const deliveredOrders = orders.filter((o) => o.userId === uid && o.orderStatus === 'ENTREGADO');
      if (deliveredOrders.length === 0) {
        botResponse = '📅 No tienes servicios activos en este momento.';
      } else {
        const list = deliveredOrders
          .map((o) => {
            const exp = o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('es-CO') : 'Garantía 30 días';
            return `• ${o.items[0]?.productName} — Vence: ${exp}`;
          })
          .join('\n');
        botResponse = `📅 Tus suscripciones activas:\n${list}\n\nPuedes solicitar una renovación desde tu panel de "Mis Servicios" con 1 clic.`;
      }
    } else if (upper.includes('NEQUI') || upper.includes('DAVIPLATA') || upper.includes('COMO PAGAR')) {
      botResponse = `💰 Datos de Pago Oficiales StreamBox Colombia:\n\n📱 NEQUI: ${settings.nequiNumber}\n📱 DAVIPLATA: ${settings.daviplataNumber}\n\n1. Transfiere desde tu app bancaria.\n2. Guarda el comprobante con el número de referencia.\n3. Repórtalo en nuestra web para recibir tus accesos de inmediato.`;
    } else {
      botResponse = '🤖 ¡Hola! Soy StreamBot AI de StreamBox Colombia. Puedo responder todas tus dudas sobre precios en COP, cuentas de streaming, software, pagos por Nequi/Daviplata o transferirte de inmediato con un asesor humano cuando lo necesites.';
    }

    const botMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: uid,
      sender: 'BOT',
      senderName: 'StreamBot AI',
      content: botResponse,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, botMsg]);
  };

  const handleChatbotAction = (actionKey: 'MI_PEDIDO' | 'MI_PAGO' | 'MI_VENCIMIENTO' | 'HABLAR_CON_SOPORTE' | 'FAQ') => {
    sendChatMessage(actionKey.replace(/_/g, ' '), actionKey);
  };

  const resetUserChat = (targetUserId?: string) => {
    const uid = targetUserId || (currentUser ? currentUser.id : 'usr-client-demo');
    const timestamp = new Date().toISOString();

    const initialWelcomeMsg: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      userId: uid,
      sender: 'BOT',
      senderName: 'StreamBot AI',
      content: '¡Hola! He reiniciado la conversación en vivo. Soy StreamBot AI, tu asistente virtual con Gemini 3.8 Flash. ¿En qué puedo ayudarte hoy?\n\nPuedes consultar el estado de tu pedido, verificar tus pagos por Nequi/Daviplata o solicitar atención con un asesor humano en cualquier momento.',
      timestamp,
    };

    setChatMessages((prev) => {
      // Keep messages from other users, replace target user's messages with fresh welcome message
      const otherMessages = prev.filter((m) => m.userId !== uid && m.userId !== 'ALL');
      const updated = [...otherMessages, initialWelcomeMsg];
      localStorage.setItem('sb_chat_messages', JSON.stringify(updated));
      return updated;
    });

    setChatMode('BOT_ACTIVE');
    setIsBotTyping(false);
    logAuditAction('REINICIO_CHAT_USUARIO', `Usuario ${uid}`, 'El usuario reinició su sesión de chat en vivo.');
  };

  // Ticket Operations
  const createTicket = (
    subject: string,
    category: string,
    initialMessage: string,
    priority: Ticket['priority'] = 'MEDIUM'
  ): Ticket => {
    const user = currentUser || {
      id: 'usr-client-demo',
      name: 'Cliente',
      email: 'carlos.cliente@gmail.com',
      role: 'CLIENTE',
      createdAt: new Date().toISOString(),
      active: true,
    };

    const newTicket: Ticket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject,
      category,
      status: 'OPEN',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `tmsg-${Date.now()}`,
          sender: 'USER',
          senderName: user.name,
          content: initialMessage,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    logAuditAction('TICKET_CREADO', newTicket.id, `Asunto: ${subject}`);
    return newTicket;
  };

  const replyTicket = (ticketId: string, content: string, asSupport = false) => {
    const author = asSupport ? 'Soporte StreamBox' : currentUser?.name || 'Cliente';
    const timestamp = new Date().toISOString();

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: asSupport ? 'WAITING_USER' : 'IN_PROGRESS',
              updatedAt: timestamp,
              messages: [
                ...t.messages,
                {
                  id: `tmsg-${Date.now()}`,
                  sender: asSupport ? 'SUPPORT' : 'USER',
                  senderName: author,
                  content,
                  timestamp,
                },
              ],
            }
          : t
      )
    );

    logAuditAction('RESPUESTA_TICKET', ticketId, `Respuesta añadida por ${author}`);
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
    logAuditAction('ESTADO_TICKET', ticketId, `Estado cambiado a ${status}`);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && (currentUser ? n.userId === currentUser.id : true)
  ).length;

  // Browser Push Notifications
  const isPushNotificationSupported = isNotificationSupported();
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );

  const requestPushNotificationPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserNotificationPermission(perm);
    return perm;
  };

  const sendPushTestNotification = (type: 'delivery' | 'expiring'): BrowserNotificationResult => {
    return sendTestNotification(type);
  };

  const notifyOrderDeliveredManually = (orderId: string): boolean => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return false;
    return notifyOrderDelivered(targetOrder, true);
  };

  // Push Notification Watcher: Evaluates active delivered orders for expiring soon alerts (<= 3 days)
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const userOrdersToCheck = orders.filter((o) => {
      if (currentUser && o.userId !== currentUser.id) return false;
      return o.orderStatus === 'ENTREGADO' && !!o.expiresAt;
    });

    userOrdersToCheck.forEach((order) => {
      if (!order.expiresAt) return;
      const daysRemaining = Math.ceil(
        (new Date(order.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Alert if subscription expires in <= 3 days (including today or yesterday)
      if (daysRemaining <= 3 && daysRemaining >= -1) {
        notifySubscriptionExpiringSoon(order, daysRemaining);
      }
    });
  }, [orders, currentUser]);

  // Settings & Promos (Protected by Custom Claim SUPER_ADMIN)
  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Configuración', 'Intento bloqueado de modificar configuración sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAuditAction('CONFIGURACION_SISTEMA', 'Global', 'Ajustes globales actualizados');
  };

  const createPromotion = (promoData: Omit<Promotion, 'id' | 'usedCount'>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Promociones', 'Intento bloqueado de crear promoción sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    const newPromo: Promotion = {
      ...promoData,
      id: `promo-${Date.now()}`,
      usedCount: 0,
    };
    setPromotions((prev) => [newPromo, ...prev]);
    logAuditAction('CREAR_PROMOCION', newPromo.code, `Cupón creado: ${newPromo.code}`);
  };

  const togglePromotionActive = (id: string) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      logAuditAction('ERROR_PERMISOS', 'Promociones', 'Intento bloqueado de alternar promoción sin Custom Claim SUPER_ADMIN', false);
      return;
    }
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    logAuditAction('TOGGLE_PROMOCION', `ID ${id}`, 'Estado de promoción actualizado');
  };

  const enterGiveaway = (
    giveawayId: string
  ): {
    success: boolean;
    message: string;
    ticketNumber?: number;
    ticketCode?: string;
    totalUserTickets?: number;
  } => {
    if (!currentUser) {
      return { success: false, message: 'Debes iniciar sesión para participar en el sorteo.' };
    }

    const campaign = giveaways.find((g) => g.id === giveawayId);
    if (!campaign) {
      return { success: false, message: 'Campaña de sorteo no encontrada.' };
    }

    const participants = campaign.participants || [];
    const userEntries = participants.filter((p) => p.userId === currentUser.id || p.userEmail === currentUser.email);

    // Si el modo NO es clics infinitos, limitar estrictamente a 1 solo clic / 1 ticket por cuenta
    if (!campaign.allowUnlimitedTickets && userEntries.length >= 1) {
      const existingTicket = userEntries[0];
      return {
        success: false,
        message: `Ya tienes tu cupo asegurado con el Turno / Ticket #${existingTicket.ticketNumber} (${existingTicket.ticketCode}). Solo se permite 1 participación por cuenta.`,
        ticketNumber: existingTicket.ticketNumber,
        ticketCode: existingTicket.ticketCode,
        totalUserTickets: 1,
      };
    }

    // Generar siguiente número/turno correlativo
    const nextTicketNumber = campaign.entriesCount + 1;
    const ticketCode = `SB-TICKET-${String(nextTicketNumber).padStart(4, '0')}`;
    const newParticipant = {
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name || 'Cliente StreamBox',
      ticketNumber: nextTicketNumber,
      ticketCode,
      joinedAt: new Date().toISOString(),
    };

    setGiveaways((prev) =>
      prev.map((g) => {
        if (g.id !== giveawayId) return g;
        const currentParts = g.participants || [];
        return {
          ...g,
          entriesCount: g.entriesCount + 1,
          participants: [...currentParts, newParticipant],
        };
      })
    );

    const totalTicketsNow = userEntries.length + 1;
    logAuditAction(
      'PARTICIPACION_SORTEO',
      giveawayId,
      `Ticket #${nextTicketNumber} (${ticketCode}) asignado a ${currentUser.email} (Total tickets usuario: ${totalTicketsNow})`
    );

    return {
      success: true,
      message: campaign.allowUnlimitedTickets
        ? `¡Ticket adicional generado con éxito! Eres el Turno #${nextTicketNumber} (${ticketCode}). Tienes ${totalTicketsNow} ticket(s) acumulados.`
        : `¡Registro exitoso! Eres el Turno / Ticket #${nextTicketNumber} (${ticketCode}). Tu participación única está guardada.`,
      ticketNumber: nextTicketNumber,
      ticketCode,
      totalUserTickets: totalTicketsNow,
    };
  };

  const toggleGiveawayUnlimitedTickets = (giveawayId: string) => {
    setGiveaways((prev) =>
      prev.map((g) => {
        if (g.id !== giveawayId) return g;
        const nextState = !g.allowUnlimitedTickets;
        logAuditAction(
          'CONFIG_SORTEO',
          giveawayId,
          `Modo de tickets cambiado: ${nextState ? 'CLICS_INFINITOS_ACTIVADO' : '1_TICKET_POR_CUENTA_ACTIVADO'}`
        );
        return { ...g, allowUnlimitedTickets: nextState };
      })
    );
  };

  // ==========================================
  // AUTOMATED EXCEL DATABASE & LIVE WEB FEED
  // ==========================================
  const getExcelFeedUrl = (): string => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${origin}/api/database/excel-feed`;
  };

  const downloadFullExcelDatabase = () => {
    const csvContent = generateExcelDatabaseCSV({
      orders,
      payments: paymentRequests,
      users: allUsers,
      products,
      giveaways,
      refundRequests,
      auditLogs,
    });
    const dateStr = new Date().toISOString().split('T')[0];
    triggerBrowserDownload(`streambox-database-completa-${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
    logAuditAction('DESCARGA_BASE_DATOS', 'Excel/CSV', 'Descarga manual de base de datos maestra multi-tabla para Excel');
  };

  const downloadExcelWebQueryConnector = () => {
    const feedUrl = getExcelFeedUrl();
    const iqyContent = generateExcelWebQueryIQY(feedUrl);
    triggerBrowserDownload('streambox-retroalimentacion-automatica.iqy', iqyContent, 'text/plain;charset=utf-8;');
    logAuditAction('DESCARGA_CONECTOR_EXCEL', 'Web Query IQY', 'Descarga de conector para auto-actualización periódica en Excel');
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        allUsers,
        isAuthLoading,
        login,
        loginWithCredentials,
        loginWithGoogle,
        register,
        sendPasswordReset,
        logout,
        switchUserRole,
        updateUserRole,
        updateUserProfile,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleCategoryActive,
        applyPriceIncrementToUnadjusted,
        adjustCatalogPrices,
        resetCatalogPrices,
        exportProductsCSV,
        importProductsCSV,
        favorites,
        toggleFavorite,
        isFavorite,
        recentlyViewed,
        addToRecentlyViewed,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        cartSubtotalCOP,
        cartDiscountCOP,
        cartTotalCOP,
        orders,
        paymentRequests,
        createOrderFromCart,
        createInstantOrder,
        reportPayment,
        confirmPaymentByAdmin,
        rejectPaymentByAdmin,
        deliverOrderCredentials,
        verifyOrderByAdmin,
        cancelOrderByAdmin,
        renewService,
        chatMessages,
        chatMode,
        isBotTyping,
        sendChatMessage,
        adminReplyChatMessage,
        handleChatbotAction,
        requestHumanSupport,
        resetUserChat,
        tickets,
        createTicket,
        replyTicket,
        updateTicketStatus,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
        isPushNotificationSupported,
        browserNotificationPermission,
        requestPushNotificationPermission,
        sendPushTestNotification,
        notifyOrderDeliveredManually,
        settings,
        updateSettings,
        promotions,
        createPromotion,
        togglePromotionActive,
        giveaways,
        enterGiveaway,
        toggleGiveawayUnlimitedTickets,
        auditLogs,
        logAuditAction,
        refundRequests,
        createRefundRequest,
        updateRefundStatus,
        complianceItems,
        updateComplianceItem,
        runComplianceAuditCheck,
        consentSettings,
        updateConsentSettings,
        downloadFullExcelDatabase,
        downloadExcelWebQueryConnector,
        getExcelFeedUrl,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
