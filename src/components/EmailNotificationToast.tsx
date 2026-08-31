import React, { useEffect } from 'react';
import { Mail, CheckCircle2, ArrowRight, X, Sparkles, Send } from 'lucide-react';
import { EmailNotification } from '../types';

interface EmailNotificationToastProps {
  notification: EmailNotification | null;
  onClose: () => void;
  onViewEmail: (notification: EmailNotification) => void;
}

export const EmailNotificationToast: React.FC<EmailNotificationToastProps> = ({
  notification,
  onClose,
  onViewEmail,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="rounded-2xl border border-[#D6CEBE] bg-[#FDFCF9] p-4 sm:p-5 shadow-2xl ring-1 ring-black/5 text-[#1F1C18] relative overflow-hidden backdrop-blur-md">
        {/* Top accent border */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#C5A059] via-[#8C6D37] to-[#C5A059]" />

        <div className="flex items-start gap-3.5">
          {/* Mail icon with animated indicator */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-[#8C6D37] text-white flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#FDFCF9] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#FDFCF9]" />
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D37] bg-[#F4EFE6] px-2 py-0.5 rounded">
                Email Automático Enviado
              </span>
              <span className="text-[10px] text-[#736B60] font-mono">{notification.sentAt.split(',')[1]?.trim() || 'Ahora'}</span>
            </div>

            <h4 className="text-xs font-bold text-[#1F1C18] mt-1 line-clamp-1">
              {notification.subject}
            </h4>

            <p className="text-[11px] text-[#595248] mt-0.5 line-clamp-2 leading-relaxed">
              Notificación enviada a <strong className="text-[#1F1C18]">{notification.customerEmail}</strong> para la orden <strong className="font-mono text-[#8C6D37]">#{notification.orderNumber}</strong>.
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 mt-3">
              <button
                type="button"
                onClick={() => onViewEmail(notification)}
                className="px-3.5 py-1.5 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs font-semibold hover:bg-[#3D352E] transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>Ver Email Completo</span>
                <ArrowRight className="w-3 h-3 text-[#ECC880]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-full border border-[#D6CEBE] bg-[#FAF7F2] text-xs text-[#595248] hover:bg-[#EFE9DE] transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="text-[#8C8275] hover:text-[#1F1C18] p-1 -mr-1 -mt-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
