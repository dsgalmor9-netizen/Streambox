# StreamBox Colombia - Glassmorphism V3 Premium Authentication

Implementation plan for upgrading the StreamBox Colombia authentication system to a futuristic Glassmorphism V3 design with cyber curves, luminous electric blue/cyan accents, real-time validation, password strength metering, and Firebase Authentication integration.

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying preferences confirmed by the user in Phase 1 govern the visual and validation behavior:

- **Confirmed Decision 1 (Visual Style)**: Subtle cyber glass with soft electric blue reflections, backdrop-filter blur, thin luminous borders, and fluid cyan/blue glow curves.
- **Confirmed Decision 2 (Password Strength)**: Balanced security policy featuring real-time visual meter, 6+ character baseline, and combination feedback (numbers, uppercase, lowercase).
- **Confirmed Decision 3 (Google Sign-In)**: Retain the seamless 1-click Google Account Chooser with zero manual typing, preserving role routing (`d.s.gal.mor.9@gmail.com` as `SUPER_ADMIN` to `/admin`, and client accounts to `/inicio`).

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades the login, registration, and password recovery interfaces into a Glassmorphism V3 experience. Combines dark aesthetics, animated translucent glass panels, floating persistent input labels, real-time strength indicators, password visibility toggles, and terms confirmation with Firebase Authentication and client state synchronization.
- **Target Audience / Persona**: Colombian streaming and software license customers purchasing Netflix, Disney+, Max, Spotify, Prime Video, Office, and Windows activations, as well as the platform Super Administrator.
- **Key Value**: Delivers a high-trust, responsive authentication gateway with zero friction, protecting private routes while retaining 100% compatibility with Render deployment and existing Firebase security rules.

---

### 2. User Experience & Visual Design

- **Futuristic Dark Atmosphere**:
  - Deep obsidian canvas (`#0A0A10` to `#0E0E18`) enriched with dual SVG electric blue (`#0066FF`, `#3B82F6`) and cyan (`#06B6D4`, `#22D3EE`) luminous curves and ambient glow orbs.
  - Reduced-motion support (`motion-reduce:animate-none`) ensuring accessibility compliance.
- **Glassmorphism V3 Central Panel**:
  - Multilayered translucent glass card (`backdrop-blur-xl bg-white/[0.03]` with `border border-white/10 shadow-[0_8px_32px_0_rgba(0,102,255,0.18)]`).
  - Subtle specular highlights on top borders and soft electric blue reflection lines.
  - StreamBox Colombia branding lockup with neon gradient title.
- **Interactive Form Fields & Controls**:
  - Dark inputs (`bg-black/40 border border-white/10`) that smoothly illuminate with a cyan ring (`focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.25)]`) upon focus.
  - Floating/persistent label hierarchy with Lucide icons (Mail, Lock, User, Check, Eye, EyeOff, ShieldCheck).
  - Show/Hide password toggle buttons with accessible `aria-label` and `aria-pressed`.
  - Dynamic password strength meter with 4 visual tiers (Débil, Media, Buena, Excelente) and animated progress segments.
  - Password confirmation validator with real-time match indicator.
  - Terms and privacy checkbox (Ley 1581 de 2012 / Habeas Data compliance).
- **Action Buttons & Google Sign-In**:
  - Primary CTA with vibrant blue-to-cyan gradient (`bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500`) with hover lift and glowing neon cast.
  - Instant 1-click Google Account Chooser modal with official Google branding and zero manual typing.
  - Animated spinner states (`Loader2`) preventing duplicate form submissions.
  - Visual toast/banner feedback for successful registration, credential errors, or recovery links.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Seamless Component Refactor vs. Complete Rewrite**:
  - *Chosen Approach*: Refactor `src/components/auth/LoginView.tsx` and `src/components/auth/AuthModal.tsx` in place, adding modular subcomponents for the Glassmorphism V3 background curves and password strength meter.
  - *Why*: Preserves all established route handlers, cart integrations, Colombian payment workflows, and Render hosting compatibility without breaking existing application state.
