import { BookFormat, CoverMaterial, FoilOption, PaperFinish, PhotoAsset, CustomerReview, TrackedOrder } from '../types';

export const STORE_CONFIG = {
  currency: 'ARS',
  currencySymbol: '$',
  whatsappNumber: '+54 11 2862-5916',
  whatsappRaw: '5491128625916',
  whatsappMessage: '¡Hola HALO Fine Art Lab! Quisiera consultar sobre los fotolibros artesanales y las opciones de diseño.',
  email: 'contacto@halofineartlab.com',
  location: {
    city: 'Pilar, Zona Norte',
    province: 'Buenos Aires',
    country: 'Argentina',
    freeRadiusKm: 20,
    freeDeliveryZones: [
      'Pilar Centro',
      'Del Viso',
      'Manzanares',
      'Fátima',
      'Tortuguitas',
      'Villa Rosa',
      'Ing. Maschwitz',
      'Escobar Centro',
      'Manuel Alberti',
      'Presidente Derqui',
      'Barrios Cerrados & Countries del Corredor Panamericana km 38 a 60'
    ]
  },
  productionTime: '4 a 6 días hábiles',
  shippingCostRestOfCountry: 8500, // ARS
  bankDiscountPercent: 10,
  paymentMethods: [
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Tarjetas de crédito (en cuotas), débito y saldo en cuenta Mercado Pago',
      badge: 'PROCESO INSTANTÁNEO'
    },
    {
      id: 'transfer',
      name: 'Transferencia Bancaria Directa',
      description: '10% de descuento abonando por transferencia o depósito inmediato',
      badge: '10% OFF'
    }
  ]
};

export const formatPriceARS = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const BOOK_FORMATS: BookFormat[] = [
  {
    id: 'square-30',
    name: 'Gran Cuadrado Fine Art',
    dimensions: '30 × 30 cm (12 × 12")',
    description: 'El formato insignia y más solicitado para bodas, aniversarios y grandes hitos de vida. Presencia imponente y fotos panorámicas espectaculares.',
    basePages: 20,
    basePrice: 145000,
    extraSpreadPrice: 9000,
    idealPhotos: '40 a 120 fotos',
    popular: true,
    category: 'cuadrado'
  },
  {
    id: 'square-20',
    name: 'Cuadrado Clásico',
    dimensions: '20 × 20 cm (8 × 8")',
    description: 'Perfecto para viajes, momentos cotidianos, sesiones de recién nacidos y regalos familiares íntimos. Cómodo y liviano en mano.',
    basePages: 20,
    basePrice: 95000,
    extraSpreadPrice: 6000,
    idealPhotos: '25 a 70 fotos',
    popular: false,
    category: 'cuadrado'
  },
  {
    id: 'square-15',
    name: 'Cuadrado Pocket Artisan',
    dimensions: '15 × 15 cm (6 × 6")',
    description: 'Edición de bolsillo ideal como souvenir de lujo, para regalar a padres/abuelos o resumir un fin de semana especial.',
    basePages: 20,
    basePrice: 68000,
    extraSpreadPrice: 4500,
    idealPhotos: '20 a 50 fotos',
    popular: false,
    category: 'cuadrado'
  },
  {
    id: 'landscape-30-20',
    name: 'Apaisado Panorámico',
    dimensions: '30 × 20 cm (12 × 8")',
    description: 'Diseño cinematográfico horizontal. Ideal para viajes por el mundo, paisajes naturales y fotografías de arquitectura.',
    basePages: 20,
    basePrice: 125000,
    extraSpreadPrice: 8000,
    idealPhotos: '35 a 90 fotos',
    popular: true,
    category: 'apaisado'
  },
  {
    id: 'landscape-40-30',
    name: 'Gran Apaisado Master Museum',
    dimensions: '40 × 30 cm (16 × 12")',
    description: 'El formato colosal de exhibición. Cada pliego abierto alcanza 80 cm de ancho con impacto visual arrollador para bodas de gala.',
    basePages: 20,
    basePrice: 195000,
    extraSpreadPrice: 12000,
    idealPhotos: '60 a 180 fotos',
    popular: false,
    category: 'apaisado'
  },
  {
    id: 'portrait-20-30',
    name: 'Editorial Vertical',
    dimensions: '20 × 30 cm (8 × 12")',
    description: 'Estilo libro de arte contemporáneo o revista de moda de alta gama. Favorece retratos individuales y sesiones de moda o 15 años.',
    basePages: 20,
    basePrice: 120000,
    extraSpreadPrice: 8000,
    idealPhotos: '30 a 80 fotos',
    popular: false,
    category: 'vertical'
  }
];

