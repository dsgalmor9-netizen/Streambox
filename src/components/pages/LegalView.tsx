import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShieldCheck,
  ArrowLeft,
  FileText,
  RefreshCw,
  Lock,
  Cookie,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Calendar,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface LegalViewProps {
  type?: 'terminos' | 'privacidad' | 'reembolsos' | 'cookies';
  onNavigate: (view: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ type = 'terminos', onNavigate }) => {
  const { settings, consentSettings, updateConsentSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'terminos' | 'privacidad' | 'reembolsos' | 'cookies'>(type);
  const [marketingConsent, setMarketingConsent] = useState(consentSettings.marketingCommunications);
  const [analyticsConsent, setAnalyticsConsent] = useState(consentSettings.analyticsCookies);
  const [savedConsentMsg, setSavedConsentMsg] = useState(false);

  const handleSaveCookiePreferences = () => {
    updateConsentSettings({
      analyticsCookies: analyticsConsent,
      marketingCommunications: marketingConsent,
    });
    setSavedConsentMsg(true);
    setTimeout(() => setSavedConsentMsg(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('inicio')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a StreamBox</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>Vigencia: {settings.lastLegalReviewDate} · Versión {settings.termsVersion}</span>
        </div>
      </div>

      {/* PENDING_REVIEW Notice Banner (Section 3 Requirement) */}
      {settings.legalStatus === 'PENDING_REVIEW' && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Estado Administrativo: PENDING_REVIEW
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 text-[10px] font-mono">
                En Verificación Jurídica
              </span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Las presentes políticas y términos rigen la operación digital de <strong>StreamBox Colombia</strong> bajo el Estatuto del Consumidor (Ley 1480 de 2011) y la Ley de Protección de Datos (Ley 1581 de 2012). Los datos societarios formales de registro mercantil y NIT se encuentran en proceso de consolidación notarial.
            </p>
          </div>
        </div>
      )}

      {/* Legal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'terminos', label: 'Términos y Condiciones', icon: FileText },
          { id: 'reembolsos', label: 'Política de Reembolsos y Retracto', icon: RefreshCw },
          { id: 'privacidad', label: 'Tratamiento de Datos (Ley 1581)', icon: Lock },
          { id: 'cookies', label: 'Cookies y Consentimiento', icon: Cookie },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#14141F] border border-zinc-800/90 shadow-2xl space-y-8 text-zinc-300 text-xs sm:text-sm leading-relaxed">

        {/* 1. TÉRMINOS Y CONDICIONES */}
        {activeTab === 'terminos' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <Scale className="w-6 h-6 text-purple-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Términos y Condiciones de Uso y Compra
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Conforme a la Ley 1480 de 2011 (Estatuto del Consumidor en Colombia) y comercio electrónico.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-purple-300">
                1. Identificación Legal y Canales de Atención
              </h3>
              <p>
                La plataforma web <strong>StreamBox</strong> (en adelante, «StreamBox» o «el Proveedor»), con sede operativa en Bogotá D.C., Colombia, comercializa suscripciones y servicios digitales en el territorio nacional. Canales oficiales de contacto:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong>Correo de Soporte y Notificaciones:</strong> {settings.supportEmail}</li>
                <li><strong>Línea de Atención al Consumidor:</strong> {settings.supportPhone}</li>
                <li><strong>Canal en Plataforma:</strong> Mi Chat / Asistente Virtual StreamBot</li>
                <li><strong>Horario de Operación:</strong> Lunes a Domingo, 8:00 AM a 10:00 PM (Hora de Colombia).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-purple-300">
                2. Objeto y Descripción de los Servicios
              </h3>
              <p>
                StreamBox ofrece a los consumidores un catálogo organizado en 17 categorías de soluciones digitales (streaming de cine y series, música Hi-Fi, herramientas de inteligencia artificial, suites de ofimática, almacenamiento en la nube, VPN, seguridad y tarjetas regalo).
              </p>
              <p>
                Cada producto detalla de manera previa: nombre, marca del desarrollador, modalidad contratada (ej. perfil individual con PIN o cuenta completa), vigencia temporal (15 días, 1 mes, 3 meses, 12 meses), calidad técnica máxima admitida, y requisitos de compatibilidad.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-purple-300">
                3. Precios y Moneda Oficial (COP)
              </h3>
              <p>
                Todos los precios mostrados en el catálogo y en la pantalla de pago se expresan en <strong>Pesos Colombianos (COP)</strong>. Corresponden al valor total y neto a pagar, sin sobrecostos imprevistos ni cargos periódicos automáticos a tarjetas de crédito.
              </p>
              <p>
                Si un producto presenta la etiqueta «Precio pendiente de verificar», el botón de compra permanece inhabilitado de acuerdo con nuestra política de transparencia y el artículo 23 de la Ley 1480.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-purple-300">
                4. Procedimiento de Pedido, Pago Manual y Entrega
              </h3>
              <ol className="list-decimal pl-5 space-y-1.5 text-zinc-400">
                <li><strong>Selección:</strong> El cliente escoge el servicio y la modalidad deseada.</li>
                <li><strong>Generación de Solicitud:</strong> Se genera una orden con identificador único (ej. ORD-SB-XXXX) y solicitud de pago (PAY-SB-XXXX).</li>
                <li><strong>Transferencia Manual:</strong> El cliente transfiere desde su aplicación bancaria oficial a los números autorizados: Nequi ({settings.nequiNumber}) o Daviplata ({settings.daviplataNumber}).</li>
                <li><strong>Reporte de Comprobante:</strong> El cliente reporta el número de referencia y teléfono origen en el formulario seguro.</li>
                <li><strong>Verificación y Despacho:</strong> Un agente administrativo valida el abono en el extracto bancario en un lapso de 5 a 15 minutos hábiles y despacha las credenciales e instrucciones de uso directamente en «Mi Chat».</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-purple-300">
                5. Garantía Legal y Soporte Técnico
              </h3>
              <p>
                De conformidad con los artículos 7 a 16 de la Ley 1480 de 2011, todos los servicios adquiridos en StreamBox gozan de <strong>garantía total de funcionamiento durante el 100% del período contratado</strong>. Si el servicio presenta caída o incompatibilidad atribuible al proveedor o a la plataforma, el cliente puede solicitar asistencia o reemplazo a través de nuestro módulo de Tickets o Reclamaciones.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-purple-300">
                6. Obligaciones y Uso Responsable del Cliente
              </h3>
              <p>
                Para garantizar la estabilidad del servicio, el cliente se compromete a:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>No modificar el correo electrónico maestro ni la contraseña general asignada.</li>
                <li>Utilizar únicamente el perfil asignado y respetar el límite de pantallas contratadas.</li>
                <li>No revender ni sublicenciar credenciales sin autorización expresa de StreamBox.</li>
              </ul>
            </section>
          </div>
        )}

        {/* 2. POLÍTICA DE REEMBOLSOS Y RETRACTO */}
        {activeTab === 'reembolsos' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <RefreshCw className="w-6 h-6 text-cyan-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Política de Devoluciones, Reclamaciones y Reembolsos
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Procedimiento transparente y auditable regulado por la Ley 1480 de 2011 (Arts. 47 y 51).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-cyan-200 text-xs">
              <strong>Regla Obligatoria StreamBox:</strong> No aplicamos cláusulas arbitrarias de «no hay devoluciones». Toda solicitud se atiende con estudio individualizado, respetando las causales legales y operativas.
            </div>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-cyan-300">
                A. Casos Sujetos a Reembolso o Reversión de Pago
              </h3>
              <p>
                Procederá la restitución de dinero o el reemplazo del servicio en las siguientes situaciones verificadas:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="font-bold text-white block mb-1">1. Pago Duplicado:</span>
                  El cliente realizó dos o más transferencias por error para un mismo pedido.
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="font-bold text-white block mb-1">2. Pago No Registrado / Error:</span>
                  El dinero fue debitado en Nequi/Daviplata pero la orden no se procesó por fallo técnico.
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="font-bold text-white block mb-1">3. Incumplimiento en Entrega:</span>
                  El servicio no fue entregado dentro del plazo máximo estipulado sin causa imputable al comprador.
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="font-bold text-white block mb-1">4. Producto Diferente:</span>
                  Se entregó una modalidad o plataforma distinta a la adquirida en el pedido.
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="font-bold text-white block mb-1">5. Activación Fallida:</span>
                  Imposibilidad técnica de activación atribuible al proveedor sin posibilidad de reemplazo.
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="font-bold text-white block mb-1">6. Falla en Garantía:</span>
                  Interrupción del servicio no subsanada en un lapso razonable durante el período contratado.
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-cyan-300">
                B. Derecho Legal de Retracto (Art. 47 Ley 1480 de 2011)
              </h3>
              <p>
                El consumidor tiene derecho a retractarse de la compra dentro de los <strong>cinco (5) días hábiles siguientes</strong> a la celebración del contrato de servicio digital, siempre y cuando la prestación del servicio no haya iniciado con su consentimiento previo o no se haya consumido o canjeado el código digital de manera definitiva.
              </p>
              <p>
                En caso de proceder el retracto, StreamBox devolverá el dinero en su totalidad dentro de los plazos legales establecidos sin descuentos indebidos.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-cyan-300">
                C. Estados del Flujo de Reclamación
              </h3>
              <p>
                Cada solicitud radicada en el sistema avanza por estados estrictamente auditados:
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">SUBMITTED (Recibida)</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">UNDER_REVIEW (En Revisión)</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800">NEED_MORE_INFO (Info Adicional)</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">APPROVED (Aprobada)</span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800">REFUND_PROCESSING (En Trámite)</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900 text-emerald-200 border border-emerald-700">REFUNDED (Reintegrado)</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800">REJECTED (Rechazada Motivada)</span>
              </div>
            </section>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <p className="text-zinc-400">
                ¿Deseas radicar una solicitud formal para alguno de tus pedidos?
              </p>
              <button
                onClick={() => onNavigate('cuenta-reembolsos')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Ir a Mis Reclamaciones</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. POLÍTICA DE PRIVACIDAD (LEY 1581) */}
        {activeTab === 'privacidad' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Política de Tratamiento y Protección de Datos Personales
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  En cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 en Colombia.
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-emerald-300">
                1. Principio de Finalidad y Datos Recopilados
              </h3>
              <p>
                StreamBox únicamente recopila los datos personales estrictamente indispensables para la ejecución del contrato de servicios digitales:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong>Nombre y Apellido:</strong> Para identificación y asignación de pedidos.</li>
                <li><strong>Correo Electrónico:</strong> Para autenticación, despacho de credenciales y avisos legales.</li>
                <li><strong>Número de Celular:</strong> Para verificación de transferencias Nequi/Daviplata y contacto de soporte.</li>
                <li><strong>Número de Referencia de Pago:</strong> Para validar la transacción bancaria.</li>
              </ul>
              <p className="text-emerald-300 font-medium">
                En ningún caso solicitamos contraseñas de cuentas bancarias personales, claves de acceso a tarjetas ni códigos OTP de seguridad.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-emerald-300">
                2. Política Estricta frente a Inteligencia Artificial (Google Gemini)
              </h3>
              <p>
                Cumpliendo los términos de Google AI Studio y Gemini API:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>Las interacciones con nuestro asistente virtual StreamBot están configuradas exclusivamente para orientar sobre el catálogo comercial, estado de órdenes y preguntas frecuentes.</li>
                <li><strong>No se envían comprobantes bancarios, contraseñas ni datos sensibles de usuarios a la API de Google Gemini.</strong></li>
                <li>No se utilizan las herramientas de IA para elaborar perfiles crediticios, suplantación de identidad ni fines ajenos al servicio.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white text-emerald-300">
                3. Derechos de los Titulares (Derechos ARCO)
              </h3>
              <p>
                De acuerdo con el artículo 8 de la Ley 1581 de 2012, el usuario tiene derecho a:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
                <li>Conocer, actualizar y rectificar sus datos personales frente a StreamBox.</li>
                <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
                <li>Ser informado sobre el uso que se ha dado a sus datos personales.</li>
                <li>Revocar la autorización o solicitar la supresión del dato cuando no medie un deber legal o contractual de permanencia.</li>
                <li>Acceder en forma gratuita a sus datos personales objeto de tratamiento.</li>
              </ol>
              <p className="mt-2">
                Para ejercer cualquiera de estos derechos, el titular puede enviar un correo a <strong>{settings.supportEmail}</strong> con el asunto «Ejercicio Derechos Ley 1581», con respuesta garantizada en un plazo máximo de diez (10) días hábiles.
              </p>
            </section>
          </div>
        )}

        {/* 4. COOKIES Y CONSENTIMIENTO */}
        {activeTab === 'cookies' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <Cookie className="w-6 h-6 text-amber-400" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Política de Cookies y Preferencias de Consentimiento
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Controla de manera granular las tecnologías de almacenamiento y comunicaciones comerciales.
                </p>
              </div>
            </div>

            <p>
              En StreamBox utilizamos almacenamiento local y cookies técnicas para recordar tu sesión iniciada, mantener los productos en tu carrito de compras y asegurar la protección de tus solicitudes.
            </p>

            <div className="space-y-4 pt-2">
              {/* Essential */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Cookies Esenciales y de Seguridad</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      Obligatorias
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Necesarias para la autenticación de usuarios, persistencia del carrito, prevención de ataques CSRF y enrutamiento seguro de la tienda. No pueden desactivarse.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="w-4 h-4 rounded text-purple-600 bg-zinc-800 border-zinc-700 cursor-not-allowed mt-1"
                />
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Métricas de Rendimiento y Navegación</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                      Opcional
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Nos ayuda a conocer los tiempos de respuesta del catálogo y páginas más visitadas de forma totalmente anónima.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-zinc-800 border-zinc-700 cursor-pointer mt-1"
                />
              </div>

              {/* Marketing (Ley 1581) */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Comunicaciones Comerciales y Promociones</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                      Opcional (No Premarcada)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Autorización expresa para recibir novedades, promociones exclusivas y lanzamientos de nuevas plataformas por correo o WhatsApp. Cumple el mandato de consentimiento previo de la Ley 1581.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-zinc-800 border-zinc-700 cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {savedConsentMsg ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preferencias guardadas exitosamente</span>
                </span>
              ) : (
                <span className="text-xs text-zinc-500">
                  Puedes modificar estas autorizaciones en cualquier momento.
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveCookiePreferences}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
