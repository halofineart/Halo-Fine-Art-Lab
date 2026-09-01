import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, XCircle, Loader2, Package } from 'lucide-react';
import { TrackedOrder } from '../types';
import { formatPriceARS } from '../data/mockData';
import { dbOrderToTrackedOrder } from '../lib/orderMapper';
import { DbOrder } from '../lib/supabase';

type ReturnKind = 'success' | 'pending' | 'failure';

interface PaymentResultModalProps {
  mpReturn: ReturnKind;
  orderCode: string;
  onClose: () => void;
  onOrderConfirmed: (order: TrackedOrder) => void;
  onOpenTracker: (orderId: string) => void;
}

/**
 * Shown when Mercado Pago redirects the shopper back to the site
 * (?mp_return=success|pending|failure&order=HALO-XXXXXX). The webhook is the
 * real source of truth for whether the payment went through — MP can (and
 * does) sometimes deliver the notification a few seconds after the browser
 * redirect — so this briefly polls /api/order-status instead of trusting the
 * return kind alone.
 */
export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  mpReturn,
  orderCode,
  onClose,
  onOrderConfirmed,
  onOpenTracker,
}) => {
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasCelebratedRef = React.useRef(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await fetch(`/api/order-status?code=${encodeURIComponent(orderCode)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok || !data.order) {
          setLoadError(data.error || 'No pudimos encontrar tu orden.');
          setIsLoading(false);
          return;
        }

        const row = data.order as DbOrder;
        setOrder(row);

        const stillPending = mpReturn === 'success' && row.payment_status === 'pending';
        attempts += 1;
        if (stillPending && attempts < 6) {
          setTimeout(poll, 2000);
          return;
        }

        setIsLoading(false);

        if (row.payment_status === 'approved' && !hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          const tracked = dbOrderToTrackedOrder(row);
          onOrderConfirmed(tracked);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ECC880', '#C5A059', '#1F1C18', '#D8CFBC'],
            });
          } catch {}
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError('No pudimos confirmar el estado del pago. Revisá el Tracker de Pedido en unos minutos.');
          setIsLoading(false);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode, mpReturn]);

  const paymentStatus = order?.payment_status;
  const isApproved = paymentStatus === 'approved';
  const isRejected = paymentStatus === 'rejected' || paymentStatus === 'cancelled' || mpReturn === 'failure';
  const isPending = !isApproved && !isRejected;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative my-8 w-full max-w-lg rounded-3xl border border-[#D6CEBE] bg-[#FDFCF9] shadow-2xl overflow-hidden text-[#1F1C18] p-8 sm:p-10 text-center space-y-4"
      >
        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#EFE9DE] text-[#8C6D37] flex items-center justify-center mx-auto border border-[#D6CEBE]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">Confirmando tu pago…</h3>
            <p className="text-sm text-[#595248]">
              Estamos verificando el resultado con Mercado Pago. Esto toma solo unos segundos.
            </p>
          </>
        ) : loadError ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">No pudimos confirmar el estado</h3>
            <p className="text-sm text-[#595248] max-w-md mx-auto">{loadError}</p>
            <p className="text-xs text-[#736B60]">
              Tu número de orden es <strong className="font-mono text-[#8C6D37]">#{orderCode}</strong>. Si el pago se realizó, va a aparecer en tu Tracker de Pedido en breve.
            </p>
          </>
        ) : isApproved ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-3xl font-bold text-[#1F1C18]">¡Pago Acreditado!</h3>
            <p className="text-sm text-[#595248] max-w-md mx-auto leading-relaxed">
              Orden: <strong className="font-mono text-[#8C6D37]">#{orderCode}</strong>
              <br />
              Total: <strong className="text-[#1F1C18]">{order ? formatPriceARS(Number(order.total_price)) : ''} ARS</strong>
            </p>
            <div className="p-4 rounded-2xl border border-[#D6CEBE] bg-[#F4EFE6] text-xs text-[#595248] max-w-md mx-auto text-left space-y-2">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8C6D37] shrink-0" />
                <span>Tiempo de elaboración & entrega: <strong>4 a 6 días hábiles</strong> desde nuestro taller en Pilar.</span>
              </p>
              <p>• Ya iniciamos el proceso de diseño y control de tus archivos.</p>
              <p>• Podés seguir el avance en tiempo real con tu número de orden.</p>
            </div>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenTracker(order?.id || orderCode)}
                className="px-6 py-3 rounded-full bg-[#8C6D37] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#73582A] flex items-center gap-2 shadow-md transition-transform hover:scale-105"
              >
                <Package className="w-4 h-4" />
                <span>Ver Tracker de Pedido</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E]"
              >
                Volver a la Tienda
              </button>
            </div>
          </>
        ) : isRejected ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto border border-red-200">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">El pago no se pudo completar</h3>
            <p className="text-sm text-[#595248] max-w-md mx-auto">
              Mercado Pago rechazó o canceló el pago de la orden <strong className="font-mono text-[#8C6D37]">#{orderCode}</strong>. No se realizó ningún cobro. Podés volver al carrito e intentar de nuevo, con otro medio de pago si preferís.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E]"
            >
              Volver a la Tienda
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-[#1F1C18]">Tu pago está en revisión</h3>
            <p className="text-sm text-[#595248] max-w-md mx-auto">
              Mercado Pago todavía está procesando el pago de la orden <strong className="font-mono text-[#8C6D37]">#{orderCode}</strong> (esto pasa con algunos medios de pago, como transferencias o efectivo). Te vamos a avisar apenas se acredite — podés revisar el estado más tarde en el Tracker de Pedido.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full bg-[#1F1C18] text-[#FDFCF9] text-xs uppercase tracking-wider font-semibold hover:bg-[#3D352E]"
            >
              Volver a la Tienda
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