export const COVER_MATERIALS: CoverMaterial[] = [
  // --- TELAS DE LINO ---
  {
    id: 'linen-natural',
    name: 'Lino Natural Crudo',
    category: 'lino',
    colorHex: '#D8CFBC',
    textureClass: 'bg-[#D8CFBC]',
    priceDelta: 0,
    previewUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    description: 'Tela 100% lino de hilado natural texturado. Suave al tacto y sumamente resistente al paso de los años.',
  },
  {
    id: 'linen-sand',
    name: 'Lino Arena Suave',
    category: 'lino',
    colorHex: '#E5DEC9',
    textureClass: 'bg-[#E5DEC9]',
    priceDelta: 0,
    previewUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    description: 'Tonalidad cálida y luminosa. El color favorito para álbumes de bebés y bautismos.',
  },
  {
    id: 'linen-sage',
    name: 'Lino Verde Salvia Botánico',
    category: 'lino',
    colorHex: '#8E9988',
    textureClass: 'bg-[#8E9988]',
    priceDelta: 4500,
    previewUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Verde orgánico y sofisticado con textura rústica europea.',
  },
  {
    id: 'linen-terracotta',
    name: 'Lino Terracota Tierra',
    category: 'lino',
    colorHex: '#B26F56',
    textureClass: 'bg-[#B26F56]',
    priceDelta: 4500,
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Pigmentación rica y elegante inspirada en la calidez del atardecer y viajes.',
  },
  {
    id: 'linen-rose',
    name: 'Lino Rosa Palo Vintage',
    category: 'lino',
    colorHex: '#CDB4B0',
    textureClass: 'bg-[#CDB4B0]',
    priceDelta: 4500,
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Tono pastel sutil y romántico de máxima delicadeza visual.',
  },
  {
    id: 'linen-mustard',
    name: 'Lino Mostaza Cálido',
    category: 'lino',
    colorHex: '#C8A25D',
    textureClass: 'bg-[#C8A25D]',
    priceDelta: 4500,
    previewUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    description: 'Amarillo ocre tostado de estética otoñal y alegre.',
  },
  {
    id: 'linen-pearl-grey',
    name: 'Lino Gris Perla Nórdico',
    category: 'lino',
    colorHex: '#B5B4AF',
    textureClass: 'bg-[#B5B4AF]',
    priceDelta: 0,
    previewUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    description: 'Gris neutro atemporal que armoniza con cualquier decoración.',
  },
  {
    id: 'linen-midnight',
    name: 'Lino Noche Profunda',
    category: 'lino',
    colorHex: '#252932',
    textureClass: 'bg-[#252932]',
    priceDelta: 4500,
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'Azul noche sobrio de lujo. Destaca de forma impresionante el estampado en oro brillante.',
  },

  // --- CUEROS ARTISAN ---
  {
    id: 'leather-taupe',
    name: 'Cuero Vegano Artisan Taupe',
    category: 'cuero',
    colorHex: '#8C7B6B',
    textureClass: 'bg-[#8C7B6B]',
    priceDelta: 18000,
    previewUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    description: 'Textura granulada ultra suave de primera calidad con costura artesanal en cantos.',
  },
  {
    id: 'leather-cognac',
    name: 'Cuero Suave Caramelo Cognac',
    category: 'cuero',
    colorHex: '#9E5B32',
    textureClass: 'bg-[#9E5B32]',
    priceDelta: 18000,
    previewUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    description: 'El tono tostado clásico de encuadernación de archivo vintage con pátina sedosa.',
  },
  {
    id: 'leather-ebony',
    name: 'Cuero Negro Ébano Mate',
    category: 'cuero',
    colorHex: '#1C1C1E',
    textureClass: 'bg-[#1C1C1E]',
    priceDelta: 18000,
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'Puro carácter sobrio y arquitectónico, ideal para grabados en plata o bajo relieve.',
  },

  // --- TERCIOPELOS ITALIANOS ---
  {
    id: 'velvet-rose',
    name: 'Terciopelo Vintage Ceniza',
    category: 'terciopelo',
    colorHex: '#9E8F8B',
    textureClass: 'bg-[#9E8F8B]',
    priceDelta: 22000,
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Terciopelo suntuoso con un brillo sutil al reflejo de la luz.',
  },
  {
    id: 'velvet-emerald',
    name: 'Terciopelo Verde Esmeralda Botánico',
    category: 'terciopelo',
    colorHex: '#1E4334',
    textureClass: 'bg-[#1E4334]',
    priceDelta: 22000,
    previewUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Verde bosque majestuoso con textura afelpada de alta gama.',
  },
  {
    id: 'velvet-royal-blue',
    name: 'Terciopelo Azul Zafiro Imperial',
    category: 'terciopelo',
    colorHex: '#1B2C4E',
    textureClass: 'bg-[#1B2C4E]',
    priceDelta: 22000,
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'Azul profundo de la realeza que contrasta con relieve en oro champagne.',
  },
  {
    id: 'velvet-terracotta',
    name: 'Terciopelo Terracota Velvet',
    category: 'terciopelo',
    colorHex: '#A04E38',
    textureClass: 'bg-[#A04E38]',
    priceDelta: 22000,
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Calidez envolvente y textura aterciopelada de presencia inigualable.',
  },

  // --- TAPA DURA FOTOGRÁFICA ---
  {
    id: 'photo-hardcover',
    name: 'Tapa Dura Fotográfica Mate Soft-Touch',
    category: 'fotografica',
    colorHex: '#F0ECE1',
    textureClass: 'bg-[#F0ECE1]',
    priceDelta: 0,
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    description: 'Impresión integral envolvente de tu foto favorita con laminado velvet anti-rayones.',
  }
];

