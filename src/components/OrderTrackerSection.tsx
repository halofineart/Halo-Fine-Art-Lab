import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Mail,
  Send,
} from 'lucide-react';
import { TrackedOrder, OrderStatusStage, EmailNotification } from '../types';
import { formatPriceARS } from '../data/mockData';

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
          stepNumber: 1,
        };
      case 'en_impresion':
        return {
          title: 'En Impresión & Taller',
          desc: 'Pliegos en papel fotográfico y encuadernado artesanal.',
          stepNumber: 2,
        };
      case 'enviado':
        return {
          title: 'Enviado / En Camino',
          desc: 'Embalaje rígido de alta seguridad en ruta.',
          stepNumber: 3,
        };
      case 'entregado':
        return {
          title: 'Entregado',
          desc: 'Recibido en mano con satisfacción garantizada.',
          stepNumber: 4,
        };
    }
  };

  const currentStageInfo = matchedOrder ? getStageInfo(matchedOrder.status) : null;
  const latestEmail = matchedOrder?.emailHistory && matchedOrder.emailHistory.length > 0
    ? matchedOrder.emailHistory[matchedOrder.emailHistory.length - 1]
    : null;

  return (
    <section id="tracker" className="py-24 bg-[#FAF8F5] border-b border-[#E8E2D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#8C6D37] uppercase block mb-3">
            PRODUCCIÓN ARTESANAL (4 A 6 DÍAS)
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] font-normal tracking-tight">
            Seguimiento de tu Fotolibro
          </h2>
          <p className="text-sm sm:text-base text-[#595248] font-light mt-4 max-w-xl mx-auto leading-relaxed">
            Notificaciones automáticas por correo electrónico en cada etapa: diseño, revelado en taller y despacho.
          </p>
        </div>

        {/* Tracker Box */}
        <div className="bg-[#FDFCF9] border border-[#E8E2D5] shadow-sm max-w-4xl mx-auto">
          
          {/* Top Search & Order Selector Bar */}
          <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E8E2D5] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Quick Order Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs sm:text-sm font-mono text-[#595248] uppercase tracking-wider shrink-0 mr-1 font-semibold">
                Órdenes:
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
                    className={`px-3.5 py-2 text-xs sm:text-sm font-mono transition-all border cursor-pointer font-medium ${
                      isSelected
                        ? 'border-[#1F1C18] bg-[#1F1C18] text-[#FDFCF9]'
                        : 'border-[#D6CEBE] bg-[#FDFCF9] text-[#595248] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    #{ord.orderNumber}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Buscar por Nº o Nombre..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#FDFCF9] border border-[#D6CEBE] focus:outline-none focus:border-[#1F1C18] placeholder:text-[#8C8275]"
              />
            </div>
          </div>

          {/* Active Order Details */}
          {matchedOrder ? (
            <div className="p-6 sm:p-9 space-y-8">
              
              {/* Order Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-[#8C6D37] font-semibold">
                    Pedido #{matchedOrder.orderNumber}
                  </span>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1F1C18] font-normal mt-1">
                    {matchedOrder.itemTitle}
                  </h3>
                  <p className="text-sm sm:text-base text-[#595248] font-normal mt-1.5">
                    Cliente: <strong className="text-[#1F1C18] font-medium">{matchedOrder.customerName}</strong> · {matchedOrder.format} · Total: <strong className="text-[#1F1C18] font-semibold">{formatPriceARS(matchedOrder.totalPrice)} ARS</strong>
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs uppercase font-mono text-[#8C8275] block font-medium">Estado Actual</span>
                  <span className="inline-block px-4 py-1.5 bg-[#FAF8F5] border border-[#D6CEBE] text-xs sm:text-sm font-serif-luxury font-medium text-[#1F1C18] mt-1">
                    {currentStageInfo?.title}
                  </span>
                </div>
              </div>

              {/* 4 Steps Minimalist Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {matchedOrder.timeline.map((step, idx) => {
                  return (
                    <div
                      key={step.stage}
                      className={`p-4 sm:p-5 border transition-all ${
                        step.current
                          ? 'border-[#1F1C18] bg-[#FAF8F5] shadow-2xs ring-1 ring-[#1F1C18]/10'
                          : step.completed
                          ? 'border-[#D6CEBE] bg-[#FDFCF9]'
                          : 'border-[#E8E2D5] bg-[#FDFCF9] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-mono font-semibold text-[#8C6D37]">0{idx + 1}</span>
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#8C6D37]" />
                        ) : step.current ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1F1C18] animate-pulse" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D6CEBE]" />
                        )}
                      </div>
                      <h4 className="font-serif-luxury text-base sm:text-lg text-[#1F1C18] font-normal leading-snug">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#595248] font-normal mt-2 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Latest Automated Email preview banner */}
              {latestEmail && (
                <div className="p-4 sm:p-5 bg-[#FAF8F5] border border-[#D6CEBE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Mail className="w-5 h-5 text-[#8C6D37] shrink-0" />
                    <div>
                      <span className="text-xs uppercase font-mono text-[#8C8275] block font-medium">Último aviso enviado al cliente</span>
                      <p className="text-sm sm:text-base text-[#1F1C18] font-semibold mt-0.5">{latestEmail.subject}</p>
                    </div>
                  </div>
                  {onViewEmailNotification && (
                    <button
                      type="button"
                      onClick={() => onViewEmailNotification(latestEmail, matchedOrder)}
                      className="px-3.5 py-1.5 border border-[#D6CEBE] text-xs uppercase tracking-wider font-mono font-medium hover:bg-[#FDFCF9] transition-colors cursor-pointer shrink-0"
                    >
                      Ver Email
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => onOpenTrackerModal(matchedOrder.id)}
                  className="text-sm sm:text-base text-[#1F1C18] font-medium hover:underline flex items-center gap-2 cursor-pointer"
                >
                  <span>Abrir vista detallada de seguimiento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onUpdateOrderStatus && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-[#736B60] font-medium">Simular avance:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const stages: OrderStatusStage[] = ['en_diseno', 'en_impresion', 'enviado', 'entregado'];
                        const curIdx = stages.indexOf(matchedOrder.status);
                        const nextStage = stages[(curIdx + 1) % stages.length];
                        onUpdateOrderStatus(matchedOrder.id, nextStage);
                      }}
                      className="px-3.5 py-1.5 bg-[#1F1C18] text-[#FDFCF9] text-xs font-mono uppercase tracking-wider font-semibold hover:bg-[#3D352E] cursor-pointer shadow-2xs"
                    >
                      Siguiente Etapa
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-sm text-[#736B60] font-light">
              No se encontraron pedidos con ese criterio.
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
