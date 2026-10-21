import { Product, Category, GlobalSettings, Promotion, GiveawayCampaign, ComplianceItem, RefundRequest } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-streaming',
    name: 'Streaming y entretenimiento',
    slug: 'streaming-entretenimiento',
    description: 'Plataformas de cine, series, documentales, producciones originales y anime bajo demanda.',
    iconName: 'Tv',
    subcategories: ['Películas y series', 'Anime', 'Documentales', 'Cine independiente', 'Contenido familiar'],
    active: true,
    order: 1,
    colorAccent: '#E50914'
  },
  {
    id: 'cat-music',
    name: 'Música y audio',
    slug: 'musica-audio',
    description: 'Streaming de música sin interrupciones, audio espacial de alta fidelidad, podcasts y audiolibros.',
    iconName: 'Headphones',
    subcategories: ['Música en streaming', 'Audio Hi-Fi', 'Podcasts', 'Planes Familiares', 'Audiolibros'],
    active: true,
    order: 2,
    colorAccent: '#1DB954'
  },
  {
    id: 'cat-ai',
    name: 'Inteligencia artificial',
    slug: 'inteligencia-artificial',
    description: 'Modelos de lenguaje, agentes conversacionales, generación de imágenes, voz y razonamiento avanzado.',
    iconName: 'Sparkles',
    subcategories: ['Asistentes de IA', 'Generación de imágenes', 'Razonamiento y código', 'Investigación'],
    active: true,
    order: 3,
    colorAccent: '#10A37F'
  },
  {
    id: 'cat-design',
    name: 'Diseño y creatividad',
    slug: 'diseno-creatividad',
    description: 'Suites gráficas, edición fotográfica, ilustración vectorial, diseño de interfaces y prototipado.',
    iconName: 'Palette',
    subcategories: ['Diseño gráfico', 'Edición de fotos', 'Diseño UI/UX', 'Recursos premium'],
    active: true,
    order: 4,
    colorAccent: '#00C4CC'
  },
  {
    id: 'cat-productivity',
    name: 'Productividad y ofimática',
    slug: 'productividad-ofimatica',
    description: 'Procesadores de texto, hojas de cálculo, gestión de proyectos, notas y colaboración de equipos.',
    iconName: 'Briefcase',
    subcategories: ['Suites ofimáticas', 'Gestión de proyectos', 'Notas y documentación', 'Correo profesional'],
    active: true,
    order: 5,
    colorAccent: '#D83B01'
  },
  {
    id: 'cat-cloud',
    name: 'Almacenamiento en la nube',
    slug: 'almacenamiento-nube',
    description: 'Copia de seguridad automática, sincronización de archivos y espacio masivo en la nube.',
    iconName: 'Cloud',
    subcategories: ['Almacenamiento personal', 'Almacenamiento empresarial', 'Copias de seguridad', 'Cifrado seguro'],
    active: true,
    order: 6,
    colorAccent: '#4285F4'
  },
  {
    id: 'cat-vpn',
    name: 'VPN y privacidad',
    slug: 'vpn-privacidad',
    description: 'Navegación anónima, cifrado de tráfico en redes públicas, protección de IP y gestores de contraseñas.',
    iconName: 'ShieldCheck',
    subcategories: ['VPN', 'Gestores de contraseñas', 'Protección de identidad', 'Navegación segura'],
    active: true,
    order: 7,
    colorAccent: '#4687FF'
  },
  {
    id: 'cat-security',
    name: 'Seguridad digital',
    slug: 'seguridad-digital',
    description: 'Antivirus avanzado, protección contra malware, ransomware, phishing y blindaje de dispositivos.',
    iconName: 'ShieldAlert',
    subcategories: ['Antivirus', 'Protección contra ransomware', 'Seguridad web', 'Control de dispositivos'],
    active: true,
    order: 8,
    colorAccent: '#EF4444'
  },
  {
    id: 'cat-gaming',
    name: 'Videojuegos y plataformas gaming',
    slug: 'videojuegos-gaming',
    description: 'Membresías multijugador, catálogos por suscripción, Cloud Gaming y créditos para consolas y PC.',
    iconName: 'Gamepad2',
    subcategories: ['Suscripciones consolas', 'PC Gaming', 'Juego en la nube', 'Créditos digitales'],
    active: true,
    order: 9,
    colorAccent: '#107C10'
  },
  {
    id: 'cat-social',
    name: 'Redes sociales y herramientas para creadores',
    slug: 'redes-sociales-creadores',
    description: 'Herramientas legítimas de gestión, programación de publicaciones, analítica de audiencias y miniaturas.',
    iconName: 'Share2',
    subcategories: ['Programación de posts', 'Analítica social', 'Gestión multicanal', 'Herramientas de creadores'],
    active: true,
    order: 10,
    colorAccent: '#EC4899'
  },
  {
    id: 'cat-video',
    name: 'Edición de video y contenido',
    slug: 'edicion-video-contenido',
    description: 'Software de posproducción, efectos visuales, subtitulado asistido, grabación de pantalla y exportación 4K.',
    iconName: 'Film',
    subcategories: ['Edición de video', 'Subtítulos automáticos', 'Grabación de pantalla', 'Efectos audiovisuales'],
    active: true,
    order: 11,
    colorAccent: '#06B6D4'
  },
  {
    id: 'cat-education',
    name: 'Educación y aprendizaje',
    slug: 'educacion-aprendizaje',
    description: 'Plataformas de idiomas, certificaciones profesionales, cursos universitarios y desarrollo de habilidades.',
    iconName: 'GraduationCap',
    subcategories: ['Idiomas', 'Cursos certificados', 'Habilidades técnicas', 'Matemáticas y ciencia'],
    active: true,
    order: 12,
    colorAccent: '#58CC02'
  },
  {
    id: 'cat-dev',
    name: 'Desarrollo de software',
    slug: 'desarrollo-software',
    description: 'Entornos de desarrollo, asistentes de programación con IA, repositorios en la nube y terminales inteligentes.',
    iconName: 'Code',
    subcategories: ['Asistentes de código', 'IDEs y editores', 'Control de versiones', 'Infraestructura'],
    active: true,
    order: 13,
    colorAccent: '#8B5CF6'
  },
  {
    id: 'cat-business',
    name: 'Servicios empresariales',
    slug: 'servicios-empresariales',
    description: 'Sistemas de atención al cliente, CRM, automatización de flujos de trabajo y correo corporativo.',
    iconName: 'Building2',
    subcategories: ['CRM empresarial', 'Atención al cliente', 'Automatización', 'Correo con dominio propio'],
    active: true,
    order: 14,
    colorAccent: '#3B82F6'
  },
  {
    id: 'cat-tv',
    name: 'Televisión y contenido autorizado',
    slug: 'television-contenido-autorizado',
    description: 'Distribución digital autorizada de señales televisivas, eventos en vivo y aplicaciones certificadas.',
    iconName: 'MonitorPlay',
    subcategories: ['Televisión digital', 'Eventos en vivo', 'Canales autorizados'],
    active: true,
    order: 15,
    colorAccent: '#6366F1'
  },
  {
    id: 'cat-giftcards',
    name: 'Tarjetas regalo y créditos digitales',
    slug: 'tarjetas-regalo-creditos',
    description: 'Códigos digitales canjeables de saldo oficial para tiendas de videojuegos, aplicaciones y plataformas.',
    iconName: 'Gift',
    subcategories: ['Steam Wallet', 'Tarjetas Xbox', 'PlayStation Network', 'Nintendo eShop'],
    active: true,
    order: 16,
    colorAccent: '#F59E0B'
  },
  {
    id: 'cat-other',
    name: 'Otros servicios digitales',
    slug: 'otros-servicios-digitales',
    description: 'Nuevos productos y utilidades digitales aprobadas por la administración de StreamBox.',
    iconName: 'Layers',
    subcategories: ['Servicios personalizados', 'Utilidades web', 'Nuevas incorporaciones'],
    active: true,
    order: 17,
    colorAccent: '#A855F7'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // ==========================================
  // A. STREAMING Y ENTRETENIMIENTO
  // ==========================================

  // 1. Netflix
  {
    id: 'prod-netflix',
    name: 'Netflix Premium 4K UHD',
    slug: 'netflix-premium',
    brand: 'Netflix',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'Disfruta de películas, series, documentales y anime ilimitados en resolución Ultra HD 4K con audio espacial inmersivo. Admite descargas para visualización sin conexión. Incluye las modalidades históricas verificadas de StreamBox.',
    shortDescription: 'Cine y series ilimitadas en máxima resolución 4K HDR.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.netflix.com&size=128',
    brandAccent: '#E50914',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'nflx-15d',
        name: 'Netflix Premium — 15 días',
        duration: '15 Días',
        priceCOP: 10000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        quality: '4K Ultra HD',
        usersAllowed: '1 Pantalla privada',
        licenseType: 'Perfil Individual con PIN',
        activationConditions: 'Entrega por chat con PIN privado asignado.',
        renewalPolicy: 'Renovación disponible al vencer el ciclo.',
        warrantyInfo: 'Garantía StreamBox total durante los 15 días.'
      },
      {
        id: 'nflx-30d',
        name: 'Netflix Premium — 30 días',
        duration: '1 Mes',
        priceCOP: 13500,
        originalPriceCOP: 16000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 45,
        quality: '4K Ultra HD',
        usersAllowed: '1 Pantalla privada',
        licenseType: 'Perfil Individual con PIN',
        activationConditions: 'Entrega directa de usuario, contraseña y PIN asignado.',
        renewalPolicy: 'Se conserva el perfil e historial.',
        warrantyInfo: 'Garantía activa de 30 días.'
      },
      {
        id: 'nflx-renov-30d',
        name: 'Netflix Renovable — 30 días',
        duration: '1 Mes',
        priceCOP: 15000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        quality: '4K Ultra HD',
        usersAllowed: '1 Pantalla privada garantizada',
        licenseType: 'Perfil Renovable Fijo',
        activationConditions: 'Mismo perfil garantizado mes a mes.',
        renewalPolicy: 'Prioridad de renovación continua sin cambio de cuenta.',
        warrantyInfo: 'Garantía 100% ininterrumpida.'
      },
      {
        id: 'nflx-std-30d',
        name: 'Netflix Estándar — 30 días',
        duration: '1 Mes',
        priceCOP: 13000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        quality: '1080p Full HD',
        usersAllowed: '1 Pantalla',
        licenseType: 'Perfil Estándar',
        activationConditions: 'Entrega por chat al confirmar pago.',
        warrantyInfo: 'Garantía StreamBox 30 días.'
      },
      {
        id: 'nflx-4k-prem',
        name: 'Netflix 4K Premium Cuenta Completa',
        duration: '1 Mes',
        priceCOP: 22000,
        officialReferencePriceCOP: 44900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 15,
        quality: '4K UHD + HDR + Audio Espacial',
        usersAllowed: '4 Pantallas simultáneas',
        licenseType: 'Cuenta Completa Familiar',
        activationConditions: 'Control total de la cuenta durante 30 días.',
        warrantyInfo: 'Garantía premium mensual.'
      }
    ],
    region: 'Colombia y Latinoamérica',
    compatibility: 'Smart TV, TV Box, Fire Stick, Android, iOS, Windows, Mac',
    deliveryMethod: 'Entrega por Chat privado StreamBox al confirmar el pago',
    terms: 'Garantía durante todo el tiempo contratado. No alterar correo principal ni contraseña administradora.',
    verificationSource: 'Catálogo Histórico Verificado StreamBox & Distribución Mayorista',
    verifiedDate: '2026-10-10',
    status: 'ACTIVE',
    tags: ['4K UHD', 'Top Ventas', 'PIN Privado', 'Películas'],
    isFeatured: true,
    isPopular: true,
    faq: [
      { q: '¿Puedo usar mi perfil en mi Smart TV?', a: 'Sí, es compatible con cualquier televisor inteligente, consola o decodificador.' },
      { q: '¿Se borra mi historial al renovar?', a: 'En la modalidad Renovable conservas tu perfil y recomendaciones mes a mes.' }
    ]
  },

  // 2. Disney+
  {
    id: 'prod-disney',
    name: 'Disney+ (Estándar & Premium)',
    slug: 'disney-plus',
    brand: 'Disney+',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'Catálogo de Disney, Pixar, Marvel, Star Wars, National Geographic y deportes en vivo ESPN con partidos de la Champions League y ligas del mundo.',
    shortDescription: 'Películas familiares, Marvel, Star Wars y todo ESPN en vivo.',
    logoColor: '#113CCF',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.disneyplus.com&size=128',
    brandAccent: '#0063E5',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'dis-sb-1m',
        name: 'Perfil Pantalla con PIN StreamBox',
        duration: '1 Mes',
        priceCOP: 12000,
        officialReferencePriceCOP: 29900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 35,
        quality: '4K Ultra HD',
        usersAllowed: '1 Pantalla con PIN',
        licenseType: 'Perfil Individual',
        warrantyInfo: 'Garantía StreamBox 30 días.'
      },
      {
        id: 'dis-ref-std',
        name: 'Plan Oficial Estándar (Referencia oficial Disney+)',
        duration: '1 Mes',
        priceCOP: 29900,
        officialReferencePriceCOP: 29900,
        priceStatus: 'OFFICIAL_REFERENCE',
        available: true,
        stock: 10,
        quality: 'Full HD 1080p',
        usersAllowed: '2 Dispositivos simultáneos',
        licenseType: 'Suscripción Oficial Proveedor',
        activationConditions: 'Activación directa al correo del cliente.',
        warrantyInfo: 'Suscripción directa proveedor.'
      },
      {
        id: 'dis-ref-prem',
        name: 'Plan Oficial Premium (Referencia oficial Disney+)',
        duration: '1 Mes',
        priceCOP: 44900,
        officialReferencePriceCOP: 44900,
        priceStatus: 'OFFICIAL_REFERENCE',
        available: true,
        stock: 10,
        quality: '4K UHD + Audio Dolby Atmos',
        usersAllowed: '4 Dispositivos simultáneos + ESPN completo',
        licenseType: 'Suscripción Oficial Proveedor',
        warrantyInfo: 'Suscripción directa proveedor.'
      }
    ],
    region: 'Colombia y Global',
    compatibility: 'Smart TV, PlayStation, Xbox, Móviles, Tablets, Web',
    deliveryMethod: 'Entrega por Chat StreamBox tras confirmar el pago',
    terms: 'Garantía 100% durante el tiempo contratado. Soporte rápido.',
    verificationSource: 'Tarifas Oficiales Publicadas Disney+ Colombia & Distribución StreamBox',
    verifiedDate: '2026-10-10',
    status: 'ACTIVE',
    tags: ['Marvel', 'ESPN', 'Pixar', 'Star Wars'],
    isFeatured: true,
    isPopular: true
  },

  // 3. Prime Video
  {
    id: 'prod-prime-video',
    name: 'Amazon Prime Video',
    slug: 'prime-video',
    brand: 'Prime Video',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'Series exclusivas originales de Amazon, The Boys, Fallout, El Señor de los Anillos y miles de películas en calidad 4K HDR.',
    shortDescription: 'Series exclusivas, películas de taquilla y producciones mundiales.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.primevideo.com&size=128',
    brandAccent: '#00A8E1',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'amz-p-1m',
        name: 'Perfil Pantalla StreamBox',
        duration: '1 Mes',
        priceCOP: 9500,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        quality: '4K HDR',
        usersAllowed: '1 Pantalla',
        licenseType: 'Perfil Privado'
      },
      {
        id: 'amz-full-1m',
        name: 'Cuenta Completa Familiar (3 Pantallas)',
        duration: '1 Mes',
        priceCOP: 24000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 12,
        quality: '4K HDR',
        usersAllowed: '3 Pantallas simultáneas',
        licenseType: 'Cuenta Completa'
      }
    ],
    region: 'Colombia y Latinoamérica',
    compatibility: 'Smart TV, Fire Stick, Android, iOS, Web',
    deliveryMethod: 'Entrega por Chat StreamBox al confirmar pago',
    terms: 'Garantía activa de 30 días.',
    status: 'ACTIVE',
    tags: ['Amazon', 'Series', '4K'],
    isPopular: true
  },

  // 4. HBO Max / Max
  {
    id: 'prod-hbo-max',
    name: 'Max (HBO Max) Platino 4K',
    slug: 'max-hbo',
    brand: 'Max',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'El universo HBO completo, Warner Bros, DC, Cartoon Network y fútbol internacional. Series galardonadas como House of the Dragon y The Last of Us.',
    shortDescription: 'Grandes historias HBO, DC Comics, Warner y deportes.',
    logoColor: '#002BE7',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.max.com&size=128',
    brandAccent: '#002BE7',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'hbo-p-1m',
        name: 'Perfil Pantalla Personal',
        duration: '1 Mes',
        priceCOP: 10000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 28,
        quality: '4K UHD',
        usersAllowed: '1 Pantalla'
      },
      {
        id: 'hbo-full-1m',
        name: 'Cuenta Completa Platino 4K',
        duration: '1 Mes',
        priceCOP: 26000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 14,
        quality: '4K UHD Platino',
        usersAllowed: '4 Pantallas'
      }
    ],
    region: 'Colombia y Latinoamérica',
    compatibility: 'Smart TV, Android TV, Consolas, Web',
    deliveryMethod: 'Entrega por Chat StreamBox',
    terms: 'Garantía total de 30 días.',
    status: 'ACTIVE',
    tags: ['HBO', 'Warner', 'DC', '4K']
  },

  // 5. Apple TV+
  {
    id: 'prod-apple-tv',
    name: 'Apple TV+ Originales',
    slug: 'apple-tv-plus',
    brand: 'Apple TV+',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'Producciones originales galardonadas con la mayor tasa de bits de la industria: Ted Lasso, Severance, The Morning Show y películas exclusivas.',
    shortDescription: 'Series y películas aclamadas por la crítica con bitrate premium.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Ftv.apple.com&size=128',
    brandAccent: '#A3A3A3',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'appletv-1m',
        name: 'Perfil Pantalla StreamBox',
        duration: '1 Mes',
        priceCOP: 11000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        quality: '4K Dolby Vision / Atmos',
        usersAllowed: '1 Dispositivo'
      }
    ],
    region: 'Global',
    compatibility: 'Apple Devices, Smart TV, Fire TV, Google TV, Web',
    deliveryMethod: 'Entrega por Chat StreamBox',
    terms: 'Garantía 30 días.',
    status: 'ACTIVE',
    tags: ['Apple', 'Dolby Vision', 'Originales']
  },

  // 6. Crunchyroll Mega Fan
  {
    id: 'prod-crunchyroll',
    name: 'Crunchyroll Mega Fan',
    slug: 'crunchyroll-mega-fan',
    brand: 'Crunchyroll',
    category: 'cat-streaming',
    subcategory: 'Anime',
    description: 'La mayor biblioteca de anime del mundo. Estrenos simulcast una hora después de su emisión en Japón, sin anuncios y con descargas.',
    shortDescription: 'Anime sin límites, simulcast Japón y descargas offline.',
    logoColor: '#F47521',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.crunchyroll.com&size=128',
    brandAccent: '#F47521',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'cr-p-1m',
        name: 'Perfil Mega Fan StreamBox',
        duration: '1 Mes',
        priceCOP: 9000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        quality: '1080p HD',
        usersAllowed: '1 Pantalla'
      }
    ],
    region: 'Global',
    compatibility: 'Consolas, Smart TV, Android, iOS, Web',
    deliveryMethod: 'Entrega por Chat StreamBox',
    terms: 'Garantía durante todo el mes contratado.',
    status: 'ACTIVE',
    tags: ['Anime', 'Simulcast', 'Sin Anuncios']
  },

  // 7. Paramount+ (Pending Price Verification)
  {
    id: 'prod-paramount-plus',
    name: 'Paramount+ Entretenimiento',
    slug: 'paramount-plus',
    brand: 'Paramount+',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'Películas taquilleras de Paramount Pictures, series exclusivas de Showtime, Nickelodeon, MTV y torneos de fútbol.',
    shortDescription: 'Montaña de entretenimiento: películas, Showtime y Nickelodeon.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.paramountplus.com&size=128',
    brandAccent: '#0064FF',
    visualStatus: 'PENDING',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'pmnt-pending',
        name: 'Suscripción Mensual',
        duration: '1 Mes',
        priceCOP: null,
        priceStatus: 'PRICE_PENDING',
        available: false,
        activationConditions: 'En proceso de verificación de tarifa comercial legítima.'
      }
    ],
    region: 'Colombia',
    compatibility: 'Smart TV, Móviles, Web',
    deliveryMethod: 'Chat StreamBox una vez verificado',
    terms: 'Pendiente de homologación de disponibilidad.',
    status: 'PRICE_PENDING',
    tags: ['Showtime', 'Películas', 'Verificación Pendiente']
  },

  // 8. ViX (Pending Price Verification)
  {
    id: 'prod-vix',
    name: 'ViX Premium',
    slug: 'vix-premium',
    brand: 'ViX',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'El mayor servicio de streaming en español: telenovelas históricas, series originales y partidos en vivo de la Liga MX y Champions.',
    shortDescription: 'Cine, series y fútbol en vivo 100% en español.',
    logoColor: '#FF3C00',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fvix.com&size=128',
    brandAccent: '#FF3C00',
    visualStatus: 'PENDING',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'vix-pending',
        name: 'Suscripción Mensual ViX Premium',
        duration: '1 Mes',
        priceCOP: null,
        priceStatus: 'PRICE_PENDING',
        available: false
      }
    ],
    region: 'Colombia y Latinoamérica',
    compatibility: 'Smart TV, Roku, Fire TV, Móviles',
    deliveryMethod: 'Chat StreamBox una vez verificado',
    terms: 'Pendiente de homologación de precios.',
    status: 'PRICE_PENDING',
    tags: ['Español', 'Fútbol', 'Verificación Pendiente']
  },

  // 9. MUBI
  {
    id: 'prod-mubi',
    name: 'MUBI Cine de Autor',
    slug: 'mubi-cine',
    brand: 'MUBI',
    category: 'cat-streaming',
    subcategory: 'Cine independiente',
    description: 'Colección curada por expertos de cine independiente, directores galardonados, clásicos restaurados y joyas de festivales internacionales.',
    shortDescription: 'Cine independiente, de autor y clásicos mundiales curados a mano.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fmubi.com&size=128',
    brandAccent: '#001E62',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'mubi-1m',
        name: 'Mensual',
        duration: '1 Mes',
        priceCOP: 28900,
        originalPriceCOP: 28900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Membresía Mensual Oficial',
        usersAllowed: '1 Usuario / 2 Dispositivos',
        warrantyInfo: 'Garantía oficial completa.'
      },
      {
        id: 'mubi-12m',
        name: 'Anual',
        duration: '12 Meses',
        priceCOP: 239000,
        originalPriceCOP: 239000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Membresía Anual Oficial',
        usersAllowed: '1 Usuario / 2 Dispositivos',
        warrantyInfo: 'Garantía anual completa.'
      }
    ],
    region: 'Global',
    compatibility: 'Smart TV, Web, iOS, Android',
    deliveryMethod: 'Activación oficial entregada por Chat StreamBox al confirmar pago',
    terms: 'Acceso completo a estrenos semanales y videoteca exclusiva.',
    status: 'ACTIVE',
    tags: ['Cine de Autor', 'Festivales', 'Películas']
  },

  // 10. Rakuten TV
  {
    id: 'prod-rakuten-tv',
    name: 'Rakuten TV Cine y Estrenos',
    slug: 'rakuten-tv',
    brand: 'Rakuten TV',
    category: 'cat-streaming',
    subcategory: 'Películas y series',
    description: 'Estrenos cinematográficos recién salidos del cine en calidad 4K UHD, alquiler bajo demanda y biblioteca de compra digital.',
    shortDescription: 'Alquiler y compra de películas y estrenos cinematográficos.',
    logoColor: '#FFE600',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.rakuten.tv&size=128',
    brandAccent: '#E50914',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'rakuten-rent',
        name: 'Alquiler de película',
        duration: '48 Horas',
        priceCOP: 12900,
        originalPriceCOP: 12900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Alquiler Digital 4K UHD',
        quality: '4K Ultra HD / HDR'
      },
      {
        id: 'rakuten-buy',
        name: 'Compra de película',
        duration: 'Permanente',
        priceCOP: 34900,
        originalPriceCOP: 34900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Compra Digital Permanente',
        quality: '4K Ultra HD / HDR'
      }
    ],
    region: 'Global',
    compatibility: 'Smart TV, Móviles, Web',
    deliveryMethod: 'Código digital oficial entregado por Chat StreamBox',
    terms: 'Canjeable en tu cuenta oficial de Rakuten TV.',
    status: 'ACTIVE',
    tags: ['Cine', 'Alquiler', '4K UHD']
  },

  // ==========================================
  // B. MÚSICA Y AUDIO
  // ==========================================

  // 11. Spotify Premium (Official reference rates + StreamBox verified)
  {
    id: 'prod-spotify',
    name: 'Spotify Premium Música Hi-Fi',
    slug: 'spotify-premium',
    brand: 'Spotify',
    category: 'cat-music',
    subcategory: 'Música en streaming',
    description: 'Escucha más de 100 millones de canciones sin anuncios, saltos ilimitados, descarga tus listas favoritas y reproduce en segundo plano.',
    shortDescription: 'Música y podcasts sin interrupciones ni anuncios en la máxima calidad.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fopen.spotify.com&size=128',
    brandAccent: '#1DB954',
    visualStatus: 'VERIFIED',
    productType: 'MUSIC',
    modalities: [
      {
        id: 'sp-ind-1m',
        name: 'Spotify Premium Individual — 1 Mes',
        duration: '1 Mes',
        priceCOP: 18500,
        officialReferencePriceCOP: 18500,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 40,
        quality: '320 kbps Muy Alta',
        usersAllowed: '1 Cuenta Personal',
        licenseType: 'Cuenta Individual',
        warrantyInfo: 'Garantía StreamBox 30 días.'
      },
      {
        id: 'sp-duo-1m',
        name: 'Spotify Premium Duo (Referencia Oficial)',
        duration: '1 Mes',
        priceCOP: 24500,
        officialReferencePriceCOP: 24500,
        priceStatus: 'OFFICIAL_REFERENCE',
        available: true,
        stock: 15,
        quality: '320 kbps Muy Alta',
        usersAllowed: '2 Cuentas Individuales',
        licenseType: 'Plan Duo',
        warrantyInfo: 'Suscripción oficial.'
      },
      {
        id: 'sp-fam-1m',
        name: 'Spotify Premium Familiar (Referencia Oficial)',
        duration: '1 Mes',
        priceCOP: 30500,
        officialReferencePriceCOP: 30500,
        priceStatus: 'OFFICIAL_REFERENCE',
        available: true,
        stock: 15,
        quality: '320 kbps Muy Alta',
        usersAllowed: 'Hasta 6 Cuentas Individuales',
        licenseType: 'Plan Familiar Oficial',
        warrantyInfo: 'Suscripción oficial.'
      },
      {
        id: 'sp-estud-1m',
        name: 'Spotify Premium Estudiantes Elegibles',
        duration: '1 Mes',
        priceCOP: 10100,
        officialReferencePriceCOP: 10100,
        priceStatus: 'OFFICIAL_REFERENCE',
        available: true,
        stock: 10,
        usersAllowed: '1 Cuenta con acreditación universitaria',
        licenseType: 'Plan Estudiante Oficial',
        activationConditions: 'Requiere validación mediante SheerID institucional.',
        warrantyInfo: 'Tarifa oficial proveedor.'
      }
    ],
    region: 'Colombia',
    compatibility: 'Android, iOS, PC, Smart Speakers, Smart TV',
    deliveryMethod: 'Activación o entrega directa por Chat StreamBox',
    terms: 'Garantía ininterrumpida durante el tiempo seleccionado.',
    verificationSource: 'Tarifas Oficiales Publicadas Spotify Colombia (spotify.com/co-es/premium)',
    verifiedDate: '2026-10-10',
    status: 'ACTIVE',
    tags: ['Música', 'Hi-Fi', 'Sin Anuncios', 'Offline'],
    isFeatured: true,
    isPopular: true
  },

  // 12. YouTube Music Premium
  {
    id: 'prod-youtube-music',
    name: 'YouTube Music Premium',
    slug: 'youtube-music-premium',
    brand: 'YouTube Music',
    category: 'cat-music',
    subcategory: 'Música en streaming',
    description: 'Toda la música del mundo, presentaciones en vivo, remixes exclusivos y audio sin anuncios en segundo plano con pantalla apagada y descargas offline.',
    shortDescription: 'Música sin anuncios en segundo plano y descargas offline.',
    logoColor: '#FF0000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.youtube.com&size=128',
    brandAccent: '#FF0000',
    visualStatus: 'VERIFIED',
    productType: 'MUSIC',
    modalities: [
      {
        id: 'ytm-ind-1m',
        name: 'Individual',
        duration: '1 Mes',
        priceCOP: 23900,
        originalPriceCOP: 23900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        usersAllowed: '1 Cuenta personal',
        licenseType: 'Plan Individual',
        warrantyInfo: 'Garantía oficial activa.'
      },
      {
        id: 'ytm-fam-1m',
        name: 'Familiar',
        duration: '1 Mes',
        priceCOP: 39900,
        originalPriceCOP: 39900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        usersAllowed: 'Hasta 6 cuentas familiares',
        licenseType: 'Plan Familiar',
        warrantyInfo: 'Garantía oficial activa.'
      }
    ],
    region: 'Colombia',
    compatibility: 'Cuentas Gmail personales, Smart TV, Móviles, Web',
    deliveryMethod: 'Activación oficial enviada por Chat StreamBox al confirmar pago',
    terms: 'Conservas tus suscripciones y listas intactas.',
    status: 'ACTIVE',
    tags: ['YouTube Music', 'Segundo Plano', 'Sin Anuncios']
  },

  // 12b. YouTube Premium
  {
    id: 'prod-youtube-premium',
    name: 'YouTube Premium',
    slug: 'youtube-premium',
    brand: 'YouTube',
    category: 'cat-streaming',
    subcategory: 'Videos y música sin anuncios',
    description: 'Todos los videos de YouTube sin interrupciones publicitarias, reproducción en segundo plano con pantalla apagada en celulares y tablets, descargas offline y acceso completo incluido a YouTube Music Premium.',
    shortDescription: 'Cero anuncios en todos los videos de YouTube, reproducción en segundo plano y descargas.',
    logoColor: '#FF0000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.youtube.com&size=128',
    brandAccent: '#FF0000',
    visualStatus: 'VERIFIED',
    productType: 'STREAMING',
    modalities: [
      {
        id: 'ytp-ind-1m',
        name: 'Individual',
        duration: '1 Mes',
        priceCOP: 30900,
        originalPriceCOP: 30900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        usersAllowed: '1 Cuenta personal',
        licenseType: 'Plan Individual'
      },
      {
        id: 'ytp-fam-1m',
        name: 'Familiar',
        duration: '1 Mes',
        priceCOP: 61900,
        originalPriceCOP: 61900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        usersAllowed: 'Hasta 6 cuentas familiares',
        licenseType: 'Plan Familiar'
      }
    ],
    region: 'Colombia',
    compatibility: 'Smart TV, Celulares Android y iOS, Web, Tablets, Consolas',
    deliveryMethod: 'Activación oficial entregada por Chat StreamBox al confirmar pago',
    terms: 'Conservas tu cuenta de YouTube con historial y suscripciones.',
    status: 'ACTIVE',
    tags: ['YouTube', 'Sin Anuncios', 'Segundo Plano', 'Streaming', 'Descargas']
  },

  // 13. Deezer HiFi (Deezer Premium & Deezer Family)
  {
    id: 'prod-deezer',
    name: 'Deezer HiFi',
    slug: 'deezer-hifi',
    brand: 'Deezer',
    category: 'cat-music',
    subcategory: 'Audio Hi-Fi',
    description: 'Más de 120 millones de canciones en calidad de sonido High Fidelity FLAC de 16 bits sin pérdida, Flow personalizado por IA, letras sincronizadas y sin anuncios.',
    shortDescription: 'Música en calidad FLAC de alta fidelidad, Flow inteligente y descargas offline.',
    logoColor: '#A238FF',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.deezer.com&size=128',
    brandAccent: '#A238FF',
    visualStatus: 'VERIFIED',
    productType: 'MUSIC',
    modalities: [
      {
        id: 'deezer-ind-1m',
        name: 'Individual (Deezer Premium)',
        duration: '1 Mes',
        priceCOP: 23900,
        originalPriceCOP: 23900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Deezer Premium Individual'
      },
      {
        id: 'deezer-fam-1m',
        name: 'Familiar (Deezer Family)',
        duration: '1 Mes',
        priceCOP: 35500,
        originalPriceCOP: 35500,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        usersAllowed: 'Hasta 6 perfiles',
        licenseType: 'Deezer Family'
      }
    ],
    region: 'Colombia',
    compatibility: 'iOS, Android, Windows, Mac, Smart TV, Sistemas de Sonido HiFi',
    deliveryMethod: 'Credenciales oficiales entregadas por Chat StreamBox al confirmar pago',
    terms: 'Garantía ininterrumpida StreamBox.',
    status: 'ACTIVE',
    tags: ['Deezer', 'Hi-Fi', 'FLAC', 'Música']
  },

  // 13b. Apple Music Audio Espacial
  {
    id: 'prod-apple-music',
    name: 'Apple Music Audio Espacial',
    slug: 'apple-music',
    brand: 'Apple Music',
    category: 'cat-music',
    subcategory: 'Audio Hi-Fi',
    description: 'Catálogo sin pérdida Lossless Audio de hasta 24 bits a 192 kHz y Dolby Atmos espacial en millones de canciones.',
    shortDescription: 'Audio Lossless de alta resolución y Dolby Atmos espacial.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fmusic.apple.com&size=128',
    brandAccent: '#FA2D48',
    visualStatus: 'VERIFIED',
    productType: 'MUSIC',
    modalities: [
      {
        id: 'apple-ind-1m',
        name: 'Individual mensual',
        duration: '1 Mes',
        priceCOP: 18500,
        originalPriceCOP: 18500,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Plan Individual',
        quality: 'Lossless Audio & Dolby Atmos'
      },
      {
        id: 'apple-est-1m',
        name: 'Estudiantes mensual',
        duration: '1 Mes',
        priceCOP: 9900,
        originalPriceCOP: 9900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Plan Estudiantes',
        quality: 'Lossless Audio & Dolby Atmos'
      },
      {
        id: 'apple-fam-1m',
        name: 'Familiar mensual',
        duration: '1 Mes',
        priceCOP: 30500,
        originalPriceCOP: 30500,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        usersAllowed: 'Hasta 6 cuentas familiares',
        licenseType: 'Plan Familiar',
        quality: 'Lossless Audio & Dolby Atmos'
      }
    ],
    region: 'Colombia',
    compatibility: 'iOS, Android, Windows, Mac, Apple Watch',
    deliveryMethod: 'Activación oficial entregada por Chat StreamBox al confirmar pago',
    terms: 'Canjeable en tu cuenta Apple ID.',
    status: 'ACTIVE',
    tags: ['Lossless', 'Audio Espacial', 'Apple Music', 'Dolby Atmos']
  },

  // ==========================================
  // C. INTELIGENCIA ARTIFICIAL
  // ==========================================

  // 14. ChatGPT (OpenAI)
  {
    id: 'prod-chatgpt',
    name: 'ChatGPT Plus (GPT-4o & o1 Reasoning)',
    slug: 'chatgpt-plus',
    brand: 'OpenAI',
    category: 'cat-ai',
    subcategory: 'Asistentes de IA',
    description: 'Acceso ilimitado a GPT-4o, análisis avanzado de datos, Canvas para redacción y código, generación fotográfica con DALL-E 3 y razonamiento avanzado o1.',
    shortDescription: 'El asistente de inteligencia artificial más avanzado del planeta.',
    logoColor: '#10A37F',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fchatgpt.com&size=128',
    brandAccent: '#10A37F',
    visualStatus: 'VERIFIED',
    productType: 'AI',
    modalities: [
      {
        id: 'gpt-plus-1m',
        name: 'ChatGPT Plus — Cuenta Privada Completa',
        duration: '1 Mes',
        priceCOP: 85000,
        originalPriceCOP: 95000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 12,
        usersAllowed: 'Cuenta privada 1 usuario',
        licenseType: 'Licencia Plus Privada',
        activationConditions: 'Credenciales entregadas directamente por chat.',
        warrantyInfo: 'Garantía técnica total de 30 días.'
      },
      {
        id: 'gpt-free-info',
        name: 'Plan Gratuito (Referencia OpenAI)',
        duration: 'Indefinida',
        priceCOP: null,
        priceStatus: 'OFFICIAL_REFERENCE',
        available: false,
        activationConditions: 'Plan gratuito no comercializable como suscripción de pago según directriz de StreamBox.'
      }
    ],
    region: 'Global',
    compatibility: 'Web, iOS App, Android App, Mac OS App',
    deliveryMethod: 'Credenciales privadas enviadas por Chat StreamBox',
    terms: '30 días de garantía continua y soporte técnico.',
    status: 'ACTIVE',
    tags: ['GPT-4o', 'OpenAI', 'DALL-E', 'Razonamiento'],
    isFeatured: true,
    isPopular: true
  },

  // 15. Claude Pro (Anthropic)
  {
    id: 'prod-claude-pro',
    name: 'Claude Pro (Claude 3.5 Sonnet)',
    slug: 'claude-pro',
    brand: 'Anthropic',
    category: 'cat-ai',
    subcategory: 'Asistentes de IA',
    description: 'Razonamiento excepcional de nivel doctorado, generación de código limpio, análisis masivo de documentos extensos y Artifacts visuales interactivos.',
    shortDescription: 'Razonamiento excepcional, código limpio y Artifacts interactivos.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fclaude.ai&size=128',
    brandAccent: '#D97706',
    visualStatus: 'VERIFIED',
    productType: 'AI',
    modalities: [
      {
        id: 'cld-pro-1m',
        name: 'Claude Pro — Cuenta Privada 1 Mes',
        duration: '1 Mes',
        priceCOP: 85000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 8,
        usersAllowed: '1 Usuario privado',
        licenseType: 'Cuenta Pro',
        warrantyInfo: 'Garantía 30 días.'
      }
    ],
    region: 'Global',
    compatibility: 'Web, iOS, Android',
    deliveryMethod: 'Acceso seguro por Chat StreamBox',
    terms: 'Garantía ininterrumpida por la totalidad del mes.',
    status: 'ACTIVE',
    tags: ['Anthropic', 'Sonnet 3.5', 'Código', 'Artifacts']
  },

  // 16. Perplexity Pro
  {
    id: 'prod-perplexity',
    name: 'Perplexity Pro Motor de Búsqueda IA',
    slug: 'perplexity-pro',
    brand: 'Perplexity',
    category: 'cat-ai',
    subcategory: 'Investigación',
    description: 'Búsqueda profunda citada con fuentes académicas y en tiempo real. Acceso a múltiples modelos (GPT-4o, Claude 3.5 Sonnet, Sonar) en una sola interfaz.',
    shortDescription: 'Motor de búsqueda conversacional con fuentes en tiempo real.',
    logoColor: '#1FB8CD',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.perplexity.ai&size=128',
    brandAccent: '#1FB8CD',
    visualStatus: 'VERIFIED',
    productType: 'AI',
    modalities: [
      {
        id: 'pplx-1m',
        name: 'Perplexity Pro — 1 Mes',
        duration: '1 Mes',
        priceCOP: 78000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 10,
        licenseType: 'Cuenta Pro'
      }
    ],
    region: 'Global',
    compatibility: 'Web, Extensión Chrome, Móviles',
    deliveryMethod: 'Chat StreamBox',
    terms: 'Garantía 30 días.',
    status: 'ACTIVE',
    tags: ['Investigación', 'Citas', 'Búsqueda']
  },

  // 17. Google Gemini AI
  {
    id: 'prod-gemini',
    name: 'Google Gemini AI',
    slug: 'google-gemini-ai',
    brand: 'Google Gemini',
    category: 'cat-ai',
    subcategory: 'Asistentes de IA',
    description: 'Acceso a los modelos multimodales Gemini de Google con ventana de contexto extendida, análisis de documentos gigantes e integración con Workspace y Drive.',
    shortDescription: 'IA multimodal de Google de última generación con razonamiento profundo.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fgemini.google.com&size=128',
    brandAccent: '#4285F4',
    visualStatus: 'VERIFIED',
    productType: 'AI',
    modalities: [
      {
        id: 'gemini-plus-1m',
        name: 'Google Gemini AI Plus — Mensual',
        duration: '1 Mes',
        priceCOP: 19900,
        originalPriceCOP: 19900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 35,
        licenseType: 'Gemini AI Plus Oficial'
      },
      {
        id: 'gemini-pro-1m',
        name: 'Google Gemini AI Pro — Mensual',
        duration: '1 Mes',
        priceCOP: 79000,
        originalPriceCOP: 79000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Gemini 1.5 Pro (1M contexto)'
      },
      {
        id: 'gemini-ultra-1m',
        name: 'Google Gemini AI Ultra — Mensual, plan inicial',
        duration: '1 Mes',
        priceCOP: 449000,
        originalPriceCOP: 449000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 10,
        licenseType: 'Gemini AI Ultra Empresarial'
      }
    ],
    region: 'Colombia',
    compatibility: 'Web, Android, iOS',
    deliveryMethod: 'Activación oficial entregada por Chat StreamBox al confirmar pago',
    terms: 'Activación vinculada a tu cuenta Google.',
    status: 'ACTIVE',
    tags: ['Google', 'Gemini', 'Multimodal', 'IA']
  },

  // ==========================================
  // D. DISEÑO Y CREATIVIDAD
  // ==========================================

  // 18. Canva Pro
  {
    id: 'prod-canva-pro',
    name: 'Canva Pro Diseñador Gráfico',
    slug: 'canva-pro',
    brand: 'Canva',
    category: 'cat-design',
    subcategory: 'Diseño gráfico',
    description: 'Acceso ilimitado a más de 100 millones de plantillas de alta gama, removedor de fondos con 1 clic, kit de marcas, fotos de stock y redimensionamiento mágico.',
    shortDescription: 'Plantillas premium, fotos de archivo y quitafondos mágico.',
    logoColor: '#00C4CC',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.canva.com&size=128',
    brandAccent: '#00C4CC',
    visualStatus: 'VERIFIED',
    productType: 'DESIGN',
    modalities: [
      {
        id: 'cnv-12m',
        name: 'Activación a tu Propio Correo — 1 Año Completo',
        duration: '12 Meses',
        priceCOP: 35000,
        originalPriceCOP: 50000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        usersAllowed: '1 Usuario a correo personal',
        licenseType: 'Activación Team Oficial',
        activationConditions: 'Se activa en tu cuenta actual de Canva. No pierdes diseños.',
        warrantyInfo: 'Garantía total de 12 meses.'
      },
      {
        id: 'cnv-1m',
        name: 'Activación Mensual a tu Correo',
        duration: '1 Mes',
        priceCOP: 15000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Activación Mensual'
      }
    ],
    region: 'Global',
    compatibility: 'Web, iPad, Tablets, Android, iOS, Windows, Mac',
    deliveryMethod: 'Invitación a equipo premium enviada por Chat StreamBox',
    terms: 'Conservas todos tus proyectos propios intactos.',
    status: 'ACTIVE',
    tags: ['Diseño', 'Plantillas', '1 Año', 'Top Ventas'],
    isFeatured: true,
    isPopular: true
  },

  // 19. Adobe Creative Cloud & Apps
  {
    id: 'prod-adobe-cc',
    name: 'Adobe Creative Cloud (Photoshop, Premiere, All Apps)',
    slug: 'adobe-creative-cloud',
    brand: 'Adobe',
    category: 'cat-design',
    subcategory: 'Recursos premium',
    description: 'Suite completa de creatividad profesional con acceso a Photoshop, Illustrator, Premiere Pro, After Effects, InDesign y almacenamiento oficial en la nube.',
    shortDescription: 'La suite estándar de la industria creativa mundial.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.adobe.com&size=128',
    brandAccent: '#FF0000',
    visualStatus: 'VERIFIED',
    productType: 'DESIGN',
    modalities: [
      {
        id: 'adobe-cc-std',
        name: 'Standard mensual (Creative Cloud)',
        duration: '1 Mes',
        priceCOP: 130900,
        originalPriceCOP: 130900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Todas las Apps Standard'
      },
      {
        id: 'adobe-cc-pro',
        name: 'Pro mensual (Creative Cloud Pro)',
        duration: '1 Mes',
        priceCOP: 166600,
        originalPriceCOP: 166600,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Todas las Apps Pro + Adobe Stock'
      },
      {
        id: 'adobe-ps-1m',
        name: 'Adobe Photoshop — Mensual',
        duration: '1 Mes',
        priceCOP: 45030,
        originalPriceCOP: 45030,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Licencia Individual Photoshop'
      },
      {
        id: 'adobe-pr-1m',
        name: 'Adobe Premiere — Mensual',
        duration: '1 Mes',
        priceCOP: 45030,
        originalPriceCOP: 45030,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Licencia Individual Premiere Pro'
      }
    ],
    region: 'Colombia y Global',
    compatibility: 'Windows, Mac, iPad',
    deliveryMethod: 'Activación oficial a correo entregada por Chat StreamBox',
    terms: 'Licencia oficial autorizada. Garantía StreamBox.',
    status: 'ACTIVE',
    tags: ['Adobe', 'Photoshop', 'Premiere', 'Creative Cloud', 'Diseño']
  },

  // ==========================================
  // E. PRODUCTIVIDAD Y OFIMÁTICA
  // ==========================================

  // 20. Microsoft 365 + 1TB OneDrive
  {
    id: 'prod-microsoft-365',
    name: 'Microsoft 365 Personal + 1TB OneDrive',
    slug: 'microsoft-365',
    brand: 'Microsoft',
    category: 'cat-productivity',
    subcategory: 'Suites ofimáticas',
    description: 'Instala Word, Excel, PowerPoint y Outlook en hasta 5 dispositivos simultáneos y obtén 1.000 GB (1TB) de almacenamiento en la nube de OneDrive con copia de seguridad.',
    shortDescription: 'Word, Excel, PowerPoint y 1.000 GB en la nube.',
    logoColor: '#D83B01',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.microsoft.com&size=128',
    brandAccent: '#D83B01',
    visualStatus: 'VERIFIED',
    productType: 'PRODUCTIVITY',
    modalities: [
      {
        id: 'ms-12m',
        name: 'Licencia Anual — 1TB OneDrive + Office Completo',
        duration: '12 Meses',
        priceCOP: 65000,
        originalPriceCOP: 85000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 22,
        usersAllowed: 'Hasta 5 Dispositivos (1 Usuario)',
        licenseType: 'Licencia 365 Oficial',
        activationConditions: 'Activación en correo asignado o personal.',
        warrantyInfo: 'Garantía durante los 365 días.'
      }
    ],
    region: 'Global',
    compatibility: 'Windows, Mac, Android, iOS',
    deliveryMethod: 'Credenciales o activación segura por Chat StreamBox',
    terms: 'Actualizaciones oficiales continuas de Microsoft.',
    status: 'ACTIVE',
    tags: ['Office', 'Excel', '1TB Nube', '12 Meses'],
    isFeatured: true
  },

  // 21. Notion Espacio de Trabajo
  {
    id: 'prod-notion',
    name: 'Notion Espacio de Trabajo & IA',
    slug: 'notion-plus',
    brand: 'Notion',
    category: 'cat-productivity',
    subcategory: 'Gestión de proyectos',
    description: 'Base de conocimiento unificada, wikis, bases de datos conectadas y gestión ágil de proyectos para creadores y empresas.',
    shortDescription: 'El cerebro digital para tus notas, proyectos y bases de datos.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.notion.so&size=128',
    brandAccent: '#37352F',
    visualStatus: 'VERIFIED',
    productType: 'PRODUCTIVITY',
    modalities: [
      {
        id: 'notion-plus-1m',
        name: 'Notion Plus — Mensual por miembro',
        duration: '1 Mes',
        priceCOP: 32100,
        originalPriceCOP: 32100,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 35,
        licenseType: 'Plan Plus por Miembro'
      },
      {
        id: 'notion-biz-1m',
        name: 'Notion Business — Mensual por miembro',
        duration: '1 Mes',
        priceCOP: 64200,
        originalPriceCOP: 64200,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Plan Business por Miembro'
      }
    ],
    region: 'Global',
    compatibility: 'Web, Mac, Windows, iOS, Android',
    deliveryMethod: 'Activación oficial entregada por Chat StreamBox al confirmar pago',
    terms: 'Válido para cuentas nuevas o existentes de Notion.',
    status: 'ACTIVE',
    tags: ['Notion', 'Productividad', 'Wikis', 'Proyectos']
  },

  // ==========================================
  // F. ALMACENAMIENTO EN LA NUBE
  // ==========================================

  // 22. Google One Almacenamiento Nube
  {
    id: 'prod-google-one',
    name: 'Google One Almacenamiento Nube',
    slug: 'google-one',
    brand: 'Google One',
    category: 'cat-cloud',
    subcategory: 'Almacenamiento personal',
    description: 'Espacio ampliado para Google Drive, Gmail y Google Fotos en calidad original con copia de seguridad para celulares y funciones avanzadas.',
    shortDescription: 'Espacio para fotos, archivos y correos en tu cuenta Google.',
    logoColor: '#4285F4',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.google.com&size=128',
    brandAccent: '#4285F4',
    visualStatus: 'VERIFIED',
    productType: 'CLOUD',
    modalities: [
      {
        id: 'gone-basic-100gb',
        name: 'Google One Basic — 100 GB mensual',
        duration: '1 Mes',
        priceCOP: 6400,
        originalPriceCOP: 6400,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Plan Básico 100 GB'
      },
      {
        id: 'gone-aiplus-400gb',
        name: 'Google One AI Plus — 400 GB mensual',
        duration: '1 Mes',
        priceCOP: 19900,
        originalPriceCOP: 19900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 40,
        licenseType: 'Plan AI Plus 400 GB'
      },
      {
        id: 'gone-aipro-5tb',
        name: 'Google One AI Pro — 5 TB mensual',
        duration: '1 Mes',
        priceCOP: 79000,
        originalPriceCOP: 79000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Plan AI Pro 5 TB + Gemini Advanced'
      }
    ],
    region: 'Colombia',
    compatibility: 'Android, iOS, Windows, Mac, Web',
    deliveryMethod: 'Activación oficial directa a tu cuenta Google',
    terms: 'Conserva tu misma cuenta Gmail personal.',
    status: 'ACTIVE',
    tags: ['Google One', 'Fotos', 'Drive', 'Almacenamiento']
  },

  // ==========================================
  // G. VPN Y PRIVACIDAD
  // ==========================================

  // 23. NordVPN
  {
    id: 'prod-nordvpn',
    name: 'NordVPN Protección y Privacidad',
    slug: 'nordvpn-ultrasecure',
    brand: 'NordVPN',
    category: 'cat-vpn',
    subcategory: 'VPN',
    description: 'Velocidad de conexión ultrarrápida, más de 6.000 servidores en 110 países, protección contra malware Threat Protection y cifrado militar de datos.',
    shortDescription: 'Navegación anónima, protección en WiFi público y streaming global.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fnordvpn.com&size=128',
    brandAccent: '#4687FF',
    visualStatus: 'VERIFIED',
    productType: 'VPN',
    modalities: [
      {
        id: 'nord-12m',
        name: 'Cuenta Privada — 1 Año Completo',
        duration: '12 Meses',
        priceCOP: 75000,
        originalPriceCOP: 110000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 14,
        licenseType: 'Licencia Anual'
      },
      {
        id: 'nord-1m',
        name: 'Acceso Mensual',
        duration: '1 Mes',
        priceCOP: 18000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Licencia Mensual'
      }
    ],
    region: 'Global',
    compatibility: 'Windows, Mac, Linux, Android, iOS, Routers',
    deliveryMethod: 'Credenciales entregadas por Chat StreamBox',
    terms: 'Garantía ininterrumpida de conexión.',
    status: 'ACTIVE',
    tags: ['VPN', 'Seguridad', 'IP', 'Streaming']
  },

  // 24. Proton VPN Plus
  {
    id: 'prod-proton-vpn-plus',
    name: 'Proton VPN Plus',
    slug: 'proton-vpn-plus',
    brand: 'Proton VPN',
    category: 'cat-vpn',
    subcategory: 'VPN',
    description: 'Cifrado de grado militar suizo, arquitectura Secure Core contra vigilancia, más de 6.500 servidores de alta velocidad a 10 Gbps en más de 110 países, bloqueador de anuncios NetShield y política estricta de cero registros auditada.',
    shortDescription: 'Privacidad y seguridad suiza de alta velocidad para hasta 10 dispositivos.',
    logoColor: '#6D4AFF',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fprotonvpn.com&size=128',
    brandAccent: '#6D4AFF',
    visualStatus: 'VERIFIED',
    productType: 'VPN',
    modalities: [
      {
        id: 'proton-24m',
        name: 'Oferta de 24 meses',
        duration: '24 Meses',
        priceCOP: 268600,
        originalPriceCOP: 268600,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Licencia 2 Años Plus',
        usersAllowed: 'Hasta 10 dispositivos simultáneos',
        warrantyInfo: 'Garantía oficial completa durante los 24 meses.'
      }
    ],
    region: 'Global',
    compatibility: 'Windows, macOS, Linux, Android, iOS, Android TV, Routers',
    deliveryMethod: 'Credenciales oficiales entregadas por Chat StreamBox al confirmar pago',
    terms: 'Garantía oficial ininterrumpida de conexión privada.',
    status: 'ACTIVE',
    tags: ['VPN', 'Proton', 'Privacidad Suiza', 'Seguridad']
  },

  // 24b. Surfshark VPN
  {
    id: 'prod-surfshark',
    name: 'Surfshark VPN Ilimitado',
    slug: 'surfshark-vpn',
    brand: 'Surfshark',
    category: 'cat-vpn',
    subcategory: 'VPN',
    description: 'Dispositivos ilimitados simultáneos con una sola suscripción, bloqueador de anuncios CleanWeb y navegación privada.',
    shortDescription: 'Conexiones ilimitadas y bloqueo de rastreadores.',
    logoColor: '#1FA299',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fsurfshark.com&size=128',
    brandAccent: '#1FA299',
    visualStatus: 'PENDING',
    productType: 'VPN',
    modalities: [
      {
        id: 'surf-pending',
        name: 'Suscripción Surfshark',
        duration: '1 Mes',
        priceCOP: null,
        priceStatus: 'PRICE_PENDING',
        available: false
      }
    ],
    region: 'Global',
    compatibility: 'Todos los dispositivos',
    deliveryMethod: 'Chat StreamBox una vez verificado',
    terms: 'Pendiente de verificación.',
    status: 'PRICE_PENDING',
    tags: ['VPN', 'Dispositivos Ilimitados', 'Verificación Pendiente']
  },

  // ==========================================
  // H. VIDEOJUEGOS Y GAMING
  // ==========================================

  // 25. Xbox Game Pass Ultimate
  {
    id: 'prod-xbox-game-pass',
    name: 'Xbox Game Pass Ultimate',
    slug: 'xbox-game-pass-ultimate',
    brand: 'Xbox',
    category: 'cat-gaming',
    subcategory: 'Suscripciones consolas',
    description: 'Más de 400 títulos para Xbox Series X|S, One y PC, multijugador online, catálogo EA Play y juego en la nube Cloud Gaming en tu celular sin consola.',
    shortDescription: 'Cientos de juegos, multijugador online, EA Play y Cloud Gaming.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.xbox.com&size=128',
    brandAccent: '#107C10',
    visualStatus: 'VERIFIED',
    productType: 'GAMING',
    modalities: [
      {
        id: 'xbx-1m',
        name: 'Código Canjeable Oficial — 1 Mes',
        duration: '1 Mes',
        priceCOP: 42000,
        originalPriceCOP: 52000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 18,
        licenseType: 'Código Canjeable Oficial',
        activationConditions: 'Canjeable directamente en microsoft.com/redeem.'
      },
      {
        id: 'xbx-3m',
        name: 'Código Canjeable — 3 Meses',
        duration: '3 Meses',
        priceCOP: 115000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 10,
        licenseType: 'Código Canjeable Oficial'
      }
    ],
    region: 'Colombia y Global',
    compatibility: 'Xbox Series X|S, Xbox One, PC Windows, Smart TV, Celulares',
    deliveryMethod: 'Código digital oficial enviado por Chat StreamBox',
    terms: 'Código directo para canjear en tu propia cuenta.',
    status: 'ACTIVE',
    tags: ['Xbox', 'Cloud Gaming', 'PC', 'EA Play'],
    isPopular: true
  },

  // 26. PlayStation Plus (Essential, Extra, Deluxe)
  {
    id: 'prod-playstation-plus',
    name: 'PlayStation Plus (Essential / Extra / Deluxe)',
    slug: 'playstation-plus',
    brand: 'PlayStation',
    category: 'cat-gaming',
    subcategory: 'Suscripciones consolas',
    description: 'Multijugador online en PlayStation Network para PS5 y PS4, juegos mensuales descargables sin costo adicional, descuentos exclusivos en PlayStation Store, catálogo de hasta 400 títulos en Extra y catálogo de clásicos PS1/PS2/PSP con pruebas de juegos en Deluxe.',
    shortDescription: 'Multijugador online, juegos mensuales y catálogo de juegos para consolas PS4 y PS5.',
    logoColor: '#003791',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.playstation.com&size=128',
    brandAccent: '#003791',
    visualStatus: 'VERIFIED',
    productType: 'GAMING',
    modalities: [
      {
        id: 'ps-essential-1m',
        name: 'PlayStation Plus Essential — 1 mes',
        duration: '1 Mes',
        priceCOP: 33472,
        originalPriceCOP: 33472,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Membresía Essential',
        quality: 'Juegos mensuales, multijugador online, guardado en la nube'
      },
      {
        id: 'ps-essential-3m',
        name: 'PlayStation Plus Essential — 3 meses',
        duration: '3 Meses',
        priceCOP: 85600,
        originalPriceCOP: 85600,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Membresía Essential',
        quality: 'Juegos mensuales, multijugador online, guardado en la nube'
      },
      {
        id: 'ps-essential-12m',
        name: 'PlayStation Plus Essential — 12 meses',
        duration: '12 Meses',
        priceCOP: 247708,
        originalPriceCOP: 247708,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Membresía Essential',
        quality: 'Juegos mensuales, multijugador online, guardado en la nube'
      },
      {
        id: 'ps-extra-1m',
        name: 'PlayStation Plus Extra — 1 mes',
        duration: '1 Mes',
        priceCOP: 50230,
        originalPriceCOP: 50230,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Membresía Extra',
        quality: 'Todo Essential + Catálogo de cientos de juegos descargables PS4 y PS5'
      },
      {
        id: 'ps-extra-3m',
        name: 'PlayStation Plus Extra — 3 meses',
        duration: '3 Meses',
        priceCOP: 141375,
        originalPriceCOP: 141375,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Membresía Extra',
        quality: 'Todo Essential + Catálogo de cientos de juegos descargables PS4 y PS5'
      },
      {
        id: 'ps-extra-12m',
        name: 'PlayStation Plus Extra — 12 meses',
        duration: '12 Meses',
        priceCOP: 401871,
        originalPriceCOP: 401871,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 15,
        licenseType: 'Membresía Extra',
        quality: 'Todo Essential + Catálogo de cientos de juegos descargables PS4 y PS5'
      },
      {
        id: 'ps-deluxe-1m',
        name: 'PlayStation Plus Deluxe — 1 mes',
        duration: '1 Mes',
        priceCOP: 59530,
        originalPriceCOP: 59530,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Membresía Deluxe',
        quality: 'Todo Extra + Catálogo de clásicos PS1/PS2/PSP y pruebas de juegos exclusivos'
      },
      {
        id: 'ps-deluxe-3m',
        name: 'PlayStation Plus Deluxe — 3 meses',
        duration: '3 Meses',
        priceCOP: 163755,
        originalPriceCOP: 163755,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Membresía Deluxe',
        quality: 'Todo Extra + Catálogo de clásicos PS1/PS2/PSP y pruebas de juegos exclusivos'
      },
      {
        id: 'ps-deluxe-12m',
        name: 'PlayStation Plus Deluxe — 12 meses',
        duration: '12 Meses',
        priceCOP: 465339,
        originalPriceCOP: 465339,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 15,
        licenseType: 'Membresía Deluxe',
        quality: 'Todo Extra + Catálogo de clásicos PS1/PS2/PSP y pruebas de juegos exclusivos'
      }
    ],
    region: 'Colombia',
    compatibility: 'PlayStation 5, PlayStation 4',
    deliveryMethod: 'Código digital o activación oficial entregada por Chat StreamBox',
    terms: 'Garantía 100% activa durante la vigencia contratada.',
    status: 'ACTIVE',
    tags: ['PlayStation', 'PS Plus', 'Essential', 'Extra', 'Deluxe', 'Gaming']
  },

  // ==========================================
  // I. REDES SOCIALES Y HERRAMIENTAS CREADORES
  // ==========================================

  // 27. Herramientas Creadores
  {
    id: 'prod-social-tools',
    name: 'Suite de Herramientas para Creadores de Contenido',
    slug: 'herramientas-creadores',
    brand: 'YouTube Creators',
    category: 'cat-social',
    subcategory: 'Herramientas de creadores',
    description: 'Herramientas legítimas de programación de publicaciones, analítica de retención, diseño de miniaturas y optimización de metadatos.',
    shortDescription: 'Herramientas profesionales de análisis y programación de contenido.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.youtube.com&size=128',
    brandAccent: '#EC4899',
    visualStatus: 'PENDING',
    productType: 'SOCIAL',
    modalities: [
      {
        id: 'social-pending',
        name: 'Suscripción Creador Pro',
        duration: '1 Mes',
        priceCOP: null,
        priceStatus: 'PRICE_PENDING',
        available: false,
        activationConditions: 'Solo herramientas de software legítimas. No comercializamos seguidores falsos.'
      }
    ],
    region: 'Global',
    compatibility: 'Web, Móviles',
    deliveryMethod: 'Chat StreamBox tras verificación',
    terms: 'Cumplimiento estricto con las políticas de las plataformas.',
    status: 'PRICE_PENDING',
    tags: ['Creadores', 'Analítica', 'Verificación Pendiente']
  },

  // ==========================================
  // J. EDICIÓN DE VIDEO Y CONTENIDO
  // ==========================================

  // 28. CapCut Pro
  {
    id: 'prod-capcut-pro',
    name: 'CapCut Pro Editor de Video & Reels',
    slug: 'capcut-pro',
    brand: 'CapCut',
    category: 'cat-video',
    subcategory: 'Edición de video',
    description: 'Subtítulos automáticos de alta fidelidad, eliminación de fondos en video, efectos VIP exclusivos, reducción de ruido y exportación en 4K 60FPS.',
    shortDescription: 'Subtítulos automáticos, efectos VIP y exportación 4K.',
    logoColor: '#1E293B',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.capcut.com&size=128',
    brandAccent: '#06B6D4',
    visualStatus: 'VERIFIED',
    productType: 'DESIGN',
    modalities: [
      {
        id: 'cpc-1m',
        name: 'Licencia Personal — 1 Mes',
        duration: '1 Mes',
        priceCOP: 22000,
        originalPriceCOP: 28000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Licencia Pro Personal'
      },
      {
        id: 'cpc-12m',
        name: 'Licencia Anual — 12 Meses',
        duration: '12 Meses',
        priceCOP: 89000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 10,
        licenseType: 'Licencia Pro Anual'
      }
    ],
    region: 'Global',
    compatibility: 'PC (Windows/Mac), Móviles Android e iOS',
    deliveryMethod: 'Credenciales oficiales entregadas por Chat StreamBox',
    terms: 'Garantía durante todo el ciclo contratado.',
    status: 'ACTIVE',
    tags: ['Video', 'TikTok', 'Reels', '4K'],
    isPopular: true
  },

  // 29. DaVinci Resolve Studio
  {
    id: 'prod-davinci',
    name: 'DaVinci Resolve Studio & Free',
    slug: 'davinci-resolve-studio',
    brand: 'Blackmagic Design',
    category: 'cat-video',
    subcategory: 'Edición de video',
    description: 'Corrección de color profesional de Hollywood, efectos visuales Fusion, postproducción de audio Fairlight y procesamiento acelerado por GPU múltiple.',
    shortDescription: 'Edición de video y etalonaje de color cinematográfico.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.blackmagicdesign.com&size=128',
    brandAccent: '#0E1E38',
    visualStatus: 'VERIFIED',
    productType: 'DESIGN',
    modalities: [
      {
        id: 'davinci-free',
        name: 'Versión gratuita',
        duration: 'Permanente',
        priceCOP: 0,
        originalPriceCOP: 0,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 999,
        licenseType: 'Descarga Oficial Libre Blackmagic'
      },
      {
        id: 'davinci-studio-key',
        name: 'DaVinci Resolve Studio — Licencia de pago único',
        duration: 'Vitalicia',
        priceCOP: 1050000,
        originalPriceCOP: 1050000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 10,
        licenseType: 'Clave de Activación Oficial Vitalicia'
      }
    ],
    region: 'Global',
    compatibility: 'Windows, Mac, Linux',
    deliveryMethod: 'Clave de activación oficial entregada por Chat StreamBox',
    terms: 'Licencia original perpetua sin suscripciones recurrentes.',
    status: 'ACTIVE',
    tags: ['Cine', 'Color', 'Video', 'Fairlight']
  },

  // ==========================================
  // K. EDUCACIÓN Y APRENDIZAJE
  // ==========================================

  // 30. Duolingo Super
  {
    id: 'prod-duolingo',
    name: 'Duolingo Super Idiomas',
    slug: 'duolingo-super',
    brand: 'Duolingo',
    category: 'cat-education',
    subcategory: 'Idiomas',
    description: 'Vidas ilimitadas, lecciones sin interrupciones ni anuncios, pruebas de nivel personalizadas y práctica focalizada de errores en todos los idiomas.',
    shortDescription: 'Aprende idiomas con vidas ilimitadas y sin interrupciones.',
    logoColor: '#58CC02',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.duolingo.com&size=128',
    brandAccent: '#58CC02',
    visualStatus: 'VERIFIED',
    productType: 'EDUCATION',
    modalities: [
      {
        id: 'duo-super-1m',
        name: 'Duolingo Super — 1 mes',
        duration: '1 Mes',
        priceCOP: 34900,
        originalPriceCOP: 34900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 35,
        licenseType: 'Suscripción Super Individual'
      },
      {
        id: 'duo-super-12m',
        name: 'Duolingo Super — 12 meses',
        duration: '12 Meses',
        priceCOP: 229900,
        originalPriceCOP: 229900,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Plan Anual Super Individual'
      }
    ],
    region: 'Global',
    compatibility: 'iOS, Android, Web',
    deliveryMethod: 'Activación oficial entregada por Chat StreamBox al confirmar pago',
    terms: 'Activación en tu cuenta personal de Duolingo.',
    status: 'ACTIVE',
    tags: ['Idiomas', 'Inglés', 'Duolingo', 'Educación']
  },

  // ==========================================
  // L. SEGURIDAD DIGITAL
  // ==========================================

  // 31. Bitdefender Seguridad Digital
  {
    id: 'prod-bitdefender',
    name: 'Bitdefender Seguridad Digital (Total Security & Antivirus Plus)',
    slug: 'bitdefender-total-security',
    brand: 'Bitdefender',
    category: 'cat-security',
    subcategory: 'Antivirus',
    description: 'Protección multicapa contra ransomware, cortafuegos de privacidad, optimización de velocidad y escudo para banca en línea.',
    shortDescription: 'Protección integral contra malware y ciberamenazas.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.bitdefender.com&size=128',
    brandAccent: '#ED1C24',
    visualStatus: 'VERIFIED',
    productType: 'SECURITY',
    modalities: [
      {
        id: 'bitd-total-5dev-1y',
        name: 'Total Security — 5 dispositivos, 1 año',
        duration: '12 Meses',
        priceCOP: 164500,
        originalPriceCOP: 164500,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Total Security 5 Dispositivos',
        usersAllowed: '5 Dispositivos (PC, Mac, Android, iOS)'
      },
      {
        id: 'bitd-total-5dev-2y',
        name: 'Total Security — 5 dispositivos, 2 años',
        duration: '24 Meses',
        priceCOP: 217485,
        originalPriceCOP: 217485,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Total Security 5 Dispositivos (2 Años)',
        usersAllowed: '5 Dispositivos'
      },
      {
        id: 'bitd-family-25dev-1y',
        name: 'Total Security Family — 25 dispositivos, 1 año',
        duration: '12 Meses',
        priceCOP: 197386,
        originalPriceCOP: 197386,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Family Pack 25 Dispositivos',
        usersAllowed: 'Hasta 25 Dispositivos'
      },
      {
        id: 'bitd-antivirus-plus-1y',
        name: 'Antivirus Plus — 1 año',
        duration: '12 Meses',
        priceCOP: 64457,
        originalPriceCOP: 64457,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 35,
        licenseType: 'Antivirus Plus 1 Año'
      }
    ],
    region: 'Global',
    compatibility: 'Windows, Mac, Android, iOS',
    deliveryMethod: 'Clave de licencia oficial entregada por Chat StreamBox',
    terms: 'Canjeable en Bitdefender Central con soporte oficial.',
    status: 'ACTIVE',
    tags: ['Antivirus', 'Seguridad', 'Bitdefender', 'Privacidad']
  },

  // ==========================================
  // M. DESARROLLO DE SOFTWARE
  // ==========================================

  // 32. GitHub Copilot, JetBrains & Cursor (Pending)
  {
    id: 'prod-cursor',
    name: 'Cursor AI Code Editor',
    slug: 'cursor-ai-editor',
    brand: 'Cursor',
    category: 'cat-dev',
    subcategory: 'Asistentes de código',
    description: 'Editor de código impulsado por IA basado en VS Code con indexación local profunda del repositorio, autocompletado predictivo y chat de refactorización.',
    shortDescription: 'El editor de programación asistido por IA más veloz.',
    logoColor: '#000000',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.cursor.com&size=128',
    brandAccent: '#6366F1',
    visualStatus: 'PENDING',
    productType: 'DEV',
    modalities: [
      {
        id: 'cursor-pending',
        name: 'Suscripción Cursor Pro',
        duration: '1 Mes',
        priceCOP: null,
        priceStatus: 'PRICE_PENDING',
        available: false
      }
    ],
    region: 'Global',
    compatibility: 'Mac, Windows, Linux',
    deliveryMethod: 'Chat StreamBox tras verificación',
    terms: 'Pendiente de verificación.',
    status: 'PRICE_PENDING',
    tags: ['Programación', 'IA', 'Verificación Pendiente']
  },

  // ==========================================
  // N. SERVICIOS EMPRESARIALES
  // ==========================================

  // 33. Google Workspace Empresa & Productividad
  {
    id: 'prod-workspace-business',
    name: 'Google Workspace Empresa (Gmail con Dominio Propio)',
    slug: 'google-workspace-empresa',
    brand: 'Google Workspace',
    category: 'cat-business',
    subcategory: 'Correo con dominio propio',
    description: 'Correo profesional con dominio corporativo propio (@tuempresa.com), Google Meet con grabación, Drive corporativo con almacenamiento en la nube y controles avanzados de seguridad.',
    shortDescription: 'Correo corporativo profesional y suite de colaboración Google.',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.google.com&size=128',
    brandAccent: '#4285F4',
    visualStatus: 'VERIFIED',
    productType: 'BUSINESS',
    modalities: [
      {
        id: 'gw-starter-anual',
        name: 'Business Starter — Anual, por usuario/mes',
        duration: '1 Mes (Contrato Anual)',
        priceCOP: 22464,
        originalPriceCOP: 22464,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Business Starter (30 GB)',
        usersAllowed: '1 Usuario / Licencia'
      },
      {
        id: 'gw-std-anual',
        name: 'Business Standard — Anual, por usuario/mes',
        duration: '1 Mes (Contrato Anual)',
        priceCOP: 44927,
        originalPriceCOP: 44927,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Business Standard (2 TB)',
        usersAllowed: '1 Usuario / Licencia'
      },
      {
        id: 'gw-plus-anual',
        name: 'Business Plus — Anual, por usuario/mes',
        duration: '1 Mes (Contrato Anual)',
        priceCOP: 70600,
        originalPriceCOP: 70600,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Business Plus (5 TB)',
        usersAllowed: '1 Usuario / Licencia'
      },
      {
        id: 'gw-starter-flex',
        name: 'Workspace Starter — Facturación flexible, por usuario/mes',
        duration: '1 Mes Flexible',
        priceCOP: 26956,
        originalPriceCOP: 26956,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Starter Flexible',
        usersAllowed: '1 Usuario / Licencia'
      },
      {
        id: 'gw-std-flex',
        name: 'Workspace Standard — Facturación flexible, por usuario/mes',
        duration: '1 Mes Flexible',
        priceCOP: 53913,
        originalPriceCOP: 53913,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Standard Flexible',
        usersAllowed: '1 Usuario / Licencia'
      },
      {
        id: 'gw-plus-flex',
        name: 'Workspace Plus — Facturación flexible, por usuario/mes',
        duration: '1 Mes Flexible',
        priceCOP: 84721,
        originalPriceCOP: 84721,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Plus Flexible',
        usersAllowed: '1 Usuario / Licencia'
      }
    ],
    region: 'Colombia',
    compatibility: 'Web, Android, iOS, Outlook',
    deliveryMethod: 'Activación oficial en consola Google Cloud / Workspace',
    terms: 'Facturación oficial empresarial de Google Workspace.',
    status: 'ACTIVE',
    tags: ['Empresa', 'Gmail', 'Workspace', 'Dominio', 'Drive']
  },

  // ==========================================
  // O. TELEVISIÓN Y CONTENIDO AUTORIZADO
  // ==========================================

  // 34. Contenido Digital Autorizado
  {
    id: 'prod-tv-digital',
    name: 'Contenido Digital Autorizado',
    slug: 'contenido-digital-autorizado',
    brand: 'StreamBox Media',
    category: 'cat-tv',
    subcategory: 'Contenido digital',
    description: 'Tarjeta de regalo o créditos digitales autorizados para plataformas oficiales de streaming y entretenimiento según denominación seleccionada.',
    shortDescription: 'Tarjeta de regalo o saldo prepago para contenido digital bajo demanda.',
    logoColor: '#6366F1',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fstreambox.tv&size=128',
    brandAccent: '#6366F1',
    visualStatus: 'VERIFIED',
    productType: 'TV',
    modalities: [
      {
        id: 'cda-credito-20k',
        name: 'Tarjeta regalo o crédito — Denominación $20.000 COP',
        duration: 'Permanente',
        priceCOP: 20000,
        originalPriceCOP: 20000,
        officialReferencePriceCOP: 20000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Crédito digital canjeable'
      },
      {
        id: 'cda-credito-50k',
        name: 'Tarjeta regalo o crédito — Denominación $50.000 COP',
        duration: 'Permanente',
        priceCOP: 50000,
        originalPriceCOP: 50000,
        officialReferencePriceCOP: 50000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 50,
        licenseType: 'Crédito digital canjeable'
      },
      {
        id: 'cda-credito-100k',
        name: 'Tarjeta regalo o crédito — Denominación $100.000 COP',
        duration: 'Permanente',
        priceCOP: 100000,
        originalPriceCOP: 100000,
        officialReferencePriceCOP: 100000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Crédito digital canjeable'
      }
    ],
    region: 'Colombia',
    compatibility: 'Smart TV, TV Box, Móviles, Web',
    deliveryMethod: 'Código de saldo digital oficial entregado por Chat StreamBox',
    terms: 'Solo distribución formal autorizada. Canjeable según denominación.',
    status: 'ACTIVE',
    tags: ['Crédito Digital', 'Tarjeta Regalo', 'Contenido Autorizado']
  },

  // ==========================================
  // P. TARJETAS REGALO Y CRÉDITOS DIGITALES
  // ==========================================

  // 35. Steam Wallet Colombia
  {
    id: 'prod-steam-giftcard',
    name: 'Tarjeta de Regalo Steam Wallet Colombia',
    slug: 'tarjeta-steam-wallet',
    brand: 'Steam',
    category: 'cat-giftcards',
    subcategory: 'Steam Wallet',
    description: 'Código digital oficial canjeable para cargar saldo en tu billetera de Steam Colombia y adquirir miles de juegos, DLCs y artículos comunitarios.',
    shortDescription: 'Saldo oficial para comprar videojuegos en Steam.',
    
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fstore.steampowered.com&size=128',
    brandAccent: '#171A21',
    visualStatus: 'VERIFIED',
    productType: 'GAMING',
    modalities: [
      {
        id: 'stm-20k',
        name: 'Saldo Steam $20.000 COP',
        duration: 'Código Digital Permanente',
        priceCOP: 22000,
        officialReferencePriceCOP: 20000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 30,
        licenseType: 'Código Canjeable'
      },
      {
        id: 'stm-50k',
        name: 'Saldo Steam $50.000 COP',
        duration: 'Código Digital Permanente',
        priceCOP: 54000,
        officialReferencePriceCOP: 50000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 20,
        licenseType: 'Código Canjeable'
      }
    ],
    region: 'Colombia',
    compatibility: 'PC (Steam Client), Web',
    deliveryMethod: 'Código digital oficial enviado por Chat StreamBox',
    terms: 'Canjeable en cuentas con región Colombia.',
    status: 'ACTIVE',
    tags: ['Steam', 'PC Games', 'Saldo']
  },

  // 36. Tarjetas Xbox & PlayStation (Verified Denominations)
  {
    id: 'prod-xbox-giftcard',
    name: 'Tarjeta de Regalo Xbox Saldo Digital',
    slug: 'tarjeta-xbox-saldo',
    brand: 'Xbox',
    category: 'cat-giftcards',
    subcategory: 'Tarjetas Xbox',
    description: 'Saldo directo para comprar juegos, complementos y películas en la Microsoft Store para Xbox Series X|S, Xbox One y PC.',
    shortDescription: 'Código de saldo digital para Xbox y Microsoft Store.',
    logoColor: '#107C10',
    logoUrl: 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https%3A%2F%2Fwww.xbox.com&size=128',
    brandAccent: '#107C10',
    visualStatus: 'VERIFIED',
    productType: 'GAMING',
    modalities: [
      {
        id: 'xbx-card-30k',
        name: 'Tarjeta Xbox $30.000 COP Saldo',
        duration: 'Permanente',
        priceCOP: 33000,
        officialReferencePriceCOP: 30000,
        priceStatus: 'VERIFIED_STREAMBOX',
        available: true,
        stock: 25,
        licenseType: 'Código Digital'
      }
    ],
    region: 'Colombia',
    compatibility: 'Consolas Xbox, PC Windows',
    deliveryMethod: 'Chat StreamBox',
    terms: 'Canjeable en microsoft.com/redeem.',
    status: 'ACTIVE',
    tags: ['Xbox', 'Gift Card']
  }
];