export const FOIL_OPTIONS: FoilOption[] = [
  {
    id: 'gold',
    name: 'Oro Champagne Brillante',
    colorHex: '#D4AF37',
    description: 'El clásico de HALO: relieve térmico en caliente con lámina dorada metalizada.',
  },
  {
    id: 'bronze',
    name: 'Bronce Envejecido',
    colorHex: '#9C7A4A',
    description: 'Tono cobre sutil y profundo, ideal para combinaciones con telas crudas.',
  },
  {
    id: 'rose-gold',
    name: 'Oro Rosa Romántico',
    colorHex: '#B76E79',
    description: 'Delicado y cálido, muy elegido para sesiones de bodas y maternidad.',
  },
  {
    id: 'silver',
    name: 'Plata Puro Pulido',
    colorHex: '#C0C0C0',
    description: 'Brillo contemporáneo de alto contraste para tapas oscuras.',
  },
  {
    id: 'deboss-blind',
    name: 'Bajo Relieve Ciego (Sin Lámina)',
    colorHex: '#6E665B',
    description: 'Grabado termo-prensado puro en la tela, ultra minimalista y sobrio.',
  }
];

export const PAPER_FINISHES: PaperFinish[] = [
  {
    id: 'photo-lustre',
    name: 'Papel Fotográfico Químico Fuji Lustre HD',
    subtitle: 'Revelado tradicional plata halide montado sobre alma rígida Layflat',
    description: 'El estándar de la fotografía profesional. Grano semi-mate perlado que no refleja destellos molestos, resistente a huellas y con una nitidez de color inigualable. Apertura 180° plana.',
    grammage: '650 g/m² (Doble cara rígida)',
    badge: 'MÁS ELEGIDO',
    priceDelta: 0,
  },
  {
    id: 'fine-art-velvet',
    name: 'Fine Art Museum 100% Algodón Velvet',
    subtitle: 'Tintas pigmentadas UltraChrome de grado museo con textura de lienzo',
    description: 'Papel 100% libre de ácido con una textura táctil aterciopelada y negros ultra profundos. Garantía de conservación de más de 120 años sin decoloración.',
    grammage: '580 g/m² rígido',
    badge: 'MÁXIMO LUJO',
    priceDelta: 28000,
  },
  {
    id: 'silk-anti-fingerprint',
    name: 'Papel Fotográfico Seda Silk Royal',
    subtitle: 'Trama milpuntos satinada de alta resistencia y elegancia táctil',
    description: 'Textura en cuadrícula milimétrica que aporta un toque vintage artesanal irrepetible. Prácticamente inmune a huellas dactilares y roces.',
    grammage: '620 g/m² rígido',
    badge: 'TEXTURA ARTISAN',
    priceDelta: 16000,
  }
];

