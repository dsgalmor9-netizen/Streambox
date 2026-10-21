// Only SUPER_ADMIN (the platform owner) and standard users (CLIENTE)
export type UserRole = 'SUPER_ADMIN' | 'CLIENTE';

export interface UserPreferences {
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
  promotionsAlerts?: boolean;
  preferredPaymentMethod?: 'NEQUI' | 'DAVIPLATA';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  active: boolean;
  referralCode?: string;
  referredBy?: string;
  rewardPoints?: number;
  preferences?: UserPreferences;
}

export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'PRICE_PENDING' | 'HIDDEN' | 'DRAFT';
export type VisualAssetStatus = 'VERIFIED' | 'PENDING' | 'NOT_FOUND' | 'FILE_ERROR' | 'LICENSE_REVIEW';
export type PriceStatus = 'VERIFIED_STREAMBOX' | 'OFFICIAL_REFERENCE' | 'PRICE_PENDING';

export interface ProductModality {
  id: string;
  name: string; // e.g. "Perfil Pantalla Individual", "Cuenta Completa 4 Pantallas", "Licencia Personal"
  duration: string; // e.g. "15 Días", "1 Mes", "3 Meses", "6 Meses", "12 Meses"
  priceCOP: number | null; // null if unverified
  originalPriceCOP?: number;
  officialReferencePriceCOP?: number; // External reference comparison
  priceStatus: PriceStatus;
  available: boolean;
  stock?: number;
  usersAllowed?: number | string;
  quality?: string; // e.g. "4K UHD", "1080p", "Hi-Fi"
  licenseType?: string; // e.g. "Perfil Individual", "Cuenta Completa", "Licencia Team"
  activationConditions?: string;
  renewalPolicy?: string;
  warrantyInfo?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  logoColor?: string;
  brandAccent?: string;
  logoUrl?: string;
  visualStatus?: VisualAssetStatus;
  productType: string;
  modalities: ProductModality[];
  region: string;
  compatibility: string;
  deliveryMethod: string;
  terms: string;
  verificationSource?: string;
  verifiedDate?: string;
  sourceUrl?: string;
  status: ProductStatus;
  tags: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  faq?: { q: string; a: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  subcategories: string[];
  active: boolean;
  order: number;
  colorAccent?: string;
}

export interface CartItem {
  productId: string;
  modalityId: string;
  productName: string;
  brand: string;
  modalityName: string;
  duration: string;
  priceCOP: number;
  quantity: number;
}

export type PaymentMethod = 'NEQUI' | 'DAVIPLATA';

export type PaymentStatus = 
  | 'PENDIENTE' 
  | 'PAGO_REPORTADO' 
  | 'PAGO_CONFIRMADO' 
  | 'PAGO_RECHAZADO' 
  | 'EXPIRADO' 
  | 'CANCELADO';

export type OrderStatus = 
  | 'EN_PREPARACIÓN' 
  | 'ENTREGADO' 
  | 'CANCELADO';

export interface PaymentRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalCOP: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string;
  phoneOrigin?: string;
  voucherNote?: string;
  reportedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  brand: string;
  modalityName: string;
  duration: string;
  priceCOP: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  customerPhone?: string;
  items: OrderItemSnapshot[];
  subtotalCOP: number;
  discountCOP: number;
  appliedCoupon?: string;
  totalCOP: number;
  paymentRequestId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  credentialsDelivered?: string;
  deliveryInstructions?: string;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  expiresAt?: string;
  renewedFromOrderId?: string;
}