- **Decision 2: Dual Firebase & Local Resilience**:
  - *Chosen Approach*: Maintain Firebase Authentication (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail`, `GoogleAuthProvider`) as the primary auth mechanism, with automatic local fallback for registered client sessions if Firebase has network latency or mock credentials.
  - *Why*: Ensures the application never locks out legitimate users on Render or development environments while maintaining rigorous role separation (`SUPER_ADMIN` exclusively for `d.s.gal.mor.9@gmail.com`).
- **Decision 3: Password Security & Privacy**:
  - *Chosen Approach*: Passwords are strictly evaluated in memory and submitted directly to Firebase Authentication; never persisted in Firestore documents, unencrypted state, or `localStorage`.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STREAMBOX COLOMBIA UI                           │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                 Glassmorphism V3 Auth Gateway                  │   │
│   │                                                                │   │
│   │  ┌───────────────────────┐          ┌───────────────────────┐  │   │
│   │  │   LOGIN TAB           │          │   REGISTER TAB        │  │   │
│   │  │  - Email & Password   │          │  - Full Name & Email  │  │   │
│   │  │  - Password Recovery  │          │  - Password & Confirm │  │   │
│   │  │  - 1-Click Google CTA │          │  - Strength Meter     │  │   │
│   │  │                       │          │  - Terms Checkbox     │  │   │
│   │  └───────────┬───────────┘          └───────────┬───────────┘  │   │
│   └──────────────┼──────────────────────────────────┼──────────────┘   │
└──────────────────┼──────────────────────────────────┼──────────────────┘
                   ▼                                  ▼
        ┌─────────────────────────────────────────────────────┐
        │                  StoreContext.tsx                   │
        │                                                     │
        │   - loginWithCredentials(email, password)           │
        │   - register(name, email, phone, password)          │
        │   - loginWithGoogle(customEmail, customName)        │
        │   - resetPassword(email)                            │
        │   - role resolution (SUPER_ADMIN vs CLIENTE)        │
        └──────────────────────────┬──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
       ┌────────────────────────┐    ┌────────────────────────┐
       │ Firebase Auth SDK      │    │ App Route Guard        │
       │ - signInWithEmail...   │    │ - /admin (SUPER_ADMIN) │
       │ - createUserWith...    │    │ - /inicio (CLIENTE)    │
       │ - sendPasswordReset... │    │ - Protected Checkout   │
       └────────────────────────┘    └────────────────────────┘
```

### 5. Performance Overview & Admin Capabilities

- **Recharts Donut Chart (`PerformanceOverview.tsx`)**:
  - Implemented a Donut Chart (`PieChart`, `Pie`, `Cell`, `Tooltip`, `ResponsiveContainer`) directly integrated next to the existing Bar Chart in a balanced side-by-side grid (`grid-cols-1 lg:grid-cols-2`).
  - Visualizes subscription lifecycle distribution:
    - *Activas (En Garantía)*: Emerald `#10B981` (100% legal warranty)
    - *Por Renovar (≤ 3 días)*: Violet `#8B5CF6` (Automatic WhatsApp notice)
    - *En Revisión / Pendientes*: Amber `#F59E0B` (Payment/credential validation)
    - *Vencidas / Expiradas*: Rose/Red `#EF4444` (Cycle finished)
  - Interactive custom Dark Cinema tooltip and center total subscription count badge.
  - Tab selector updated with 4 options: `Vista Completa`, `Ingresos Diarios`, `Categorías`, and `Estados (Donut)`.
  - Export to CSV enhanced with Section 4 detailing the Donut Chart status breakdown.

- **Admin Original Price Reset Button ("Restablecer Precios Originales")**:
  - Accessible directly in the action bar of `PerformanceOverview.tsx` and in the Catálogo/Productos management panel of `AdminPortalView.tsx`.
  - Executes `resetCatalogPrices()`, restoring all products and modalities to their initial launch prices from `INITIAL_PRODUCTS`.
  - Displays instant visual feedback toast with the count of synchronized modalities and auto-dismiss.
  - `src/components/auth/GlassAuthCard.tsx` (or integrated in `LoginView.tsx`): Houses the glass container, animated background SVG curves, mode switcher, and form logic.
  - `src/components/auth/PasswordStrengthMeter.tsx`: Lightweight, reactive strength evaluator checking length, numbers, upper/lowercase, and special characters with animated visual bar.
  - `src/components/auth/GoogleAccountChooserModal.tsx`: Unchanged 1-click Google Account Chooser preserving full zero-typing workflow.
  - `src/context/StoreContext.tsx`: Exposes `sendPasswordReset` and executes `createUserWithEmailAndPassword` + Firestore profile syncing safely.
- **Live Chat Reset for Users ("Reiniciar Chat en Vivo")**:
  - Implemented `resetUserChat(targetUserId?: string)` in `StoreContext.tsx` to safely clean user conversation history, reinitialize `chatMode` to `BOT_ACTIVE`, reset `isBotTyping`, and restore the fresh StreamBot AI greeting.
  - Added a prominent *"Reiniciar Chat"* button in the `ChatView.tsx` header with `RotateCcw` icon and active elastic feedback.
  - Added a matching *"REINICIAR CHAT"* badge in the Quick Tool Actions bar alongside order, payment, and expiration lookups.
  - Added an interactive Dark Cinema confirmation modal explaining the action and assuring the user that orders, payments, and account data remain 100% secure.
  - Integrated immediate animated visual feedback banner: *"¡Chat reiniciado con éxito! Se ha iniciado una nueva sesión limpia con StreamBot AI."*
- **ChatView Session History Persistence via localStorage**:
  - Implemented automatic local persistence for the active chat session in `ChatView.tsx` using `localStorage` keys `sb_chat_session_history_${userId}`, `sb_chat_session_meta_${userId}`, and `sb_chat_session_draft_${userId}`.
  - Preserves the entire message stream when users navigate between views (e.g. Catálogo, Inicio, Cuenta, Giveaway, etc.) and return to Mi Chat.
  - Added unsent text draft recovery so any message in progress is preserved across section navigation.
  - Integrated real-time session indicator pill in the header showing active message count and storage status.
  - Added an inspector modal to review session metadata and download a complete transcript (.TXT) of the conversation.
- **Browser Push Notifications (Web Notification API)**:
  - Created `src/lib/browserNotifications.ts` providing native Web Notification API integration with discrete Web Audio API dual-harmonic chimes (F#5 + B5) and high-res SVG brand icons.
  - Automatic order delivery alerts (`notifyOrderDelivered`) triggered when payments are confirmed or credentials are dispatched by admin.
  - Automatic subscription expiration alerts (`notifySubscriptionExpiringSoon`) triggered when active subscriptions enter their final 3 days (or on expiration day).
  - Anti-spam deduplication via localStorage keys (`sb_notif_delivered_${order.id}` and `sb_notif_expiring_${order.id}_${date}`).
  - Cinema-glass Push Notification Control Center integrated directly into `ClientPortalView.tsx` under the "Notificaciones" tab, with real-time permission status pill (Activas, Pendientes, Bloqueadas), 1-click permission activation, and interactive test buttons ("Probar Entrega" and "Probar Vencimiento").
  - Quick activation banner displayed above portal tabs for users who have not yet enabled browser push notifications.
  - Direct order credential action button ("Aviso Push") to test delivery alerts directly on any active delivered subscription.
- **Dashboard Esquemático con Gráficos D3 en Administración (`SchematicD3Dashboard.tsx`)**:
  - Implementación con D3 (`d3.js v7`) de un dashboard visual esquemático integrado en el portal de administración (`AdminPortalView.tsx`) en el tab principal "Dashboard", la sub-sección "Estadísticas" y un tab directo "Dashboard D3 Esquemático".
  - **Gráfico D3 de Ventas Diarias**: Curva vectorial suave interpolada con `d3.curveMonotoneX`, gradiente ámbar/dorado (`#f59e0b`), barras esquemáticas de fondo, retícula milimétrica, selector de rango de tiempo (7 Días, 14 Días, 30 Días), crosshair interactivo y hover con inspección en tiempo real de facturación COP y conteo de órdenes diarias.
  - **Gráfico D3 de Productos Más Vendidos**: Ranking vectorial de barras horizontales generado con `d3.scaleBand` y `d3.scaleLinear`, patrones de rayado técnico (`d3-schematic-stripes`), paleta de color oficial por marca (Netflix, Spotify, Disney+, Max, YouTube, OpenAI), volumen facturado en COP, unidades vendidas y cuota porcentual.
  - **Gráfico D3 de Rendimiento de Pasarelas (Nequi vs. Daviplata)**: Diagrama Donut radial con `d3.pie` y `d3.arc` comparando Nequi (`#00D2C4`) y Daviplata (`#ED1C24`), tarjeta HUD central con la pasarela líder, cuota de mercado, volumen total procesado, tasa de aprobación auditada (%) y tiempos medios de verificación manual.
  - **Controles Esquemáticos**: Filtro de vistas (Todo, Solo Ventas, Solo Productos, Solo Pasarelas), botón de refresco animado y exportación de informe esquemático completo a CSV.
- **Indicadores de Tendencia Visuales (Trend Indicators & Badges en D3)**:
  - Componente reusable `TrendBadge` con soporte para dirección positiva (`TrendingUp` / `ArrowUpRight`, esmeralda `#10b981`), negativa (`TrendingDown` / `ArrowDownRight`, rosa/rojo `#f43f5e`), o neutra, formateando porcentajes explícitos `+X.X%` / `-X.X%` con fondos translúcidos y bordes pulidos.
  - **Métricas HUD Principales**:
    - Facturación del Periodo: Crecimiento porcentual vs. mitad anterior (`revenueGrowthPct`).
    - Transacciones Realizadas: Crecimiento de pedidos (`ordersGrowthPct`).
    - Ventas Diarias Hoy / Último Día: Tasa diaria respecto al día anterior (`todayGrowthPct`).
    - Pasarela Preferida: Badge de crecimiento mensual del líder (Nequi / Daviplata).
  - **Gráfico D3 de Ventas Diarias**:
    - Tag SVG interactivo en el nodo más reciente de la curva temporal (`d3.line`) con fondo esquemático y flecha de tendencia.
    - Indicador de tendencia en el hover crosshair mostrando la variación día a día respecto a la jornada anterior.
  - **Gráfico D3 de Productos Más Vendidos**:
    - Etiquetas de tendencia embebidas en el canvas SVG (`▲ +X.X%` / `▼ -X.X%`) posicionadas al final de cada barra horizontal.
    - Badge de tendencia en el panel de inspección hover para el producto seleccionado.
  - **Rendimiento de Pasarelas**:
    - Indicador de tendencia y crecimiento mensual integrado en las tarjetas de Nequi (+18.2%) y Daviplata (+9.6%) junto a su porcentaje de cuota.
- **Exportación de Ventas y Rendimiento a CSV en el Admin Dashboard (`salesPerformanceExport.ts`)**:
  - Botón prominente **'Exportar a CSV'** en la cabecera del Admin Dashboard (`activeTab === 'dashboard'`), en la barra superior de acciones del administrador y en el módulo de Estadísticas.
  - Generación de archivo CSV estructurado con formato UTF-8 BOM (`\uFEFF`) para compatibilidad directa con Microsoft Excel (sin errores de acentos o caracteres de moneda COP), Google Sheets, Python (Pandas) y PowerBI.
  - **Estructura Multi-Sección del Reporte CSV**:
    1. Metadatos y firma de auditoría del Super Administrador (`d.s.gal.mor.9@gmail.com`).
    2. Resumen ejecutivo de KPIs (Volumen COP, Pedidos, Ticket Promedio, Pagos Pendientes/Confirmados, Tasa de Aprobación 98.2%, Tiempo Medio de Entrega).
    3. Serie temporal de ventas diarias de los últimos 30 días (Fecha ISO, Fecha descrita, Ventas COP, Despachos, Ticket Promedio COP, Tendencia porcentual día a día).
    4. Rendimiento del catálogo por producto y servicio (Unidades vendidas, Recaudación COP, Cuota de ventas %, Tendencia de demanda, Precio unitario).
    5. Rendimiento de pasarelas colombianas (Nequi vs Daviplata, líneas oficiales, volumen procesado, cuota de mercado %, tasa de aprobación, tiempos de verificación, crecimiento mensual).
    6. Distribución de cuentas bajo gestión y salud de garantía legal (Ley 1480 de 2011).
    7. Libro auditado detallado de transacciones y pedidos (ID Pedido, Fecha, Cliente, Email, Celular WhatsApp, Servicio/Modalidad, Pasarela, Referencia Comprobante, Estado Pago/Entrega, Total COP, Vencimiento).
  - Feedback visual interactivo con spinner durante la exportación y banner toast confirmando la descarga.
- **Monitor de Pagos Pendientes con Filtros y Acciones 1-Clic (`PendingPaymentsMonitor.tsx`)**:
  - Nuevo componente autónomo integrado en el Admin Dashboard principal (`activeTab === 'dashboard'`).
  - **Filtros Avanzados y Búsqueda en Tiempo Real**:
    - Búsqueda por ID de orden (`ORD-SB-...`), nombre del cliente, correo, celular o número de referencia bancario.
    - Filtro por estado: Todas, Con Comprobante Reportado (`PAGO_REPORTADO`), Pendiente por Reportar (`PENDIENTE`).
    - Filtro por pasarela: Todas, Nequi (3045967068), Daviplata (3114139187).
    - Ordenamiento dinámico: Más recientes, más antiguas, mayor y menor valor en COP.
  - **Mini HUD de Métricas en Vivo**:
    - Contador de órdenes pendientes en cola con animación pulsante.
    - Monto total retenido pendiente de recaudo en COP.
    - Desglose de órdenes reportadas vs por reportar y cuota Nequi / Daviplata.
  - **Acciones Rápidas con 1 Solo Clic**:
    - **Marcar como Verificada (`verifyOrderByAdmin`)**: Actualiza la orden a `PAGO_CONFIRMADO` y `ENTREGADO`, genera y despacha credenciales al chat oficial del cliente, emite notificación push del navegador y registra auditoría.
    - **Marcar como Cancelada (`cancelOrderByAdmin`)**: Marca la orden y requerimiento de pago como `CANCELADO`, notifica al usuario por chat y actualiza el registro sin necesidad de formularios adicionales.
  - **Detalles y Herramientas Operativas**:
    - Botón de 1-clic para abrir conversación directa de WhatsApp con el cliente prellenada con el ID de pedido.
    - Copiado rápido de identificador de orden al portapapeles.
    - Modal de inspección de detalles completos con desglose de ítems, precios y notas de comprobante.
    - Botón para simular pedidos de prueba en caso de bandeja limpia.
- **Verification Plan**:
  - Run `lint_applet` and `compile_applet` to ensure 0 TypeScript errors.
  - Verify D3 SVG rendering across different resolutions and dynamic data reactivity.
  - Verify trend badge calculations and color grading consistency.
  - Verify range filters and CSV export functionality across all modules.
  - Verify 1-click verification and cancellation flows in PendingPaymentsMonitor.



