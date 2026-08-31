import { TrackedOrder, OrderStatusStage, EmailNotification } from '../types';
import { STORE_CONFIG } from '../data/mockData';

/**
 * Formats current date and time for the email header
 */
export const getFormattedTimestamp = (): string => {
  const now = new Date();
  const day = now.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} hs`;
};

/**
 * Generates an automated, editorial-grade luxury email notification
 * tailored to the specific stage of the artisan photobook production.
 */
export const generateStatusEmail = (
  order: TrackedOrder,
  stage: OrderStatusStage,
  customNotes?: string
): EmailNotification => {
  const item = order.items[0];
  const itemsSummary = item 
    ? `${item.title} (${item.format} · ${item.cover} · ${item.pages} págs.)` 
    : 'Fotolibro Artesanal Fine Art';

  const shippingMethodName = 
    order.shippingMethod === 'pilar_direct'
      ? 'Entrega Propia Sin Cargo (Zona Pilar y radio de 20 km)'
      : 'Envío Asegurado por Correo Argentino a todo el país';

  let subject = '';
  let headline = '';
  let highlightBadge = '';
  let bodyText = '';
  let nextStep = '';

  switch (stage) {
    case 'en_diseno':
      subject = `✨ [HALO Fine Art] Tu Fotolibro #${order.orderNumber} ha entrado a la Mesa de Diseño`;
      headline = `Comenzó la Maquetación Editorial de tu Álbum`;
      highlightBadge = 'FASE 1: DISEÑO & CALIBRACIÓN';
      bodyText = `¡Hola ${order.customerName}! Te confirmamos que tu orden #${order.orderNumber} ya fue recibida por nuestro equipo de dirección de arte en el laboratorio de Pilar. Estamos revisando la nitidez de tus fotografías, calibrando el balance cromático para papel fotográfico HD y preparando la diagramación de cada pliego con criterio estético minimalista.`;
      nextStep = `En las próximas 24 a 48 hs te enviaremos el borrador digital interactivo o pasaremos a la etapa de prensado una vez que los perfiles de color estén optimizados.`;
      break;

    case 'en_impresion':
      subject = `📸 [HALO Fine Art] ¡En Taller! Tu Fotolibro #${order.orderNumber} está en Impresión & Prensado`;
      headline = `Revelado Químico HD & Encuadernado Artesanal`;
      highlightBadge = 'FASE 2: EN PRODUCCIÓN & TALLER';
      bodyText = `¡Buenas noticias, ${order.customerName}! Los pliegos de tu fotolibro están siendo revelados en papel químico profesional de plata halide (Fuji Lustre HD / Fine Art) y montados sobre alma rígida para garantizar la apertura perfecta a 180° Layflat. Al mismo tiempo, preparamos la matriz tipográfica para el estampado en bajo relieve Hot Stamping sobre la tela de tapa.`;
      nextStep = `El libro permanecerá en prensa de curado durante 24 horas para asegurar una durabilidad centenaria y pasará a control de calidad y embalaje seguro.`;
      break;

    case 'enviado':
      subject = `📦 [HALO Fine Art] ¡En Camino! Tu Fotolibro #${order.orderNumber} fue despachado`;
      headline = `Tu pedido está en viaje hacia ${order.shippingCity}`;
      highlightBadge = 'FASE 3: DESPACHADO & EN RUTA';
      bodyText = `¡Tu fotolibro superó todas las pruebas de inspección de calidad! Ya fue cuidadosamente envuelto en papel de seda, colocado en su caja de protección y despachado desde nuestro laboratorio en Pilar hacia tu dirección (${order.shippingAddress}).`;
      nextStep = order.shippingMethod === 'pilar_direct'
        ? `Nuestro chofer de entrega directa se comunicará previamente por WhatsApp para coordinar el momento de recepción en tu domicilio.`
        : `Podés seguir el recorrido en tiempo real mediante el código de seguimiento de Correo Argentino: ${order.trackingCode || 'Asignado en tránsito'}.`;
      break;

    case 'entregado':
      subject = `🎉 [HALO Fine Art] ¡Entregado! Tu Fotolibro #${order.orderNumber} ha llegado a tus manos`;
      headline = `Tus recuerdos más valiosos, ahora tangibles`;
      highlightBadge = 'FASE 4: ENTREGADO CON ÉXITO';
      bodyText = `¡Es un honor haber transformado tus momentos más significativos en una pieza de arte tangible! Esperamos que disfrutes cada página, la textura del lino y el peso del papel de alta gama junto a tus seres queridos por muchísimos años.`;
      nextStep = `Recordá conservar tu fotolibro en un ambiente seco, lejos de la luz solar directa prolongada. Tu obra cuenta con garantía oficial de laboratorio de por vida.`;
      break;
  }

  if (customNotes) {
    bodyText += `\n\nNota personalizada del taller: "${customNotes}"`;
  }

  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    stage,
    subject,
    sentAt: getFormattedTimestamp(),
    headline,
    bodyText,
    highlightBadge,
    nextStep,
    estimatedDelivery: order.estimatedDeliveryDate,
    trackingCode: order.trackingCode,
    shippingAddress: order.shippingAddress,
    shippingMethodName,
    itemsSummary,
    itemPreviewUrl: item?.previewUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    read: false,
  };
};

