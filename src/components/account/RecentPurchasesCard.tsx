import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { Order, PaymentStatus, OrderStatus } from '../../types';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Download,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface RecentPurchasesCardProps {
  onSelectOrderForInvoice: (order: Order) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToChat?: () => void;
  maxItems?: number;
}

export const RecentPurchasesCard: React.FC<RecentPurchasesCardProps> = ({
  onSelectOrderForInvoice,
  onNavigateToCatalog,
  onNavigateToChat,
  maxItems = 5,
}) => {
  const { currentUser, orders: storeOrders } = useStore();
  const [firebaseOrders, setFirebaseOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveFromFirebase, setIsLiveFromFirebase] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load / listen to purchases from Firebase Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadOrdersFromFirebase = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        if (isFirebaseConfigured && db) {
          // Query user purchases from Firebase Firestore 'orders' collection
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef,
            where('userEmail', '==', currentUser.email),
            limit(maxItems)
          );

          // Real-time listener
          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              if (!snapshot.empty) {
                const fetched: Order[] = snapshot.docs.map((doc) => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    userId: data.userId || currentUser.id,
                    userName: data.userName || currentUser.name || 'Cliente StreamBox',
                    userEmail: data.userEmail || currentUser.email,
                    customerPhone: data.customerPhone || currentUser.phone,
                    items: data.items || [],
                    subtotalCOP: data.subtotalCOP || data.totalCOP || 0,
                    discountCOP: data.discountCOP || 0,
                    appliedCoupon: data.appliedCoupon,
                    totalCOP: data.totalCOP || 0,
                    paymentRequestId: data.paymentRequestId || `pay-${doc.id}`,
                    paymentMethod: data.paymentMethod || 'NEQUI',
                    paymentStatus: (data.paymentStatus || 'PAGO_CONFIRMADO') as PaymentStatus,
                    orderStatus: (data.orderStatus || 'ENTREGADO') as OrderStatus,
                    credentialsDelivered: data.credentialsDelivered || data.credentials,
                    deliveryInstructions: data.deliveryInstructions || data.instructions,
                    confirmedAt: data.confirmedAt,
                    deliveredAt: data.deliveredAt,
                    expiresAt: data.expiresAt,
                    createdAt: data.createdAt || new Date().toISOString(),
                  };
                });

                // Sort descending by date
                fetched.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setFirebaseOrders(fetched);
                setIsLiveFromFirebase(true);
              } else {
                // If firestore returns 0 docs for this demo user, fall back to memory store
                setIsLiveFromFirebase(false);
              }
              setIsLoading(false);
            },
            (error) => {
              console.warn('[RecentPurchasesCard] Firestore snapshot note:', error.message);
              setIsLiveFromFirebase(false);
              setIsLoading(false);
            }
          );
        } else {
          setIsLiveFromFirebase(false);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[RecentPurchasesCard] Error querying Firestore:', err);
        setIsLiveFromFirebase(false);
        setIsLoading(false);
      }
    };

    loadOrdersFromFirebase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, maxItems]);

  // Combine Firestore results with StoreContext user orders fallback
  const userStoreOrders = storeOrders.filter(
    (o) =>
      o.userEmail === currentUser?.email ||
      o.userId === currentUser?.id ||
      currentUser?.role === 'SUPER_ADMIN'
  );

  const displayOrders =
    firebaseOrders.length > 0 ? firebaseOrders : userStoreOrders.slice(0, maxItems);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="cinema-glass-card rounded-3xl p-6 sm:p-7 border border-white/8 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-6">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Mis Compras Recientes</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            {isLiveFromFirebase ? (
              <span className="text-[11px] text-emerald-400 font-mono inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Sincronizado en vivo con Firebase
              </span>
            ) : (
              <span className="text-[11px] text-neutral-400 font-mono inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Almacén Seguro StreamBox
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Historial de Suscripciones & Facturación
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Consulta el estado de entrega en tiempo real y descarga tus recibos oficiales en formato PDF.
          </p>
        </div>

        {onNavigateToCatalog && (
          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer active:scale-95 inline-flex items-center gap-1.5"
          >
            <span>Nueva Compra</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        )}
      </div>

      {/* Purchases List */}
      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-black/40 border border-white/6 text-neutral-400 space-y-3">
            <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
            <div>
              <h4 className="text-sm font-bold text-white">No tienes compras registradas aún</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                Tus pedidos activados con Nequi, Daviplata o Binance se reflejarán aquí con acceso directo a la factura PDF.
              </p>
            </div>
            {onNavigateToCatalog && (
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95 inline-flex items-center gap-2"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          displayOrders.map((order) => {
            const firstItem = order.items[0];
            const isDelivered = order.orderStatus === 'ENTREGADO';
            const isConfirmed = order.paymentStatus === 'PAGO_CONFIRMADO';
            const isReported = order.paymentStatus === 'PAGO_REPORTADO';
            const isRejected = order.paymentStatus === 'PAGO_RECHAZADO';

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-black/50 border border-white/6 hover:border-amber-500/25 transition-all space-y-3.5"
              >
                {/* Header row: Order ID, Date & Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/6 text-xs">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-white text-sm">
                      {order.id}
                    </span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-neutral-400 text-[11px]">
                      Método: <strong className="text-neutral-200">{order.paymentMethod}</strong>
                    </span>
                  </div>

                  {/* Color-Coded Status Tags (Etiquetas de estado con códigos de color) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Status Tag */}
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PAGO CONFIRMADO</span>
                      </span>
                    ) : isReported ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>VALIDANDO PAGO</span>
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>RECHAZADO</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>PENDIENTE</span>
                      </span>
                    )}

                    {/* Delivery Status Tag */}
                    {isDelivered ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ENTREGADO</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
                        <Clock className="w-3.5 h-3.5" />
                        <span>EN APROVISIONAMIENTO</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in this purchase */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-black/40 border border-white/4 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BrandLogo brand={item.productName} size="xs" />
                        <div className="min-w-0">
                          <h5 className="font-bold text-white truncate">{item.productName}</h5>
                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            {item.modalityName} · {item.duration} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono font-bold text-white shrink-0 ml-3">
                        ${(item.priceCOP * item.quantity).toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivered Credentials snippet if available */}
                {order.credentialsDelivered && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-cyan-300 font-semibold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Credenciales Oficiales Asignadas</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.credentialsDelivered!, `cred-${order.id}`)}
                        className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `cred-${order.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Copiadas!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-zinc-200 text-xs bg-black/60 p-2 rounded-lg break-all select-all">
                      {order.credentialsDelivered}
                    </p>
                  </div>
                )}

                {/* Footer: Total & Direct PDF Invoice Download Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                  <div className="text-neutral-400">
                    Total pagado:{' '}
                    <strong className="font-mono text-white text-sm">
                      ${order.totalCOP.toLocaleString('es-CO')} COP
                    </strong>
                  </div>

                  {/* Direct PDF Receipt Download Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrderForInvoice(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 hover:border-purple-400 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      title="Descargar o imprimir comprobante PDF oficial de la compra"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-300" />
                      <span>Descargar Factura PDF</span>
                    </button>

                    {onNavigateToChat && (
                      <button
                        type="button"
                        onClick={onNavigateToChat}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-neutral-300 hover:text-white transition-colors cursor-pointer active:scale-95"
                        title="Ver soporte en Mi Chat"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
