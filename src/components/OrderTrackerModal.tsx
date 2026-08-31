import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw,
  Gift,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Printer,
  Mail,
  Send,
  Bell,
  Cloud,
  HardDrive,
  Upload,
  Copy,
  ExternalLink
} from 'lucide-react';
import { TrackedOrder, OrderStatusStage, EmailNotification } from '../types';
import { generateAutomatedCloudFolder } from '../lib/cloudStorageService';
import { formatPriceARS, STORE_CONFIG } from '../data/mockData';

interface OrderTrackerModalProps {
  orders: TrackedOrder[];
  selectedOrderId?: string;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, newStage: OrderStatusStage) => void;
  onViewEmailNotification?: (notification: EmailNotification, order: TrackedOrder) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  orders,
  selectedOrderId,
  onClose,
  onUpdateOrderStatus,
  onViewEmailNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrderId || (orders.length > 0 ? orders[0].id : '')
  );
  const [filterStage, setFilterStage] = useState<'all' | OrderStatusStage>('all');

  // Search filter
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.trackingCode && ord.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStage = filterStage === 'all' || ord.status === filterStage;
    return matchesSearch && matchesStage;
  });

  const currentOrder = orders.find((o) => o.id === activeOrderId) || filteredOrders[0] || orders[0];

  const getStageBadge = (stage: OrderStatusStage) => {
    switch (stage) {
      case 'en_diseno':
        return {
          label: 'En Diseño & Revisión',
          bgColor: 'bg-amber-50 text-amber-900 border-amber-200',
          dotColor: 'bg-amber-500',
          icon: Sparkles,
          progress: 25,
        };
      case 'en_impresion':
        return {
          label: 'En Impresión & Taller',
          bgColor: 'bg-blue-50 text-blue-900 border-blue-200',
          dotColor: 'bg-blue-600',
          icon: Layers,
          progress: 55,
        };
      case 'enviado':
        return {
          label: 'En Camino / Despachado',
          bgColor: 'bg-purple-50 text-purple-900 border-purple-200',
          dotColor: 'bg-purple-600',
          icon: Truck,
          progress: 85,
        };
      case 'entregado':
        return {
          label: 'Entregado con Éxito',
          bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          dotColor: 'bg-emerald-600',
          icon: CheckCircle2,
          progress: 100,
        };
    }
  };

  const currentBadge = currentOrder ? getStageBadge(currentOrder.status) : null;
  const latestEmail = currentOrder?.emailHistory && currentOrder.emailHistory.length > 0
    ? currentOrder.emailHistory[currentOrder.emailHistory.length - 1]
    : null;

  const whatsappInquiryUrl = currentOrder
    ? `https://wa.me/${STORE_CONFIG.whatsappRaw}?text=${encodeURIComponent(
        `¡Hola HALO Fine Art Lab! Quisiera consultar el estado de mi pedido ${currentOrder.orderNumber} a nombre de ${currentOrder.customerName}.`
      )}`
    : `https://wa.me/${STORE_CONFIG.whatsappRaw}`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative my-auto w-full max-w-5xl rounded-3xl border border-[#D6CEBE] bg-[#FDFCF9] shadow-2xl overflow-hidden text-[#1F1C18] flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#E8E2D5] bg-[#F4EFE6] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFE9DE] border border-[#D6CEBE] flex items-center justify-center text-[#8C6D37]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#8C6D37] uppercase">
                  SEGUIMIENTO EN TIEMPO REAL
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline-block text-[11px] text-[#736B60]">
                  Laboratorio Pilar (Bs. As.)
                </span>
              </div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#1F1C18]">
                Tracker de Pedido & Historial
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#736B60] hover:bg-[#E8E2D5] hover:text-[#1F1C18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main 2-Column Body Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E2D5]">
          
          {/* Left Column: Order List & Search (4 cols on lg) */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-[#FAF7F2]/60 flex flex-col gap-4 overflow-y-auto">
            {/* Search Input */}
            <div>
              <label className="text-xs font-semibold text-[#1F1C18] block mb-1.5">
                Buscar por Nº de Orden o Nombre
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C8275] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej: HALO-849201, Rossi, Valentina..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] text-xs text-[#1F1C18] focus:border-[#8C6D37] focus:outline-none shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C8275] hover:text-[#1F1C18]"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'en_diseno', label: 'Diseño' },
                { id: 'en_impresion', label: 'Taller' },
                { id: 'enviado', label: 'Enviados' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStage(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-colors ${
                    filterStage === f.id
                      ? 'border-[#8C6D37] bg-[#8C6D37] text-white shadow-xs'
                      : 'border-[#D6CEBE] bg-[#FDFCF9] text-[#595248] hover:bg-[#EFE9DE]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-2.5 flex-1">
              <span className="text-[11px] font-semibold text-[#736B60] uppercase tracking-wider block">
                Tus Pedidos ({filteredOrders.length})
              </span>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-[#D6CEBE] bg-[#FDFCF9]">
                  <Package className="w-8 h-8 text-[#A89F91] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[#1F1C18]">No se encontraron pedidos</p>
                  <p className="text-[11px] text-[#736B60] mt-0.5">
                    Probá ingresando el código completo o limpiando la búsqueda.
                  </p>
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getStageBadge(ord.status);
                  const isSelected = currentOrder && currentOrder.id === ord.id;
                  const emailCount = ord.emailHistory?.length || 0;

                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setActiveOrderId(ord.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-md ring-1 ring-[#8C6D37]'
                          : 'border-[#E8E2D5] bg-[#FDFCF9] hover:bg-[#F4EFE6]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-[#8C6D37]">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bgColor}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#1F1C18] line-clamp-1">
                        {ord.items[0]?.title || 'Fotolibro Fine Art'}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-[#736B60] mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#8C6D37]" />
                          <span>{emailCount} emails</span>
                        </span>
                        <span className="font-semibold text-[#1F1C18]">
                          {formatPriceARS(ord.totalPrice)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick helper note */}
            <div className="p-3 rounded-xl border border-[#D6CEBE] bg-[#F4EFE6] text-[11px] text-[#595248] space-y-1">
              <div className="flex items-center gap-1.5 text-[#1F1C18] font-bold">
                <Bell className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>Notificaciones Automáticas</span>
              </div>
              <p>
                El cliente recibe un correo electrónico verificado al momento en que su libro ingresa a diseño, impresión y despacho.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Tracker View (8 cols on lg) */}
          <div className="lg:col-span-8 p-5 sm:p-7 overflow-y-auto space-y-6">
            {currentOrder ? (
              <>
                {/* 1. Header Card with Order ID & Status */}
                <div className="rounded-2xl border border-[#D6CEBE] bg-[#F4EFE6]/60 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest text-[#8C6D37] uppercase">
                          PEDIDO CONFIRMADO
                        </span>
                        <span className="text-xs text-[#736B60]">· Creado el {currentOrder.createdAt}</span>
                      </div>
                      <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">
                        Orden {currentOrder.orderNumber}
                      </h3>
                      <p className="text-xs text-[#595248]">
                        Cliente: <strong className="text-[#1F1C18]">{currentOrder.customerName}</strong> ({currentOrder.customerEmail})
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Email Notifications Button */}
                      {latestEmail && onViewEmailNotification && (
                        <button
                          type="button"
                          onClick={() => onViewEmailNotification(latestEmail, currentOrder)}
                          className="px-3.5 py-2 rounded-xl border border-[#8C6D37] bg-[#FDFCF9] text-xs font-semibold text-[#8C6D37] hover:bg-[#EFE9DE] transition-all flex items-center gap-1.5 shadow-xs"
                          title="Ver emails enviados al cliente"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Emails ({currentOrder.emailHistory?.length || 1})</span>
                        </button>
                      )}

                      {currentBadge && (
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${currentBadge.bgColor}`}>
                          <currentBadge.icon className="w-4 h-4 shrink-0" />
                          <div className="text-left">
                            <span className="text-[10px] uppercase tracking-wider block opacity-75">Estado Actual</span>
                            <span className="text-xs font-bold">{currentBadge.label}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Automated Email Status Banner */}
                  <div className="rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#1F1C18]">Notificaciones por Email:</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                            Activas
                          </span>
                        </div>
                        <p className="text-[#736B60] text-[11px] mt-0.5">
                          Enviando avisos instantáneos a <strong className="text-[#1F1C18]">{currentOrder.customerEmail}</strong> con cada cambio de fase.
                        </p>
                      </div>
                    </div>

                    {latestEmail && onViewEmailNotification && (
                      <button
                        type="button"
                        onClick={() => onViewEmailNotification(latestEmail, currentOrder)}
                        className="text-xs font-bold text-[#8C6D37] hover:text-[#73582A] underline flex items-center gap-1 shrink-0"
                      >
                        <span>Ver Último Email Enviado</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Estimated Delivery Banner */}
                  <div className="rounded-xl border border-[#C5A059]/40 bg-[#FDFCF9] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F4EFE6] border border-[#D6CEBE] flex items-center justify-center text-[#8C6D37] shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1F1C18]">
                            Tiempo de Elaboración & Entrega:
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#EFE9DE] text-[#8C6D37] text-[11px] font-bold">
                            {currentOrder.estimatedDays}
                          </span>
                        </div>
                        <p className="text-xs text-[#595248] mt-0.5">
                          Fecha estimada de recepción: <strong className="text-[#1F1C18]">{currentOrder.estimatedDeliveryDate}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-right sm:border-l sm:border-[#E8E2D5] sm:pl-4">
                      <span className="text-[10px] text-[#736B60] uppercase block">Origen de Despacho</span>
                      <span className="font-semibold text-[#1F1C18]">Taller Pilar, Bs. As.</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  {currentBadge && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-[#736B60]">
                        <span>Progreso del Libro</span>
                        <span className="font-bold text-[#1F1C18]">{currentBadge.progress}% Completado</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E8E2D5] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C5A059] to-[#8C6D37] transition-all duration-500 rounded-full"
                          style={{ width: `${currentBadge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CUSTOMER HIGH-RES CLOUD FOLDER UPLOAD ZONE (GOOGLE DRIVE & MEGA.NZ) */}
                  {(() => {
                    const cloudFolder = generateAutomatedCloudFolder(currentOrder);
                    return (
                      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-[#F7FAFE] to-[#F0F5FF] p-4 sm:p-5 space-y-3 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Cloud className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-serif-luxury font-bold text-sm sm:text-base text-[#1F1C18]">
                                Carpeta Cloud del Pedido · Subida en Alta Resolución
                              </h4>
                              <p className="text-[11px] text-[#736B60]">
                                Carpeta asignada: <strong className="text-blue-900 font-mono">{cloudFolder.folderName}</strong>
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 self-start sm:self-auto">
                            Google Drive & MEGA.NZ
                          </span>
                        </div>

                        <p className="text-xs text-[#595248] leading-relaxed">
                          ¿Tenés fotos adicionales o querés enviar los archivos originales en RAW / máxima calidad para revelado químico Fuji? Podés subirlas directamente a la carpeta segura de tu pedido.
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <a
                            href={cloudFolder.googleDriveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                          >
                            <Cloud className="w-4 h-4" />
                            <span>Abrir en Google Drive</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>

                          <a
                            href={cloudFolder.megaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                          >
                            <HardDrive className="w-4 h-4" />
                            <span>Abrir en MEGA.NZ</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cloudFolder.googleDriveUrl);
                              alert('Enlace copiado al portapapeles.');
                            }}
                            className="px-3.5 py-2 rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] hover:bg-[#EFE9DE] text-[#1F1C18] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#8C6D37]" />
                            <span>Copiar Enlace</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Visual Stepper Timeline */}
                <div className="space-y-3">
                  <h4 className="font-serif-luxury text-base font-bold text-[#1F1C18] border-b border-[#E8E2D5] pb-2 flex items-center justify-between">
                    <span>Etapas de Elaboración Artesanal</span>
                    <span className="text-xs font-normal text-[#736B60] font-sans">
                      4 pasos de producción
                    </span>
                  </h4>

                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E2D5]">
                    {currentOrder.timeline.map((step, idx) => {
                      const isDone = step.completed;
                      const isCurrent = step.current;

                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          {/* Dot / Icon */}
                          <div
                            className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full border flex items-center justify-center text-xs transition-all ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : isCurrent
                                ? 'bg-[#8C6D37] border-[#8C6D37] text-white ring-4 ring-[#8C6D37]/20 animate-pulse'
                                : 'bg-[#FDFCF9] border-[#D6CEBE] text-[#A89F91]'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                            ) : isCurrent ? (
                              <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                            ) : (
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                            )}
                          </div>

                          {/* Content */}
                          <div
                            className={`flex-1 p-3.5 rounded-xl border transition-all ${
                              isCurrent
                                ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-sm'
                                : isDone
                                ? 'border-[#E8E2D5] bg-[#FAF7F2]/50'
                                : 'border-[#E8E2D5]/60 bg-[#FDFCF9]/50 opacity-75'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-xs font-bold ${
                                  isCurrent ? 'text-[#8C6D37]' : 'text-[#1F1C18]'
                                }`}
                              >
                                {step.title}
                              </span>
                              <span className="text-[11px] text-[#736B60] font-mono">
                                {step.date} {step.time ? `· ${step.time}` : ''}
                              </span>
                            </div>
                            <p className="text-xs text-[#595248] leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Book Details & Delivery Destination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Item Breakdown */}
                  <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFCF9] p-4 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D37] block">
                      Detalle de los Álbumes
                    </span>

                    {currentOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {item.previewUrl && (
                          <img
                            src={item.previewUrl}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover border border-[#D6CEBE] shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="text-xs space-y-0.5">
                          <h5 className="font-bold text-[#1F1C18]">{item.title}</h5>
                          <p className="text-[#595248]">{item.format}</p>
                          <p className="text-[#736B60] text-[11px]">
                            {item.cover} · {item.foil} · {item.pages} págs.
                          </p>
                          {item.hasGiftBox && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Gift className="w-3 h-3 text-amber-700" /> Caja Rígida Incluida
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-[#E8E2D5] pt-2 flex justify-between text-xs font-bold text-[#1F1C18]">
                      <span>Total Abonado:</span>
                      <span className="font-serif-luxury text-base text-[#8C6D37]">
                        {formatPriceARS(currentOrder.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Destination & Logistics */}
                  <div className="rounded-2xl border border-[#E8E2D5] bg-[#FDFCF9] p-4 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6D37] block">
                      Destino & Entrega
                    </span>

                    <div className="space-y-2 text-xs text-[#595248]">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#8C6D37] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#1F1C18] block">{currentOrder.shippingAddress}</strong>
                          <span>{currentOrder.shippingCity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Truck className="w-4 h-4 text-[#8C6D37] shrink-0" />
                        <span>
                          {currentOrder.shippingMethod === 'pilar_direct'
                            ? 'Entrega propia directa (Zona Pilar / 20km Sin Cargo)'
                            : 'Envío Asegurado por Correo Argentino'}
                        </span>
                      </div>

                      {currentOrder.trackingCode && (
                        <div className="p-2 rounded-xl bg-[#F4EFE6] text-[11px] font-mono text-[#1F1C18] flex items-center justify-between">
                          <span className="text-[#736B60]">Código de Guía:</span>
                          <span className="font-bold">{currentOrder.trackingCode}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[11px]">
                        <CreditCard className="w-3.5 h-3.5 text-[#736B60]" />
                        <span>{currentOrder.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Lab Notes & Interactive Stage Simulation (for testing) */}
                {currentOrder.labNotes && (
                  <div className="rounded-xl border border-[#D6CEBE] bg-[#FAF7F2] p-3 text-xs text-[#595248] flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#8C6D37] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1F1C18] block">Nota del Maestro Encuadernador:</strong>
                      <span>{currentOrder.labNotes}</span>
                    </div>
                  </div>
                )}

                {/* Simulation controls & WhatsApp Contact bar */}
                <div className="pt-3 border-t border-[#E8E2D5] flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Status switcher for demo / testing with automatic email dispatch label */}
                  {onUpdateOrderStatus && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#736B60]">
                      <span className="flex items-center gap-1 font-semibold text-[#1F1C18]">
                        <Send className="w-3 h-3 text-[#8C6D37]" />
                        <span>Simular Cambio de Estado:</span>
                      </span>
                      <select
                        value={currentOrder.status}
                        onChange={(e) =>
                          onUpdateOrderStatus(currentOrder.id, e.target.value as OrderStatusStage)
                        }
                        className="rounded-lg border border-[#D6CEBE] bg-[#FDFCF9] px-2.5 py-1 text-xs font-semibold text-[#1F1C18] focus:border-[#8C6D37] focus:outline-none shadow-xs"
                      >
                        <option value="en_diseno">1. En Diseño (Dispara Email)</option>
                        <option value="en_impresion">2. En Impresión (Dispara Email)</option>
                        <option value="enviado">3. Enviado (Dispara Email)</option>
                        <option value="entregado">4. Entregado (Dispara Email)</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <a
                      href={whatsappInquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Consultar por WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E]"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-16 text-center space-y-3">
                <Package className="w-12 h-12 text-[#A89F91] mx-auto opacity-50" />
                <h3 className="font-serif-luxury text-xl font-bold text-[#1F1C18]">
                  Seleccioná un pedido para ver su seguimiento
                </h3>
                <p className="text-xs text-[#736B60]">
                  Hacé clic en cualquiera de los pedidos del panel izquierdo.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