/**
 * Initializes default sample email history for existing mock orders
 */
export const initializeSampleEmailHistory = (order: TrackedOrder): EmailNotification[] => {
  const history: EmailNotification[] = [];

  // Order created / En diseno email
  history.push({
    id: `email-hist-1-${order.id}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    stage: 'en_diseno',
    subject: `✨ [HALO Fine Art] Confirmación de Pedido #${order.orderNumber} - Inicio de Diseño`,
    sentAt: `${order.createdAt}, 10:15 hs`,
    headline: 'Comenzó la Maquetación Editorial de tu Álbum',
    highlightBadge: 'FASE 1: DISEÑO & CALIBRACIÓN',
    bodyText: `¡Hola ${order.customerName}! Te confirmamos que tu orden #${order.orderNumber} ya fue recibida por nuestro equipo de dirección de arte en el laboratorio de Pilar. Estamos revisando la nitidez de tus fotografías y preparando la diagramación de cada pliego.`,
    nextStep: 'En 24 a 48 hs te enviaremos el borrador o pasaremos a la etapa de prensado.',
    estimatedDelivery: order.estimatedDeliveryDate,
    trackingCode: order.trackingCode,
    shippingAddress: order.shippingAddress,
    shippingMethodName: order.shippingMethod === 'pilar_direct' ? 'Entrega Propia Sin Cargo en Pilar' : 'Correo Argentino',
    itemsSummary: order.items[0]?.title || 'Fotolibro Artesanal Fine Art',
    itemPreviewUrl: order.items[0]?.previewUrl,
    read: true,
  });

  if (order.status === 'en_impresion' || order.status === 'enviado' || order.status === 'entregado') {
    history.push({
      id: `email-hist-2-${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      stage: 'en_impresion',
      subject: `📸 [HALO Fine Art] ¡En Taller! Tu Fotolibro #${order.orderNumber} está en Impresión & Prensado`,
      sentAt: `${order.createdAt}, 16:40 hs`,
      headline: 'Revelado Químico HD & Encuadernado Artesanal',
      highlightBadge: 'FASE 2: EN PRODUCCIÓN & TALLER',
      bodyText: `¡Buenas noticias, ${order.customerName}! Los pliegos de tu fotolibro están siendo revelados en papel químico profesional de plata halide y montados sobre alma rígida para garantizar la apertura perfecta a 180° Layflat.`,
      nextStep: 'El libro permanecerá en prensa de curado por 24 hs.',
      estimatedDelivery: order.estimatedDeliveryDate,
      trackingCode: order.trackingCode,
      shippingAddress: order.shippingAddress,
      shippingMethodName: order.shippingMethod === 'pilar_direct' ? 'Entrega Propia Sin Cargo en Pilar' : 'Correo Argentino',
      itemsSummary: order.items[0]?.title || 'Fotolibro Artesanal Fine Art',
      itemPreviewUrl: order.items[0]?.previewUrl,
      read: true,
    });
  }

  if (order.status === 'enviado' || order.status === 'entregado') {
    history.push({
      id: `email-hist-3-${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      stage: 'enviado',
      subject: `📦 [HALO Fine Art] ¡En Camino! Tu Fotolibro #${order.orderNumber} fue despachado`,
      sentAt: `30 Ago 2026, 08:30 hs`,
      headline: `Tu pedido está en viaje hacia ${order.shippingCity}`,
      highlightBadge: 'FASE 3: DESPACHADO & EN RUTA',
      bodyText: `¡Tu fotolibro superó todas las pruebas de inspección de calidad! Ya fue colocado en su caja de protección y despachado desde nuestro laboratorio en Pilar hacia tu dirección (${order.shippingAddress}).`,
      nextStep: order.shippingMethod === 'pilar_direct'
        ? 'Coordinación directa de entrega en mano.'
        : `Seguimiento activo en Correo Argentino: ${order.trackingCode}`,
      estimatedDelivery: order.estimatedDeliveryDate,
      trackingCode: order.trackingCode,
      shippingAddress: order.shippingAddress,
      shippingMethodName: order.shippingMethod === 'pilar_direct' ? 'Entrega Propia Sin Cargo en Pilar' : 'Correo Argentino',
      itemsSummary: order.items[0]?.title || 'Fotolibro Artesanal Fine Art',
      itemPreviewUrl: order.items[0]?.previewUrl,
      read: false,
    });
  }

  return history;
};
