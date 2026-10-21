# StreamBox — ENTRETENIMIENTO SIN LÍMITES

Aplicación web premium de catálogo y comercialización de servicios digitales, entretenimiento, streaming, inteligencia artificial, música y productividad para el mercado de Colombia (COP).

---

## 🚀 Características Principales

1. **Identidad Visual Oficial StreamBox**:
   - Recreación fiel del logotipo con cubo isométrico 3D neón, monograma "S", botón de reproducción, gradientes fucsia/púrpura y cian, texto cromado y eslogan *"ENTRETENIMIENTO SIN LÍMITES"*.
   - Paleta de color optimizada para pantallas OLED: fondo `#0B0B10`, tarjetas `#14141F`, tipografía Inter para datos e interfaz, y Montserrat para títulos.
   - Cumplimiento estricto del *Top Bar Contract* (Wordmark, enlaces directos, selector de rol y carrito).

2. **Catálogo de Servicios Digitales en Pesos Colombianos (COP)**:
   - Películas & Series 4K (Netflix, Disney+, Prime Video, Max HBO, Crunchyroll).
   - Música & Audio (Spotify Premium, YouTube Premium).
   - Inteligencia Artificial (ChatGPT Plus GPT-4o/o1, Claude 3.5 Sonnet).
   - Diseño & Creatividad (Canva Pro 12 Meses, CapCut Pro).
   - Productividad (Microsoft 365 Personal con 1TB OneDrive).
   - VPN & Gaming (NordVPN, Xbox Game Pass Ultimate).
   - Modalidades configuradas (Perfil con PIN privado, Cuenta completa familiar, Duraciones 1, 3 y 12 meses).
   - Regla de ajuste de precios con incremento de $6.000 COP accesible desde el panel administrativo.

3. **Flujo de Pagos Manuales Verificados para Colombia**:
   - Pasarelas oficiales:
     * **Nequi**: `3045967068`
     * **Daviplata**: `3114139187`
   - Flujo de compra:
     1. El cliente genera el pedido en la web.
     2. Transfiere el monto exacto a Nequi o Daviplata.
     3. Reporta el pago con número de referencia y teléfono.
     4. Recibe confirmación en pantalla: *"¡PAGO REPORTADO CORRECTAMENTE! Tu pago fue enviado para verificación..."*.
     5. En Mi Chat se registra: *"PAGO PENDIENTE DE VERIFICACIÓN..."*.
     6. El administrador revisa el pago en `/admin/pagos` y confirma o rechaza con motivo.
     7. Al confirmar, el sistema despacha las credenciales, PIN y garantía directamente al chat del cliente.

4. **Área Privada del Cliente (`/cuenta`)**:
   - **Mis Pedidos**: Historial completo con copiado de credenciales entregadas.
   - **Mis Pagos**: Solicitudes con trazabilidad del número de referencia.
   - **Mis Servicios & Renovaciones**: Contador de días de suscripción y renovación con 1 clic.
   - **Tickets de Soporte**: Creación y seguimiento de tickets técnicos.
   - **Notificaciones**: Alertas en tiempo real sobre confirmaciones de pago y entregas.

5. **Chat y Chatbot Integrado (StreamBot)**:
   - Consultas automáticas en tiempo real con botones rápidos:
     * `MI PEDIDO` (consulta el pedido más reciente y su estado).
     * `MI PAGO` (consulta solicitudes de pago y aprobaciones).
     * `MI VENCIMIENTO` (consulta fechas de vencimiento de suscripciones activas).
     * `HABLAR CON SOPORTE` (deriva la conversación a agentes humanos).
   - Consola de atención humana directa en el panel administrativo.

6. **Panel de Administración Maestro (`/admin`)**:
   - Dashboard con métricas reales de volumen en COP, pagos pendientes y tickets.
   - Gestión de pagos con filtros y confirmación en 1 clic.
   - Despacho de pedidos y credenciales.
   - Editor de catálogo y precios.
   - Gestión de usuarios y matriz de roles (RBAC): `SUPER_ADMIN`, `ADMIN`, `SOPORTE`, `VENTAS`, `CLIENTE`.
   - Selector rápido de rol en la barra superior para evaluar todas las vistas de forma inmediata.
   - Consola de chat en vivo con clientes.
   - Módulo de promociones y cupones de descuento.
   - Configuración global de números Nequi/Daviplata y modo mantenimiento.
   - Auditoría con registro de fecha, actor y resultado.

7. **Página 404 & Sorteo Oficial (Giveaway)**:
   - Pantalla 404 con estética cyberpunk neón.
   - Módulo de sorteos transparentes con registro único de participantes.

---

## 🛠️ Tecnologías Empleadas

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Entorno**: Vite en puerto 3000.
- **Persistencia & Autoridad**: Store autoritativo con validaciones de negocio en backend simulado, LocalStorage reactivo e hidratación instantánea.
