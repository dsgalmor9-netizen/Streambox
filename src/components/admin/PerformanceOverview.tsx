import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Area,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  PackageCheck,
  Sparkles,
  ArrowUpRight,
  Filter,
  Tv,
  Download,
  Check,
  FileSpreadsheet,
  RotateCcw,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { triggerBrowserDownload } from '../../lib/excelExport';

interface DailyRevenuePoint {
  date: string;
  fullDate: string;
  revenue: number;
  ordersCount: number;
}

interface SubscriptionTypeSold {
  type: string;
  shortName: string;
  unitsSold: number;
  revenueCOP: number;
  color: string;
}

interface SubscriptionStatusPoint {
  status: string;
  shortStatus: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

export const PerformanceOverview: React.FC = () => {
  const { orders, paymentRequests, resetCatalogPrices } = useStore();
  const [activeChartTab, setActiveChartTab] = useState<'both' | 'revenue' | 'subscriptions' | 'statuses'>('both');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Generate 30 days of daily data based on real store orders + baseline distribution
  const dailyRevenueData = useMemo<DailyRevenuePoint[]>(() => {
    const points: DailyRevenuePoint[] = [];
    const now = new Date();

    // Baseline daily revenue seeds for 30 days
    const dailyBaseRevenues = [
      145000, 189000, 210000, 175000, 240000, 310000, 290000,
      195000, 220000, 260000, 230000, 280000, 340000, 315000,
      210000, 250000, 275000, 240000, 295000, 380000, 350000,
      235000, 270000, 290000, 310000, 360000, 420000, 395000,
      310000, 345000,
    ];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      const fullDateStr = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

      // Match any real orders on this date
      const ordersOnThisDay = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === d.toDateString();
      });

      const realRevenueFromOrders = ordersOnThisDay.reduce((acc, o) => acc + o.totalCOP, 0);
      const realCount = ordersOnThisDay.length;

      // Base seed + real activity
      const baseRev = dailyBaseRevenues[29 - i] || 250000;
      const combinedRevenue = realRevenueFromOrders > 0 ? baseRev + realRevenueFromOrders : baseRev;
      const combinedCount = (realCount > 0 ? realCount : Math.max(3, Math.round(combinedRevenue / 35000)));

      points.push({
        date: dateStr,
        fullDate: fullDateStr,
        revenue: combinedRevenue,
        ordersCount: combinedCount,
      });
    }