export type ChatSender = 'USER' | 'BOT' | 'ADMIN' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  userId: string;
  sender: ChatSender;
  senderName: string;
  content: string;
  timestamp: string;
  orderId?: string;
  paymentRequestId?: string;
  quickAction?: string;
  isHumanRequestAlert?: boolean;
  adminNotifiedEmail?: string;
  adminNotifiedPhone?: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TicketMessage {
  id: string;
  sender: 'USER' | 'SUPPORT';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'PAYMENT_REPORTED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_REJECTED' | 'NEW_MESSAGE' | 'ORDER_CREATED' | 'ORDER_DELIVERED' | 'TICKET_UPDATED';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface Promotion {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_COP';
  value: number;
  minPurchaseCOP: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  validUntil: string;
  description?: string;
}

export interface GlobalSettings {
  nequiNumber: string;
  daviplataNumber: string;
  maintenanceMode: boolean;
  allowPurchases: boolean;
  allowRegistrations: boolean;
  supportEmail: string;
  supportPhone: string;
  storeName: string;
  slogan: string;
  // Legal & Compliance fields (Ley 1480 y Ley 1581)
  legalBusinessName?: string;
  legalNIT?: string;
  legalAddress?: string;
  legalRepresentative?: string;
  legalCity?: string;
  legalStatus: 'PENDING_REVIEW' | 'VERIFIED';
  termsVersion: string;
  privacyVersion: string;
  refundsVersion: string;
  lastLegalReviewDate: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  success: boolean;
}

export interface GiveawayParticipant {
  userId: string;
  userEmail: string;
  userName: string;
  ticketNumber: number; // Número o turno único oficial
  ticketCode: string;   // Código de ticket alfanumérico (ej: SB-TICKET-0088)
  joinedAt: string;
}

export interface GiveawayCampaign {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ENDED';
  rules: string[];
  entriesCount: number;
  winnerName?: string;
  winnerAnnounced: boolean;
  participants?: GiveawayParticipant[];
  allowUnlimitedTickets?: boolean; // Permite alternar entre 1 ticket único o modo clics infinitos
}

// ==========================================
// REFUNDS & CLAIMS (Ley 1480 de 2011)
// ==========================================

export type RefundStatus =
  | 'SUBMITTED'          // Solicitud recibida
  | 'UNDER_REVIEW'       // En revisión técnica / jurídica
  | 'NEED_MORE_INFO'     // Requiere información adicional
  | 'APPROVED'           // Aprobada por el equipo
  | 'REJECTED'           // Rechazada con justificación motivada
  | 'REFUND_PROCESSING'  // Devolución en trámite bancario
  | 'REFUNDED'           // Devolución confirmada
  | 'CLOSED';            // Caso finalizado

export type RefundReason =
  | 'DUPLICATE_PAYMENT'      // Pago duplicado
  | 'UNREGISTERED_PAYMENT'   // Pago realizado pero pedido no registrado
  | 'ORDER_NOT_STARTED'      // Pedido cancelado antes del inicio del servicio
  | 'DELIVERY_TIMEOUT'       // Servicio no entregado en plazo informado
  | 'WRONG_PRODUCT'          // Producto o modalidad diferente a la comprada
  | 'ACTIVATION_FAILURE'     // Activación fallida atribuible a la plataforma
  | 'SERVICE_MALFUNCTION'    // Falla técnica durante el período de garantía
  | 'INCORRECT_CHARGE'       // Cobro incorrecto verificado
  | 'LEGAL_RETRACTO'         // Ejercicio legítimo de derecho de retracto (art. 47 Ley 1480)
  | 'OTHER';

export interface RefundHistoryEntry {
  date: string;
  status: RefundStatus;
  note: string;
  actor: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: RefundReason;
  reasonTitle: string;
  reasonDescription: string;
  incidentDate: string;
  preferredContact: 'EMAIL' | 'WHATSAPP' | 'CHAT_INTERNO';
  evidenceUrls?: string[];
  status: RefundStatus;
  requestedAmountCOP: number;
  refundedAmountCOP?: number;
  resolutionOffer?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reviewedBy?: string;
  history: RefundHistoryEntry[];
}

// ==========================================
// COMPLIANCE AUDIT (12 Áreas Obligatorias)
// ==========================================

export type ComplianceArea =
  | 'GOOGLE_POLICIES'
  | 'PROVIDER_CONDITIONS'
  | 'TERMS_CONDITIONS'
  | 'PRIVACY_POLICY'
  | 'REFUNDS_RETRACTO'
  | 'DATA_PROTECTION_1581'
  | 'PAYMENTS_FRAUD'
  | 'SECURITY_RBAC'
  | 'CATALOG_LICENSING'
  | 'ADVERTISING_PROMOTIONS'
  | 'CLAIMS_RESOLUTION'
  | 'DATA_RETENTION';

export type ComplianceStatus =
  | 'COMPLIANT'       // Comprobado con evidencia suficiente
  | 'NEEDS_REVIEW'    // Requiere revisión jurídica o técnica
  | 'NON_COMPLIANT'   // Se identificó un incumplimiento
  | 'NOT_APPLICABLE'  // No aplica, con justificación
  | 'BLOCKED';        // No se puede verificar temporalmente

export interface ComplianceItem {
  id: string;
  area: ComplianceArea;
  name: string;
  description: string;
  status: ComplianceStatus;
  officialSource: string;
  lastReviewedAt: string;
  reviewer: string;
  evidence: string;
  observations: string;
  nextReviewDate?: string;
}

// ==========================================
// USER CONSENT & COOKIES (Ley 1581)
// ==========================================

export interface ConsentSettings {
  essentialCookies: boolean; // Siempre true
  analyticsCookies: boolean;
  marketingCommunications: boolean; // NO premarcada por defecto
  acceptedTermsVersion?: string;
  acceptedPrivacyVersion?: string;
  consentTimestamp?: string;
}
