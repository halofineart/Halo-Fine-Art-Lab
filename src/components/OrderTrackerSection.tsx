import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Truck, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Phone,
  BookOpen,
  Mail,
  Send,
  Bell
} from 'lucide-react';
import { TrackedOrder, OrderStatusStage, EmailNotification } from '../types';
import { formatPriceARS, STORE_CONFIG } from '../data/mockData';

interface OrderTrackerSectionProps {
  orders: TrackedOrder[];
  onOpenTrackerModal: (orderId?: string) => void;
  onViewEmailNotification?: (notification: EmailNotification, order: TrackedOrder) => void;
  onUpdateOrderStatus?: (orderId: string, newStage: OrderStatusStage) => void;
}

export const OrderTrackerSection: React.FC<OrderTrackerSectionProps> = ({
  orders,
  onOpenTrackerModal,
  onViewEmailNotification,
  onUpdateOrderStatus,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>(orders[0]?.id || '');

  const matchedOrder = orders.find(
    (o) =>
      o.id === activeTab ||
      (quickSearch &&
        (o.orderNumber.toLowerCase().includes(quickSearch.toLowerCase()) ||
          o.customerName.toLowerCase().includes(quickSearch.toLowerCase())))
  ) || orders[0];

  const getStageInfo = (stage: OrderStatusStage) => {
    switch (stage) {
      case 'en_diseno':
        return {
          title: 'En Diseño & Revisión',
          desc: 'Maquetación editorial y calibración de perfiles de color.',
          badge: 'bg-amber-50 text-amber-900 border-amber-200',
          stepNumber: 1,
        };
      case 'en_impresion':
        return {
          title: 'En Impresión & Taller',
          desc: 'Pliegos en papel fotográfico y encuadernado artesanal.',
          badge: 'bg-blue-50 text-blue-900 border-blue-200',
          stepNumber: 2,
        };
      case 'enviado':
        return {
          title: 'Enviado / En Camino',
          desc: 'Embalaje rígido de alta seguridad en ruta.',
          badge: 'bg-purple-50 text-purple-900 border-purple-200',
          stepNumber: 3,
        };
      case 'entregado':
        return {
          title: 'Entregado',
          desc: 'Recibido en mano con satisfacción garantizada.',
          badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          stepNumber: 4,
        };
    }
  };

  const currentStageInfo = matchedOrder ? getStageInfo(matchedOrder.status) : null;
  const latestEmail = matchedOrder?.emailHistory && matchedOrder.emailHistory.length > 0
    ? matchedOrder.emailHistory[matchedOrder.emailHistory.length - 1]
    : null;

  return (
    <section id="tracker" className="py-20 bg-[#F4EFE6]/60 border-y border-[#E8E2D5] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ECC880]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8C6D37]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE9DE] border border-[#D6CEBE] text-xs uppercase tracking-widest text-[#8C6D37] font-bold mb-3">
            <Package className="w-3.5 h-3.5" />
            <span>Seguimiento de Producción en Vivo</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#1F1C18]">
            Tracker de Pedidos & Avisos por Email
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#595248] leading-relaxed">
            Notificaciones automáticas por correo electrónico en cada etapa: diseño editorial, revelado en taller y despacho a domicilio.
          </p>
        </div>

        {/* Tracker Box */}
        <div className="bg-[#FDFCF9] rounded-3xl border border-[#D6CEBE] shadow-xl overflow-hidden max-w-5xl mx-auto">
          
          {/* Top Search & Order Selector Bar */}
          <div className="p-5 sm:p-6 bg-[#FAF7F2] border-b border-[#E8E2D5] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Quick Order Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-[#736B60] uppercase tracking-wider shrink-0 mr-1">
                Órdenes de Muestra:
              </span>
              {orders.slice(0, 3).map((ord) => {
                const isSelected = matchedOrder && matchedOrder.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(ord.id);
                      setQuickSearch('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'border-[#8C6D37] bg-[#8C6D37] text-white shadow-xs'
                        : 'border-[#D6CEBE] bg-[#FDFCF9] text-[#595248] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    #{ord.orderNumber} ({ord.customerName.split(' ')[0]})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Ingresar Nº de Orden..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] text-xs text-[#1F1C18] focus:border-[#8C6D37] focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {matchedOrder ? (
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8C6D37]">ORDEN DE COMPRA</span>
                    <span className="text-xs text-[#736B60]">· Ingresada el {matchedOrder.createdAt}</span>
                  </div>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1F1C18]">
                    {matchedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-[#595248] mt-0.5">
                    Cliente: <strong className="text-[#1F1C18]">{matchedOrder.customerName}</strong> ({matchedOrder.customerEmail}) · Destino: {matchedOrder.shippingCity}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {currentStageInfo && (
                    <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${currentStageInfo.badge}`}>
                      {currentStageInfo.title}
                    </span>
                  )}

                  {latestEmail && onViewEmailNotification && (
                    <button
                      type="button"
                      onClick={() => onViewEmailNotification(latestEmail, matchedOrder)}
                      className="px-3.5 py-1.5 rounded-xl border border-[#8C6D37] bg-[#FDFCF9] text-xs font-semibold text-[#8C6D37] hover:bg-[#EFE9DE] transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Ver Email Enviado</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenTrackerModal(matchedOrder.id)}
                    className="px-4 py-2 rounded-full border border-[#D6CEBE] bg-[#FAF7F2] text-xs font-semibold text-[#1F1C18] hover:bg-[#EFE9DE] transition-colors flex items-center gap-1.5"
                  >
                    <span>Ver Detalle Completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3 Key Stages Visual Stepper */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                  {[
                    {
                      id: 'en_diseno',
                      title: '1. En Diseño & Maquetación',
                      desc: 'Selección de fotografías, diagramación editorial y calibración de color.',
                      icon: Sparkles,
                      isCompleted: matchedOrder.status !== 'en_diseno',
                      isCurrent: matchedOrder.status === 'en_diseno',
                      emailLabel: 'Email: Confirmación & Diseño',
                    },
                    {
                      id: 'en_impresion',
                      title: '2. En Impresión & Encuadernado',
                      desc: 'Revelado químico HD, prensado Layflat y estampado Hot Stamping en taller.',
                      icon: Layers,
                      isCompleted: matchedOrder.status === 'enviado' || matchedOrder.status === 'entregado',
                      isCurrent: matchedOrder.status === 'en_impresion',
                      emailLabel: 'Email: En Prensa & Taller',
                    },
                    {
                      id: 'enviado',
                      title: '3. Despachado & En Camino',
                      desc: 'Embalaje rígido protector en camino a domicilio (Zona Pilar o Correo).',
                      icon: Truck,
                      isCompleted: matchedOrder.status === 'entregado',
                      isCurrent: matchedOrder.status === 'enviado',
                      emailLabel: 'Email: Guía de Despacho',
                    },
                  ].map((step, idx) => {
                    return (
                      <div
                        key={step.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          step.isCurrent
                            ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-md ring-2 ring-[#8C6D37]/20'
                            : step.isCompleted
                            ? 'border-emerald-200 bg-emerald-50/40 text-[#1F1C18]'
                            : 'border-[#E8E2D5] bg-[#FAF7F2]/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              step.isCurrent
                                ? 'bg-[#8C6D37] text-white'
                                : step.isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#EFE9DE] text-[#8C8275]'
                            }`}
                          >
                            {step.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <step.icon className="w-5 h-5" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              step.isCurrent
                                ? 'bg-amber-100 text-amber-900 font-bold'
                                : step.isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {step.isCompleted ? 'Completado' : step.isCurrent ? 'En Curso' : 'Pendiente'}
                          </span>
                        </div>

                        <h4 className="font-serif-luxury text-base font-bold text-[#1F1C18] mb-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-[#595248] leading-relaxed mb-3">
                          {step.desc}
                        </p>

                        <div className="pt-2 border-t border-[#E8E2D5]/70 flex items-center gap-1.5 text-[11px] text-[#736B60]">
                          <Mail className="w-3 h-3 text-[#8C6D37]" />
                          <span>{step.emailLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time & Delivery Highlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#D6CEBE] bg-[#F4EFE6] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-[#595248]">
                  <Clock className="w-5 h-5 text-[#8C6D37] shrink-0" />
                  <div>
                    <span className="font-bold text-[#1F1C18] block text-sm">
                      Tiempo Estimado de Entrega: 4 a 6 días hábiles
                    </span>
                    <span>
                      Laboratorio propio en Pilar (Zona Norte, Bs. As.) · Entrega sin cargo en 20 km o por Correo a todo el país.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <a
                    href={`https://wa.me/${STORE_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                      `¡Hola HALO Fine Art Lab! Consulto por mi pedido ${matchedOrder.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Directo</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenTrackerModal(matchedOrder.id)}
                    className="px-4 py-2.5 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs font-semibold hover:bg-[#3D352E] transition-colors w-full sm:w-auto text-center"
                  >
                    Abrir Tracker
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-[#A89F91] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1F1C18]">No se encontró ninguna orden con ese criterio.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