export const INITIAL_SETTINGS: GlobalSettings = {
  nequiNumber: '3045967068',
  daviplataNumber: '3114139187',
  maintenanceMode: false,
  allowPurchases: true,
  allowRegistrations: true,
  supportEmail: 'd.s.gal.mor.9@gmail.com',
  supportPhone: '+57 304 596 7068',
  storeName: 'StreamBox',
  slogan: 'ENTRETENIMIENTO SIN LÍMITES',
  legalBusinessName: 'StreamBox Colombia Digital Services (En Proceso de Registro Mercantil)',
  legalNIT: 'Pendiente de Asignación DIAN',
  legalAddress: 'Calle 93B # 13-45, Chicó Norte',
  legalRepresentative: 'Administración StreamBox Colombia',
  legalCity: 'Bogotá D.C., Colombia',
  legalStatus: 'PENDING_REVIEW',
  termsVersion: 'v2.1-2026-10-CO',
  privacyVersion: 'v2.1-2026-10-CO',
  refundsVersion: 'v2.1-2026-10-CO',
  lastLegalReviewDate: '2026-10-11',
};

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-streambox10',
    code: 'STREAMBOX10',
    type: 'PERCENTAGE',
    value: 10,
    minPurchaseCOP: 10000,
    maxUses: 500,
    usedCount: 38,
    active: true,
    validUntil: '2027-12-31',
    description: '10% de descuento en cualquier producto o suscripción'
  },
  {
    id: 'promo-bienvenido5k',
    code: 'BIENVENIDO5K',
    type: 'FIXED_COP',
    value: 5000,
    minPurchaseCOP: 20000,
    maxUses: 300,
    usedCount: 42,
    active: true,
    validUntil: '2027-12-31',
    description: '$5.000 COP de descuento de bienvenida en compras desde $20.000 COP'
  },
  {
    id: 'promo-supervip',
    code: 'SUPERVIP',
    type: 'PERCENTAGE',
    value: 20,
    minPurchaseCOP: 40000,
    maxUses: 100,
    usedCount: 12,
    active: true,
    validUntil: '2027-12-31',
    description: '20% de descuento VIP para clientes recurrentes'
  },
  {
    id: 'promo-combo',
    code: 'COMBO10',
    type: 'PERCENTAGE',
    value: 10,
    minPurchaseCOP: 35000,
    maxUses: 100,
    usedCount: 15,
    active: true,
    validUntil: '2027-12-31',
    description: '10% de descuento en combos superiores a $35.000 COP'
  }
];

