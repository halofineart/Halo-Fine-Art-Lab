import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Sparkles, 
  Layers, 
  Phone, 
  MapPin, 
  Copy, 
  Send, 
  ExternalLink,
  ShieldCheck,
  Package,
  Calendar,
  Gift
} from 'lucide-react';
import { EmailNotification, TrackedOrder, OrderStatusStage } from '../types';
import { STORE_CONFIG, formatPriceARS } from '../data/mockData';

interface EmailViewerModalProps {
  notification: EmailNotification;
  order?: TrackedOrder;
  emailHistory?: EmailNotification[];
  onClose: () => void;
  onSelectHistoricalEmail?: (email: EmailNotification) => void;
  onResendEmail?: (email: EmailNotification) => void;
  onOpenTracker?: (orderId: string) => void;
}

export const EmailViewerModal: React.FC<EmailViewerModalProps> = ({
  notification,
  order,
  emailHistory = [],
  onClose,
  onSelectHistoricalEmail,
  onResendEmail,
  onOpenTracker,
}) => {
  const [copied, setCopied] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const activeEmail = notification;

  const handleCopy = () => {
    const textToCopy = `Asunto: ${activeEmail.subject}\nPara: ${activeEmail.customerEmail}\n\n${activeEmail.headline}\n\n${activeEmail.bodyText}\n\nPróximo paso: ${activeEmail.nextStep}\nEntrega estimada: ${activeEmail.estimatedDelivery}\nHALO Fine Art Lab - Pilar, Bs. As.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResend = () => {
    if (onResendEmail) {
      onResendEmail(activeEmail);
    }
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto w-full max-w-4xl rounded-3xl border border-[#D6CEBE] bg-[#FDFCF9] shadow-2xl overflow-hidden text-[#1F1C18] flex flex-col max-h-[94vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E8E2D5] bg-[#F4EFE6] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8C6D37] text-white flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#8C6D37] uppercase">
                  NOTIFICACIÓN AUTOMÁTICA POR EMAIL
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-[#736B60]">Disparador de Estado en Vivo</span>
              </div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#1F1C18]">
                Vista Previa de Correo al Cliente
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FDFCF9] text-xs font-semibold text-[#595248] hover:bg-[#EFE9DE] transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#736B60] hover:bg-[#E8E2D5] hover:text-[#1F1C18] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Content if History exists, otherwise full container */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#E8E2D5]">
          
          {/* Left Column: Email History list (if more than 1 email) */}
          {emailHistory && emailHistory.length > 0 && (
            <div className="md:col-span-4 p-4 bg-[#FAF7F2] space-y-3 overflow-y-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#736B60] block">
                Historial de Avisos ({emailHistory.length})
              </span>

              <div className="space-y-2">
                {emailHistory.map((item) => {
                  const isSelected = item.id === activeEmail.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectHistoricalEmail && onSelectHistoricalEmail(item)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#8C6D37] bg-[#FDFCF9] shadow-md ring-1 ring-[#8C6D37]'
                          : 'border-[#E8E2D5] bg-[#FDFCF9] hover:bg-[#F4EFE6]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#8C6D37] font-bold mb-1">
                        <span className="uppercase">{item.highlightBadge.split(':')[0] || 'AVISO'}</span>
                        <span className="font-mono text-[#736B60]">{item.sentAt.split(',')[0]}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1F1C18] line-clamp-1">
                        {item.headline}
                      </h4>
                      <p className="text-[11px] text-[#736B60] line-clamp-1 mt-0.5">
                        {item.subject}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Email dispatch info */}
              <div className="p-3 rounded-xl border border-[#D6CEBE] bg-[#F4EFE6] text-xs text-[#595248] space-y-1 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-[#1F1C18]">
                  <Send className="w-3.5 h-3.5 text-[#8C6D37]" />
                  <span>Automatización Activa</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Cada vez que el taller de Pilar avanza de estado, el cliente recibe este email en tiempo real con su guía de seguimiento.
                </p>
              </div>
            </div>
          )}

          {/* Right Column: Full Email Rendering */}
          <div className={`${emailHistory.length > 0 ? 'md:col-span-8' : 'md:col-span-12'} p-4 sm:p-7 overflow-y-auto bg-[#F6F3EC]`}>
            
            {/* Email Client Header Metadata Card */}
            <div className="bg-[#FDFCF9] rounded-2xl border border-[#D6CEBE] p-4 sm:p-5 mb-4 shadow-sm text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8E2D5]">
                <div className="space-y-0.5">
                  <p className="text-[#595248]">
                    <strong className="text-[#1F1C18]">De:</strong> HALO Fine Art Lab &lt;notificaciones@halofineart.com.ar&gt;
                  </p>
                  <p className="text-[#595248]">
                    <strong className="text-[#1F1C18]">Para:</strong> {activeEmail.customerName} &lt;{activeEmail.customerEmail}&gt;
                  </p>
                </div>
                <div className="text-right text-[11px] text-[#736B60] font-mono">
                  {activeEmail.sentAt}
                </div>
              </div>

              <div>
                <span className="text-[#736B60]">Asunto: </span>
                <strong className="text-[#1F1C18] text-sm">{activeEmail.subject}</strong>
              </div>
            </div>

            {/* Rendered HTML Email Body Canvas */}
            <div className="bg-[#FDFCF9] rounded-3xl border border-[#D6CEBE] shadow-xl overflow-hidden text-[#1F1C18]">
              
              {/* Luxury Email Header Banner */}
              <div className="bg-[#1F1C18] text-[#FDFCF9] px-6 sm:px-8 py-7 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ECC880]/10 rounded-full blur-2xl pointer-events-none" />
                
                <span className="text-[10px] tracking-[0.3em] font-bold text-[#ECC880] uppercase block mb-1">
                  HALO FINE ART · LABORATORIO DE ENCUADERNACIÓN
                </span>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-wide text-[#FDFCF9]">
                  Actualización de tu Fotolibro
                </h1>
                <p className="text-xs text-[#D8CFBC] mt-1 font-mono">
                  Orden #{activeEmail.orderNumber} · Taller Pilar, Buenos Aires
                </p>
              </div>

              {/* Email Content Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Stage Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#EFE9DE] border border-[#D6CEBE] text-[#8C6D37] text-xs font-bold uppercase tracking-wider">
                    {activeEmail.highlightBadge}
                  </span>
                  <span className="text-xs font-semibold text-[#736B60]">
                    Plazo: 4 a 6 días hábiles
                  </span>
                </div>

                {/* Headline & Body Text */}
                <div className="space-y-3">
                  <h2 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">
                    {activeEmail.headline}
                  </h2>
                  <p className="text-sm text-[#4A443C] leading-relaxed whitespace-pre-line">
                    {activeEmail.bodyText}
                  </p>
                </div>

                {/* Next Step Box */}
                <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#D6CEBE] flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#8C6D37] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <strong className="text-[#1F1C18] block font-bold">
                      Próximo paso en el proceso:
                    </strong>
                    <p className="text-[#595248] leading-relaxed">
                      {activeEmail.nextStep}
                    </p>
                  </div>
                </div>

                {/* Photobook Details Card */}
                <div className="p-4 rounded-2xl border border-[#E8E2D5] bg-[#FAF7F2] flex flex-col sm:flex-row items-center gap-4">
                  {activeEmail.itemPreviewUrl && (
                    <img
                      src={activeEmail.itemPreviewUrl}
                      alt="Fotolibro Fine Art"
                      className="w-20 h-20 rounded-xl object-cover border border-[#D6CEBE] shrink-0 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 text-xs space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold text-[#8C6D37] uppercase">Tu Álbum Artesanal</span>
                    <h4 className="font-bold text-[#1F1C18] text-sm">{activeEmail.itemsSummary}</h4>
                    <p className="text-[#736B60]">
                      Destino: <strong className="text-[#1F1C18]">{activeEmail.shippingAddress}</strong>
                    </p>
                  </div>
                </div>

                {/* Logistics Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl border border-[#E8E2D5] bg-[#FDFCF9] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#736B60] block">
                      Recepción Estimada
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-[#1F1C18]">
                      <Calendar className="w-4 h-4 text-[#8C6D37]" />
                      <span>{activeEmail.estimatedDelivery}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#E8E2D5] bg-[#FDFCF9] space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#736B60] block">
                      Método de Envío
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-[#1F1C18]">
                      <Truck className="w-4 h-4 text-[#8C6D37]" />
                      <span className="truncate">{activeEmail.shippingMethodName}</span>
                    </div>
                  </div>
                </div>

                {/* Call To Action Buttons in Email */}
                <div className="pt-4 border-t border-[#E8E2D5] text-center space-y-3">
                  {onOpenTracker && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTracker(activeEmail.orderId);
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8C6D37] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#73582A] shadow-md transition-all inline-flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>Ver Tracker de Pedido en Vivo</span>
                    </button>
                  )}

                  <p className="text-[11px] text-[#736B60]">
                    ¿Tenés alguna consulta sobre tus fotos? Podés responder directamente a este correo o escribirnos a nuestro WhatsApp oficial: <strong>{STORE_CONFIG.whatsappNumber}</strong>.
                  </p>
                </div>

                {/* Email Signoff */}
                <div className="pt-6 border-t border-[#E8E2D5] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736B60]">
                  <div>
                    <strong className="text-[#1F1C18] block font-serif-luxury text-sm">HALO Fine Art Lab</strong>
                    <span>Laboratorio de Encuadernación Artesanal · Pilar, Buenos Aires</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#8C6D37] font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Garantía de Conservación 100 Años</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Bar Under Email */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResend}
                className="px-4 py-2.5 rounded-full bg-[#FDFCF9] border border-[#D6CEBE] text-xs font-semibold text-[#1F1C18] hover:bg-[#EFE9DE] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-[#8C6D37]" />
                <span>{resendSuccess ? '¡Reenviado al instante!' : 'Reenviar Email al Cliente'}</span>
              </button>

              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                  `¡Hola! Te comparto la confirmación de la orden ${activeEmail.orderNumber}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Compartir por WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
