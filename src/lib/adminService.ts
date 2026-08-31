import { TrackedOrder, OrderStatusStage, DesignServiceRequest, PhotoAsset, PhotobookProject } from '../types';
import { SAMPLE_ORDERS } from '../data/mockData';
import { supabase } from './supabase';
import JSZip from 'jszip';

const ADMIN_ORDERS_KEY = 'halo_admin_orders_db';
const CONCIERGE_REQUESTS_KEY = 'halo_concierge_requests_db';

// Mock sample concierge requests for workshop testing
const INITIAL_CONCIERGE_REQUESTS: DesignServiceRequest[] = [
  {
    id: 'req-201',
    customerName: 'Santiago Morales',
    customerEmail: 'santiago.morales@viajes.com',
    customerPhone: '+54 351 556-7890',
    occasion: 'viaje',
    bookFormatId: 'landscape-30-20',
    coverMaterialId: 'linen-terracotta',
    foilColor: 'bronze',
    coverTitle: 'PATAGONIA SUR · EXPEDICIÓN 2026',
    coverSubtitle: 'RECUERDOS DE VIAJE',
    hasCoverWindow: false,
    paperFinishId: 'fine-art-velvet',
    designStyle: 'editorial',
    uploadMethod: 'cloud-link',
    cloudLink: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ?usp=sharing',
    uploadedPhotos: [],
    estimatedPhotosCount: 85,
    specialInstructions: 'Priorizar fotos panorámicas de El Chaltén y glaciares. Dejar espacios en blanco tipo libro de arte contemporáneo.',
    giftBox: true,
    estimatedPages: 24,
    estimatedTotal: 141000,
  },
  {
    id: 'req-202',
    customerName: 'Camila & Facundo Benítez',
    customerEmail: 'camila.benitez@gmail.com',
    customerPhone: '+54 11 3998-1234',
    occasion: 'boda',
    bookFormatId: 'square-30',
    coverMaterialId: 'linen-natural',
    foilColor: 'gold',
    coverTitle: 'NUESTRO DÍA SOÑADO',
    coverSubtitle: 'CAMI & FACU · 15 DE FEBRERO 2026',
    hasCoverWindow: true,
    coverWindowPhotoIndex: 0,
    paperFinishId: 'photo-lustre',
    designStyle: 'clasico',
    uploadMethod: 'direct',
    uploadedPhotos: [
      {
        id: 'req-ph-1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        name: 'Vals_Principal.jpg',
        caption: 'Momento del vals',
      },
      {
        id: 'req-ph-2',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        name: 'Ceremonia_Anillos.jpg',
        caption: 'Entrega de alianzas',
      },
      {
        id: 'req-ph-3',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
        name: 'Ramo_Novia.jpg',
        caption: 'Detalle del vestido y ramo',
      }
    ],
    estimatedPhotosCount: 120,
    specialInstructions: 'Queremos que el orden sea estrictamente cronológico desde la preparación hasta el final de la fiesta en Pilar.',
    giftBox: true,
    estimatedPages: 30,
    estimatedTotal: 185000,
  }
];

// 1. Get all orders
export function getAdminOrders(): TrackedOrder[] {
  try {
    const raw = localStorage.getItem(ADMIN_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading admin orders from localStorage', e);
  }
  // Initialize with sample orders
  saveAdminOrders(SAMPLE_ORDERS);
  return SAMPLE_ORDERS;
}

// 2. Save orders
export function saveAdminOrders(orders: TrackedOrder[]) {
  try {
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving admin orders', e);
  }
}

// 3. Update Order Status in Workshop
export async function updateOrderStatusInWorkshop(
  orderId: string, 
  newStage: OrderStatusStage, 
  trackingCode?: string, 
  labNotes?: string
): Promise<TrackedOrder | null> {
  const orders = getAdminOrders();
  const orderIdx = orders.findIndex(o => o.id === orderId || o.orderNumber === orderId);

  if (orderIdx === -1) return null;

  const order = { ...orders[orderIdx] };
  order.status = newStage;

  if (trackingCode !== undefined) {
    order.trackingCode = trackingCode;
  }
  if (labNotes !== undefined) {
    order.labNotes = labNotes;
  }

  // Update timeline
  const nowStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

  const stagesOrder: OrderStatusStage[] = ['en_diseno', 'en_impresion', 'enviado', 'entregado'];
  const currentStageIdx = stagesOrder.indexOf(newStage);

  order.timeline = order.timeline.map((step, idx) => {
    const isCompleted = idx < currentStageIdx || (idx === currentStageIdx && newStage === 'entregado');
    const isCurrent = idx === currentStageIdx && newStage !== 'entregado';
    return {
      ...step,
      completed: isCompleted,
      current: isCurrent,
      date: isCurrent || (isCompleted && !step.completed) ? nowStr : step.date,
      time: isCurrent || (isCompleted && !step.completed) ? timeStr : step.time,
    };
  });

  orders[orderIdx] = order;
  saveAdminOrders(orders);

  // Sync with Supabase if available
  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({ 
          status: newStage,
          tracking_number: order.trackingCode,
        })
        .eq('order_code', order.orderNumber);
    } catch (err) {
      console.warn('Could not sync with Supabase', err);
    }
  }

  return order;
}