export const INITIAL_GIVEAWAYS: GiveawayCampaign[] = [
  {
    id: 'giveaway-1',
    title: 'Sorteo Oficial StreamBox — 1 Año Netflix o Spotify',
    description: 'Celebramos la comunidad de StreamBox Colombia. Participa por 1 año completo del servicio de streaming que prefieras (Netflix 4K o Spotify Premium).',
    prize: '1 Año Completo de Netflix Premium 4K o Spotify Premium',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    status: 'ACTIVE',
    rules: [
      'Válido para usuarios registrados en la plataforma StreamBox.',
      '1 solo clic por persona / cuenta (1 número o ticket por cuenta).',
      'Modo opcional disponible: permite acumular tickets múltiples si está habilitado por el administrador.',
      'El ganador se anunciará públicamente en el panel y se contactará por el chat interno.',
      'Sorteo auditado con registro criptográfico de selección aleatoria.'
    ],
    entriesCount: 87,
    winnerAnnounced: false,
    allowUnlimitedTickets: false, // Por defecto: 1 solo ticket por cuenta / 1 solo clic
    participants: [
      {
        userId: 'usr-demo-prev-1',
        userEmail: 'mariana.gomez@gmail.com',
        userName: 'Mariana Gómez',
        ticketNumber: 85,
        ticketCode: 'SB-TICKET-0085',
        joinedAt: '2026-10-10T14:20:00Z',
      },
      {
        userId: 'usr-demo-prev-2',
        userEmail: 'andres.felipe@gmail.com',
        userName: 'Andrés Felipe',
        ticketNumber: 86,
        ticketCode: 'SB-TICKET-0086',
        joinedAt: '2026-10-11T09:12:00Z',
      },
      {
        userId: 'usr-demo-prev-3',
        userEmail: 'laura.bogota@gmail.com',
        userName: 'Laura R.',
        ticketNumber: 87,
        ticketCode: 'SB-TICKET-0087',
        joinedAt: '2026-10-11T18:45:00Z',
      },
    ],
  }
];