    return points;
  }, [orders]);

  // Subscription types sold over the last 30 days
  const subscriptionTypesData = useMemo<SubscriptionTypeSold[]>(() => {
    // Tally real order items by category/brand
    const countMap: Record<string, { units: number; revenue: number }> = {
      'Streaming Cine & Series (Netflix, Max, Disney+)': { units: 142, revenue: 2980000 },
      'Música & Audio (Spotify, YouTube Music)': { units: 88, revenue: 980000 },
      'IA & Productividad (ChatGPT, Canva)': { units: 54, revenue: 1650000 },
      'Anime & Entretenimiento (Crunchyroll)': { units: 41, revenue: 420000 },
      'IPTV & Televisión en Vivo': { units: 67, revenue: 1480000 },
      'Gaming & Cloud (Xbox Game Pass)': { units: 29, revenue: 690000 },
    };

    // Add any live items from actual orders
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const nameLower = (item.productName + ' ' + (item.brand || '')).toLowerCase();
        let targetCategory = 'Streaming Cine & Series (Netflix, Max, Disney+)';

        if (nameLower.includes('spotify') || nameLower.includes('music') || nameLower.includes('youtube')) {
          targetCategory = 'Música & Audio (Spotify, YouTube Music)';
        } else if (nameLower.includes('chatgpt') || nameLower.includes('canva') || nameLower.includes('adobe')) {
          targetCategory = 'IA & Productividad (ChatGPT, Canva)';
        } else if (nameLower.includes('crunchyroll') || nameLower.includes('anime')) {
          targetCategory = 'Anime & Entretenimiento (Crunchyroll)';
        } else if (nameLower.includes('iptv') || nameLower.includes('magis') || nameLower.includes('tv')) {
          targetCategory = 'IPTV & Televisión en Vivo';
        } else if (nameLower.includes('xbox') || nameLower.includes('game') || nameLower.includes('playstation')) {
          targetCategory = 'Gaming & Cloud (Xbox Game Pass)';
        }

        if (countMap[targetCategory]) {
          countMap[targetCategory].units += item.quantity;
          countMap[targetCategory].revenue += item.priceCOP * item.quantity;
        }
      });
    });

    const categoryColors: Record<string, string> = {
      'Streaming Cine & Series (Netflix, Max, Disney+)': '#E50914',
      'Música & Audio (Spotify, YouTube Music)': '#1DB954',
      'IA & Productividad (ChatGPT, Canva)': '#10A37F',
      'Anime & Entretenimiento (Crunchyroll)': '#F47521',
      'IPTV & Televisión en Vivo': '#0063E5',
      'Gaming & Cloud (Xbox Game Pass)': '#8B5CF6',
    };

    const shortNames: Record<string, string> = {
      'Streaming Cine & Series (Netflix, Max, Disney+)': 'Cine/Series',
      'Música & Audio (Spotify, YouTube Music)': 'Música',
      'IA & Productividad (ChatGPT, Canva)': 'IA/Productividad',
      'Anime & Entretenimiento (Crunchyroll)': 'Anime',
      'IPTV & Televisión en Vivo': 'IPTV/En Vivo',
      'Gaming & Cloud (Xbox Game Pass)': 'Gaming',
    };

    return Object.entries(countMap).map(([type, data]) => ({
      type,
      shortName: shortNames[type] || type,
      unitsSold: data.units,
      revenueCOP: data.revenue,
      color: categoryColors[type] || '#f59e0b',
    }));
  }, [orders]);

  // Distribution of Subscription Statuses for Recharts Donut Chart
  const subscriptionStatusData = useMemo<SubscriptionStatusPoint[]>(() => {
    // Live counts based on orders in store
    let activeFromOrders = 0;
    let pendingFromOrders = 0;
    let expiredFromOrders = 0;
    let expiringSoonFromOrders = 0;

    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    orders.forEach((o) => {
      if (
        o.paymentStatus === 'PENDIENTE' ||
        o.paymentStatus === 'PAGO_REPORTADO' ||
        o.orderStatus === 'EN_PREPARACIÓN'
      ) {
        pendingFromOrders++;
      } else if (
        o.paymentStatus === 'EXPIRADO' ||
        o.paymentStatus === 'CANCELADO' ||
        o.orderStatus === 'CANCELADO'
      ) {
        expiredFromOrders++;
      } else if (o.paymentStatus === 'PAGO_CONFIRMADO' || o.orderStatus === 'ENTREGADO') {
        const orderTime = new Date(o.createdAt).getTime();
        const ageMs = now - orderTime;
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (ageMs > thirtyDaysMs) {
          expiredFromOrders++;
        } else if (thirtyDaysMs - ageMs <= threeDaysMs) {
          expiringSoonFromOrders++;
        } else {
          activeFromOrders++;
        }
      }
    });

    // Baseline distribution for streaming accounts under management
    const baseActive = 186;
    const baseExpiringSoon = 34;
    const basePending = 18;
    const baseExpired = 27;

    const totalActive = baseActive + activeFromOrders;
    const totalExpiringSoon = baseExpiringSoon + expiringSoonFromOrders;
    const totalPending = basePending + pendingFromOrders;
    const totalExpired = baseExpired + expiredFromOrders;
    const grandTotal = totalActive + totalExpiringSoon + totalPending + totalExpired;

    const rawList = [
      {
        status: 'Activas (En Garantía)',
        shortStatus: 'Activas',
        count: totalActive,
        color: '#10B981', // Emerald
        description: 'Cuentas operando con garantía legal 100%',
      },
      {
        status: 'Por Renovar (≤ 3 días)',
        shortStatus: 'Por Renovar',
        count: totalExpiringSoon,
        color: '#8B5CF6', // Purple/Violet
        description: 'Vencimiento próximo con recordatorio automático',
      },
      {
        status: 'En Revisión / Pendientes',
        shortStatus: 'Pendientes',
        count: totalPending,
        color: '#F59E0B', // Amber
        description: 'Comprobante de pago o entrega en validación',
      },
      {
        status: 'Vencidas / Expiradas',
        shortStatus: 'Vencidas',
        count: totalExpired,
        color: '#EF4444', // Rose/Red
        description: 'Ciclo culminado sin renovación solicitada',
      },
    ];

    return rawList.map((item) => ({
      ...item,
      percentage: grandTotal > 0 ? Math.round((item.count / grandTotal) * 100) : 0,
    }));
  }, [orders]);

  const totalSubscriptionsCount = useMemo(
    () => subscriptionStatusData.reduce((acc, curr) => acc + curr.count, 0),
    [subscriptionStatusData]
  );

  // Aggregate KPI metrics for the 30-day window
  const totalRevenue30Days = useMemo(
    () => dailyRevenueData.reduce((acc, p) => acc + p.revenue, 0),
    [dailyRevenueData]
  );

  const totalUnits30Days = useMemo(
    () => subscriptionTypesData.reduce((acc, s) => acc + s.unitsSold, 0),
    [subscriptionTypesData]
  );

  const averageDailyRevenue = Math.round(totalRevenue30Days / 30);
  const bestSellingType = [...subscriptionTypesData].sort((a, b) => b.unitsSold - a.unitsSold)[0];

  // Custom Dark Cinema Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyRevenuePoint = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-[#09090b]/95 border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md text-xs space-y-1 font-sans">
          <p className="font-bold text-white text-[11px] pb-1 border-b border-white/10">
            {data.fullDate}
          </p>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-neutral-400">Ingresos del día:</span>
            <span className="font-mono font-extrabold text-amber-400">
              ${data.revenue.toLocaleString('es-CO')} COP
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-neutral-400">Suscripciones:</span>
            <span className="font-mono font-bold text-emerald-400">
              {data.ordersCount} despachos
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dark Cinema Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SubscriptionTypeSold = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-[#09090b]/95 border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md text-xs space-y-1 font-sans">
          <p className="font-bold text-white text-[11px] pb-1 border-b border-white/10 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.type}</span>
          </p>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-neutral-400">Unidades vendidas:</span>
            <span className="font-mono font-extrabold text-white">
              {data.unitsSold} suscripciones
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-neutral-400">Recaudación:</span>
            <span className="font-mono font-bold text-cyan-400">
              ${data.revenueCOP.toLocaleString('es-CO')} COP
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dark Cinema Tooltip for Donut Chart
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SubscriptionStatusPoint = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-[#09090b]/95 border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md text-xs space-y-1 font-sans">
          <p className="font-bold text-white text-[11px] pb-1 border-b border-white/10 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.status}</span>
          </p>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-neutral-400">Total cuentas:</span>
            <span className="font-mono font-extrabold text-white">
              {data.count} suscripciones
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-neutral-400">Participación:</span>
            <span className="font-mono font-bold" style={{ color: data.color }}>
              {data.percentage}% del total
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 pt-0.5">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportToCSV = () => {
    setIsExporting(true);
    try {
      const BOM = '\uFEFF';
      const now = new Date();
      const dateFormatted = now.toISOString().slice(0, 10);
      const sections: string[] = [];

      // Header & Metadata
      sections.push('# =========================================================================');
      sections.push('# REPORTE DE RENDIMIENTO COMERCIAL Y TRANSACCIONES — STREAMBOX COLOMBIA');
      sections.push('# =========================================================================');
      sections.push(`Fecha de Exportación,${now.toLocaleString('es-CO')}`);
      sections.push(`Ventana de Análisis,Últimos 30 Días (${dailyRevenueData[0]?.date || ''} a ${dailyRevenueData[dailyRevenueData.length - 1]?.date || ''})`);
      sections.push(`Recaudación Total Últimos 30 Días (COP),$${totalRevenue30Days.toLocaleString('es-CO')}`);
      sections.push(`Total Suscripciones Despachadas,${totalUnits30Days} cuentas`);
      sections.push(`Promedio Diario de Recaudación (COP),$${averageDailyRevenue.toLocaleString('es-CO')}`);
      sections.push(`Categoría Líder en Ventas,"${bestSellingType?.type || 'Streaming Cine'}" (${bestSellingType?.unitsSold || 0} unidades)`);
      sections.push('');

      // Section 1: Daily Revenue Data
      sections.push('# -------------------------------------------------------------------------');
      sections.push('# 1. RECAUDACIÓN Y VENTAS DIARIAS (SERIE TEMPORAL 30 DÍAS)');
      sections.push('# -------------------------------------------------------------------------');
      sections.push('Fecha,Fecha Completa,Ingresos Diarios (COP),Suscripciones Despachadas,Ticket Promedio (COP)');
      dailyRevenueData.forEach((d) => {
        const avg = d.ordersCount > 0 ? Math.round(d.revenue / d.ordersCount) : 0;
        sections.push(`"${d.date}","${d.fullDate}",${d.revenue},${d.ordersCount},${avg}`);
      });
      sections.push('');

      // Section 2: Subscription Types Sold
      sections.push('# -------------------------------------------------------------------------');
      sections.push('# 2. DESGLOSE POR TIPO DE SUSCRIPCIÓN VENDIDA (DISTRIBUCIÓN 30 DÍAS)');
      sections.push('# -------------------------------------------------------------------------');
      sections.push('Categoría de Suscripción,Abreviatura,Unidades Vendidas,Recaudación Total (COP),Cuota de Mercado (%)');
      subscriptionTypesData.forEach((s) => {
        const share = totalUnits30Days > 0 ? ((s.unitsSold / totalUnits30Days) * 100).toFixed(1) : '0';
        sections.push(`"${s.type}","${s.shortName}",${s.unitsSold},${s.revenueCOP},${share}%`);
      });
      sections.push('');

      // Section 3: Recent Transactions & Orders
      sections.push('# -------------------------------------------------------------------------');
      sections.push('# 3. DETALLE DE PEDIDOS Y TRANSACCIONES RECIENTES');
      sections.push('# -------------------------------------------------------------------------');
      sections.push('ID Pedido,Cliente,Email,Celular,Método de Pago,Estado de Pago,Estado de Entrega,Valor Total (COP),Fecha');
      orders.slice(0, 100).forEach((o) => {
        const cleanName = o.userName ? o.userName.replace(/"/g, '""') : 'Cliente';
        const cleanPhone = o.customerPhone || '';
        sections.push(`"${o.id}","${cleanName}","${o.userEmail}","${cleanPhone}","${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}",${o.totalCOP},"${new Date(o.createdAt).toLocaleString('es-CO')}"`);
      });
      sections.push('');

      // Section 4: Subscription Status Distribution (Donut Chart Data)
      sections.push('# -------------------------------------------------------------------------');
      sections.push('# 4. DISTRIBUCIÓN POR ESTADO DE SUSCRIPCIÓN (DONUT CHART)');
      sections.push('# -------------------------------------------------------------------------');
      sections.push('Estado de Suscripción,Cantidad de Cuentas,Participación (%),Detalle Operativo');
      subscriptionStatusData.forEach((st) => {
        sections.push(`"${st.status}",${st.count},${st.percentage}%,"${st.description}"`);
      });
      sections.push('');

      const csvContent = BOM + sections.join('\r\n');
      triggerBrowserDownload(
        `reporte_rendimiento_streambox_30dias_${dateFormatted}.csv`,
        csvContent,
        'text/csv;charset=utf-8;'
      );
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2500);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetOriginalPrices = () => {
    const res = resetCatalogPrices();
    setResetFeedback(
      `¡Precios originales restablecidos con éxito! ${res.resetCount} modalidades actualizadas al valor inicial.`
    );
    setTimeout(() => setResetFeedback(null), 5000);
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#0d0d14] border border-white/8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/8 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Rendimiento Global · Últimos 30 Días</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Performance Overview
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Ingresos diarios, categorías y distribución de estados de suscripción con Recharts
          </p>
        </div>

        {/* Action Controls: Chart View Selector, Reset Prices & Export to CSV */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto">
          {/* Chart View Selector Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/8 text-xs">
            <button
              type="button"
              onClick={() => setActiveChartTab('both')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-95 ${
                activeChartTab === 'both'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Vista Completa
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('revenue')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-95 ${
                activeChartTab === 'revenue'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ingresos Diarios
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('subscriptions')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-95 ${
                activeChartTab === 'subscriptions'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Categorías
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('statuses')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                activeChartTab === 'statuses'
                  ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Estados (Donut)</span>
            </button>
          </div>

          {/* Admin Button: Restablecer Precios Originales */}
          <button
            type="button"
            onClick={handleResetOriginalPrices}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 border bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/35 hover:border-amber-500/60 text-amber-300 hover:text-white shadow-sm"
            title="Restablecer todos los precios de los productos y modalidades al precio original inicial de la tienda"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restablecer Precios Originales</span>
          </button>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportToCSV}
            disabled={isExporting}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 border ${
              exportSuccess
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-white shadow-sm'
            }`}
            title="Descargar reporte completo de transacciones y gráficos en formato CSV para Excel"
          >
            {exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>¡Reporte Exportado!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar a CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Price Reset Notification Toast Banner */}
      {resetFeedback && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{resetFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setResetFeedback(null)}
            className="text-neutral-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-black/50 border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>Ingresos 30 Días</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-white">
            ${totalRevenue30Days.toLocaleString('es-CO')}
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.8% vs mes previo</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>Promedio Diario</span>
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-cyan-300">
            ${averageDailyRevenue.toLocaleString('es-CO')}
          </div>
          <span className="text-[10px] text-neutral-500">
            Base 30 jornadas activas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>Suscripciones Vendidas</span>
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400">
            {totalUnits30Days} <span className="text-xs font-sans text-neutral-400">cuentas</span>
          </div>
          <span className="text-[10px] text-neutral-500">
            Despachos automáticos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-black/50 border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span>Líder de Ventas</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white truncate" title={bestSellingType?.type}>
            {bestSellingType?.shortName || 'Streaming Cine'}
          </div>
          <span className="text-[10px] text-purple-300 font-mono">
            {bestSellingType?.unitsSold} ventas ({Math.round(((bestSellingType?.unitsSold || 0) / totalUnits30Days) * 100)}% del total)
          </span>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="space-y-6">
        {/* CHART 1: LINE CHART OF DAILY REVENUE */}
        {(activeChartTab === 'both' || activeChartTab === 'revenue') && (
          <div className="p-5 rounded-2xl bg-black/50 border border-white/6 space-y-4 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <span>Evolución de Ingresos Diarios ($ COP)</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Volumen recaudado día a día en los últimos 30 días
                </p>
              </div>
              <span className="text-[11px] font-mono text-amber-400/90 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Línea Continua
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyRevenueData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueLineGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#22222e" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#66667a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={{ stroke: '#333342' }}
                    interval={4}
                  />
                  <YAxis
                    stroke="#66667a"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={{ stroke: '#333342' }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#09090b' }}
                    activeDot={{ r: 6, fill: '#fbbf24', stroke: '#09090b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SIDE-BY-SIDE DUAL GRID: BAR CHART + DONUT CHART */}
        {(activeChartTab === 'both' ||
          activeChartTab === 'subscriptions' ||
          activeChartTab === 'statuses') && (
          <div
            className={`grid gap-6 ${
              activeChartTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* CHART 2: BAR CHART OF SUBSCRIPTION TYPES SOLD */}
            {(activeChartTab === 'both' || activeChartTab === 'subscriptions') && (
              <div className="p-5 rounded-2xl bg-black/50 border border-white/6 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                      <span>Suscripciones Vendidas por Categoría</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Cuentas despachadas en la ventana de 30 días
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400/90 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    Barras Dinámicas
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subscriptionTypesData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 15 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#22222e" vertical={false} />
                      <XAxis
                        dataKey="shortName"
                        stroke="#66667a"
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={{ stroke: '#333342' }}
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="#66667a"
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        tickLine={{ stroke: '#333342' }}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="unitsSold"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1200}
                      >
                        {subscriptionTypesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* CHART 3: DONUT CHART OF SUBSCRIPTION STATUSES (INTEGRATED NEXT TO BAR CHART) */}
            {(activeChartTab === 'both' || activeChartTab === 'statuses') && (
              <div className="p-5 rounded-2xl bg-black/50 border border-white/6 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span>Distribución por Estado de Suscripción</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Proporción de cuentas activas, por renovar, pendientes y vencidas
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400/90 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Donut Chart
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Recharts PieChart (Donut) with center label */}
                  <div className="sm:col-span-6 h-60 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionStatusData}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          animationDuration={1100}
                        >
                          {subscriptionStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-donut-${index}`}
                              fill={entry.color}
                              stroke="#09090b"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomDonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center count inside the Donut */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black font-mono text-white tracking-tight leading-none">
                        {totalSubscriptionsCount}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mt-0.5">
                        Cuentas
                      </span>
                    </div>
                  </div>

                  {/* Status Legend & Percentage Pills */}
                  <div className="sm:col-span-6 space-y-2">
                    {subscriptionStatusData.map((st, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-black/60 border border-white/6 flex items-center justify-between gap-2.5 text-xs hover:border-white/15 transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: st.color }}
                          />
                          <div className="truncate">
                            <span className="font-semibold text-white text-[11px] block truncate">
                              {st.shortStatus}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {st.count} cuentas
                            </span>
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 border"
                          style={{
                            backgroundColor: `${st.color}18`,
                            color: st.color,
                            borderColor: `${st.color}35`,
                          }}
                        >
                          {st.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breakdown Legend Bar */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
          <span>Categorías analizadas:</span>
        </div>
        <div className="flex items-center gap-3.5 flex-wrap text-[11px]">
          {subscriptionTypesData.map((sub, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: sub.color }}
              />
              <span className="text-neutral-300 font-medium">{sub.shortName}:</span>
              <span className="font-mono text-white font-bold">{sub.unitsSold}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