// 4. Get Concierge Requests
export function getAdminConciergeRequests(): DesignServiceRequest[] {
  try {
    const raw = localStorage.getItem(CONCIERGE_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading concierge requests', e);
  }
  localStorage.setItem(CONCIERGE_REQUESTS_KEY, JSON.stringify(INITIAL_CONCIERGE_REQUESTS));
  return INITIAL_CONCIERGE_REQUESTS;
}

// 5. Add new Concierge Request
export function addAdminConciergeRequest(req: DesignServiceRequest) {
  const requests = getAdminConciergeRequests();
  requests.unshift(req);
  try {
    localStorage.setItem(CONCIERGE_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving concierge request', e);
  }
}

// 6. Download ZIP of High-Resolution Production Assets
export async function generateAndDownloadProductionZip(order: TrackedOrder, photoAssets: PhotoAsset[] = []) {
  const zip = new JSZip();

  // Create Workshop Technical Spec Sheet
  const specSheetContent = `========================================================================
HALO FINE ART LAB - FICHA TÉCNICA DE PRODUCCIÓN & ENCUADERNACIÓN
Laboratorio Artesanal de Fotolibros · Pilar, Buenos Aires
========================================================================

NÚMERO DE PEDIDO:     ${order.orderNumber}
FECHA DE ORDEN:       ${order.createdAt}
ESTADO ACTUAL:        ${order.status.toUpperCase()}
MÉTODO DE PAGO:       ${order.paymentMethod}
INVERSIÓN TOTAL:      $${order.totalPrice.toLocaleString('es-AR')} ARS

------------------------------------------------------------------------
DATOS DEL CLIENTE & DESTINO DE ENTREGA
------------------------------------------------------------------------
Nombre:               ${order.customerName}
Email de Contacto:    ${order.customerEmail}
Teléfono:             ${order.customerPhone || 'No proporcionado'}
Dirección de Entrega: ${order.shippingAddress}
Localidad:            ${order.shippingCity}
Modalidad de Envío:   ${order.shippingMethod === 'pilar_direct' ? 'ENTREGA DIRECTA PILAR & ALREDEDORES (Radio 20 km Bonificada)' : 'ENVÍO NACIONAL (Correo Argentino / Expreso)'}
Código de Despacho:   ${order.trackingCode || 'Pendiente de emisión'}

------------------------------------------------------------------------
ESPECIFICACIONES DEL FOTOLIBRO & ENCUADERNACIÓN
------------------------------------------------------------------------
${order.items.map((item, i) => `
ÍTEM #${i + 1}: ${item.title}
• Formato:              ${item.format}
• Material de Portada:  ${item.cover}
• Estampado Hot Stamping: ${item.foil}
• Tipo de Papel:        Papel Fotográfico Químico Profesional HD (Fuji Crystal Archive Lustre / Velvet)
• Apertura:             180° Layflat (Apertura Panorámica Plana)
• Cantidad de Páginas:  ${item.pages} páginas (${Math.ceil(item.pages / 2)} pliegos dobles)
• Caja Rígida de Lujo:  ${item.hasGiftBox ? 'INCLUIDA (Acabado texturado con lazo)' : 'NO'}
• Importe:              $${item.price.toLocaleString('es-AR')} ARS
`).join('\n')}

------------------------------------------------------------------------
INSTRUCCIONES & NOTAS DE TALLER:
------------------------------------------------------------------------
${order.labNotes || 'Inspección minuciosa de apertura 180° y curado de lomo bajo prensa de 24 horas.'}

========================================================================
HALO Fine Art Lab · Pilar, Buenos Aires · www.halofineart.com.ar
========================================================================
`;

  zip.file(`FICHA_TECNICA_${order.orderNumber}.txt`, specSheetContent);

  // Add sample photos or real photos to ZIP
  const photosToInclude = photoAssets.length > 0 ? photoAssets : [
    {
      id: 'p-1',
      name: '01_Portada_Ventanita.jpg',
      url: order.items[0]?.previewUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'p-2',
      name: '02_Pliego_01_Apertura.jpg',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'p-3',
      name: '03_Pliego_02_Panoramica.jpg',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    }
  ];

  const photosFolder = zip.folder(`FOTOS_ALTA_CALIDAD_${order.orderNumber}`);

  // Fetch images as blobs and add to zip
  for (let i = 0; i < photosToInclude.length; i++) {
    const photo = photosToInclude[i];
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const filename = `${String(i + 1).padStart(2, '0')}_${(photo.name || `foto_${i + 1}`).replace(/[^a-zA-Z0-9._-]/g, '_')}.jpg`;
      photosFolder?.file(filename, blob);
    } catch (e) {
      console.warn(`Could not fetch photo ${photo.url}`, e);
      // Create a dummy placeholder text if fetch is blocked by CORS in preview
      photosFolder?.file(`FOTO_${i + 1}_ENLACE_ALTA_CALIDAD.txt`, `Enlace de descarga directa: ${photo.url}`);
    }
  }

  // Generate ZIP and trigger browser download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `HALO_PRODUCCION_${order.orderNumber}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
