import { TrackedOrder, OrderStatusStage, OrderTimelineStep, PaymentStatus } from '../types';
import { DbOrder } from './supabase';

const STAGE_ORDER: OrderStatusStage[] = ['en_diseno', 'en_impresion', 'enviado', 'entregado'];

const TIMELINE_TEMPLATE: Array<{ stage: OrderStatusStage; title: string; description: string }> = [
  {
    stage: 'en_diseno',
    title: 'Orden Registrada & Control de Archivos',
    description: 'Recibimos tu pedido en el laboratorio de Pilar. Iniciando calibración de perfiles de color.',
  },
  {
    stage: 'en_impresion',
    title: 'Revelado Químico & Encuadernación',
    description: 'Prensado de hojas Layflat y estampado Hot Stamping en tapa.',
  },
  {
    stage: 'enviado',
    title: 'Despacho & Embalaje Rígido',
    description: 'Salida desde Pilar con logística asegurada.',
  },
  {
    stage: 'entregado',
    title: 'Entrega en Domicilio',
    description: 'Recepción en tu domicilio.',
  },
];

/** DB `status` free-text values that are NOT one of the 4 production stages. */
const NON_STAGE_STATUSES = new Set(['confirmado', 'pendiente_pago', 'rechazado', 'cancelado']);

export function buildOrderTimeline(stage: OrderStatusStage): OrderTimelineStep[] {
  const currentIdx = STAGE_ORDER.indexOf(stage);
  return TIMELINE_TEMPLATE.map((step, idx) => ({
    ...step,
    date: idx === 0 ? 'Hoy' : idx <= currentIdx ? 'Completado' : 'Próximamente',
    completed: idx < currentIdx || (idx === currentIdx && stage === 'entregado'),
    current: idx === currentIdx && stage !== 'entregado',
  }));
}

function normalizeStage(rawStatus: string | undefined): OrderStatusStage {
  if (rawStatus && (STAGE_ORDER as string[]).includes(rawStatus)) {
    return rawStatus as OrderStatusStage;
  }
  // Free-text payment/order statuses ('confirmado', 'pendiente_pago', etc.)
  // haven't entered production yet — show them at the first stage.
  return 'en_diseno';
}

function normalizePaymentStatus(raw: string | undefined): PaymentStatus {
  const allowed: PaymentStatus[] = ['pending', 'approved', 'in_process', 'rejected', 'refunded', 'cancelled', 'not_required'];
  if (raw && (allowed as string[]).includes(raw)) return raw as PaymentStatus;
  return 'pending';
}

/** Converts a raw Supabase `orders` row into the shape the UI (tracker & admin) expects. */
export function dbOrderToTrackedOrder(row: DbOrder): TrackedOrder {
  const stage = normalizeStage(row.status);
  const items = row.items_json && row.items_json.length > 0
    ? row.items_json
    : [{
        title: row.format_title,
        format: row.format_title,
        cover: row.cover_type || 'Lino Seleccionado',
        foil: 'Oro Champagne',
        pages: 20,
        price: row.total_price,
        hasGiftBox: true,
      }];

  return {
    id: row.id || `db-${row.order_code}`,
    orderNumber: row.order_code,
    trackingCode: row.tracking_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address || '',
    shippingCity: row.city || '',
    shippingMethod: row.shipping_method === 'correo_nacional' ? 'correo_nacional' : 'pilar_direct',
    status: stage,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    estimatedDeliveryDate: '4 a 6 días hábiles',
    estimatedDays: '4 a 6 días hábiles',
    totalPrice: Number(row.total_price || 0),
    paymentMethod: row.payment_provider === 'transfer' ? 'Transferencia Bancaria' : 'Mercado Pago',
    paymentStatus: normalizePaymentStatus(row.payment_status),
    paymentProvider: row.payment_provider === 'transfer' ? 'transfer' : 'mercadopago',
    items,
    timeline: buildOrderTimeline(stage),
    labNotes: row.lab_notes || (row.status === 'rechazado'
      ? 'Pago rechazado por Mercado Pago. Contactar al cliente antes de iniciar producción.'
      : undefined),
  };
}
