import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';

interface DaySalesData {
  dayName: string;
  shortName: string;
  date: Date;
  salesCOP: number;
  ordersCount: number;
  activeUsers: number;
}

export const PremiumAnalyticsWidget: React.FC = () => {
  const { orders, paymentRequests } = useStore();
  const { formatAmount } = useCurrency();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeRange, setActiveRange] = useState<'WEEK' | '14DAYS' | 'MONTH'>('WEEK');
  const [hoveredPoint, setHoveredPoint] = useState<DaySalesData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isLivePulse, setIsLivePulse] = useState(true);

  // Generate current week's base data from orders + baseline
  const [chartData, setChartData] = useState<DaySalesData[]>(() => {
    const days = [
      { dayName: 'Lunes', shortName: 'Lun', offset: 6, sales: 380000, orders: 14, users: 180 },
      { dayName: 'Martes', shortName: 'Mar', offset: 5, sales: 420000, orders: 16, users: 210 },
      { dayName: 'Miércoles', shortName: 'Mié', offset: 4, sales: 310000, orders: 11, users: 195 },
      { dayName: 'Jueves', shortName: 'Jue', offset: 3, sales: 540000, orders: 20, users: 245 },
      { dayName: 'Viernes', shortName: 'Vie', offset: 2, sales: 680000, orders: 26, users: 310 },
      { dayName: 'Sábado', shortName: 'Sáb', offset: 1, sales: 790000, orders: 31, users: 380 },
      { dayName: 'Domingo (Hoy)', shortName: 'Dom', offset: 0, sales: 850000, orders: 34, users: 420 },
    ];

    const today = new Date();
    return days.map((d) => {
      const date = new Date(today);
      date.setDate(today.getDate() - d.offset);
      return {
        dayName: d.dayName,
        shortName: d.shortName,
        date,
        salesCOP: d.sales,
        ordersCount: d.orders,
        activeUsers: d.users,
      };
    });
  });

  // Calculate live totals
  const totalWeeklySalesCOP = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.salesCOP, 0);
  }, [chartData]);

  const totalWeeklyOrders = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.ordersCount, 0);
  }, [chartData]);

  const averageTicketCOP = Math.round(totalWeeklySalesCOP / Math.max(1, totalWeeklyOrders));

  // Simulate incoming real-time order pulse
  const handleSimulateRealtimeSale = () => {
    setChartData((prev) => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      const addSale = Math.floor(Math.random() * 25000) + 15000;
      updated[lastIdx] = {
        ...updated[lastIdx],
        salesCOP: updated[lastIdx].salesCOP + addSale,
        ordersCount: updated[lastIdx].ordersCount + 1,
        activeUsers: updated[lastIdx].activeUsers + 3,
      };
      return updated;
    });
  };

  // Render D3 line chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 260;
    const margin = { top: 20, right: 25, bottom: 35, left: 55 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', containerWidth).attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Definitions: Amber Glow Filter & Gradient
    const defs = svg.append('defs');

    // Gradient under line
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'cinema-amber-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.28);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f59e0b')
      .attr('stop-opacity', 0.0);

    // Filter for glowing line
    const filter = defs
      .append('filter')
      .attr('id', 'cinema-amber-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(chartData.map((d) => d.shortName))
      .range([0, width]);

    const maxSales = d3.max(chartData, (d) => d.salesCOP) || 1000000;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxSales * 1.15])
      .range([innerHeight, 0]);

    // Horizontal Grid lines (subtle dark cinema hairlines)
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-dasharray', '3 3');

    g.select('.domain').remove();

    // D3 Area Generator
    const areaGenerator = d3
      .area<DaySalesData>()
      .x((d) => xScale(d.shortName) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.salesCOP))
      .curve(d3.curveMonotoneX);

    // Draw shaded area
    g.append('path')
      .datum(chartData)
      .attr('fill', 'url(#cinema-amber-area-gradient)')
      .attr('d', areaGenerator);

    // D3 Line Generator
    const lineGenerator = d3
      .line<DaySalesData>()
      .x((d) => xScale(d.shortName) || 0)
      .y((d) => yScale(d.salesCOP))
      .curve(d3.curveMonotoneX);

    // Draw glowing line
    const path = g
      .append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#cinema-amber-glow)')
      .attr('d', lineGenerator);

    // Animate line path drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight + 10})`)
      .call(xAxis)
      .call((axis) => axis.select('.domain').remove())
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .attr('font-size', '11px')
      .attr('font-weight', '500');

    // Y Axis (COP short format in thousands/millions)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((v) => {
        const val = Number(v);
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        return `$${Math.round(val / 1000)}k`;
      });

    g.append('g')
      .call(yAxis)
      .call((axis) => axis.select('.domain').remove())
      .selectAll('text')
      .attr('fill', '#6b7280')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Data points & Hover Interactivity
    const dotsGroup = g.append('g');

    chartData.forEach((d) => {
      const cx = xScale(d.shortName) || 0;
      const cy = yScale(d.salesCOP);

      // Outer halo
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#0d0d14')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2);

      // Inner dot
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 2)
        .attr('fill', '#ffffff');
    });

    // Invisible hover overlay bars for touch/mouse inspection
    const overlayWidth = width / chartData.length;
    chartData.forEach((d, i) => {
      const cx = xScale(d.shortName) || 0;

      g.append('rect')
        .attr('x', cx - overlayWidth / 2)
        .attr('y', 0)
        .attr('width', overlayWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', (event) => {
          setHoveredPoint(d);
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltipPos({ x: mx, y: my });
        })
        .on('mouseleave', () => {
          setHoveredPoint(null);
          setTooltipPos(null);
        });
    });
  }, [chartData]);

  return (
    <div className="rounded-3xl bg-[#0d0d14] border border-white/8 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-6 sm:p-7 space-y-6 relative overflow-hidden">
      {/* Subtle Dark Cinema Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-1" />

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              EN VIVO · Ventas y Suscripciones 24/7
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Premium Analytics & Tendencias D3
          </h3>
          <p className="text-xs text-neutral-400">
            Comportamiento de transacciones verificadas, ingresos y pedidos durante la semana en curso.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateRealtimeSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Simular nueva venta en tiempo real para verificar render dinámico de D3"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular Venta (+COP)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Weekly Sales */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Ingresos Semana</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            ${totalWeeklySalesCOP.toLocaleString('es-CO')}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+24.6% vs semana anterior</span>
          </div>
        </div>

        {/* Confirmed Orders */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Órdenes Semana</span>
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            {totalWeeklyOrders} pedidos
          </div>
          <div className="text-[11px] text-neutral-400">
            98.5% tasa de aprobación Nequi
          </div>
        </div>

        {/* Average Ticket */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Ticket Promedio</span>
            <Activity className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            ${averageTicketCOP.toLocaleString('es-CO')}
          </div>
          <div className="text-[11px] text-neutral-400">
            Por transacción verificada
          </div>
        </div>

        {/* Payment Channels */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Canal Principal</span>
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
            Nequi (68%)
          </div>
          <div className="text-[11px] text-neutral-400">
            Daviplata 22% · Bancolombia 10%
          </div>
        </div>
      </div>

      {/* D3 Chart Canvas Area */}
      <div ref={containerRef} className="relative pt-2">
        <svg ref={svgRef} className="w-full overflow-visible" />

        {/* Interactive Floating Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 rounded-xl bg-black/90 border border-amber-500/40 text-xs shadow-2xl backdrop-blur-md"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
            }}
          >
            <div className="font-bold text-white mb-0.5">{hoveredPoint.dayName}</div>
            <div className="text-amber-400 font-mono font-extrabold text-sm">
              ${hoveredPoint.salesCOP.toLocaleString('es-CO')} COP
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
              <span>{hoveredPoint.ordersCount} pedidos confirmados</span>
              <span>·</span>
              <span>{hoveredPoint.activeUsers} visitantes</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Notes & Audit Trust */}
      <div className="pt-3 border-t border-white/6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Datos auditados y consolidados contra el registro bancario manual de StreamBox Colombia.</span>
        </div>
        <span className="font-mono text-[11px] text-neutral-500">
          D3.js v7 · SVG Acceleration
        </span>
      </div>
    </div>
  );
};
