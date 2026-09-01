import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Mail,
  Truck,
  Sparkles,
  ShieldCheck,
  AlertCircle
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<TrackedOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // If the user already has placed orders in this session, show their most recent order by default
  const myRecentOrder = orders.length > 0 ? orders[0] : null;
  const activeOrder = searchedOrder || (hasSearched ? null : myRecentOrder);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === query ||
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase() === query ||
        (o.trackingCode && o.trackingCode.toLowerCase() === query)
    );
    setSearchedOrder(found || null);
  };

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

  const currentStageInfo = activeOrder ? getStageInfo(activeOrder.status) : null;
  const latestEmail = activeOrder?.emailHistory && activeOrder.emailHistory.length > 0
    ? activeOrder.emailHistory[activeOrder.emailHistory.length - 1]
    : null;

  return (
    <section id="tracker" className="py-24 bg-[#FAF8F5] border-b border-[#E8E2D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-[#8C6D37] uppercase block mb-3">
            PRODUCCIÓN ARTESANAL (4 A 6 DÍAS)
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#1F1C18] font-normal tracking-tight">
            Seguimiento de tu Fotolibro
          </h2>
          <p className="text-sm sm:text-base text-[#595248] font-light mt-4 max-w-xl mx-auto leading-relaxed">
            Consultá el avance exclusivo de tu pedido en taller y recibí notificaciones automáticas en cada etapa de confección.
          </p>
        </div>

        {/* Private Tracker Box */}
        <div className="bg-[#FDFCF9] border border-[#E8E2D5] shadow-xs max-w-4xl mx-auto">
          
          {/* Top Private Search Bar */}
          <div className="p-6 sm:p-7 bg-[#FAF8F5] border-b border-[#E8E2D5]">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ingresá tu N° de pedido (ej: HALO-849201) o tu email..."
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FDFCF9] border border-[#D6CEBE] focus:outline-none focus:border-[#1F1C18] placeholder:text-[#8C8275]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-[0.14em] font-semibold hover:bg-[#3D352E] transition-colors cursor-pointer shrink-0"
              >
                Buscar Pedido
              </button>
            </form>
            <div className="flex items-center justify-between mt-3 text-xs text-[#8C8275]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D37]" />
                Búsqueda privada protegida para clientes
              </span>
              {myRecentOrder && !searchedOrder && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchedOrder(null);
                    setHasSearched(false);
                    setSearchQuery('');
                  }}
                  className="text-[#8C6D37] hover:underline cursor-pointer font-medium"
                >
                  Ver mi pedido más reciente ({myRecentOrder.orderNumber})
                </button>
              )}
            </div>
          </div>

          {/* Order Content */}
          {activeOrder ? (
            <div className="p-6 sm:p-9 space-y-8">
              
              {/* Order Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-[#8C6D37] font-semibold">
                    Pedido #{activeOrder.orderNumber}
                  </span>
                  <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1F1C18] font-normal mt-1">
                    {activeOrder.itemTitle}
                  </h3>
                  <p className="text-sm sm:text-base text-[#595248] font-normal mt-1.5">
                    Cliente: <strong className="text-[#1F1C18] font-medium">{activeOrder.customerName}</strong> · {activeOrder.format}
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
                {activeOrder.timeline.map((step, idx) => {
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
                      <span className="text-xs uppercase font-mono text-[#8C8275] block font-medium">Último aviso enviado a tu casilla</span>
                      <p className="text-sm sm:text-base text-[#1F1C18] font-semibold mt-0.5">{latestEmail.subject}</p>
                    </div>
                  </div>
                  {onViewEmailNotification && (
                    <button
                      type="button"
                      onClick={() => onViewEmailNotification(latestEmail, activeOrder)}
                      className="px-3.5 py-1.5 border border-[#D6CEBE] text-xs uppercase tracking-wider font-mono font-medium hover:bg-[#FDFCF9] transition-colors cursor-pointer shrink-0"
                    >
                      Ver Notificación
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => onOpenTrackerModal(activeOrder.id)}
                  className="text-sm sm:text-base text-[#1F1C18] font-medium hover:underline flex items-center gap-2 cursor-pointer"
                >
                  <span>Abrir panel completo de seguimiento y remito</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#8C8275]">
                  Entrega estimada: <strong className="text-[#1F1C18] font-medium">{activeOrder.estimatedDelivery}</strong>
                </span>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-center mx-auto mb-4 text-[#8C6D37]">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-serif-luxury text-xl text-[#1F1C18] font-normal">
                {hasSearched ? "No encontramos ningún pedido con esos datos" : "Ingresá tus datos para consultar tu pedido"}
              </h4>
              <p className="text-sm text-[#736B60] font-light mt-2 max-w-md mx-auto">
                {hasSearched
                  ? "Verificá que el número de pedido (ej: HALO-849201) o el correo electrónico coincidan con los de tu compra."
                  : "Tu información es privada. Cada cliente accede únicamente al seguimiento de sus propios fotolibros ingresando su código o email."}
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