export const INITIAL_COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: 'comp-google-terms',
    area: 'GOOGLE_POLICIES',
    name: 'Términos de Google AI Studio y Gemini API',
    description: 'Verificación de que no existen elusiones de filtros de seguridad, claves expuestas en frontend ni automatizaciones engañosas.',
    status: 'COMPLIANT',
    officialSource: 'https://ai.google.dev/gemini-api/terms',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Oficial de Cumplimiento Técnico',
    evidence: 'Claves manejadas vía variables de entorno en servidor, cero código de elusión de filtros, sin almacenamiento de contraseñas bancarias.',
    observations: 'Control activo permanente en dev y producción. Sin uso prohibido identificado.',
    nextReviewDate: '2026-11-11'
  },
  {
    id: 'comp-provider-conditions',
    area: 'PROVIDER_CONDITIONS',
    name: 'Condiciones y Licenciamiento de Proveedores Digitales',
    description: 'Verificación de marcas y licencias. No afirmar representación oficial o distribución exclusiva sin contrato demostrable.',
    status: 'COMPLIANT',
    officialSource: 'Términos de servicio de Netflix, Spotify, Microsoft, Adobe, etc.',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Asesoría Comercial y Legal',
    evidence: 'Disclaimers visibles en fichas técnicas de producto y pie de página. Modalidades diferenciadas entre cuentas y perfiles autorizados.',
    observations: 'Revisión periódica de políticas de uso compartido de proveedores.',
    nextReviewDate: '2026-11-15'
  },
  {
    id: 'comp-terms-conditions',
    area: 'TERMS_CONDITIONS',
    name: 'Términos y Condiciones Comerciales (Ley 1480 de 2011)',
    description: 'Página pública /legal/terminos con deber de información previa, precios finales en COP, plazos y vigencia.',
    status: 'COMPLIANT',
    officialSource: 'Ley 1480 de 2011 Art. 50 (Comercio Electrónico)',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Equipo Legal StreamBox',
    evidence: 'Ruta pública disponible. Precios en COP netos sin cargos ocultos. Procedimiento de entrega detallado.',
    observations: 'Muestra estado PENDING_REVIEW hasta inscripción formal de NIT en Cámara de Comercio.',
    nextReviewDate: '2026-12-01'
  },
  {
    id: 'comp-privacy-policy',
    area: 'PRIVACY_POLICY',
    name: 'Aviso de Privacidad y Tratamiento de Datos (Ley 1581 de 2012)',
    description: 'Página pública /legal/privacidad con finalidades legítimas, no transferencia de datos a IA y derechos ARCO.',
    status: 'COMPLIANT',
    officialSource: 'Ley Estatutaria 1581 de 2012 & Decreto 1377 de 2013',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Delegado de Protección de Datos',
    evidence: 'Finalidades explícitas (gestión de pedidos, soporte). Canal directo para solicitudes de actualización o supresión.',
    observations: 'Los comprobantes de pago solo se usan para validar la transacción y no se comparten con terceros.',
    nextReviewDate: '2026-12-15'
  },
  {
    id: 'comp-refunds-retracto',
    area: 'REFUNDS_RETRACTO',
    name: 'Política de Reembolsos y Derecho de Retracto',
    description: 'Procedimiento funcional en /legal/reembolsos y /cuenta/reembolsos con trazabilidad en 8 estados según art. 47 Ley 1480.',
    status: 'COMPLIANT',
    officialSource: 'Ley 1480 de 2011 Art. 47 (Retracto) & Art. 51 (Reversión del pago)',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Atención al Consumidor y Garantías',
    evidence: 'Casos explícitos (doble pago, no entrega, falla técnica). Sin regla de "no devoluciones" genérica e ilícita.',
    observations: 'Trazabilidad de cada solicitud con registro de fecha, motivo, decisión y comprobante de reintegro.',
    nextReviewDate: '2026-11-20'
  },
  {
    id: 'comp-data-1581',
    area: 'DATA_PROTECTION_1581',
    name: 'Consentimiento Libre, Previo e Informado',
    description: 'Casillas de aceptación independientes en checkout y registro. Publicidad no premarcada por defecto.',
    status: 'COMPLIANT',
    officialSource: 'Superintendencia de Industria y Comercio (SIC)',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Oficial de Cumplimiento',
    evidence: 'Checkbox de términos obligatorio y checkbox de publicidad voluntario desmarcado por defecto.',
    observations: 'Cumple el estándar estricto de consentimiento expreso.',
    nextReviewDate: '2026-12-10'
  },
  {
    id: 'comp-payments-fraud',
    area: 'PAYMENTS_FRAUD',
    name: 'Seguridad en Pagos Manuales (Nequi y Daviplata)',
    description: 'Ciclo estricto: PENDIENTE -> PAGO_REPORTADO -> PAGO_CONFIRMADO -> ENTREGADO. Prohibición de entrega sin confirmación.',
    status: 'COMPLIANT',
    officialSource: 'Protocolo de Seguridad Financiera StreamBox',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Coordinador de Pagos y Tesorería',
    evidence: 'Solo rol ADMIN o SUPER_ADMIN puede confirmar pagos. Registro de referencia bancaria y comprobante protegido.',
    observations: 'Se mitiga riesgo de fraude o suplantación de comprobantes.',
    nextReviewDate: '2026-11-05'
  },
  {
    id: 'comp-security-rbac',
    area: 'SECURITY_RBAC',
    name: 'Seguridad Técnica y Control de Acceso (RBAC)',
    description: 'Roles SUPER_ADMIN, ADMIN, SOPORTE, VENTAS y CLIENTE. Los clientes no pueden elevar privilegios ni alterar auditoría.',
    status: 'COMPLIANT',
    officialSource: 'Norma ISO/IEC 27001 & OWASP Top 10',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Líder de Seguridad de la Información',
    evidence: 'Verificación de sesión en cada acción sensible. Registro de auditoría criptográfica interna.',
    observations: 'No se almacena información bancaria sensible (claves, PINes ni tokens de usuario).',
    nextReviewDate: '2026-11-30'
  },
  {
    id: 'comp-catalog-licensing',
    area: 'CATALOG_LICENSING',
    name: 'Control de Catálogo y Transparencia en Precios',
    description: 'Bloqueo estricto de compra en productos con PRICE_PENDING. Identificación de usuarios permitidos y calidad de reproducción.',
    status: 'COMPLIANT',
    officialSource: 'Estatuto del Consumidor Art. 23 (Información Mínima)',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Gerencia de Producto',
    evidence: 'Botón de compra deshabilitado si precio es null o PRICE_PENDING. Fichas técnicas completas con términos de garantía.',
    observations: 'Evita falsas expectativas y cobros erróneos.',
    nextReviewDate: '2026-11-15'
  },
  {
    id: 'comp-advertising',
    area: 'ADVERTISING_PROMOTIONS',
    name: 'Publicidad Veraz y Promociones Legítimas',
    description: 'Prohibición de escasez artificial, temporizadores engañosos y descuentos ficticios sin base histórica.',
    status: 'COMPLIANT',
    officialSource: 'Ley 1480 de 2011 Art. 29 a 33',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Equipo de Marketing Ético',
    evidence: 'Códigos promocionales con fecha de vencimiento real y límite de usos auditables en el sistema.',
    observations: 'Sin dark patterns ni tácticas de presión abusivas.',
    nextReviewDate: '2026-12-05'
  },
  {
    id: 'comp-claims-pqr',
    area: 'CLAIMS_RESOLUTION',
    name: 'Gestión Oportuna de Peticiones, Quejas y Reclamos (PQR)',
    description: 'Canales formales de radicación con acuse de recibo y plazo máximo de respuesta legal (15 días hábiles).',
    status: 'COMPLIANT',
    officialSource: 'Circular Única SIC Título II',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Defensor del Consumidor StreamBox',
    evidence: 'Sistema de tickets y formulario de reclamaciones con identificador único y trazabilidad completa.',
    observations: 'Tiempo promedio de atención en soporte inferior a 24 horas hábiles.',
    nextReviewDate: '2026-11-25'
  },
  {
    id: 'comp-data-retention',
    area: 'DATA_RETENTION',
    name: 'Conservación Justificada y Minimización de Datos',
    description: 'Conservación de registros de transacciones conforme al Código de Comercio y supresión de datos sensibles en chats.',
    status: 'COMPLIANT',
    officialSource: 'Código de Comercio Art. 60 & Ley 1581 Art. 4',
    lastReviewedAt: '2026-10-11',
    reviewer: 'Asesor Jurídico y Contable',
    evidence: 'Registros contables resguardados por 5 años. Opciones de depuración para clientes que soliciten eliminación.',
    observations: 'Cumple el deber legal sin almacenamiento indiscriminado de datos.',
    nextReviewDate: '2026-12-20'
  }
];

