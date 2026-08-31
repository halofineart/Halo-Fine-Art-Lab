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
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-medium tracking-[0.25em] text-[#8C8275] uppercase block mb-2">
            PRODUCCIÓN ARTESANAL (4 A 6 DÍAS)
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#1F1C18] font-normal">
            Seguimiento de tu Fotolibro
          </h2>
          <p className="text-xs sm:text-sm text-[#736B60] font-light mt-3">
            Notificaciones automáticas por correo electrónico en cada etapa: diseño, revelado en taller y despacho.
          </p>
        </div>

        {/* Tracker Box */}
        <div className="bg-[#FDFCF9] border border-[#E8E2D5] shadow-xs max-w-4xl mx-auto">
          
          {/* Top Search & Order Selector Bar */}
          <div className="p-5 bg-[#FAF8F5] border-b border-[#E8E2D5] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Quick Order Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-[11px] font-mono text-[#8C8275] uppercase tracking-wider shrink-0 mr-1">
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
                    className={`px-3 py-1.5 text-xs font-mono transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-[#1F1C18] bg-[#1F1C18] text-[#FDFCF9]'
                        : 'border-[#E8E2D5] bg-[#FDFCF9] text-[#736B60] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    #{ord.orderNumber}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Buscar por Nº o Nombre..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FDFCF9] border border-[#E8E2D5] focus:outline-none focus:border-[#1F1C18]"
              />
            </div>
          </div>

          {/* Active Order Details */}
          {matchedOrder ? (
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Order Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C8275]">
                    Pedido #{matchedOrder.orderNumber}
                  </span>
                  <h3 className="font-serif-luxury text-2xl text-[#1F1C18] font-normal mt-0.5">
                    {matchedOrder.itemTitle}
                  </h3>
                  <p className="text-xs text-[#736B60] font-light mt-1">
                    Cliente: {matchedOrder.customerName} · {matchedOrder.format} · Total: {formatPriceARS(matchedOrder.totalPrice)} ARS
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-mono text-[#8C8275] block">Estado Actual</span>
                  <span className="inline-block px-3 py-1 bg-[#FAF8F5] border border-[#E8E2D5] text-xs font-serif-luxury text-[#1F1C18] mt-1">
                    {currentStageInfo?.title}
                  </span>
                </div>
              </div>

              {/* 4 Steps Minimalist Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {matchedOrder.timeline.map((step, idx) => {
                  return (
                    <div
                      key={step.stage}
                      className={`p-4 border transition-all ${
                        step.current
                          ? 'border-[#1F1C18] bg-[#FAF8F5]'
                          : step.completed
                          ? 'border-[#E8E2D5] bg-[#FDFCF9]'
                          : 'border-[#E8E2D5]/50 bg-[#FDFCF9] opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-[#8C8275]">0{idx + 1}</span>
                        {step.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6D37]" />
                        ) : step.current ? (
                          <span className="w-2 h-2 rounded-full bg-[#1F1C18] animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#E8E2D5]" />
                        )}
                      </div>
                      <h4 className="font-serif-luxury text-sm text-[#1F1C18] font-normal">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-[#736B60] font-light mt-1 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Latest Automated Email preview banner */}
              {latestEmail && (
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#8C6D37] shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#8C8275] block">Último aviso enviado al cliente</span>
                      <p className="text-xs text-[#1F1C18] font-medium">{latestEmail.subject}</p>
                    </div>
                  </div>
                  {onViewEmailNotification && (
                    <button
                      type="button"
                      onClick={() => onViewEmailNotification(latestEmail, matchedOrder)}
                      className="px-3 py-1 border border-[#D6CEBE] text-[11px] uppercase tracking-wider font-mono hover:bg-[#FDFCF9] transition-colors cursor-pointer shrink-0"
                    >
                      Ver Email
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenTrackerModal(matchedOrder.id)}
                  className="text-xs text-[#1F1C18] font-medium hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir vista detallada de seguimiento</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {onUpdateOrderStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8C8275]">Simular avance:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const stages: OrderStatusStage[] = ['en_diseno', 'en_impresion', 'enviado', 'entregado'];
                        const curIdx = stages.indexOf(matchedOrder.status);
                        const nextStage = stages[(curIdx + 1) % stages.length];
                        onUpdateOrderStatus(matchedOrder.id, nextStage);
                      }}
                      className="px-2.5 py-1 bg-[#1F1C18] text-[#FDFCF9] text-[10px] font-mono uppercase tracking-wider hover:bg-[#3D352E] cursor-pointer"
                    >
                      Siguiente Etapa
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#8C8275] font-light">
              No se encontraron pedidos con ese criterio.
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