// Sample Curated High Resolution Photo Collections to test the photobook builder immediately
export const SAMPLE_PHOTO_PACKS: Record<string, { name: string; description: string; photos: PhotoAsset[] }> = {
  boda: {
    name: 'Boda & Romance Fine Art',
    description: 'Colección de momentos emotivos, votos, detalles y atardecer nupcial.',
    photos: [
      {
        id: 'w-1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        name: 'Los Votos Nupciales',
        dateTaken: '2025-11-14',
        caption: 'Bajo el roble centenario prometimos amarnos siempre.',
      },
      {
        id: 'w-2',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        name: 'El Abrazo',
        dateTaken: '2025-11-14',
        caption: 'Nuestra primera mirada de recién casados.',
      },
      {
        id: 'w-3',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        name: 'El Ramo & Detalles',
        dateTaken: '2025-11-14',
        caption: 'Flores silvestres de estación y detalles hechos a mano.',
      },
      {
        id: 'w-4',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        name: 'Caminata al Atardecer',
        dateTaken: '2025-11-14',
        caption: 'La luz dorada de las seis de la tarde.',
      },
      {
        id: 'w-5',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
        name: 'El Primer Baile',
        dateTaken: '2025-11-14',
        caption: 'Bailando mientras todos nuestros seres queridos nos rodeaban.',
      },
      {
        id: 'w-6',
        url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
        name: 'Brindis & Celebración',
        dateTaken: '2025-11-14',
        caption: 'Por una vida entera juntos.',
      }
    ]
  },
  familia: {
    name: 'Momentos en Familia',
    description: 'Risas, domingos en casa, abrazos y recuerdos con los abuelos e hijos.',
    photos: [
      {
        id: 'f-1',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
        name: 'Desayuno de Domingo',
        dateTaken: '2026-03-12',
        caption: 'El café recién hecho y las risas de la mañana.',
      },
      {
        id: 'f-2',
        url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
        name: 'Abuelos & Nietos',
        dateTaken: '2026-03-12',
        caption: 'Historias que quedan grabadas para siempre en el corazón.',
      },
      {
        id: 'f-3',
        url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80',
        name: 'Tarde de Juegos en el Jardín',
        dateTaken: '2026-03-12',
        caption: 'Corriendo descalzos sobre el pasto.',
      },
      {
        id: 'f-4',
        url: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=1200&q=80',
        name: 'Retrato de Papá e Hija',
        dateTaken: '2026-03-12',
        caption: 'Creciendo demasiado rápido.',
      }
    ]
  },
  viaje: {
    name: 'Aventuras & Viajes',
    description: 'Paisajes montañosos, calas mediterráneas y recorridos inolvidables.',
    photos: [
      {
        id: 'v-1',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        name: 'Amanecer en las Montañas',
        dateTaken: '2025-08-19',
        caption: 'La inmensidad de los picos alpinos.',
      },
      {
        id: 'v-2',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        name: 'Costa Dorada del Mediterráneo',
        dateTaken: '2025-08-22',
        caption: 'Aguas cristalinas y aire salino.',
      },
      {
        id: 'v-3',
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        name: 'Perdidos en Calles Empedradas',
        dateTaken: '2025-08-24',
        caption: 'Descubriendo rincones secretos sin mapa ni prisa.',
      },
      {
        id: 'v-4',
        url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        name: 'Ruta Infinita',
        dateTaken: '2025-08-27',
        caption: '1.200 km de música, paisajes y libertad.',
      }
    ]
  },
  bebe: {
    name: 'Bebé & Maternidad Botánica',
    description: 'Manitos, piecitos, primeros abrazos y detalles íntimos del recién nacido.',
    photos: [
      {
        id: 'b-1',
        url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
        name: 'Piecitos en Manos de Papás',
        caption: 'Mi todo en este mundo.'
      },
      {
        id: 'b-2',
        url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1200&q=80',
        name: 'Primer Sueño Dulce',
        caption: 'Durmiendo en calma.'
      },
      {
        id: 'b-3',
        url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80',
        name: 'Detalle de Pies de Bebé',
        caption: 'Pasitos que recién comienzan.'
      },
      {
        id: 'b-4',
        url: 'https://images.unsplash.com/photo-1544126592-807daa2b567b?auto=format&fit=crop&w=1200&q=80',
        name: 'Abrazo de Mamá',
        caption: 'El refugio más cálido.'
      },
      {
        id: 'b-5',
        url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
        name: 'Sosteniendo su Manito',
        caption: 'Amor incondicional.'
      }
    ]
  },
  lifestyle: {
    name: 'Editorial Lifestyle & Wellness',
    description: 'Estética contemporánea, texturas naturales, spa y momentos de autocuidado.',
    photos: [
      { id: 'l-1', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80', name: 'Ritual de Cuidado' },
      { id: 'l-2', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80', name: 'Reflejos en el Espejo' },
      { id: 'l-3', url: 'https://images.unsplash.com/photo-1512290900672-1f4163488730?auto=format&fit=crop&w=1200&q=80', name: 'Piel & Calma' },
      { id: 'l-4', url: 'https://images.unsplash.com/photo-1608248597359-58a3641215b5?auto=format&fit=crop&w=1200&q=80', name: 'Texturas Orgánicas' },
      { id: 'l-5', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80', name: 'Botánicos & Sombras' },
      { id: 'l-6', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80', name: 'Baño de Cerámica' },
      { id: 'l-7', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80', name: 'Mascarilla Facial' },
      { id: 'l-8', url: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=80', name: 'Aceites Esenciales' },
      { id: 'l-9', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', name: 'Cesta Artisan' },
      { id: 'l-10', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80', name: 'Eucalipto & Rodillo de Jade' }
    ]
  },
  gourmet: {
    name: 'Gastronomía & Cena Celebración',
    description: 'Platos de autor, velas de noche, brindis y mesas de fiesta.',
    photos: [
      { id: 'g-1', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', name: 'Ensalada Fresca & Pollo Glaseado' },
      { id: 'g-2', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80', name: 'Mesa con Velas y Granadas' },
      { id: 'g-3', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80', name: 'Pollo Teriyaki Crocante' },
      { id: 'g-4', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80', name: 'Langostinos Salteados con Zucchini' }
    ]
  },
  romance: {
    name: 'Romance Golden Hour & Atardecer',
    description: 'Parejas a contraluz, playa, globos aerostáticos y montañas al atardecer.',
    photos: [
      { id: 'r-p1', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80', name: 'Caminando en la Montaña' },
      { id: 'r-p2', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80', name: 'Bailando en la Orilla' },
      { id: 'r-p3', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80', name: 'Mirando el Horizonte' },
      { id: 'r-p4', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', name: 'Atardecer en el Lago' },
      { id: 'r-p5', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80', name: 'Paseo en la Playa' },
      { id: 'r-p6', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80', name: 'Silueta al Ocaso' },
      { id: 'r-p7', url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=1200&q=80', name: 'Cálido Abrazo' },
      { id: 'r-p8', url: 'https://images.unsplash.com/photo-1507038772120-7fff76f79d74?auto=format&fit=crop&w=1200&q=80', name: 'Globos en Capadocia' },
      { id: 'r-p9', url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=1200&q=80', name: 'Sonrisas de Cerca' },
      { id: 'r-p10', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', name: 'Votos Frente al Lago' }
    ]
  }
};

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'r-1',
    name: 'Valentina & Mateo Rossi',
    location: 'Pilar, Buenos Aires',
    occasion: 'Álbum de Boda Fine Art 30x30',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'Teníamos las fotos de nuestra boda guardadas en un pendrive desde hacía dos años. Vivimos en Pilar y nos lo entregaron en mano en 5 días. Verlas en el libro con lino natural y grabado en oro nos emocionó hasta las lágrimas. ¡La apertura plana es una obra de arte!',
    bookPhotoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    format: 'Gran Cuadrado 30x30 cm · Lino Natural Crudo',
  },
  {
    id: 'r-2',
    name: 'Santiago Morales',
    location: 'Córdoba Capital',
    occasion: 'Servicio Concierge: Viaje a la Patagonia',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'No tenía tiempo de maquetar 300 fotos de mi viaje. Les pasé el link de Drive y en 48 horas me mandaron una propuesta editorial perfecta. Llegó por correo a Córdoba impecablemente embalado. El peso del libro y el papel Fuji Lustre demuestran que es pura calidad profesional.',
    bookPhotoUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    format: 'Apaisado 30x20 cm · Papel Químico Fuji Lustre',
  },
  {
    id: 'r-3',
    name: 'Lucía Fernández',
    location: 'Nordelta, Tigre, Buenos Aires',
    occasion: 'Primer Año de Sofía',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: 'El regalo más hermoso que le vamos a dejar a nuestra hija. La ventanita con su foto en la portada de lino arena queda tan delicada en la mesa del living. La atención por WhatsApp fue súper cálida y personalizada.',
    bookPhotoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    format: 'Cuadrado 20x20 cm · Lino Arena + Ventana',
  }
];

export const FAQ_ITEMS = [
  {
    question: '¿Cuáles son los tiempos de producción y entrega?',
    answer: 'Cada fotolibro se confecciona artesanalmente a mano en nuestro laboratorio en Pilar (Zona Norte, Buenos Aires). El tiempo de producción es de tan solo 4 a 6 días hábiles. Ofrecemos entrega sin cargo en un radio de 20 km alrededor de Pilar, y enviamos por correo a cualquier punto de Argentina con embalaje reforzado anti-golpes.'
  },
  {
    question: '¿Cómo funciona la entrega gratuita en Pilar y alrededores (radio 20 km)?',
    answer: 'Si te encontrás en Pilar, Del Viso, Manzanares, Fátima, Tortuguitas, Villa Rosa, Ing. Maschwitz, Escobar Centro, Derqui o countries/barrios de la zona (hasta 20 km de nuestro taller), la entrega es 100% bonificada y coordinamos el horario que te quede más cómodo.'
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer: 'Aceptamos todas las tarjetas de crédito y débito a través de Mercado Pago (con opciones en cuotas según promociones bancarias vigentes) y Transferencia Bancaria Directa con un 10% de descuento inmediato.'
  },
  {
    question: '¿Cuál es la diferencia entre papel fotográfico auténtico y la imprenta digital común?',
    answer: 'La mayoría de los libros comerciales se imprimen con tinta líquida/tóner sobre papel satinado estándar de revista (150-170g) que se ondula y pierde color en pocos años. En HALO utilizamos revelado químico tradicional en papel fotográfico profesional de plata halide (Fuji Crystal Archive HD) de 650g/m² montado sobre alma rígida. Los colores no se degradan con la luz ni el paso del tiempo por más de 100 años.'
  },
  {
    question: '¿Qué es la apertura Layflat 180°?',
    answer: 'Significa que el fotolibro se abre completamente plano sobre cualquier superficie, sin la molesta curvatura en el centro de las páginas. Esto te permite colocar una fotografía panorámica atravesando las dos páginas sin que nada del rostro o paisaje se pierda en el pliegue del lomo.'
  },
  {
    question: '¿Cómo funciona la opción "Nosotros lo diseñamos por vos"?',
    answer: 'Es nuestro servicio concierge de diseño: solo subís tus fotos favoritas desde el celular o enviás un enlace de Drive / Dropbox / WeTransfer. Nuestros diseñadores profesionales seleccionan la mejor narrativa visual, balancean colores y te envían un borrador digital interactivo por WhatsApp o email en 48 hs para que lo revises y apruebes antes de imprimir.'
  },
  {
    question: '¿Las fotos del celular tienen suficiente calidad para imprimir?',
    answer: '¡Totalmente! Las cámaras de los teléfonos actuales tienen excelente resolución. Nuestro sistema cuenta con un analizador de nitidez inteligente que te avisará si alguna foto tiene baja resolución antes de imprimir, y nuestros diseñadores optimizan el contraste y la saturación de cada imagen.'
  }
];

export const SAMPLE_ORDERS: TrackedOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'HALO-849201',
    trackingCode: 'CORREO-AR-93821094',
    customerName: 'Valentina & Mateo Rossi',
    customerEmail: 'valentina.rossi@gmail.com',
    customerPhone: '+54 11 4455-8899',
    shippingAddress: 'Barrio Cerrado Los Robles, Lote 42',
    shippingCity: 'Pilar, Buenos Aires (Zona Norte)',
    shippingMethod: 'pilar_direct',
    status: 'en_impresion',
    createdAt: '2026-08-28',
    estimatedDeliveryDate: '2 al 4 de Septiembre, 2026',
    estimatedDays: '4 a 6 días hábiles',
    totalPrice: 173000,
    paymentMethod: 'Mercado Pago (3 cuotas sin interés)',
    items: [
      {
        title: 'NUESTRA BODA · VALENTINA & MATEO',
        format: 'Gran Cuadrado Fine Art (30×30 cm)',
        cover: 'Lino Natural Crudo',
        foil: 'Oro Champagne Brillante',
        pages: 28,
        price: 173000,
        previewUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
        hasGiftBox: true,
      }
    ],
    timeline: [
      {
        stage: 'en_diseno',
        title: 'Diseño Editorial & Revisión Final',
        description: 'Borrador interactivo aprobado por el cliente. Ajuste cromático y calibración de perfil RGB listos.',
        date: '28 Ago 2026',
        time: '14:20 hs',
        completed: true,
        current: false,
      },
      {
        stage: 'en_impresion',
        title: 'Revelado Químico & Encuadernación Artesanal',
        description: 'Pliegos Layflat en papel Fuji Lustre HD en prensa. Estampado Hot Stamping en taller de Pilar en curso.',
        date: '29 Ago 2026',
        time: '10:45 hs',
        completed: false,
        current: true,
      },
      {
        stage: 'enviado',
        title: 'Embalaje Seguro & Despacho',
        description: 'Colocación en caja rígida de regalo y coordinación de logística protegida.',
        date: 'Estimado 2 Sep 2026',
        completed: false,
        current: false,
      },
      {
        stage: 'entregado',
        title: 'Entrega en Mano en Pilar',
        description: 'Entrega directa sin cargo en domicilio (radio de 20 km).',
        date: 'Estimado 3 Sep 2026',
        completed: false,
        current: false,
      }
    ],
    labNotes: 'El grabado en oro champagne se realizó con matriz tipográfica personalizada. Curado de encuadernación en prensa por 24 hs.',
  },
  {
    id: 'ord-102',
    orderNumber: 'HALO-941032',
    customerName: 'Santiago Morales',
    customerEmail: 'santiago.morales@viajes.com',
    customerPhone: '+54 351 556-7890',
    shippingAddress: 'Av. Hipólito Yrigoyen 450, Piso 6B',
    shippingCity: 'Córdoba Capital, Córdoba',
    shippingMethod: 'correo_nacional',
    trackingCode: 'AR-CR-882194012',
    status: 'en_diseno',
    createdAt: '2026-08-30',
    estimatedDeliveryDate: '5 al 8 de Septiembre, 2026',
    estimatedDays: '4 a 6 días hábiles',
    totalPrice: 141000,
    paymentMethod: 'Transferencia Bancaria Inmediata (10% OFF)',
    items: [
      {
        title: 'PATAGONIA SUR · EXPEDICIÓN 2026',
        format: 'Apaisado Panorámico (30×20 cm)',
        cover: 'Lino Terracota Tierra',
        foil: 'Bronce Envejecido',
        pages: 24,
        price: 141000,
        previewUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        hasGiftBox: true,
      }
    ],
    timeline: [
      {
        stage: 'en_diseno',
        title: 'Servicio Concierge: Maquetación en Curso',
        description: 'Nuestros diseñadores están organizando las 85 fotos del enlace de Drive en una narrativa fluida.',
        date: '30 Ago 2026',
        time: '09:15 hs',
        completed: false,
        current: true,
      },
      {
        stage: 'en_impresion',
        title: 'Impresión & Prensado Layflat',
        description: 'Impresión en papel Fine Art Velvet libre de ácido una vez confirmada la maqueta.',
        date: 'Pendiente aprobación',
        completed: false,
        current: false,
      },
      {
        stage: 'enviado',
        title: 'Despacho por Correo Argentino Expreso',
        description: 'Caja reforzada de alta resistencia con seguimiento digital nacional.',
        date: 'Estimado 4 Sep 2026',
        completed: false,
        current: false,
      },
      {
        stage: 'entregado',
        title: 'Entrega en Córdoba Capital',
        description: 'Recepción en domicilio.',
        date: 'Estimado 7 Sep 2026',
        completed: false,
        current: false,
      }
    ],
    labNotes: 'Borrador digital será enviado por WhatsApp en menos de 36 hs para revisión.',
  },
  {
    id: 'ord-103',
    orderNumber: 'HALO-630291',
    trackingCode: 'CHEV-PIL-0042',
    customerName: 'Lucía Fernández & Familia',
    customerEmail: 'lucia.fernandez@nordelta.com',
    customerPhone: '+54 11 6789-0123',
    shippingAddress: 'Barrio Los Castores, Calle del Lago 128',
    shippingCity: 'Nordelta, Tigre, Buenos Aires',
    shippingMethod: 'pilar_direct',
    status: 'enviado',
    createdAt: '2026-08-25',
    estimatedDeliveryDate: 'Hoy (30 de Agosto, 2026)',
    estimatedDays: '4 a 6 días hábiles',
    totalPrice: 117000,
    paymentMethod: 'Mercado Pago Débito',
    items: [
      {
        title: 'PRIMER AÑO DE SOFÍA',
        format: 'Cuadrado Clásico (20×20 cm)',
        cover: 'Lino Arena Suave + Ventana',
        foil: 'Oro Rosa Romántico',
        pages: 22,
        price: 117000,
        previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
        hasGiftBox: true,
      }
    ],
    timeline: [
      {
        stage: 'en_diseno',
        title: 'Diseño Editorial & Ventana Troquelada',
        description: 'Calibración de retrato de portada y tipografía.',
        date: '25 Ago 2026',
        completed: true,
        current: false,
      },
      {
        stage: 'en_impresion',
        title: 'Revelado & Encuadernado Finalizado',
        description: 'Inspección de control de calidad aprobada al 100%.',
        date: '28 Ago 2026',
        completed: true,
        current: false,
      },
      {
        stage: 'enviado',
        title: 'En Camino / En Reparto Directo',
        description: 'Vehículo del laboratorio en ruta por Zona Norte / Nordelta.',
        date: '30 Ago 2026',
        time: '08:30 hs',
        completed: false,
        current: true,
      },
      {
        stage: 'entregado',
        title: 'Entrega Programada',
        description: 'Llegada estimada entre las 13:00 y 17:00 hs.',
        date: 'Hoy 30 Ago 2026',
        completed: false,
        current: false,
      }
    ],
    labNotes: 'Paquete con lazo de cinta de algodón natural y certificado de garantía Fine Art.',
  }
];