export const INITIAL_REFUNDS: RefundRequest[] = [
  {
    id: 'REF-SB-1001',
    orderId: 'ORD-SB-7421',
    userId: 'usr-client-demo',
    userName: 'Carlos Mendoza',
    userEmail: 'carlos.cliente@gmail.com',
    reason: 'DUPLICATE_PAYMENT',
    reasonTitle: 'Pago Duplicado por Transferencia Nequi',
    reasonDescription: 'Por error de conexión en la app bancaria se envió dos veces la transferencia de $13.500 COP para Netflix.',
    incidentDate: '2026-10-08',
    preferredContact: 'WHATSAPP',
    status: 'REFUNDED',
    requestedAmountCOP: 13500,
    refundedAmountCOP: 13500,
    resolutionOffer: 'Reintegro inmediato mediante reversión directa a Nequi origen.',
    adminNotes: 'Verificado doble movimiento en extracto Nequi. Reversión aprobada y ejecutada.',
    createdAt: '2026-10-08T15:20:00Z',
    updatedAt: '2026-10-08T16:45:00Z',
    resolvedAt: '2026-10-08T16:45:00Z',
    reviewedBy: 'd.s.gal.mor.9@gmail.com',
    history: [
      { date: '2026-10-08T15:20:00Z', status: 'SUBMITTED', note: 'Solicitud radicada por el cliente con comprobante Nequi.', actor: 'Carlos Mendoza' },
      { date: '2026-10-08T15:45:00Z', status: 'UNDER_REVIEW', note: 'Verificando con módulo de pagos manuales.', actor: 'Super Admin' },
      { date: '2026-10-08T16:10:00Z', status: 'APPROVED', note: 'Doble abono confirmado. Se programa reintegro bancario.', actor: 'Super Admin' },
      { date: '2026-10-08T16:45:00Z', status: 'REFUNDED', note: 'Transferencia reversada exitosamente a la cuenta Nequi 3157894561.', actor: 'Super Admin' },
    ]
  },
  {
    id: 'REF-SB-1002',
    orderId: 'ORD-SB-8319',
    userId: 'usr-client-demo',
    userName: 'Carlos Mendoza',
    userEmail: 'carlos.cliente@gmail.com',
    reason: 'ACTIVATION_FAILURE',
    reasonTitle: 'Incompatibilidad de Región en Licencia',
    reasonDescription: 'La suscripción solicitada presentó bloqueo geográfico al momento del canje en la consola del cliente.',
    incidentDate: '2026-10-10',
    preferredContact: 'CHAT_INTERNO',
    status: 'UNDER_REVIEW',
    requestedAmountCOP: 18500,
    resolutionOffer: 'Reemplazo prioritario de clave regional o devolución del 100% del dinero.',
    adminNotes: 'En revisión con soporte técnico para generar código regional compatible Colombia.',
    createdAt: '2026-10-10T11:15:00Z',
    updatedAt: '2026-10-10T11:30:00Z',
    reviewedBy: 'soporte@streambox.co',
    history: [
      { date: '2026-10-10T11:15:00Z', status: 'SUBMITTED', note: 'Reclamación recibida con captura de pantalla del error.', actor: 'Carlos Mendoza' },
      { date: '2026-10-10T11:30:00Z', status: 'UNDER_REVIEW', note: 'Asignado a Soporte VIP para análisis técnico.', actor: 'Soporte StreamBox' }
    ]
  }
];

